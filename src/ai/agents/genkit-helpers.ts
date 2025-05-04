// src/ai/agents/genkit-helpers.ts
// Helper functions for more complex Genkit interactions,
// potentially simulating agent-like behavior by chaining flows or using tools.

'use server'; // Required if these functions are called from Server Components or Actions

import { ai } from '@/ai/ai-instance';
import { generateCodeFromPrompt, type GenerateCodeFromPromptInput } from '@/ai/flows/generate-code-from-prompt';
import { explainSelectedCode, type ExplainSelectedCodeInput } from '@/ai/flows/explain-selected-code';
import { summarizeCodeComments, type SummarizeCodeCommentsInput } from '@/ai/flows/summarize-code-comments';
import { z } from 'genkit';

// --- Example 1: Chaining Flows ---
// Generate code, then explain it.

interface GenerateAndExplainInput {
    generationPrompt: string;
    explanationLanguage: string; // e.g., 'TypeScript'
}

interface GenerateAndExplainOutput {
    generatedCode: string;
    explanation: string;
}

export async function generateAndExplainCode(input: GenerateAndExplainInput): Promise<GenerateAndExplainOutput> {
    console.log("Starting generateAndExplainCode flow...");

    // Step 1: Generate Code
    const generateInput: GenerateCodeFromPromptInput = { prompt: input.generationPrompt };
    let generatedOutput;
    try {
        console.log("Calling generateCodeFromPrompt flow...");
        generatedOutput = await generateCodeFromPrompt(generateInput);
        if (!generatedOutput?.code) {
            throw new Error("Code generation returned empty result.");
        }
        console.log("Code generation successful.");
    } catch (error) {
        console.error("Error in code generation step:", error);
        throw new Error("Failed to generate code."); // Re-throw or handle error
    }

    // Step 2: Explain the Generated Code
    const explainInput: ExplainSelectedCodeInput = {
        code: generatedOutput.code,
        language: input.explanationLanguage,
    };
    let explanationOutput;
    try {
        console.log("Calling explainSelectedCode flow...");
        explanationOutput = await explainSelectedCode(explainInput);
        if (!explanationOutput?.explanation) {
             throw new Error("Code explanation returned empty result.");
        }
        console.log("Code explanation successful.");
    } catch (error) {
        console.error("Error in code explanation step:", error);
         throw new Error("Failed to explain generated code."); // Re-throw or handle error
    }

    console.log("generateAndExplainCode flow completed.");
    return {
        generatedCode: generatedOutput.code,
        explanation: explanationOutput.explanation,
    };
}


// --- Example 2: Using a Genkit Tool ---
// Define a hypothetical tool that could be used by a Genkit flow.
// Tools allow the LLM to call back into your application code.

// Define the input/output schema for the tool
const GetProjectFilesInputSchema = z.object({
    directory: z.string().optional().describe("The directory path to list files from. Defaults to root."),
    recursive: z.boolean().optional().default(false).describe("Whether to list files recursively."),
});
const GetProjectFilesOutputSchema = z.array(z.string()).describe("A list of file paths.");

// Define the tool using ai.defineTool
export const getProjectFilesTool = ai.defineTool(
    {
        name: 'getProjectFiles',
        description: 'Retrieves a list of files within the current project structure. Useful for understanding project context.',
        inputSchema: GetProjectFilesInputSchema,
        outputSchema: GetProjectFilesOutputSchema,
    },
    async (input) => {
        console.log("Executing getProjectFilesTool with input:", input);
        // !!! Placeholder Implementation !!!
        // In a real scenario, this would interact with the backend/filesystem
        // to get the actual file list based on the current project context.
        // This requires backend integration (e.g., an API endpoint the tool can call).
        await new Promise(resolve => setTimeout(resolve, 200)); // Simulate async work

        // Example static response:
        if (input.directory === 'src/components' && input.recursive) {
            return ['src/components/ui/button.tsx', 'src/components/ui/input.tsx', 'src/components/retro-window.tsx'];
        } else if (input.directory === 'src/components') {
             return ['src/components/retro-window.tsx']; // Example non-recursive
        } else {
            return ['package.json', 'README.md', 'src/app/page.tsx', 'src/lib/utils.ts', 'src/components/retro-window.tsx'];
        }
        // !!! End Placeholder !!!
    }
);


// Example of defining a flow that USES the tool:
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
    system: "You are an expert technical writer. Generate a README.md file for the given project. Use the getProjectFiles tool if you need to understand the project structure to write a better README.",
    // Include the tool definition
    tools: [getProjectFilesTool],
    prompt: `Generate a README.md for a project named "{{projectName}}".
Description: {{projectDescription}}

Structure the README with sections like Introduction, Features, Getting Started, etc.
Be concise and informative. You can use the available tools to get more context about the project files if needed.
`,
});


// Define the flow that uses the prompt (and implicitly the tool)
export const generateReadmeFlow = ai.defineFlow(
    {
        name: 'generateReadmeFlow',
        inputSchema: GenerateReadmeInputSchema,
        outputSchema: GenerateReadmeOutputSchema,
    },
    async (input) => {
        console.log("Executing generateReadmeFlow with input:", input);
        // The Genkit runtime handles calling the tool if the LLM decides to use it.
        const { output } = await generateReadmePrompt(input);
        if (!output) {
             throw new Error("README generation failed to produce output.");
        }
        console.log("generateReadmeFlow completed.");
        return output;
    }
);

// Exported wrapper function for the flow
export async function generateProjectReadme(input: z.infer<typeof GenerateReadmeInputSchema>) {
    return generateReadmeFlow(input);
}


// --- Potential Enhancements ---
// - More complex chaining logic (conditional execution, loops)
// - Error handling and retry mechanisms within chains
// - Integration with state management for longer conversations/agent memory
// - Defining more sophisticated tools that interact with backend services (Git, Docker, Nix)
