// services/ai-service/src/rag-handler.ts
// Handles Retrieval Augmented Generation requests.

import { Request, Response } from 'express';
import { Document } from "@langchain/core/documents";
import { Ollama } from "@langchain/community/llms/ollama"; // Or ChatOllama
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; // Import text splitter

// Import memory functions to retrieve context
import { queryLongTermMemory, storeLongTermMemory } from './memory';

// --- Configuration ---
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || "llama3";
const DEFAULT_COLLECTION_NAME = "quonxcoder_default";
const DEFAULT_CHUNK_SIZE = 1000; // Default characters per chunk
const DEFAULT_CHUNK_OVERLAP = 200; // Default overlap between chunks

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
        if (typeof queryText !== 'string') {
            return res.status(400).json({ error: 'queryText must be a string.' });
        }


        // 1. Retrieve relevant documents from long-term memory
        console.log(`RAG Handler: Retrieving documents for query in collection '${collection}'...`);
        const contextDocs = await queryLongTermMemory(collection, queryText, limit, filter);

        if (contextDocs.length === 0) {
            console.log(`RAG Handler: No relevant documents found in collection '${collection}' for query.`);
            // Respond that no context was found, but still try asking the LLM directly without context.
             const context = "No relevant context found in the knowledge base.";
             const llm = new Ollama({ baseUrl: OLLAMA_BASE_URL, model: model });
             const result = await llm.invoke(`Answer the following question: ${queryText}`); // Simple direct question
             return res.status(200).json({ response: `(No specific context found) ${result}`, retrievedDocs: 0 });
        }

        console.log(`RAG Handler: Retrieved ${contextDocs.length} documents.`);
        const context = contextDocs.map(doc => doc.pageContent).join("\n\n---\n\n"); // Join documents

        // 2. Construct the prompt with retrieved context
        const ragPromptTemplate = PromptTemplate.fromTemplate(
            `You are an AI assistant for the QuonxCoder IDE. Answer the following question based *only* on the provided context. If the context doesn't contain the answer, clearly state that the information wasn't found in the provided documents.\n\nContext:\n{context}\n\nQuestion: {question}`
        );

        // 3. Invoke the LLM with the augmented prompt
        console.log(`RAG Handler: Invoking LLM model '${model}' with augmented prompt...`);
        const llm = new Ollama({ baseUrl: OLLAMA_BASE_URL, model: model }); // Use Ollama or ChatOllama
        const chain = ragPromptTemplate.pipe(llm).pipe(new StringOutputParser());
        const result = await chain.invoke({ context: context, question: queryText });

        console.log(`RAG Handler: Received LLM response.`);
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
            chunkSize = DEFAULT_CHUNK_SIZE,
            chunkOverlap = DEFAULT_CHUNK_OVERLAP
        } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Missing text to ingest.' });
        }
         if (typeof text !== 'string') {
             return res.status(400).json({ error: 'Text to ingest must be a string.' });
         }
          if (typeof chunkSize !== 'number' || chunkSize <= 0) {
             return res.status(400).json({ error: 'chunkSize must be a positive number.' });
         }
          if (typeof chunkOverlap !== 'number' || chunkOverlap < 0 || chunkOverlap >= chunkSize) {
             return res.status(400).json({ error: 'chunkOverlap must be a non-negative number less than chunkSize.' });
         }


        console.log(`Ingesting text into collection '${collection}' (Source: ${source || 'N/A'})...`);

        // 1. Split text into chunks
         let chunks: string[];
         try {
             const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
             chunks = await textSplitter.splitText(text);
             console.log(`Split text into ${chunks.length} chunks.`);
         } catch (splitError: any) {
              console.error("Error splitting text:", splitError);
              return res.status(500).json({ error: 'Failed to split text for ingestion.', message: splitError.message });
         }


        if (chunks.length === 0) {
            console.warn("Text splitting resulted in zero chunks.");
             return res.status(400).json({ error: 'Text content resulted in zero processable chunks.' });
        }

        // 2. Create Langchain Documents
        const documents = chunks.map((chunk, index) => new Document({
            pageContent: chunk,
            metadata: {
                ...metadata, // Include provided metadata
                source: source || `text_ingest_${Date.now()}`, // Add source identifier
                chunk: index, // Add chunk index
                timestamp: new Date().toISOString(), // Add ingestion timestamp
                // Add other relevant metadata: project ID, user ID, etc.
            }
        }));

        // 3. Store documents in the vector store (via memory module)
        console.log(`RAG Handler: Storing ${documents.length} document chunks...`);
        await storeLongTermMemory(collection, documents);

        res.status(200).json({ message: `Successfully ingested ${documents.length} text chunks into collection '${collection}'.` });

    } catch (error: any) {
        console.error("RAG Ingest Error:", error);
        // Check if it's a vector store error or something else
        res.status(500).json({ error: 'Failed to ingest data for RAG.', message: error.message });
    }
};
