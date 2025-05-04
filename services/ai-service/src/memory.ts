// services/ai-service/src/memory.ts
// Manages the Adaptive Dual Memory System (Long-Term Vector Store, Short-Term Redis Cache)
// and handles Recursive Summarization triggers.

import { Request, Response } from 'express';
import Redis from 'ioredis';
import { QdrantClient } from '@qdrant/js-client-rest'; // Example Qdrant client
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Document } from "@langchain/core/documents";
// Import summarization flow/agent logic (or call Agent Coordinator)
// import { summarizeText } from '@/ai/flows/summarize-text';
// import { requestAgentExecution } from './agent-coordinator-client'; // Hypothetical client

// --- Configuration ---
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const VECTOR_DB_URL = process.env.VECTOR_DB_URL || 'http://localhost:6333';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";
const DEFAULT_COLLECTION_NAME = "quonxcoder_default"; // Default Qdrant collection
const SHORT_TERM_CACHE_TTL = 60 * 60; // 1 hour TTL for session cache

// --- Clients (Initializelazily or on server start) ---
let redisClient: Redis;
let vectorStoreClient: QdrantClient;
let embeddings: OllamaEmbeddings;

export function initialize() {
    console.log("Initializing AI Service memory components...");
    try {
        redisClient = new Redis(REDIS_URL);
        console.log("Redis client connected.");
    } catch (error) {
        console.error("Failed to connect to Redis:", error);
    }
    try {
        vectorStoreClient = new QdrantClient({ url: VECTOR_DB_URL });
         console.log("Vector DB client initialized.");
         // Ensure default collection exists (simplified)
         vectorStoreClient.getCollections().then(collections => {
             if (!collections.collections.find(c => c.name === DEFAULT_COLLECTION_NAME)) {
                 console.log(`Creating default vector collection: ${DEFAULT_COLLECTION_NAME}`);
                 vectorStoreClient.createCollection(DEFAULT_COLLECTION_NAME, { vectors: { size: 768, distance: 'Cosine' } }); // Adjust size based on embedding model
             }
         }).catch(err => console.error("Failed to check/create default collection:", err));

    } catch(error){
         console.error("Failed to initialize Vector DB client:", error);
    }
    try {
        embeddings = new OllamaEmbeddings({
            model: OLLAMA_EMBEDDING_MODEL,
            baseUrl: OLLAMA_BASE_URL
        });
        console.log("Ollama Embeddings initialized.");
    } catch (error) {
        console.error("Failed to initialize Ollama Embeddings:", error);
    }
}

export function cleanup() {
    console.log("Cleaning up AI Service memory components...");
    redisClient?.disconnect();
    // Vector DB client might not have an explicit disconnect
}

// --- Long-Term Memory (Vector Store) ---

/**
 * Stores text data (code snippets, summaries, documents) in the vector store.
 * @param collection - The target collection (e.g., project ID, 'global_docs').
 * @param documents - Array of Langchain Document objects with pageContent and metadata.
 */
async function storeLongTermMemory(collection: string, documents: Document[]) {
    if (!vectorStoreClient || !embeddings) throw new Error("Vector store or embeddings not initialized.");
    console.log(`Storing ${documents.length} documents in collection '${collection}'...`);
    // Embed documents and prepare points for Qdrant/VectorDB
    // This requires mapping Langchain Documents to the specific vector store's format.
    // Example for Qdrant:
    try {
         const points = [];
         for (const doc of documents) {
            const [vector] = await embeddings.embedDocuments([doc.pageContent]);
             points.push({
                id: doc.metadata.id || crypto.randomUUID(), // Ensure unique ID
                vector: vector,
                payload: { // Store content and metadata
                     pageContent: doc.pageContent,
                    ...doc.metadata
                 }
             });
         }
        await vectorStoreClient.upsert(collection, { wait: true, points: points });
        console.log("Successfully stored documents in vector store.");
    } catch (error) {
        console.error("Error storing documents in vector store:", error);
        throw error; // Re-throw for handling in the route
    }
}

/**
 * Queries the vector store for relevant information.
 * @param collection - The target collection.
 * @param queryText - The text to search for.
 * @param limit - Maximum number of results.
 * @param filter - Optional metadata filter (specific to vector store).
 * @returns Array of relevant Document objects.
 */
async function queryLongTermMemory(collection: string, queryText: string, limit: number = 5, filter?: any): Promise<Document[]> {
     if (!vectorStoreClient || !embeddings) throw new Error("Vector store or embeddings not initialized.");
     console.log(`Querying collection '${collection}' for: "${queryText}"`);
    try {
        const queryEmbedding = await embeddings.embedQuery(queryText);
        const searchResult = await vectorStoreClient.search(collection, {
            vector: queryEmbedding,
            limit: limit,
            filter: filter, // Pass filter if provided
             with_payload: true // Ensure payload is returned
        });

        // Map results back to Langchain Document format
         const documents = searchResult.map(hit => new Document({
            pageContent: hit.payload?.pageContent as string || "",
            metadata: hit.payload // Pass through all metadata
         }));
         console.log(`Found ${documents.length} relevant documents.`);
         return documents;

    } catch (error) {
         console.error("Error querying vector store:", error);
         throw error;
    }
}

// --- Short-Term Memory (Redis Cache) ---

/**
 * Retrieves data from the session cache.
 * @param sessionId - Unique identifier for the session.
 * @param key - Key for the cached item.
 * @returns The cached value (string) or null if not found/expired.
 */
async function getShortTermCache(sessionId: string, key: string): Promise<string | null> {
    if (!redisClient) throw new Error("Redis client not initialized.");
    const cacheKey = `cache:${sessionId}:${key}`;
    return redisClient.get(cacheKey);
}

/**
 * Stores data in the session cache with a TTL.
 * @param sessionId - Unique identifier for the session.
 * @param key - Key for the cached item.
 * @param value - Value to cache (string).
 * @param ttlSeconds - Time-to-live in seconds.
 */
async function setShortTermCache(sessionId: string, key: string, value: string, ttlSeconds: number = SHORT_TERM_CACHE_TTL) {
     if (!redisClient) throw new Error("Redis client not initialized.");
     const cacheKey = `cache:${sessionId}:${key}`;
     await redisClient.set(cacheKey, value, 'EX', ttlSeconds);
}

// --- Recursive Summarization (Trigger/Handler) ---

/**
 * Handles requests to summarize text, potentially part of a recursive process.
 * This might call a local summarization flow or delegate to the Agent Coordinator.
 * @param text - The text to summarize.
 * @param context - Optional context.
 * @returns The summary string.
 */
async function summarize(text: string, context?: string): Promise<string> {
    console.log("Triggering summarization...");
    // Option 1: Call local Genkit flow (if AI service handles Genkit directly)
    // const { summarizeText } = await import('@/ai/flows/summarize-text'); // Adjust path if needed
    // const result = await summarizeText({ text, context });
    // return result.summary;

    // Option 2: Delegate to Agent Coordinator Service
    // const summaryResult = await requestAgentExecution('summarizationAgent', { text, context });
    // return summaryResult.summary;

    // Placeholder implementation:
    if (text.length < 100) return text; // Don't summarize very short text
    return `Summary placeholder for: ${text.substring(0, 50)}... (Context: ${context || 'N/A'})`;
    // TODO: Implement actual summarization call
}

// --- Route Handlers ---

export const handleStore = async (req: Request, res: Response) => {
    try {
        const { collection = DEFAULT_COLLECTION_NAME, documents } = req.body;
        if (!documents || !Array.isArray(documents) || documents.length === 0) {
            return res.status(400).json({ error: 'Missing or invalid documents array.' });
        }
        // Basic validation of document structure
        if (!documents.every(d => typeof d.pageContent === 'string' && typeof d.metadata === 'object')) {
             return res.status(400).json({ error: 'Each document must have pageContent (string) and metadata (object).' });
        }
        await storeLongTermMemory(collection, documents.map(d => new Document(d)));
        res.status(200).json({ message: 'Documents stored successfully.' });
    } catch (error: any) {
        console.error("Store Memory Error:", error);
        res.status(500).json({ error: 'Failed to store memory.', message: error.message });
    }
};

export const handleQuery = async (req: Request, res: Response) => {
    try {
        const { collection = DEFAULT_COLLECTION_NAME, queryText, limit = 5, filter } = req.body;
        if (!queryText) {
            return res.status(400).json({ error: 'Missing queryText.' });
        }
        const results = await queryLongTermMemory(collection, queryText, limit, filter);
        res.status(200).json(results);
    } catch (error: any) {
         console.error("Query Memory Error:", error);
        res.status(500).json({ error: 'Failed to query memory.', message: error.message });
    }
};

export const handleCacheGet = async (req: Request, res: Response) => {
    try {
        const { sessionId, key } = req.params;
        if (!sessionId || !key) {
            return res.status(400).json({ error: 'Missing sessionId or key in path.' });
        }
        const value = await getShortTermCache(sessionId, key);
        if (value !== null) {
            res.status(200).json({ value });
        } else {
            res.status(404).json({ message: 'Cache key not found or expired.' });
        }
    } catch (error: any) {
        console.error("Cache Get Error:", error);
        res.status(500).json({ error: 'Failed to get cache.', message: error.message });
    }
};

export const handleCacheSet = async (req: Request, res: Response) => {
     try {
        const { sessionId, key } = req.params;
        const { value, ttl } = req.body;
        if (!sessionId || !key) {
            return res.status(400).json({ error: 'Missing sessionId or key in path.' });
        }
         if (typeof value !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid value in body.' });
        }
        await setShortTermCache(sessionId, key, value, ttl);
        res.status(200).json({ message: 'Cache set successfully.' });
    } catch (error: any) {
         console.error("Cache Set Error:", error);
        res.status(500).json({ error: 'Failed to set cache.', message: error.message });
    }
};

export const handleSummarize = async (req: Request, res: Response) => {
     try {
        const { text, context } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Missing text to summarize.' });
        }
        const summary = await summarize(text, context);
        res.status(200).json({ summary });
    } catch (error: any) {
         console.error("Summarization Error:", error);
        res.status(500).json({ error: 'Failed to summarize text.', message: error.message });
    }
};
```