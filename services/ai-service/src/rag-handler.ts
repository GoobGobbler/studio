// services/ai-service/src/rag-handler.ts
// Handles Retrieval Augmented Generation requests.

import { Request, Response } from 'express';
import { Document } from "@langchain/core/documents";
import { Ollama } from "@langchain/community/llms/ollama"; // Or ChatOllama
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Import memory functions to retrieve context
import { queryLongTermMemory, storeLongTermMemory } from './memory';
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; // Needed for ingestion

// --- Configuration ---
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || "llama3";
const DEFAULT_COLLECTION_NAME = "quonxcoder_default";

// --- Route Handlers ---

export const handleRAGQuery = async (req: Request, res: Response) => {
    try {
        const {
            queryText,
            collection = DEFAULT_COLLECTION_NAME,
            limit = 5,
            filter, // Optional metadata filter for retrieval
            model = OLLAMA_DEFAULT_MODEL,
            // Add options for prompt customization if needed
        } = req.body;

        if (!queryText) {
            return res.status(400).json({ error: 'Missing queryText.' });
        }

        // 1. Retrieve relevant documents from long-term memory
        const contextDocs = await queryLongTermMemory(collection, queryText, limit, filter);

        if (contextDocs.length === 0) {
            // Option: Respond directly or try LLM without context
            console.log("No relevant documents found for RAG query.");
            // return res.status(404).json({ message: "No relevant information found in knowledge base." });
        }

        const context = contextDocs.map(doc => doc.pageContent).join("\n\n---\n\n"); // Join documents

        // 2. Construct the prompt with retrieved context
        const ragPrompt = PromptTemplate.fromTemplate(
            `You are an AI assistant for the QuonxCoder IDE. Answer the following question based *only* on the provided context. If the context doesn't contain the answer, indicate that you couldn't find the specific information in the knowledge base.\n\nContext:\n{context}\n\nQuestion: {question}`
        );

        // 3. Invoke the LLM with the augmented prompt
        const llm = new Ollama({ baseUrl: OLLAMA_BASE_URL, model: model }); // Use Ollama or ChatOllama
        const chain = ragPrompt.pipe(llm).pipe(new StringOutputParser());
        const result = await chain.invoke({ context: context || "No context provided.", question: queryText });

        res.status(200).json({ response: result, retrievedDocs: contextDocs.length }); // Optionally return number of docs used

    } catch (error: any) {
        console.error("RAG Query Error:", error);
        res.status(500).json({ error: 'Failed to perform RAG query.', message: error.message });
    }
};

export const handleIngest = async (req: Request, res: Response) => {
    try {
        const {
            collection = DEFAULT_COLLECTION_NAME,
            text, // Raw text to ingest
            metadata = {}, // Associated metadata
            source, // Optional: Source identifier (e.g., file path, URL)
            chunkSize = 1000, // Langchain defaults
            chunkOverlap = 200
        } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Missing text to ingest.' });
        }

        console.log(`Ingesting text into collection '${collection}' (Source: ${source || 'N/A'})...`);

        // 1. (Optional but Recommended) Split text into chunks
        // const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
        // const chunks = await textSplitter.splitText(text);
        // console.log(`Split text into ${chunks.length} chunks.`);

        // For simplicity here, treating the whole text as one document.
        // In production, use the splitter above.
        const chunks = [text]; // Replace with split chunks

        // 2. Create Langchain Documents
        const documents = chunks.map((chunk, index) => new Document({
            pageContent: chunk,
            metadata: {
                ...metadata, // Include provided metadata
                source: source || `text_ingest_${Date.now()}`, // Add source if available
                chunk: index // Add chunk index if splitting
                // Add other relevant metadata: project ID, timestamp, etc.
            }
        }));

        // 3. Store documents in the vector store (via memory module)
        await storeLongTermMemory(collection, documents);

        res.status(200).json({ message: `Successfully ingested text into collection '${collection}'.` });

    } catch (error: any) {
        console.error("RAG Ingest Error:", error);
        res.status(500).json({ error: 'Failed to ingest data for RAG.', message: error.message });
    }
};
```