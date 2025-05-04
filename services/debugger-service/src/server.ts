// services/debugger-service/src/server.ts
// Handles Debug Adapter Protocol (DAP) sessions via WebSockets.

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { DebugSession, InitializedEvent, TerminatedEvent, OutputEvent } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { spawn } from 'child_process'; // To launch actual debug adapters

dotenv.config();

const port = process.env.PORT || 3011; // Assign Debugger service port
const app = express(); // Use Express for health check, potentially REST endpoints later

// --- Simple In-Memory Session Management ---
// WARNING: Not suitable for production scaling. Use Redis or DB.
const activeSessions: Map<string, { ws: WebSocket, adapterProcess?: any, dapSession?: DebugSession }> = new Map();

// --- Express Setup (for health check) ---
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const server = http.createServer(app);

// --- WebSocket Server Setup ---
const wss = new WebSocketServer({ server, path: '/dap' });

wss.on('connection', (ws, req) => {
    const sessionId = req.url?.split('?')[1]?.split('=')[1] || `session_${Date.now()}`; // Crude session ID from URL query ?sessionId=xyz
    console.log(`Debugger Service: Client connected for session ${sessionId}`);
    activeSessions.set(sessionId, { ws }); // Store WebSocket connection

    ws.on('message', (message) => {
        const messageString = message.toString();
        console.log(`[${sessionId}] Received from Client:`, messageString.substring(0, 100) + (messageString.length > 100 ? '...' : ''));

        try {
            const request = JSON.parse(messageString) as DebugProtocol.Request;

            // TODO: Implement message routing to the actual Debug Adapter process based on sessionId
            const sessionData = activeSessions.get(sessionId);
            if (sessionData?.adapterProcess) {
                 // Forward message to the debug adapter's stdin
                 console.log(`[${sessionId}] Forwarding to Adapter...`);
                 sessionData.adapterProcess.stdin.write(`Content-Length: ${Buffer.byteLength(messageString)}\r\n\r\n${messageString}`);
             } else if (request.command === 'initialize') {
                // First message should be 'initialize', use it to spawn the adapter
                 console.log(`[${sessionId}] Received initialize request. Spawning adapter...`);
                 // TODO: Determine adapter command based on request.arguments (e.g., type: 'node', 'python')
                 const adapterCommand = 'node'; // Placeholder - should be dynamic
                 const adapterArgs: string[] = []; // Placeholder - e.g., path to node debug adapter script
                 // Example: adapterArgs = [require.resolve('vscode-node-debug2/out/src/nodeDebug')];

                 if (adapterCommand === 'node') { // Actual logic needed here
                    // Placeholder: Echo adapter for testing DAP protocol flow
                     const echoAdapterPath = path.resolve(__dirname, 'echo-adapter.js'); // Simple echo adapter script
                     adapterArgs.push(echoAdapterPath);
                     console.log(`[${sessionId}] Spawning echo adapter: ${adapterCommand} ${adapterArgs.join(' ')}`);

                    const adapterProcess = spawn(adapterCommand, adapterArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
                     sessionData!.adapterProcess = adapterProcess;

                     // Handle adapter output (stdout) -> Forward to Client WS
                     let buffer = '';
                     adapterProcess.stdout.on('data', (data) => {
                        buffer += data.toString();
                         console.log(`[${sessionId}] Raw from Adapter STDOUT:`, data.toString());
                         while (true) {
                            const lengthMatch = buffer.match(/Content-Length: (\d+)\r\n\r\n/);
                            if (!lengthMatch) break;

                            const contentLength = parseInt(lengthMatch[1], 10);
                            const messageStart = lengthMatch[0].length;
                            const messageEnd = messageStart + contentLength;

                            if (buffer.length < messageEnd) break; // Wait for full message

                            const messageJson = buffer.substring(messageStart, messageEnd);
                             console.log(`[${sessionId}] Parsed from Adapter:`, messageJson.substring(0, 100) + (messageJson.length > 100 ? '...' : ''));
                             try {
                                 // Forward DAP message to client
                                 ws.send(messageJson);
                             } catch (sendError) {
                                 console.error(`[${sessionId}] Error sending message to client:`, sendError);
                             }

                             buffer = buffer.substring(messageEnd); // Remove processed message from buffer
                         }
                     });

                     adapterProcess.stderr.on('data', (data) => {
                         console.error(`[${sessionId}] Adapter STDERR:`, data.toString());
                         // Optionally send stderr as OutputEvent to client
                         const errorEvent: DebugProtocol.OutputEvent = {
                           seq: 0, // Client needs to handle seq generation if needed
                           type: 'event',
                           event: 'output',
                           body: { category: 'stderr', output: data.toString() }
                         };
                         ws.send(JSON.stringify(errorEvent));
                     });

                     adapterProcess.on('close', (code) => {
                         console.log(`[${sessionId}] Adapter process exited with code ${code}`);
                         activeSessions.delete(sessionId);
                          try { ws.close(); } catch {}
                     });

                     adapterProcess.on('error', (err) => {
                         console.error(`[${sessionId}] Failed to spawn adapter process:`, err);
                         activeSessions.delete(sessionId);
                         try { ws.close(); } catch {}
                     });

                      // Forward the initial client request AFTER setting up listeners
                      adapterProcess.stdin.write(`Content-Length: ${Buffer.byteLength(messageString)}\r\n\r\n${messageString}`);

                 } else {
                     console.error(`[${sessionId}] Unsupported debug type. Cannot spawn adapter.`);
                     ws.send(JSON.stringify({ type: 'response', request_seq: request.seq, success: false, command: request.command, message: 'Unsupported debug type' }));
                     ws.close();
                     activeSessions.delete(sessionId);
                 }

             } else {
                  console.warn(`[${sessionId}] Received message before adapter process started or unrecognized command: ${request.command}`);
                  // Handle cases where adapter isn't ready or command is unexpected
             }

        } catch (error) {
            console.error(`[${sessionId}] Error processing message:`, error);
            // Inform client about the error?
        }
    });

    ws.on('close', () => {
        console.log(`Debugger Service: Client disconnected for session ${sessionId}`);
        const sessionData = activeSessions.get(sessionId);
        sessionData?.adapterProcess?.kill(); // Kill adapter process if WS closes
        activeSessions.delete(sessionId);
         console.log(`Adapter process for session ${sessionId} killed.`);
    });

    ws.on('error', (error) => {
        console.error(`Debugger Service: WebSocket error for session ${sessionId}:`, error);
        const sessionData = activeSessions.get(sessionId);
        sessionData?.adapterProcess?.kill();
        activeSessions.delete(sessionId);
    });
});

// --- Start Server ---
server.listen(port, () => {
  console.log(`Debugger Service listening on http://localhost:${port}`);
  console.log(`DAP WebSocket endpoint: ws://localhost:${port}/dap`);
});

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing Debugger Service');
  wss.close(); // Close WebSocket server
  // Kill any remaining adapter processes
  activeSessions.forEach((session, id) => {
      console.log(`Killing adapter process for session ${id}`);
      session.adapterProcess?.kill();
  });
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// --- Simple Echo Debug Adapter (for testing) ---
// Create a file named echo-adapter.js next to server.ts
/* echo-adapter.js
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let buffer = '';

process.stdin.on('data', (chunk) => {
    buffer += chunk.toString();
    while (true) {
        const lengthMatch = buffer.match(/Content-Length: (\d+)\r\n\r\n/);
        if (!lengthMatch) break;

        const contentLength = parseInt(lengthMatch[1], 10);
        const messageStart = lengthMatch[0].length;
        const messageEnd = messageStart + contentLength;

        if (buffer.length < messageEnd) break; // Wait for full message

        const messageJson = buffer.substring(messageStart, messageEnd);
        buffer = buffer.substring(messageEnd); // Consume message from buffer

        try {
            const request = JSON.parse(messageJson);
            process.stderr.write(`Echo Adapter Received: ${JSON.stringify(request)}\n`);

            let response;
            if (request.command === 'initialize') {
                response = {
                    type: 'response',
                    request_seq: request.seq,
                    success: true,
                    command: request.command,
                    body: { // Announce capabilities
                        supportsConfigurationDoneRequest: true,
                        supportsTerminateRequest: true,
                        // Add other capabilities as needed
                    }
                };
                 // Send InitializedEvent after InitializeResponse
                const initializedEvent = { type: 'event', seq: 0, event: 'initialized' };
                const initEventMsg = JSON.stringify(initializedEvent);
                 process.stdout.write(`Content-Length: ${Buffer.byteLength(initEventMsg)}\r\n\r\n${initEventMsg}`);

            } else if (request.command === 'configurationDone') {
                 response = { type: 'response', request_seq: request.seq, success: true, command: request.command };
            } else if (request.command === 'terminate' || request.command === 'disconnect') {
                 response = { type: 'response', request_seq: request.seq, success: true, command: request.command };
                  // Send TerminatedEvent before exiting
                 const terminatedEvent = { type: 'event', seq: 0, event: 'terminated' };
                 const termEventMsg = JSON.stringify(terminatedEvent);
                 process.stdout.write(`Content-Length: ${Buffer.byteLength(termEventMsg)}\r\n\r\n${termEventMsg}`);
                 setTimeout(() => process.exit(0), 100); // Exit after sending response/event
            } else {
                // Default echo response for other commands
                response = {
                    type: 'response',
                    request_seq: request.seq,
                    success: true, // Assume success for echo
                    command: request.command,
                    message: `Echoing command: ${request.command}`
                };
            }

            const responseMsg = JSON.stringify(response);
            process.stdout.write(`Content-Length: ${Buffer.byteLength(responseMsg)}\r\n\r\n${responseMsg}`);

        } catch (e) {
            process.stderr.write(`Echo Adapter Error parsing message: ${e}\n`);
        }
    }
});

process.stdin.on('end', () => {
  process.stderr.write('Echo Adapter: Stdin closed.\n');
});
*/
import path from 'path'; // Ensure path is imported at the top

