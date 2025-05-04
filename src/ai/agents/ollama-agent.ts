// src/ai/agents/ollama-agent.ts
// Interaction logic for Ollama models via LangChain.js.
// Note: In the multi-agent architecture, direct calls here might be less frequent.
// The Agent Coordinator service will likely manage agent execution and tool calls.

'use server'; // Mark for server-side execution

// Ensure you have installed langchain: npm install langchain @langchain/community @langchain/openai @langchain/anthropic etc.
// Also install vector store clients: npm install @langchain/community --save-dev # For embeddings/vectorstores
// e.g., npm install @langchain/qdrant
// Potentially needed: npm install tiktoken

import { Ollama } from "@langchain/community/llms/ollama";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Document } from "@langchain/core/documents";
// --- Potentially needed for advanced features ---
// import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
// import { createRetrievalChain } from "langchain/chains/retrieval";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { QdrantVectorStore } from "@langchain/qdrant"; // Example vector store
// import { BufferMemory } from "langchain/memory"; // For short-term chat history if not handled externally
// import { AgentExecutor, createReactAgent } from "langchain/agents"; // For complex agent logic if needed locally
// import { TavilySearchResults } from "@langchain/community/tools/tavily_search"; // Example external tool

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || "llama3"; // Default model
const OLLAMA_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text"; // Default embedding model

// --- Basic Ollama LLM Invocation (Likely wrapped by AI Service/Coordinator) ---
export async function simpleOllamaCompletion(prompt: string, modelName: string = OLLAMA_DEFAULT_MODEL): Promise<string> {
  try {
    const ollama = new Ollama({
      baseUrl: OLLAMA_BASE_URL,
      model: modelName,
    });

    console.log(`Sending prompt to Ollama (${modelName}): "${prompt}"`);
    const result = await ollama.invoke(prompt);
    console.log(`Received response from Ollama (${modelName})`);
    return result;
  } catch (error) {
    console.error(`Error interacting with Ollama (${modelName}):`, error);
    throw new Error(`Failed to get completion from Ollama (${modelName})`);
  }
}

// --- Ollama Chat Model Example (Likely wrapped by AI Service/Coordinator) ---
export async function simpleOllamaChat(userInput: string, modelName: string = OLLAMA_DEFAULT_MODEL): Promise<string> {
  try {
    const chatOllama = new ChatOllama({
      baseUrl: OLLAMA_BASE_URL,
      model: modelName,
    });

    const prompt = PromptTemplate.fromTemplate(
      "You are a helpful AI assistant integrated into the QuonxCoder IDE. Answer the user's question concisely: {question}"
    );
    const outputParser = new StringOutputParser();
    const chain = prompt.pipe(chatOllama).pipe(outputParser);

    console.log(`Sending user input to Ollama Chat (${modelName}): "${userInput}"`);
    const result = await chain.invoke({ question: userInput });
    console.log(`Received chat response from Ollama (${modelName})`);
    return result;

  } catch (error) {
    console.error(`Error interacting with Ollama Chat (${modelName}):`, error);
    throw new Error(`Failed to get chat response from Ollama Chat (${modelName})`);
  }
}

// --- Placeholder for RAG Implementation ---
// RAG involves retrieving relevant documents (context) from a vector store
// and passing them to the LLM along with the user query.
// This logic would typically reside within the AI Service or be triggered by the Agent Coordinator.

// Example Structure (Conceptual - requires Vector Store client, e.g., Qdrant)
// import { QdrantClient } from "@qdrant/js-client-rest";
// const vectorStoreClient = new QdrantClient({ url: process.env.VECTOR_DB_URL });

// export async function ollamaRAGQuery(query: string, collectionName: string = "quonxcoder_docs", modelName: string = OLLAMA_DEFAULT_MODEL): Promise<string> {
//   try {
//     const embeddings = new OllamaEmbeddings({
//       model: OLLAMA_EMBEDDING_MODEL,
//       baseUrl: OLLAMA_BASE_URL
//     });

    // 1. Embed the query
    // const queryEmbedding = await embeddings.embedQuery(query);

    // 2. Search the vector store for relevant documents
    // const searchResult = await vectorStoreClient.search(collectionName, {
    //   vector: queryEmbedding,
    //   limit: 5, // Retrieve top 5 relevant chunks
    //   // Add filtering if needed (e.g., by project ID, file type)
    //   // filter: { must: [{ key: "project_id", match: { value: "current_project" } }] }
    // });
    // const contextDocs = searchResult.map(hit => new Document({ pageContent: hit.payload?.pageContent || "" }));
    // const context = contextDocs.map(doc => doc.pageContent).join("\n\n");

//     // 3. Create a prompt with the context and query
//     const ragPrompt = PromptTemplate.fromTemplate(
//       `You are an AI assistant for the QuonxCoder IDE. Answer the following question based *only* on the provided context. If the context doesn't contain the answer, say "I don't have enough information in my knowledge base to answer that."\n\nContext:\n{context}\n\nQuestion: {question}`
//     );

//     // 4. Invoke the LLM with the augmented prompt
//     const chatModel = new ChatOllama({ baseUrl: OLLAMA_BASE_URL, model: modelName });
//     const chain = ragPrompt.pipe(chatModel).pipe(new StringOutputParser());
//     const result = await chain.invoke({ context: context, question: query });

//     return result;

//   } catch (error) {
//     console.error("Error during RAG query:", error);
//     throw new Error("Failed RAG query");
//   }
// }

// --- Placeholder for Agent Implementation ---
// Complex agent logic (planning, tool use, self-reflection) is typically managed by the Agent Coordinator.
// The coordinator would call specific functions (like simpleOllamaChat or ollamaRAGQuery) or more complex LangChain chains/executors as needed.

// Example Self-Reflection Loop Concept (Managed by Coordinator):
// async function selfReflectiveCodingTask(taskDescription: string): Promise<string> {
//   let currentCode = "";
//   let testResults = { pass: false, errors: [] };
//   const maxAttempts = 5;

//   for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//     console.log(`Attempt ${attempt}: Generating code for "${taskDescription}"...`);
//     // 1. Plan/Generate Code (Call Code Gen Agent via Coordinator)
//     currentCode = await coordinator.requestAgentExecution('codeGenAgent', { prompt: taskDescription, existingCode: currentCode });

//     console.log(`Attempt ${attempt}: Generating tests...`);
//     // 2. Generate Tests (Call Test Gen Agent via Coordinator)
//     const testCode = await coordinator.requestAgentExecution('testGenAgent', { code: currentCode });

//     console.log(`Attempt ${attempt}: Running tests...`);
//     // 3. Execute Tests (Call Test Execution Service/Agent)
//     testResults = await coordinator.requestServiceExecution('testExecutor', { code: currentCode, testCode: testCode });

//     if (testResults.pass) {
//       console.log(`Attempt ${attempt}: Tests passed!`);
//       return currentCode; // Success
//     }

//     console.log(`Attempt ${attempt}: Tests failed. Reflecting and repairing...`);
//     // 4. Reflect and Repair (Call Code Gen Agent with feedback via Coordinator)
//     taskDescription = `The previous code attempt failed tests with these errors: ${JSON.stringify(testResults.errors)}. Please fix the code: ${currentCode}`;
//     // The next loop iteration will use the updated taskDescription
//   }

//   throw new Error(`Failed to generate passing code after ${maxAttempts} attempts.`);
// }

console.log("Ollama Agent logic loaded. Execution typically orchestrated by Agent Coordinator.");
```