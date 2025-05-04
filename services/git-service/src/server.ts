// services/git-service/src/server.ts
// Handles Git operations for the workspace.

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import path from 'path';

dotenv.config();

const port = process.env.PORT || 3007; // Assign Git service port
const workspaceRoot = process.env.WORKSPACE_ROOT || path.resolve(__dirname, '../../..'); // Assume project root for now
const app = express();

app.use(cors());
app.use(express.json());

// --- Git Client Setup ---
const options: Partial<SimpleGitOptions> = {
   baseDir: workspaceRoot,
   binary: 'git',
   maxConcurrentProcesses: 6,
   trimmed: false,
};
const git: SimpleGit = simpleGit(options);

// --- Middleware (Placeholder for Authentication/Authorization) ---
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  console.warn('Git Service: Authentication/Authorization middleware not implemented!');
  // TODO: Check if the requesting service/user has rights to perform Git actions
  next(); // Allow request for now
};

// --- API Routes ---

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Get Git status
app.get('/status', authenticate, async (req: Request, res: Response) => {
    try {
        console.log(`Git Service: Fetching status for ${workspaceRoot}`);
        const status = await git.status();
        // Format the status nicely (simple-git provides a detailed object)
        const formattedStatus = `
Branch: ${status.current}
Tracking: ${status.tracking}
Ahead: ${status.ahead}, Behind: ${status.behind}

Changes not staged for commit:
${status.not_added.map(f => `  new file:   ${f}`).join('\n')}
${status.conflicted.map(f => `  unmerged:   ${f}`).join('\n')}
${status.created.map(f => `  created:    ${f}`).join('\n')}
${status.deleted.map(f => `  deleted:    ${f}`).join('\n')}
${status.modified.map(f => `  modified:   ${f}`).join('\n')}
${status.renamed.map(f => `  renamed:    ${f.from} -> ${f.to}`).join('\n')}

Changes to be committed:
${status.staged.map(f => `  staged:     ${f}`).join('\n')}
`;
        res.status(200).json({ success: true, status: formattedStatus, rawStatus: status });
    } catch (error: any) {
         console.error("Git Service: Error getting status:", error);
         res.status(500).json({ success: false, message: `Error getting Git status: ${error.message}` });
    }
});

// Commit changes
app.post('/commit', authenticate, async (req: Request, res: Response) => {
    const { message, stageAll = true } = req.body;
    if (!message) {
        return res.status(400).json({ success: false, message: 'Commit message is required.' });
    }
    try {
        console.log(`Git Service: Performing commit with message: "${message}" (stageAll: ${stageAll})`);
        if (stageAll) {
             await git.add('.'); // Stage all changes
             console.log("Git Service: Staged all changes.");
        }
        const commitResult = await git.commit(message);
         console.log("Git Service: Commit successful.", commitResult);
         res.status(200).json({ success: true, message: `Commit successful: ${commitResult.commit}`, result: commitResult });
    } catch (error: any) {
         console.error("Git Service: Error committing:", error);
         res.status(500).json({ success: false, message: `Error committing changes: ${error.message}` });
    }
});

// Push changes
app.post('/push', authenticate, async (req: Request, res: Response) => {
    const { remote = 'origin', branch, force = false } = req.body;
    try {
        const currentBranch = branch || (await git.status()).current;
         if (!currentBranch) {
            return res.status(400).json({ success: false, message: 'Could not determine current branch.' });
         }
        console.log(`Git Service: Pushing to ${remote}/${currentBranch} (force: ${force})`);
         const pushOptions = force ? { '--force': null } : {};
        const pushResult = await git.push(remote, currentBranch, pushOptions);
         console.log("Git Service: Push successful.", pushResult);
         res.status(200).json({ success: true, message: `Push to ${remote}/${currentBranch} successful.`, result: pushResult });
    } catch (error: any) {
         console.error("Git Service: Error pushing:", error);
         // Provide more specific feedback if possible (e.g., authentication failed, non-fast-forward)
         res.status(500).json({ success: false, message: `Error pushing changes: ${error.message}` });
    }
});

// Pull changes
app.post('/pull', authenticate, async (req: Request, res: Response) => {
    const { remote = 'origin', branch, rebase = false } = req.body;
     try {
        const currentBranch = branch || (await git.status()).current;
         if (!currentBranch) {
            return res.status(400).json({ success: false, message: 'Could not determine current branch.' });
         }
        console.log(`Git Service: Pulling from ${remote}/${currentBranch} (rebase: ${rebase})`);
         const pullOptions = rebase ? { '--rebase': null } : {};
        const pullResult = await git.pull(remote, currentBranch, pullOptions);
        console.log("Git Service: Pull successful.", pullResult);
        // Check pullResult.summary for conflicts etc.
         res.status(200).json({ success: true, message: `Pull from ${remote}/${currentBranch} successful. ${pullResult.summary.changes} changes.`, result: pullResult });
    } catch (error: any) {
         console.error("Git Service: Error pulling:", error);
         res.status(500).json({ success: false, message: `Error pulling changes: ${error.message}` });
    }
});

// List branches
app.get('/branches', authenticate, async (req: Request, res: Response) => {
     try {
         console.log("Git Service: Listing branches");
         const branches = await git.branchLocal();
         res.status(200).json({ success: true, branches: branches });
     } catch (error: any) {
         console.error("Git Service: Error listing branches:", error);
         res.status(500).json({ success: false, message: `Error listing branches: ${error.message}` });
     }
});

// Create branch
app.post('/branches', authenticate, async (req: Request, res: Response) => {
    const { name, checkout = false } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Branch name is required.' });
    }
    try {
        console.log(`Git Service: Creating branch '${name}' (checkout: ${checkout})`);
        const options = checkout ? ['-b'] : [];
        await git.checkout(options.concat(name));
         res.status(201).json({ success: true, message: `Branch '${name}' created${checkout ? ' and checked out' : ''}.` });
    } catch (error: any) {
        console.error("Git Service: Error creating branch:", error);
        res.status(500).json({ success: false, message: `Error creating branch '${name}': ${error.message}` });
    }
});

// Checkout branch/commit
app.post('/checkout', authenticate, async (req: Request, res: Response) => {
    const { target } = req.body; // target can be branch name or commit hash
    if (!target) {
        return res.status(400).json({ success: false, message: 'Target branch or commit is required.' });
    }
    try {
         console.log(`Git Service: Checking out '${target}'`);
         await git.checkout(target);
         const newStatus = await git.status();
         res.status(200).json({ success: true, message: `Checked out '${target}'. Current branch: ${newStatus.current}`, branch: newStatus.current });
    } catch (error: any)
         console.error("Git Service: Error checking out:", error);
         res.status(500).json({ success: false, message: `Error checking out '${target}': ${error.message}` });
    }
});


// TODO: Implement Merge, Revert, Clone, Fetch, GitHub Import (requires OAuth handling)

// --- Error Handling ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Git Service Error:", err.stack);
  res.status(500).json({ error: 'Internal Git Service Error', message: err.message });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Git service listening on http://localhost:${port}`);
  console.log(`Operating on Git repository at: ${workspaceRoot}`);
  // Check if the workspace is a git repository
  git.checkIsRepo()
     .then(isRepo => console.log(`Is Git Repository: ${isRepo}`))
     .catch(err => console.error("Git check failed:", err));
});

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing Git Service');
  process.exit(0);
});
