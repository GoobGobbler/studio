// services/language-env-service/src/server.ts
// Handles file system access, command execution, and potentially Nix environment management.

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import shell from 'shelljs'; // For simpler command execution
import * as pty from 'node-pty'; // For interactive PTY sessions
import os from 'os';

dotenv.config();

const port = process.env.PORT || 3006; // Assign Lang Env service port
const workspaceRoot = process.env.WORKSPACE_ROOT || path.resolve(__dirname, '../../..'); // Assume project root
const app = express();
const ptyProcesses: { [key: string]: pty.IPty } = {}; // Store PTY processes

app.use(cors());
app.use(express.json());

// --- Helper Functions ---
function resolveWorkspacePath(relativePath: string): string {
    const resolved = path.resolve(workspaceRoot, relativePath);
    // Security check: Ensure the resolved path is still within the workspace root
    if (!resolved.startsWith(workspaceRoot)) {
        throw new Error(`Access denied: Path '${relativePath}' is outside the workspace.`);
    }
    return resolved;
}

// --- Middleware (Placeholder for Authentication/Authorization) ---
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  console.warn('Language Env Service: Auth middleware not implemented!');
  // TODO: Verify request source (e.g., Frontend, other internal services)
  next(); // Allow request for now
};

// --- API Routes ---

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// === File System Operations ===

// List files/folders
app.get('/files/list', authenticate, async (req: Request, res: Response) => {
    const relativePath = (req.query.path as string) || '/';
    const recursive = req.query.recursive === 'true'; // Basic recursive flag
    try {
        const targetPath = resolveWorkspacePath(relativePath);
         console.log(`Language Env Service: Listing files in ${targetPath} (recursive: ${recursive})`);

         const files: string[] = [];
         const listDir = async (dir: string, currentRelative: string) => {
             const entries = await fs.readdir(dir, { withFileTypes: true });
             for (const entry of entries) {
                 // Skip hidden files/folders like .git, node_modules
                 if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

                 const entryRelativePath = path.join(currentRelative, entry.name);
                 files.push(entryRelativePath);
                 if (recursive && entry.isDirectory()) {
                     await listDir(path.join(dir, entry.name), entryRelativePath);
                 }
             }
         }

         await listDir(targetPath, relativePath);
         res.status(200).json({ success: true, path: relativePath, files });

    } catch (error: any) {
         console.error(`Language Env Service: Error listing files at '${relativePath}':`, error);
         const status = error.code === 'ENOENT' ? 404 : 500;
         res.status(status).json({ success: false, message: `Error listing files: ${error.message}` });
    }
});


// Read file content
app.get('/files/read', authenticate, async (req: Request, res: Response) => {
    const relativePath = req.query.path as string;
    if (!relativePath) {
        return res.status(400).json({ success: false, message: 'Missing required query parameter: path' });
    }
    try {
         const targetPath = resolveWorkspacePath(relativePath);
         console.log(`Language Env Service: Reading file ${targetPath}`);
         const content = await fs.readFile(targetPath, 'utf-8');
         res.status(200).json({ success: true, path: relativePath, content });
    } catch (error: any) {
        console.error(`Language Env Service: Error reading file '${relativePath}':`, error);
        const status = error.code === 'ENOENT' ? 404 : 500;
        res.status(status).json({ success: false, message: `Error reading file: ${error.message}` });
    }
});

// Write file content
app.post('/files/write', authenticate, async (req: Request, res: Response) => {
    const { path: relativePath, content } = req.body;
     if (!relativePath || typeof content !== 'string') {
         return res.status(400).json({ success: false, message: 'Missing or invalid parameters: path (string), content (string).' });
     }
     try {
         const targetPath = resolveWorkspacePath(relativePath);
         console.log(`Language Env Service: Writing to file ${targetPath}`);
         await fs.mkdir(path.dirname(targetPath), { recursive: true }); // Ensure directory exists
         await fs.writeFile(targetPath, content, 'utf-8');
         res.status(200).json({ success: true, message: `File '${relativePath}' saved successfully.` });
     } catch (error: any) {
         console.error(`Language Env Service: Error writing file '${relativePath}':`, error);
         res.status(500).json({ success: false, message: `Error writing file: ${error.message}` });
     }
});

// === Command Execution ===

// Execute a non-interactive command
app.post('/execute', authenticate, (req: Request, res: Response) => {
    const { command, cwd, timeout = 30000 } = req.body; // Timeout in ms
    if (!command) {
        return res.status(400).json({ success: false, message: 'Missing required parameter: command' });
    }

    try {
         const targetCwd = cwd ? resolveWorkspacePath(cwd) : workspaceRoot;
         console.log(`Language Env Service: Executing command in ${targetCwd}: ${command}`);

         // Use shelljs for simpler execution, capture output
         shell.cd(targetCwd);
         const result = shell.exec(command, { silent: true, async: false, timeout: timeout }); // shelljs timeout is less reliable

         console.log(`Language Env Service: Command finished with code ${result.code}`);
         res.status(200).json({
             success: result.code === 0,
             stdout: result.stdout,
             stderr: result.stderr,
             exitCode: result.code,
         });

    } catch (error: any) {
        console.error(`Language Env Service: Error executing command '${command}':`, error);
        res.status(500).json({ success: false, message: `Error executing command: ${error.message}` });
    } finally {
        shell.cd(workspaceRoot); // Reset directory just in case
    }
});


// === Nix Environment Management (Placeholders) ===
// These would require installing Nix and potentially using 'nix-shell' or flakes

app.get('/envs', authenticate, (req: Request, res: Response) => {
     console.log("Language Env Service: Request to list environments (Placeholder).");
     // TODO: Implement logic to detect/list available Nix environments (e.g., from flake.nix or shell.nix files)
     const exampleEnvs = [
         { id: 'python3.11', name: 'Python 3.11 Env', active: true }, // Assuming one is active based on current shell
         { id: 'node20', name: 'Node.js 20 Env', active: false },
     ];
     res.status(200).json({ success: true, environments: exampleEnvs });
});

app.post('/envs/:envId/activate', authenticate, (req: Request, res: Response) => {
    const envId = req.params.envId;
    console.log(`Language Env Service: Request to activate environment '${envId}' (Placeholder).`);
    // TODO: Implement logic to launch a shell within the specified Nix environment.
    // This is complex, might involve restarting PTY sessions within the Nix shell.
    res.status(501).json({ success: false, message: 'Environment activation not yet implemented.' });
});

// --- Error Handling ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Language Env Service Error:", err.stack);
  // Avoid sending detailed internal errors to client unless necessary
  res.status(500).json({ error: 'Internal Language Environment Service Error' });
});

// --- Start Server ---
const server = app.listen(port, () => {
  console.log(`Language Environment Service listening on http://localhost:${port}`);
  console.log(`Workspace Root: ${workspaceRoot}`);
});


// --- WebSocket for PTY ---
import { Server as WebSocketServer } from 'ws';
const wss = new WebSocketServer({ server, path: '/pty' }); // Attach WebSocket server to the same HTTP server

wss.on('connection', (ws) => {
    console.log('PTY WebSocket client connected');
    // NOTE: Using a simple /bin/sh for broad compatibility.
    // In a Nix setup, you might launch `nix-shell` here.
    // Determine shell based on OS
    const shellCmd = os.platform() === 'win32' ? 'powershell.exe' : '/bin/sh'; // Basic shell
    const ptyProcess = pty.spawn(shellCmd, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: workspaceRoot, // Start PTY in workspace root
        env: process.env as { [key: string]: string } // Pass environment variables
    });

    const termId = Date.now().toString(); // Simple ID
    ptyProcesses[termId] = ptyProcess;
    console.log(`PTY process ${termId} created.`);

    // Forward PTY output to WebSocket client
    ptyProcess.onData((data: string) => {
        try {
             ws.send(data);
        } catch (ex) {
             console.error("Error sending PTY data to WebSocket:", ex);
        }
    });

    // Handle input from WebSocket client and write to PTY
    ws.on('message', (message: Buffer | string) => {
         const input = typeof message === 'string' ? message : message.toString();
         // console.log("PTY Input:", input); // Debugging input
         ptyProcess.write(input);
    });

    // Handle resize commands from client
     ws.on('message', (message: Buffer | string) => {
         try {
             const msgString = typeof message === 'string' ? message : message.toString();
             const parsed = JSON.parse(msgString);
             if (parsed.type === 'resize' && parsed.cols && parsed.rows) {
                 console.log(`Resizing PTY ${termId} to ${parsed.cols}x${parsed.rows}`);
                 ptyProcess.resize(parsed.cols, parsed.rows);
             }
         } catch (e) {
             // Ignore non-JSON messages or messages not for resize
             ptyProcess.write(typeof message === 'string' ? message : message.toString());
         }
     });


    // Clean up when WebSocket closes
    ws.on('close', () => {
        console.log(`PTY WebSocket client disconnected for ${termId}`);
        ptyProcess.kill();
        delete ptyProcesses[termId];
         console.log(`PTY process ${termId} killed.`);
    });

     ws.on('error', (err) => {
        console.error(`PTY WebSocket error for ${termId}:`, err);
         ptyProcess.kill();
         delete ptyProcesses[termId];
     });

     ptyProcess.onExit(({ exitCode, signal }) => {
        console.log(`PTY process ${termId} exited with code ${exitCode}, signal ${signal}`);
        delete ptyProcesses[termId];
         try {
            ws.close(); // Close WebSocket connection if PTY exits
         } catch {}
    });
});

console.log(`PTY WebSocket server listening on ws://localhost:${port}/pty`);


// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing Language Env Service');
  // Kill all running PTY processes
  Object.keys(ptyProcesses).forEach(key => {
      console.log(`Killing PTY process ${key}`);
      ptyProcesses[key].kill();
      delete ptyProcesses[key];
  });
  wss.close(() => console.log('WebSocket server closed.'));
  server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
  });
});
