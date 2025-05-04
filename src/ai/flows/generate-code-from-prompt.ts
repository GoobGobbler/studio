'use server';
/**
 * @fileOverview A code generation AI agent.
 *
 * - generateCodeFromPrompt - A function that handles the code generation process.
 * - GenerateCodeFromPromptInput - The input type for the generateCodeFromPrompt function.
 * - GenerateCodeFromPromptOutput - The return type for the generateCodeFromPrompt function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateCodeFromPromptInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired code snippet.'),
});
export type GenerateCodeFromPromptInput = z.infer<typeof GenerateCodeFromPromptInputSchema>;

const GenerateCodeFromPromptOutputSchema = z.object({
  code: z.string().describe('The generated code snippet.'),
});
export type GenerateCodeFromPromptOutput = z.infer<typeof GenerateCodeFromPromptOutputSchema>;

export async function generateCodeFromPrompt(input: GenerateCodeFromPromptInput): Promise<GenerateCodeFromPromptOutput> {
  return generateCodeFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeFromPromptPrompt',
  input: {
    schema: z.object({
      prompt: z.string().describe('A text prompt describing the desired code snippet.'),
    }),
  },
  output: {
    schema: z.object({
      code: z.string().describe('The generated code snippet.'),
    }),
  },
  prompt: `You are an expert software developer. Generate a code snippet based on the following prompt:\n\n{{{prompt}}}`,
});

const generateCodeFromPromptFlow = ai.defineFlow<
  typeof GenerateCodeFromPromptInputSchema,
  typeof GenerateCodeFromPromptOutputSchema
>({
  name: 'generateCodeFromPromptFlow',
  inputSchema: GenerateCodeFromPromptInputSchema,
  outputSchema: GenerateCodeFromPromptOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
