'use server';

/**
 * @fileOverview Summarizes code comments in a given code snippet.
 *
 * - summarizeCodeComments - A function that takes code as input and returns a summary of the comments.
 * - SummarizeCodeCommentsInput - The input type for the summarizeCodeComments function.
 * - SummarizeCodeCommentsOutput - The return type for the summarizeCodeComments function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeCodeCommentsInputSchema = z.object({
  code: z.string().describe('The code snippet to summarize comments from.'),
});
export type SummarizeCodeCommentsInput = z.infer<typeof SummarizeCodeCommentsInputSchema>;

const SummarizeCodeCommentsOutputSchema = z.object({
  summary: z.string().describe('A summary of the comments in the code snippet.'),
});
export type SummarizeCodeCommentsOutput = z.infer<typeof SummarizeCodeCommentsOutputSchema>;

export async function summarizeCodeComments(
  input: SummarizeCodeCommentsInput
): Promise<SummarizeCodeCommentsOutput> {
  return summarizeCodeCommentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCodeCommentsPrompt',
  input: {
    schema: z.object({
      code: z.string().describe('The code snippet to summarize comments from.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the comments in the code snippet.'),
    }),
  },
  prompt: `You are an AI assistant that summarizes code comments.  Given the following code, summarize the comments to explain what the code does.

Code:
{{code}}`,
});

const summarizeCodeCommentsFlow = ai.defineFlow<
  typeof SummarizeCodeCommentsInputSchema,
  typeof SummarizeCodeCommentsOutputSchema
>(
  {
    name: 'summarizeCodeCommentsFlow',
    inputSchema: SummarizeCodeCommentsInputSchema,
    outputSchema: SummarizeCodeCommentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
