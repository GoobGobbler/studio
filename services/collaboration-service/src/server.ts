// services/collaboration-service/src/server.ts
// Placeholder implementation for real-time collaboration using Yjs and WebSockets

import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils'; // Correct import path
// import { LeveldbPersistence } from 'y-leveldb'; // Example persistence
// import Redis from 'ioredis'; // For y-redis persistence or pub/sub

import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const port = process.env.PORT || 3001;
// const persistenceDir = process.env.YJS_PERSISTENCE_DIR || './yjs-db';

// --- Persistence Setup (Choose one or adapt) ---
// Option 1: LevelDB (Simple file-based persistence)
// const persistence = new LeveldbPersistence(persistenceDir);

// Option 2: Redis (Requires Redis server and y-redis adapter - Install separately)
// import { RedisPersistence } from 'y-redis'; // Assuming y-redis is installed
// const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
// const persistence = new RedisPersistence({ redisOpts: redisClient }); // Check y-redis docs for config

// --- Express App Setup (Optional - for health checks, etc.) ---
const app = express();
app.use(cors()); // Enable CORS if accessed from different origin than frontend
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// --- HTTP Server ---
const server = http.createServer(app);

// --- WebSocket Server Setup ---
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
  console.log('WebSocket connection established');

  // Use y-websocket's utility to handle Yjs protocol negotiation and document syncing.
  // It automatically handles different documents based on the URL path requested by the client.
  // Example URL from client: ws://localhost:3001/project-doc/my-project-id
  setupWSConnection(ws, req, {
    // --- Persistence Integration ---
    // Check if persistence should be used based on docName or other criteria
    // docName comes from the URL path, e.g., 'project-doc/my-project-id'
    // persistence: persistence, // Uncomment and use your chosen persistence adapter
    // Optional: Provide a GC (Garbage Collection) setting for persistence
    // gc: true,
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// --- Start Server ---
server.listen(port, () => {
  console.log(`Collaboration service listening on http://localhost:${port}`);
  console.log(`WebSocket server ready on ws://localhost:${port}`);
});

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  wss.close(() => {
    console.log('WebSocket server closed');
  });
  server.close(() => {
    console.log('HTTP server closed');
    // Close persistence connection if necessary
    // persistence?.destroy().then(() => console.log('Persistence closed'));
    // redisClient?.disconnect();
    process.exit(0);
  });
});
