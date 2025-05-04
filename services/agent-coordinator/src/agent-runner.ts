// services/agent-coordinator/src/agent-runner.ts
// Handles the logic for executing specific agent tasks by calling the AI service.

import { Request, Response } from 'express';
import axios from 'axios'; // Or node-fetch/undici

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
    | 'sastAgent' // Security Analysis Agent
    | 'iacGenAgent' // Infrastructure as Code Generation Agent
    // Add more as needed
    | string; // Allow custom agent names potentially

interface AgentExecutionRequest {
    // Common parameters
    prompt?: string;
    context?: any; // Can be code, chat history, error logs, etc.
    memory?: { // Optional memory context to pass
        shortTerm?: Record<string, any>;
        longTermQuery?: string; // Query to retrieve relevant long-term context
        collection?: string;
    };
    // Agent-specific parameters
    code?: string; // For refactor, testGen, fixBug
    existingCode?: string; // For codeGen incremental work
    testCode?: string; // For test execution agent (if implemented)
    language?: string; // Target language
    taskDescription?: string; // For planning agent
    vulnerabilities?: any[]; // For SAST agent review
    // ... add other agent-specific inputs
}

interface AgentExecutionResponse {
    success: boolean;
    result?: any; // Code, text, plan steps, test results, etc.
    error?: string;
    agentUsed: AgentName;
    // Add usage metrics (tokens, latency) if available from AI Service
}

// --- Route Handler ---

export const handleExecuteAgent = async (req: Request, res: Response) => {
    const agentName: AgentName = req.params.agentName;
    const requestBody: AgentExecutionRequest = req.body;

    console.log(`Received request to execute agent: ${agentName}`);

    try {
        // TODO: Implement sophisticated routing and execution logic based on agentName.
        // This will involve:
        // 1. Validating input based on the agent type.
        // 2. Preparing the specific request payload for the AI Service endpoint(s).
        //    - May involve querying short-term cache or long-term memory first via AI Service.
        // 3. Calling the appropriate AI Service endpoint(s).
        //    - e.g., /llm/chat, /llm/complete, /rag/query, or specialized agent endpoints if created.
        // 4. Potentially chaining multiple AI Service calls for complex tasks (e.g., self-reflection loop).
        // 5. Handling responses and errors from the AI Service.
        // 6. Formatting the final response.

        // --- Placeholder Logic ---
        let aiServiceResponse: any;
        switch (agentName) {
            case 'summarizationAgent':
                if (!requestBody.context?.text) {
                    return res.status(400).json({ error: 'Missing context.text for summarizationAgent.' });
                }
                 // Example: Call AI Service's summarization endpoint (which might call a flow)
                 // This assumes memory.ts has a summarize function exposed via an endpoint
                // For simplicity, let's assume a generic chat endpoint for now
                aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/llm/chat`, {
                     messages: [{ role: 'user', content: `Summarize the following text: ${requestBody.context.text}` }],
                     // Pass model/options if needed
                 });
                break;

            case 'codeGenAgent':
                 if (!requestBody.prompt) {
                    return res.status(400).json({ error: 'Missing prompt for codeGenAgent.' });
                 }
                 aiServiceResponse = await axios.post(`${AI_SERVICE_URL}/llm/complete`, { // Or chat
                     prompt: `Generate code based on this prompt: ${requestBody.prompt}\nExisting Code Context:\n${requestBody.existingCode || ''}`,
                     // Add model, options, etc.
                 });
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
                 });
                 break;

            // Add cases for other agents (testGen, refactor, planning, fixBug, sast, iacGen, etc.)
            // Each case would format its request and call the appropriate AI Service endpoint(s).

            default:
                console.warn(`Unhandled agent type: ${agentName}`);
                return res.status(404).json({ error: `Agent type '${agentName}' not recognized.` });
        }

        // --- Format Response ---
        const responsePayload: AgentExecutionResponse = {
            success: true,
            // Extract relevant data from aiServiceResponse based on agent type
            result: aiServiceResponse.data?.response || aiServiceResponse.data?.completion || aiServiceResponse.data, // Adjust based on AI service response structure
            agentUsed: agentName,
        };

        res.status(200).json(responsePayload);

    } catch (error: any) {
        console.error(`Error executing agent ${agentName}:`, error.response?.data || error.message);
        const responsePayload: AgentExecutionResponse = {
            success: false,
            error: `Failed to execute agent ${agentName}: ${error.message}`,
            agentUsed: agentName,
        };
        res.status(500).json(responsePayload);
    }
};
```