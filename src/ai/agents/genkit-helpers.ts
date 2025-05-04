'use server';
/**
 * @fileOverview Genkit Tool definitions for interacting with backend services.
 * These tools allow AI flows (potentially running via Agent Coordinator)
 * to interact with the IDE's backend capabilities like Git and file system.
 *
 * - getProjectFilesTool - Lists files in the project.
 * - readFileContentTool - Reads the content of a specific file.
 * - writeFileContentTool - Writes content to a specific file.
 * - getGitStatusTool - Gets the current Git status.
 * - gitCommitTool - Performs a Git commit.
 * - gitPushTool - Performs a Git push.
 * - gitPullTool - Performs a Git pull.
 * - runTerminalCommandTool - Executes a command in the integrated terminal.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import axios from 'axios'; // To call backend services

// --- Configuration ---
// URLs for backend services (these might be internal URLs if Genkit runs co-located)
const LANGUAGE_ENV_SERVICE_URL = process.env.LANGUAGE_ENV_SERVICE_URL || 'http://localhost:3006'; // Example URL
const GIT_SERVICE_URL = process.env.GIT_SERVICE_URL || 'http://localhost:3007'; // Example URL

// Helper to make authenticated API calls (replace with actual auth mechanism if needed)
async function callBackendService(url: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    console.log(`Genkit Tool: Calling ${method} ${url}`);
    try {
        const response = await axios({
            method: method,
            url: url,
            data: data,
            // headers: { 'Authorization': `Bearer ${INTERNAL_AUTH_TOKEN}` } // Add auth if needed
        });
        console.log(`Genkit Tool: Received response from ${url} (Status: ${response.status})`);
        return response.data;
    } catch (error: any) {
        console.error(`Genkit Tool: Error calling ${method} ${url}:`, error.response?.data || error.message);
        // Throw a more specific error or return an error structure
        throw new Error(`Backend service call failed: ${error.message}`);
    }
}


// --- File System Tools (via Language Env Service) ---

const GetProjectFilesInputSchema = z.object({
    directory: z.string().optional().default('/').describe("The directory path relative to project root. Defaults to root ('/')."),
    recursive: z.boolean().optional().default(false).describe("Whether to list files recursively."),
});
const GetProjectFilesOutputSchema = z.array(z.string()).describe("A list of file or folder paths relative to the project root.");

export const getProjectFilesTool = ai.defineTool(
    {
        name: 'getProjectFiles',
        description: 'Retrieves a list of files and folders within the current project structure. Useful for understanding project context.',
        inputSchema: GetProjectFilesInputSchema,
        outputSchema: GetProjectFilesOutputSchema,
    },
    async (input) => {
        // Call Language Env Service endpoint
        const params = new URLSearchParams();
        if (input.directory) params.append('path', input.directory);
        if (input.recursive) params.append('recursive', 'true');
        const result = await callBackendService(`${LANGUAGE_ENV_SERVICE_URL}/files/list?${params.toString()}`);
        return result?.files || []; // Assuming the service returns { files: [...] }
    }
);

const ReadFileContentInputSchema = z.object({
    filePath: z.string().describe("The path to the file relative to the project root."),
});
const ReadFileContentOutputSchema = z.string().describe("The content of the file.");

export const readFileContentTool = ai.defineTool(
    {
        name: 'readFileContent',
        description: 'Reads the content of a specific file in the project.',
        inputSchema: ReadFileContentInputSchema,
        outputSchema: ReadFileContentOutputSchema,
    },
    async (input) => {
         // Call Language Env Service endpoint
        const result = await callBackendService(`${LANGUAGE_ENV_SERVICE_URL}/files/read?path=${encodeURIComponent(input.filePath)}`);
        return result?.content || ''; // Assuming the service returns { content: "..." }
    }
);

const WriteFileContentInputSchema = z.object({
    filePath: z.string().describe("The path to the file relative to the project root. Will be created if it doesn't exist."),
    content: z.string().describe("The content to write to the file."),
});
const WriteFileContentOutputSchema = z.object({
    success: z.boolean().describe("Whether the write operation was successful."),
    message: z.string().optional().describe("Optional message, e.g., error details."),
});

export const writeFileContentTool = ai.defineTool(
    {
        name: 'writeFileContent',
        description: 'Writes content to a specific file in the project, overwriting existing content or creating the file if it does not exist.',
        inputSchema: WriteFileContentInputSchema,
        outputSchema: WriteFileContentOutputSchema,
    },
    async (input) => {
        // Call Language Env Service endpoint
         const result = await callBackendService(`${LANGUAGE_ENV_SERVICE_URL}/files/write`, 'POST', {
            path: input.filePath,
            content: input.content,
        });
        return {
            success: result?.success || false,
            message: result?.message
        }; // Assuming the service returns { success: true/false, message?: "..." }
    }
);

// --- Git Tools (via Git Service) ---

const GetGitStatusInputSchema = z.object({}); // No input needed
const GetGitStatusOutputSchema = z.string().describe("The output of 'git status', including branch info, staged, and unstaged changes.");

export const getGitStatusTool = ai.defineTool(
    {
        name: 'getGitStatus',
        description: 'Retrieves the current Git status of the project repository.',
        inputSchema: GetGitStatusInputSchema,
        outputSchema: GetGitStatusOutputSchema,
    },
    async () => {
        const result = await callBackendService(`${GIT_SERVICE_URL}/status`);
        return result?.status || 'Error retrieving Git status.'; // Assuming { status: "..." }
    }
);

const GitCommitInputSchema = z.object({
    message: z.string().describe("The commit message."),
    stageAll: z.boolean().optional().default(true).describe("Whether to stage all changes ('git add .') before committing. Defaults to true."),
});
const GitCommitOutputSchema = z.object({
    success: z.boolean().describe("Whether the commit operation was successful."),
    message: z.string().optional().describe("Output from the git commit command or error details."),
});

export const gitCommitTool = ai.defineTool(
    {
        name: 'gitCommit',
        description: 'Performs a Git commit. By default, stages all changes first.',
        inputSchema: GitCommitInputSchema,
        outputSchema: GitCommitOutputSchema,
    },
    async (input) => {
        const result = await callBackendService(`${GIT_SERVICE_URL}/commit`, 'POST', {
            message: input.message,
            stageAll: input.stageAll,
        });
         return {
             success: result?.success || false,
             message: result?.message
         }; // Assuming { success: true/false, message?: "..." }
    }
);

const GitPushInputSchema = z.object({
    remote: z.string().optional().default('origin').describe("The remote repository name. Defaults to 'origin'."),
    branch: z.string().optional().describe("The branch to push. Defaults to the current branch."),
    force: z.boolean().optional().default(false).describe("Whether to force push."),
});
const GitPushOutputSchema = z.object({
    success: z.boolean().describe("Whether the push operation was successful."),
    message: z.string().optional().describe("Output from the git push command or error details."),
});

export const gitPushTool = ai.defineTool(
    {
        name: 'gitPush',
        description: 'Pushes committed changes to a remote Git repository.',
        inputSchema: GitPushInputSchema,
        outputSchema: GitPushOutputSchema,
    },
    async (input) => {
         const result = await callBackendService(`${GIT_SERVICE_URL}/push`, 'POST', {
             remote: input.remote,
             branch: input.branch,
             force: input.force,
         });
          return {
              success: result?.success || false,
              message: result?.message
          }; // Assuming { success: true/false, message?: "..." }
    }
);


const GitPullInputSchema = z.object({
    remote: z.string().optional().default('origin').describe("The remote repository name. Defaults to 'origin'."),
    branch: z.string().optional().describe("The branch to pull. Defaults to the current branch."),
    rebase: z.boolean().optional().default(false).describe("Whether to use 'pull --rebase'."),
});
const GitPullOutputSchema = z.object({
    success: z.boolean().describe("Whether the pull operation was successful."),
    message: z.string().optional().describe("Output from the git pull command or error details."),
});

export const gitPullTool = ai.defineTool(
    {
        name: 'gitPull',
        description: 'Fetches changes from a remote Git repository and merges them into the current branch.',
        inputSchema: GitPullInputSchema,
        outputSchema: GitPullOutputSchema,
    },
    async (input) => {
         const result = await callBackendService(`${GIT_SERVICE_URL}/pull`, 'POST', {
             remote: input.remote,
             branch: input.branch,
             rebase: input.rebase,
         });
          return {
              success: result?.success || false,
              message: result?.message
          }; // Assuming { success: true/false, message?: "..." }
    }
);


// --- Terminal Command Execution Tool ---

const RunTerminalCommandInputSchema = z.object({
    command: z.string().describe("The command line string to execute."),
    directory: z.string().optional().describe("The directory to run the command in (relative to project root). Defaults to root."),
    timeoutMs: z.number().optional().default(30000).describe("Timeout in milliseconds. Defaults to 30000 (30 seconds)."),
});
const RunTerminalCommandOutputSchema = z.object({
    success: z.boolean().describe("Whether the command exited with code 0."),
    stdout: z.string().optional().describe("Standard output from the command."),
    stderr: z.string().optional().describe("Standard error output from the command."),
    exitCode: z.number().optional().nullable().describe("The exit code of the command."),
});

export const runTerminalCommandTool = ai.defineTool(
    {
        name: 'runTerminalCommand',
        description: 'Executes a shell command within the project\'s environment (e.g., inside the Nix container). Use for build steps, tests, etc. Avoid long-running or interactive commands.',
        inputSchema: RunTerminalCommandInputSchema,
        outputSchema: RunTerminalCommandOutputSchema,
    },
    async (input) => {
        // Call Language Env Service or a dedicated execution service
         const result = await callBackendService(`${LANGUAGE_ENV_SERVICE_URL}/execute`, 'POST', {
             command: input.command,
             cwd: input.directory,
             timeout: input.timeoutMs,
         });
         return {
             success: result?.exitCode === 0,
             stdout: result?.stdout,
             stderr: result?.stderr,
             exitCode: result?.exitCode,
         }; // Assuming the service returns { success: bool, stdout?: string, stderr?: string, exitCode: number | null }
    }
);


// --- Example Flow using tools (Placeholder - Actual flows might be managed by Agent Coordinator) ---

const GenerateReadmeInputSchema = z.object({
  projectName: z.string().describe("The name of the project."),
  projectDescription: z.string().describe("A brief description of the project."),
});
const GenerateReadmeOutputSchema = z.object({
  readmeContent: z.string().describe("The generated README.md content."),
});

// Define a prompt that might utilize the tool
const generateReadmePrompt = ai.definePrompt({
    name: 'generateReadmePrompt',
    input: { schema: GenerateReadmeInputSchema },
    output: { schema: GenerateReadmeOutputSchema },
    // Instruct the LLM to use the tool if needed
    system: `You are an expert technical writer. Generate a README.md file for the given project.
Use the getProjectFiles tool to understand the project structure.
Use the readFileContent tool to examine key files like package.json or main application files if needed for context.
Format the output as Markdown.`,
    // Include the tool definitions
    tools: [getProjectFilesTool, readFileContentTool],
    prompt: `Generate a README.md for a project named "{{projectName}}".
Description: {{projectDescription}}

Structure the README with sections like Introduction, Features, Getting Started, Usage, Contributing, etc.
Be concise and informative. Use the available tools to get context about project files if needed.`,
});


// Define the flow that uses the prompt (and implicitly the tool)
export const generateReadmeFlow = ai.defineFlow(
    {
        name: 'generateReadmeFlow',
        inputSchema: GenerateReadmeInputSchema,
        outputSchema: GenerateReadmeOutputSchema,
    },
    async (input) => {
        console.log("Genkit Flow: Executing generateReadmeFlow with input:", input);
        // The Genkit runtime handles calling the tool if the LLM decides to use it.
        const { output } = await generateReadmePrompt(input);
        if (!output) {
             throw new Error("README generation failed to produce output.");
        }
        console.log("Genkit Flow: generateReadmeFlow completed.");
        return output;
    }
);

// Exported wrapper function for the flow (might be called by Agent Coordinator)
export async function generateProjectReadme(input: z.infer<typeof GenerateReadmeInputSchema>): Promise<z.infer<typeof GenerateReadmeOutputSchema>> {
    return generateReadmeFlow(input);
}

// --- Potential Enhancements ---
// - Defining more sophisticated tools that interact with backend services (Docker, Nix, Secrets, Observability, Deployment)
// - Tools for specific agent actions like running tests and parsing results.
// - Adding authentication/authorization checks within the tool implementations if needed.
