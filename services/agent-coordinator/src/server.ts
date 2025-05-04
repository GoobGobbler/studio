// services/agent-coordinator/src/server.ts
// Main entry point for the Agent Coordinator Service.
// Handles routing tasks to appropriate AI agents and managing workflows.

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import agent execution logic (placeholder)
import * as agentRunner from './agent-runner';

dotenv.config();

const port = process.env.PORT || 3004;
const app = express();

app.use(cors()); // Configure CORS appropriately
app.use(express.json());

// --- Middleware (Placeholder for Authentication/Authorization) ---
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement proper authentication (e.g., JWT, API Key from internal services/frontend)
  console.warn('Agent Coordinator: Authentication middleware not implemented!');
  next(); // Allow request for now
};

// --- API Routes ---

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Route to execute a specific agent task
app.post('/agents/:agentName/execute', authenticate, agentRunner.handleExecuteAgent);

// Route to manage workflows (e.g., start, stop, query status) - Placeholder
// app.post('/workflows/start', authenticate, workflowManager.handleStartWorkflow);
// app.get('/workflows/:workflowId/status', authenticate, workflowManager.getWorkflowStatus);


// --- Error Handling ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Agent Coordinator Error:", err.stack);
  res.status(500).json({ error: 'Internal Agent Coordinator Error', message: err.message });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Agent Coordinator service listening on http://localhost:${port}`);
  // Initialize connections (e.g., Redis for task queue) if needed
  // taskQueue.initialize();
});

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing Agent Coordinator service');
  // Close connections gracefully
  // taskQueue.close();
  process.exit(0);
});
```