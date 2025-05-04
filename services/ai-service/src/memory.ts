// services/ai-service/src/memory.ts
// Manages the Adaptive Dual Memory System (Long-Term Vector Store, Short-Term Redis Cache)
// and handles Recursive Summarization triggers.

import { Request, Response } from 'express';
import Redis from 'ioredis';
import { QdrantClient } from '@qdrant/js-client-rest'; // Example Qdrant client
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Document } from "@langchain/core/documents";
import axios from 'axios'; // To call Agent Coordinator for summarization

// --- Configuration ---
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const VECTOR_DB_URL = process.env.VECTOR_DB_URL || 'http://localhost:6333';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";
const AGENT_COORDINATOR_URL = process.env.AGENT_COORDINATOR_URL || 'http://localhost:3004';
const DEFAULT_COLLECTION_NAME = "quonxcoder_default"; // Default Qdrant collection
const SHORT_TERM_CACHE_TTL_SECONDS = 60 * 60; // 1 hour TTL for session cache
const SUMMARIZATION_THRESHOLD_LENGTH = 500; // Characters after which summarization might be triggered

// --- Clients (Initialize lazily or on server start) ---
let redisClient: Redis | null = null;
let vectorStoreClient: QdrantClient | null = null;
let embeddings: OllamaEmbeddings | null = null;

export function initialize() {
    console.log("Initializing AI Service memory components...");
    try {
        if (!redisClient) {
            redisClient = new Redis(REDIS_URL);
            redisClient.on('error', (err) => console.error('Redis Client Error', err));
            redisClient.on('connect', () => console.log('Redis client connected.'));
        }
    } catch (error) {
        console.error("Failed to connect to Redis:", error);
    }
    try {
         if (!vectorStoreClient) {
             vectorStoreClient = new QdrantClient({ url: VECTOR_DB_URL });
             console.log("Vector DB client initialized.");
             // Ensure default collection exists (simplified) - Adjust vector size based on actual embedding model
             vectorStoreClient.getCollections().then(async collections => {
                 const embeddingDims = 768; // Placeholder - Determine dynamically or configure based on OLLAMA_EMBEDDING_MODEL
                 // try {
                 //     const testEmbedding = await embeddings?.embedQuery("test");
                 //     if (testEmbedding) embeddingDims = testEmbedding.length;
                 // } catch (e) { console.warn("Could not determine embedding dimensions, using default.", e)}

                 if (!collections.collections.find(c => c.name === DEFAULT_COLLECTION_NAME)) {
                     console.log(`Creating default vector collection: ${DEFAULT_COLLECTION_NAME} with size ${embeddingDims}`);
                     try {
                         await vectorStoreClient?.createCollection(DEFAULT_COLLECTION_NAME, { vectors: { size: embeddingDims, distance: 'Cosine' } });
                     } catch (createErr) {
                          console.error(`Failed to create default collection '${DEFAULT_COLLECTION_NAME}':`, createErr);
                     }
                 }
             }).catch(err => console.error("Failed to check/create default collection:", err));
         }

    } catch(error){
         console.error("Failed to initialize Vector DB client:", error);
    }
    try {
        if (!embeddings) {
            embeddings = new OllamaEmbeddings({
                model: OLLAMA_EMBEDDING_MODEL,
                baseUrl: OLLAMA_BASE_URL
            });
             console.log("Ollama Embeddings initialized.");
        }
    } catch (error) {
        console.error("Failed to initialize Ollama Embeddings:", error);
    }
}

export function cleanup() {
    console.log("Cleaning up AI Service memory components...");
    redisClient?.quit(); // Use quit for graceful shutdown
    redisClient = null;
    // Vector DB client might not have an explicit disconnect
    vectorStoreClient = null;
    embeddings = null;
}

// --- Long-Term Memory (Vector Store) ---

/**
 * Stores text data (code snippets, summaries, documents) in the vector store.
 * @param collection - The target collection (e.g., project ID, 'global_docs').
 * @param documents - Array of Langchain Document objects with pageContent and metadata.
 */
async function storeLongTermMemory(collection: string, documents: Document[]) {
    if (!vectorStoreClient || !embeddings) throw new Error("Vector store or embeddings not initialized.");
    if (documents.length === 0) {
        console.log("No documents provided to storeLongTermMemory.");
        return;
    }
    console.log(`Storing ${documents.length} documents in collection '${collection}'...`);

    try {
         const points = [];
         // Embed documents in batches if necessary (depends on model/client limits)
         for (const doc of documents) {
            if (!doc.pageContent || typeof doc.pageContent !== 'string' || doc.pageContent.trim() === '') {
                console.warn("Skipping document with empty or invalid pageContent:", doc.metadata);
                continue;
            }
            try {
                const [vector] = await embeddings.embedDocuments([doc.pageContent]);
                points.push({
                    id: doc.metadata.id || crypto.randomUUID(), // Ensure unique ID
                    vector: vector,
                    payload: { // Store content and metadata
                         pageContent: doc.pageContent,
                        ...doc.metadata
                     }
                 });
            } catch (embedError) {
                 console.error("Error embedding document:", embedError, "Metadata:", doc.metadata);
                 // Decide whether to skip this doc or fail the batch
            }
         }

         if (points.length > 0) {
             await vectorStoreClient.upsert(collection, { wait: true, points: points });
             console.log(`Successfully stored ${points.length} points in vector store collection '${collection}'.`);
         } else {
            console.warn(`No valid points generated to store in collection '${collection}'.`);
         }

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
     if (!queryText || typeof queryText !== 'string' || queryText.trim() === '') {
        console.warn("Empty or invalid queryText provided to queryLongTermMemory.");
        return [];
     }
     console.log(`Querying collection '${collection}' for: "${queryText.substring(0, 50)}..."`);
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
            // Ensure pageContent is a string, provide fallback if missing
            pageContent: typeof hit.payload?.pageContent === 'string' ? hit.payload.pageContent : "",
            metadata: hit.payload || {} // Pass through all metadata, ensure object
         }));
         console.log(`Found ${documents.length} relevant documents in collection '${collection}'.`);
         return documents;

    } catch (error) {
         console.error(`Error querying vector store collection '${collection}':`, error);
         // Handle specific errors like collection not found?
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
    if (!redisClient) {
        console.error("Redis client not initialized during getShortTermCache call.");
        return null;
        // Or throw new Error("Redis client not initialized.");
    }
    const cacheKey = `cache:${sessionId}:${key}`;
    try {
        return await redisClient.get(cacheKey);
    } catch (error) {
        console.error(`Error getting cache key ${cacheKey}:`, error);
        return null;
    }
}

/**
 * Stores data in the session cache with a TTL.
 * @param sessionId - Unique identifier for the session.
 * @param key - Key for the cached item.
 * @param value - Value to cache (string).
 * @param ttlSeconds - Time-to-live in seconds.
 */
async function setShortTermCache(sessionId: string, key: string, value: string, ttlSeconds: number = SHORT_TERM_CACHE_TTL_SECONDS) {
     if (!redisClient) {
        console.error("Redis client not initialized during setShortTermCache call.");
        return; // Or throw
     }
     const cacheKey = `cache:${sessionId}:${key}`;
     try {
        await redisClient.set(cacheKey, value, 'EX', ttlSeconds);
     } catch (error) {
        console.error(`Error setting cache key ${cacheKey}:`, error);
     }
}

// --- Recursive Summarization (Trigger/Handler) ---

/**
 * Handles requests to summarize text, potentially part of a recursive process.
 * Delegates the summarization task to the Agent Coordinator service.
 * @param text - The text to summarize.
 * @param context - Optional context.
 * @returns The summary string or an error message.
 */
async function summarize(text: string, context?: string): Promise<string> {
    console.log(`Attempting summarization for text (length: ${text.length})...`);
    if (text.length < SUMMARIZATION_THRESHOLD_LENGTH) {
        console.log("Text length below threshold, returning original text.");
        return text; // Don't summarize very short text
    }

    try {
        // Delegate to Agent Coordinator Service
        const response = await axios.post(`${AGENT_COORDINATOR_URL}/agents/summarizationAgent/execute`, {
             // Use a payload structure consistent with Agent Runner
             context: { text: text },
             config: { context: context } // Pass context in config or another appropriate field
        });

        if (response.data && response.data.success && response.data.result?.summary) {
            console.log("Summarization successful via Agent Coordinator.");
            return response.data.result.summary;
        } else {
             console.error("Summarization agent failed or returned unexpected result:", response.data);
             return `Error: Summarization failed. ${response.data?.error || 'Unknown error'}`;
        }
    } catch (error: any) {
         console.error("Error calling summarization agent via coordinator:", error.response?.data || error.message);
         return `Error: Could not reach summarization agent. ${error.message}`;
    }
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
        // Convert plain objects to Document instances
        const documentInstances = documents.map(d => new Document(d));
        await storeLongTermMemory(collection, documentInstances);
        res.status(200).json({ message: `Documents stored successfully in '${collection}'.` });
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
        if (typeof queryText !== 'string') {
            return res.status(400).json({ error: 'queryText must be a string.' });
        }
        const results = await queryLongTermMemory(collection, queryText, limit, filter);
        res.status(200).json(results);
    } catch (error: any) {
         console.error("Query Memory Error:", error);
         // Provide more specific error if possible (e.g., collection not found)
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
            return res.status(400).json({ error: 'Missing or invalid value in body (must be string).' });
        }
        const ttlSeconds = typeof ttl === 'number' && ttl > 0 ? ttl : SHORT_TERM_CACHE_TTL_SECONDS;
        await setShortTermCache(sessionId, key, value, ttlSeconds);
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
         if (typeof text !== 'string') {
             return res.status(400).json({ error: 'Text must be a string.' });
         }
        const summary = await summarize(text, context);
        if (summary.startsWith('Error:')) {
            // Check if the error was due to agent failure or just inability to summarize
             res.status(500).json({ error: summary });
        } else {
             res.status(200).json({ summary });
        }
    } catch (error: any) {
         console.error("Summarization Route Error:", error);
        res.status(500).json({ error: 'Failed to summarize text.', message: error.message });
    }
};

// Ensure initialization is called when the service starts
initialize();

// Optional: Re-initialize on certain events or periodically if connections drop
// setInterval(initialize, 60 * 60 * 1000); // Re-check connection every hour
