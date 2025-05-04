// services/agent-coordinator/src/agent-runner.ts
// Handles the logic for executing specific agent tasks by calling the AI service.

import { Request, Response } from 'express';
import axios from 'axios'; // Or node-fetch/undici
import type { AgentExecutionRequest, AgentExecutionResponse } from '@/types/agent-types';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3003';

// Define agent types (align with planning, codegen, test, deploy, etc.)
type AgentName =
    | 'planningAgent'
    | 'codeGenAgent'
    | 'testGenAgent'
    | 'refactorAgent'
    | 'summarizationAgent'
    | 'ragAgent'
    | 'fixBugAgent'
    | 'explainCodeAgent' // Agent to explain code
    | 'docGenAgent' // Agent to generate documentation
    | 'ingestAgent' // Agent to handle knowledge ingestion
    | 'sastAgent' // Security Analysis Agent
    | 'iacGenAgent' // Infrastructure as Code Generation Agent
    | 'chatAgent' // Generic chat agent
    | 'scaffoldAgent' // Agent for scaffolding apps/features
    // Add more as needed
    | string; // Allow custom agent names potentially


// Forward declaration for self-reflection loop if needed
// async function runSelfReflectionLoop(...)

// --- Route Handler ---

export const handleExecuteAgent = async (req: Request, res: Response) => {
    const agentName: AgentName = req.params.agentName;
    const requestBody: AgentExecutionRequest = req.body;

    console.log(`Agent Coordinator: Received request to execute agent: ${agentName}`);

    try {
        let aiServiceResponse: any;
        let finalResult: any = null;
        let success = true;
        let errorMessage: string | undefined = undefined;

        // --- Agent Logic Implementation ---
        switch (agentName) {
            case 'chatAgent':
                 if (!requestBody.prompt) return res.status(400).json({ error: 'Missing prompt for chatAgent.' });
                 aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/llm/chat`, {
                     messages: requestBody.context?.chatHistory ? [...requestBody.context.chatHistory, { role: 'user', content: requestBody.prompt }] : [{ role: 'user', content: requestBody.prompt }],
                     model: requestBody.config?.model, // Pass model if specified
                     options: requestBody.config?.options // Pass other options
                 });
                 finalResult = { response: aiServiceResponse.data?.response };
                 break;

            case 'summarizationAgent':
                if (!requestBody.context?.text) {
                    return res.status(400).json({ error: 'Missing context.text for summarizationAgent.' });
                }
                // Call AI Service's generic chat/completion endpoint for summarization
                aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/llm/complete`, { // Or /llm/chat
                     prompt: `Summarize the following text concisely${requestBody.config?.context ? ` (Context: ${requestBody.config.context})` : ''}:\n\n${requestBody.context.text}`,
                     model: requestBody.config?.model || process.env.OLLAMA_DEFAULT_MODEL, // Use default if not specified
                     options: { temperature: 0.3, ...requestBody.config?.options } // Lower temp for factual summary
                 });
                 finalResult = { summary: aiServiceResponse.data?.completion || aiServiceResponse.data?.response };
                 break;

            case 'codeGenAgent':
                 if (!requestBody.prompt) {
                    return res.status(400).json({ error: 'Missing prompt for codeGenAgent.' });
                 }
                 // Construct a more detailed prompt for code generation
                 const codeGenPrompt = `Generate code based on the following request. ${requestBody.config?.language ? `Target language: ${requestBody.config.language}.` : ''} ${requestBody.context?.filePath ? `Consider the context of file: ${requestBody.context.filePath}.` : ''}

Request: ${requestBody.prompt}

Existing Code (if any):
\`\`\`${requestBody.context?.code || ''}
\`\`\`

Generated Code:`;
                 aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/llm/complete`, {
                     prompt: codeGenPrompt,
                     model: requestBody.config?.model,
                     options: { temperature: 0.5, stop: ['```'], ...requestBody.config?.options }, // Stop token helps
                 });
                 finalResult = { code: aiServiceResponse.data?.completion };
                 break;

             case 'explainCodeAgent':
                 if (!requestBody.context?.code) {
                     return res.status(400).json({ error: 'Missing context.code for explainCodeAgent.' });
                 }
                 const explainPrompt = `Explain the following ${requestBody.config?.language || 'code'} snippet clearly and concisely:

\`\`\`${requestBody.context.code}
\`\`\`

Explanation:`;
                 aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/llm/complete`, {
                      prompt: explainPrompt,
                      model: requestBody.config?.model,
                      options: { temperature: 0.4, ...requestBody.config?.options },
                  });
                 finalResult = { explanation: aiServiceResponse.data?.completion };
                 break;

             case 'refactorAgent':
                 if (!requestBody.context?.code) {
                     return res.status(400).json({ error: 'Missing context.code for refactorAgent.' });
                 }
                 const refactorPrompt = `Refactor the following ${requestBody.config?.language || 'code'}. ${requestBody.instructions ? `Instructions: ${requestBody.instructions}` : 'Focus on improving clarity, efficiency, and maintainability.'}

Original Code:
\`\`\`${requestBody.context.code}
\`\`\`

Refactored Code:`;
                  aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/llm/complete`, {
                       prompt: refactorPrompt,
                       model: requestBody.config?.model,
                       options: { temperature: 0.5, stop: ['```'], ...requestBody.config?.options },
                   });
                  finalResult = { code: aiServiceResponse.data?.completion };
                 // TODO: Add self-reflection step: run tests on refactored code if available
                  break;

             case 'testGenAgent':
                  if (!requestBody.context?.code) {
                      return res.status(400).json({ error: 'Missing context.code for testGenAgent.' });
                  }
                   const testGenPrompt = `Generate unit tests for the following ${requestBody.config?.language || 'code'}. ${requestBody.config?.framework ? `Use the ${requestBody.config.framework} framework.` : 'Use a common testing framework for the language.'} Aim for good coverage of functions and edge cases.

Code to Test:
\`\`\`${requestBody.context.code}
\`\`\`

Generated Tests:`;
                    aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/llm/complete`, {
                         prompt: testGenPrompt,
                         model: requestBody.config?.model,
                         options: { temperature: 0.6, stop: ['```'], ...requestBody.config?.options },
                     });
                    finalResult = { tests: aiServiceResponse.data?.completion };
                  break;

             case 'docGenAgent':
                  if (!requestBody.context?.code) {
                      return res.status(400).json({ error: 'Missing context.code for docGenAgent.' });
                  }
                  const docGenPrompt = `Generate documentation for the following ${requestBody.config?.language || 'code'}. ${requestBody.config?.format ? `Use ${requestBody.config.format} format.` : 'Use standard documentation format (e.g., JSDoc, Python Docstrings).'} Document functions, classes, parameters, and return values clearly.

Code to Document:
\`\`\`${requestBody.context.code}
\`\`\`

Generated Documentation:`;
                    aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/llm/complete`, {
                         prompt: docGenPrompt,
                         model: requestBody.config?.model,
                         options: { temperature: 0.4, stop: ['```'], ...requestBody.config?.options },
                     });
                    // Attempt to integrate docs back into the code structure if possible, otherwise return separately
                    finalResult = { documentation: aiServiceResponse.data?.completion };
                  break;

             case 'fixBugAgent':
                  if (!requestBody.context?.code || !requestBody.description) {
                       return res.status(400).json({ error: 'Missing context.code or description for fixBugAgent.' });
                  }
                   const fixBugPrompt = `Fix the bug described below in the following ${requestBody.config?.language || 'code'}. Provide only the corrected code block.

Bug Description: ${requestBody.description}

Code with Bug:
\`\`\`${requestBody.context.code}
\`\`\`

Corrected Code:`;
                     aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/llm/complete`, {
                          prompt: fixBugPrompt,
                          model: requestBody.config?.model,
                          options: { temperature: 0.5, stop: ['```'], ...requestBody.config?.options },
                      });
                     finalResult = { code: aiServiceResponse.data?.completion };
                     // TODO: Add self-reflection loop: run tests (if available) after applying fix
                  break;

             case 'scaffoldAgent':
                   if (!requestBody.description) {
                       return res.status(400).json({ error: 'Missing description for scaffoldAgent.' });
                   }
                   const scaffoldPrompt = `Scaffold an application or feature based on the following description. Provide the necessary file structure and initial code content.

Description: ${requestBody.description}

Structure and Code:`;
                   aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/llm/complete`, {
                       prompt: scaffoldPrompt,
                       model: requestBody.config?.model,
                       // Higher temperature might be needed for creative scaffolding
                       options: { temperature: 0.7, ...requestBody.config?.options },
                   });
                    // Result might include file structure info and multiple code blocks
                   finalResult = { files: aiServiceResponse.data?.completion };
                 break;

             case 'ragAgent':
                if (!requestBody.prompt) {
                     return res.status(400).json({ error: 'Missing prompt for ragAgent.' });
                 }
                // Call RAG endpoint on AI service
                 aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/rag/query`, {
                     queryText: requestBody.prompt,
                     collection: requestBody.memory?.collection, // Pass collection if specified
                     filter: requestBody.context?.filter, // Pass filter if specified
                     limit: requestBody.config?.limit,
                     model: requestBody.config?.model, // Pass model to RAG handler if needed
                 });
                 finalResult = { response: aiServiceResponse.data?.response, retrievedDocs: aiServiceResponse.data?.retrievedDocs };
                 break;

             case 'ingestAgent':
                 if (!requestBody.text) {
                      return res.status(400).json({ error: 'Missing text for ingestAgent.' });
                 }
                  // Call ingest endpoint on AI service
                  aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/rag/ingest`, {
                      text: requestBody.text,
                      source: requestBody.source,
                      collection: requestBody.collection, // Pass collection if specified
                      metadata: requestBody.metadata,
                      // Pass chunking config if needed
                      // chunkSize: requestBody.config?.chunkSize,
                      // chunkOverlap: requestBody.config?.chunkOverlap,
                  });
                  finalResult = { message: aiServiceResponse.data?.message || "Ingestion request processed." };
                 break;

             case 'iacGenAgent':
                  if (!requestBody.prompt) {
                      return res.status(400).json({ error: 'Missing prompt for iacGenAgent.' });
                  }
                  const iacPrompt = `Generate Infrastructure as Code (IaC). Default to Terraform unless specified otherwise.
Request: ${requestBody.prompt}

IaC Configuration:`;
                  aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/llm/complete`, {
                      prompt: iacPrompt,
                      model: requestBody.config?.model,
                      options: { temperature: 0.6, stop: ['```'], ...requestBody.config?.options },
                  });
                  finalResult = { code: aiServiceResponse.data?.completion };
                  break;

              case 'sastAgent':
                    // This agent might involve multiple steps:
                    // 1. Identify potential vulnerabilities (using LLM or a dedicated tool).
                    // 2. Review code context with identified vulnerabilities.
                    // 3. Optionally suggest fixes.
                   if (!requestBody.context?.code) {
                       return res.status(400).json({ error: 'Missing context.code for sastAgent.' });
                   }
                   const sastPrompt = `Analyze the following code for potential security vulnerabilities (e.g., SQL injection, XSS, insecure defaults, hardcoded secrets). List findings with severity (Critical, High, Medium, Low) and file path/line number if possible.

Code:
\`\`\`${requestBody.context.code}
\`\`\`

Security Findings:`;
                   aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/llm/complete`, {
                        prompt: sastPrompt,
                        model: requestBody.config?.model,
                        options: { temperature: 0.3, ...requestBody.config?.options }, // Lower temp for factual analysis
                   });
                   // Parse the findings from the LLM response
                   finalResult = { vulnerabilities: aiServiceResponse.data?.completion }; // Simple string result for now
                   // TODO: Implement parsing of findings into structured data
                  break;


            // Add cases for other agents (planning, etc.)

            default:
                console.warn(`Agent Coordinator: Unhandled agent type: ${agentName}`);
                return res.status(404).json({ error: `Agent type '${agentName}' not recognized.` });
        }

        // --- Format Response ---
        const responsePayload: AgentExecutionResponse = {
            success: success,
            result: finalResult || aiServiceResponse?.data, // Use parsed result or raw data
            error: errorMessage,
            agentUsed: agentName,
            // Add usage metrics if available from AI Service response
            usage: aiServiceResponse?.data?.usage,
        };

        res.status(success ? 200 : 500).json(responsePayload);

    } catch (error: any) {
        console.error(`Agent Coordinator: Error executing agent ${agentName}:`, error.response?.data || error.message);
        // Determine appropriate status code based on error type if possible
        const status = error.response?.status || 500;
        const responsePayload: AgentExecutionResponse = {
            success: false,
            error: `Failed to execute agent ${agentName}: ${error.message}`,
            agentUsed: agentName,
        };
        res.status(status).json(responsePayload);
    }
};
