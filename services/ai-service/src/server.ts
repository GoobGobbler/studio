// services/ai-service/src/server.ts
// Main entry point for the AI Service backend.
// Handles requests related to memory management, LLM interaction, and RAG.

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import specific AI logic modules (placeholders)
import * as memoryManager from './memory';
import * as llmHandler from './llm-handler';
import * as ragHandler from './rag-handler';

dotenv.config();

const port = process.env.PORT || 3003;
const app = express();

app.use(cors()); // Configure CORS appropriately for production
app.use(express.json({ limit: '50mb' })); // Increase limit for potential large embeddings/docs

// --- Middleware (Placeholder for Authentication/Authorization) ---
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement proper authentication (e.g., JWT, API Key from internal services)
  // Verify the request comes from an authorized source (e.g., Agent Coordinator, Frontend Proxy)
  console.warn('AI Service: Authentication middleware not implemented!');
  next(); // Allow request for now
};

// --- API Routes ---

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// === Memory Routes ===
app.post('/memory/query', authenticate, memoryManager.handleQuery); // Query long-term memory (Vector DB)
app.post('/memory/store', authenticate, memoryManager.handleStore); // Store data in long-term memory
app.get('/memory/cache/:sessionId/:key', authenticate, memoryManager.handleCacheGet); // Get short-term cache
app.post('/memory/cache/:sessionId/:key', authenticate, memoryManager.handleCacheSet); // Set short-term cache
app.post('/memory/summarize', authenticate, memoryManager.handleSummarize); // Trigger summarization

// === LLM Interaction Routes ===
app.post('/llm/complete', authenticate, llmHandler.handleCompletion); // Basic completion
app.post('/llm/chat', authenticate, llmHandler.handleChat); // Chat interaction
app.post('/llm/embed', authenticate, llmHandler.handleEmbed); // Generate embeddings

// === RAG Routes ===
app.post('/rag/query', authenticate, ragHandler.handleRAGQuery); // Query with Retrieval Augmented Generation
app.post('/rag/ingest', authenticate, ragHandler.handleIngest); // Ingest documents into Vector DB

// === Agent Support Routes (Potentially called by Coordinator) ===
// Example: Route to execute a specific LangChain chain or tool needed by an agent
// app.post('/agents/execute-chain', authenticate, agentSupportHandler.executeChain);

// --- Error Handling ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("AI Service Error:", err.stack);
  res.status(500).json({ error: 'Internal AI Service Error', message: err.message });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`AI service listening on http://localhost:${port}`);
  // Initialize connections (e.g., Vector DB, Redis)
  memoryManager.initialize();
});

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing AI service');
  // Close connections gracefully
  memoryManager.cleanup();
  // Add cleanup for other resources if needed
  process.exit(0);
});
```