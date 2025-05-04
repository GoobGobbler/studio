// services/workflow-service/src/server.ts
// Handles parsing and execution of user-defined YAML workflows.

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import yaml from 'js-yaml';
import axios from 'axios'; // To call other services

dotenv.config();

const port = process.env.PORT || 3010; // Assign a new port
const app = express();

app.use(cors());
app.use(express.json());

// --- Placeholder Data (Replace with actual storage/retrieval) ---
interface Workflow {
    id: string;
    name: string;
    description: string;
    trigger: string; // e.g., 'manual', 'onCommit', 'onFileChange'
    yamlContent: string; // Store the raw YAML
}
const workflows: Workflow[] = [
    { id: 'build-test', name: 'Build & Test', description: 'Runs build script and unit tests.', trigger: 'onCommit', yamlContent: `
name: Build and Test Workflow
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest # Example runner
    steps:
      - uses: actions/checkout@v3 # Example step
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npm test
` },
     { id: 'deploy-staging', name: 'Deploy Staging', description: 'Deploys to staging environment.', trigger: 'manual', yamlContent: `
name: Deploy to Staging
on: [workflow_dispatch] # Manual trigger
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy using QC Agent
        # This step would ideally call an agent/service
        run: echo "Simulating deployment to staging..."
` },
];

// --- Workflow Execution Logic (Placeholder) ---
async function executeWorkflow(workflow: Workflow, inputPayload?: any): Promise<{ success: boolean, logs: string[] }> {
    console.log(`Executing workflow: ${workflow.name} (ID: ${workflow.id})`);
    const logs: string[] = [`[${new Date().toISOString()}] Starting workflow: ${workflow.name}`];

    try {
        // 1. Parse YAML content
        const parsedWorkflow = yaml.load(workflow.yamlContent) as any; // Use 'any' for simplicity, consider Zod validation
        logs.push(`[INFO] Parsed workflow YAML.`);

        if (!parsedWorkflow || !parsedWorkflow.jobs) {
            logs.push(`[ERROR] Invalid workflow structure: Missing 'jobs'.`);
            return { success: false, logs };
        }

        // 2. Iterate through jobs and steps (basic simulation)
        for (const jobName in parsedWorkflow.jobs) {
            const job = parsedWorkflow.jobs[jobName];
            logs.push(`[INFO] Starting job: ${jobName}`);
            if (!job.steps || !Array.isArray(job.steps)) {
                logs.push(`[WARN] Job '${jobName}' has no steps.`);
                continue;
            }

            for (const step of job.steps) {
                 const stepName = step.name || `Step ${job.steps.indexOf(step) + 1}`;
                logs.push(`[INFO] Executing step: ${stepName}`);

                if (step.run) {
                    // Simulate running a shell command
                    logs.push(`[CMD] ${step.run}`);
                    // TODO: Call Language Env Service / Execution Service to run the command
                    // try {
                    //   const response = await axios.post('http://language-env-service:3006/execute', { command: step.run });
                    //   logs.push(`[STDOUT] ${response.data.stdout || ''}`);
                    //   if (response.data.stderr) logs.push(`[STDERR] ${response.data.stderr}`);
                    //   if (!response.data.success) throw new Error(`Command failed with exit code ${response.data.exitCode}`);
                    // } catch (err: any) {
                    //   logs.push(`[ERROR] Step '${stepName}' failed: ${err.message}`);
                    //   return { success: false, logs };
                    // }
                    await new Promise(r => setTimeout(r, 200)); // Simulate execution time
                    logs.push(`[INFO] Step '${stepName}' completed (simulation).`);
                } else if (step.uses) {
                    // Simulate using an action (e.g., GitHub Action syntax)
                    logs.push(`[ACTION] uses: ${step.uses}`);
                    // TODO: Implement logic to handle specific 'uses' actions if needed,
                    // potentially by mapping them to internal agent calls or services.
                     await new Promise(r => setTimeout(r, 100));
                     logs.push(`[INFO] Action '${step.uses}' completed (simulation).`);
                } else {
                    logs.push(`[WARN] Step '${stepName}' has no 'run' or 'uses' field.`);
                }
            }
             logs.push(`[INFO] Job '${jobName}' completed.`);
        }

        logs.push(`[${new Date().toISOString()}] Workflow '${workflow.name}' finished successfully.`);
        return { success: true, logs };

    } catch (error: any) {
        logs.push(`[ERROR] Workflow execution failed: ${error.message}`);
        console.error(`Workflow execution error (${workflow.id}):`, error);
        return { success: false, logs };
    }
}


// --- Middleware (Placeholder for Authentication/Authorization) ---
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  console.warn('Workflow Service: Authentication middleware not implemented!');
  next(); // Allow request for now
};

// --- API Routes ---

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// List defined workflows
app.get('/workflows', authenticate, (req: Request, res: Response) => {
    console.log("Workflow Service: Request to list workflows.");
    // TODO: Fetch from storage (Git repo, DB)
    res.status(200).json({ workflows: workflows.map(w => ({ id: w.id, name: w.name, description: w.description, trigger: w.trigger })) }); // Don't send yamlContent by default
});

// Get a specific workflow definition (including YAML)
app.get('/workflows/:workflowId', authenticate, (req: Request, res: Response) => {
    const workflowId = req.params.workflowId;
    console.log(`Workflow Service: Request to get workflow: ${workflowId}`);
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found.' });
    }
    res.status(200).json({ workflow });
});

// Create/Update a workflow
app.put('/workflows/:workflowId', authenticate, (req: Request, res: Response) => {
    const workflowId = req.params.workflowId;
    const { name, description, trigger, yamlContent } = req.body;
    console.log(`Workflow Service: Request to create/update workflow: ${workflowId}`);

    if (!name || !yamlContent) {
        return res.status(400).json({ error: 'Missing required fields: name, yamlContent.' });
    }

    // Validate YAML (basic)
    try {
        yaml.load(yamlContent);
    } catch (e: any) {
        return res.status(400).json({ error: 'Invalid YAML content.', details: e.message });
    }

    const existingIndex = workflows.findIndex(w => w.id === workflowId);
    const newWorkflow: Workflow = { id: workflowId, name, description: description || '', trigger: trigger || 'manual', yamlContent };

    if (existingIndex > -1) {
        workflows[existingIndex] = newWorkflow;
        res.status(200).json({ message: 'Workflow updated successfully.', workflow: newWorkflow });
    } else {
        workflows.push(newWorkflow);
        res.status(201).json({ message: 'Workflow created successfully.', workflow: newWorkflow });
    }
    // TODO: Persist to storage
});

// Delete a workflow
app.delete('/workflows/:workflowId', authenticate, (req: Request, res: Response) => {
    const workflowId = req.params.workflowId;
     console.log(`Workflow Service: Request to delete workflow: ${workflowId}`);
     const index = workflows.findIndex(w => w.id === workflowId);
     if (index === -1) {
         return res.status(404).json({ error: 'Workflow not found.' });
     }
     workflows.splice(index, 1);
     // TODO: Delete from storage
     res.status(200).json({ message: 'Workflow deleted successfully.' });
});

// Manually trigger a workflow execution
app.post('/workflows/:workflowId/execute', authenticate, async (req: Request, res: Response) => {
    const workflowId = req.params.workflowId;
    const inputPayload = req.body.payload; // Optional payload for the workflow
    console.log(`Workflow Service: Request to execute workflow: ${workflowId}`);
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found.' });
    }

    // Execute asynchronously (don't block the request)
    executeWorkflow(workflow, inputPayload)
        .then(result => {
            console.log(`Workflow ${workflowId} execution finished. Success: ${result.success}`);
            // TODO: Store execution results/logs somewhere accessible
        })
        .catch(error => {
            console.error(`Error during async workflow execution (${workflowId}):`, error);
        });

    res.status(202).json({ message: `Workflow '${workflowId}' execution started (placeholder). Check logs for status.` });
});

// --- Error Handling ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Workflow Service Error:", err.stack);
  res.status(500).json({ error: 'Internal Workflow Service Error', message: err.message });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Workflow Service listening on http://localhost:${port}`);
});

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing Workflow Service');
  process.exit(0);
});
