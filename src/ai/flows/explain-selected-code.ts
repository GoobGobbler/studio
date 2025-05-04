'use server';

/**
 * @fileOverview A code explanation AI agent.
 *
 * - explainSelectedCode - A function that handles the code explanation process.
 * - ExplainSelectedCodeInput - The input type for the explainSelectedCode function.
 * - ExplainSelectedCodeOutput - The return type for the explainSelectedCode function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ExplainSelectedCodeInputSchema = z.object({
  code: z.string().describe('The code to be explained.'),
  language: z.string().describe('The programming language of the code.'),
});
export type ExplainSelectedCodeInput = z.infer<typeof ExplainSelectedCodeInputSchema>;

const ExplainSelectedCodeOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the code.'),
});
export type ExplainSelectedCodeOutput = z.infer<typeof ExplainSelectedCodeOutputSchema>;

export async function explainSelectedCode(input: ExplainSelectedCodeInput): Promise<ExplainSelectedCodeOutput> {
  return explainSelectedCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainSelectedCodePrompt',
  input: {
    schema: z.object({
      code: z.string().describe('The code to be explained.'),
      language: z.string().describe('The programming language of the code.'),
    }),
  },
  output: {
    schema: z.object({
      explanation: z.string().describe('The explanation of the code.'),
    }),
  },
  prompt: `You are an expert software developer. Explain the following code block as clearly and concisely as possible.\n\nLanguage: {{{language}}}\n\nCode:\n{{{code}}}`,
});

const explainSelectedCodeFlow = ai.defineFlow<
  typeof ExplainSelectedCodeInputSchema,
  typeof ExplainSelectedCodeOutputSchema
>(
  {
    name: 'explainSelectedCodeFlow',
    inputSchema: ExplainSelectedCodeInputSchema,
    outputSchema: ExplainSelectedCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
