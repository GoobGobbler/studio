
'use server';

/**
 * @fileOverview Summarizes provided text content.
 * Suitable for summarizing code, chat history, or documents for memory management.
 *
 * - summarizeText - A function that takes text and returns a summary.
 * - SummarizeTextInput - The input type for the summarizeText function.
 * - SummarizeTextOutput - The return type for the summarizeText function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeTextInputSchema = z.object({
  text: z.string().describe('The text content to summarize.'),
  context: z.string().optional().describe('Optional context about the text (e.g., "code comments", "chat discussion", "document section"). Helps guide the summary focus.'),
  maxLength: z.number().optional().describe('Optional maximum length (in words or tokens, model-dependent) for the summary.')
});
export type SummarizeTextInput = z.infer<typeof SummarizeTextInputSchema>;

const SummarizeTextOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the input text.'),
});
export type SummarizeTextOutput = z.infer<typeof SummarizeTextOutputSchema>;

export async function summarizeText(
  input: SummarizeTextInput
): Promise<SummarizeTextOutput> {
  // This flow might be executed directly or called by the Agent Coordinator
  // as part of the recursive summarization process.
  console.log("Executing summarizeText flow...");
  return summarizeTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTextPrompt',
  input: {
    schema: SummarizeTextInputSchema,
  },
  output: {
    schema: SummarizeTextOutputSchema,
  },
  prompt: `You are an AI assistant expert at summarizing text. Provide a concise summary of the following text.
{{#if context}}
Context: {{context}}
{{/if}}
{{#if maxLength}}
Aim for a summary around {{maxLength}} words.
{{/if}}

Text to Summarize:
{{{text}}}

Summary:`,
});

const summarizeTextFlow = ai.defineFlow<
  typeof SummarizeTextInputSchema,
  typeof SummarizeTextOutputSchema
>(
  {
    name: 'summarizeTextFlow',
    inputSchema: SummarizeTextInputSchema,
    outputSchema: SummarizeTextOutputSchema,
  },
  async input => {
    // TODO: Potentially add logic here to handle very long text by chunking
    // and summarizing recursively before calling the final prompt, if the model has limits.
    // This could involve calling this flow itself multiple times.
    const {output} = await prompt(input);
    if (!output) {
         throw new Error("Text summarization failed to produce output.");
    }
    console.log("summarizeText flow completed.");
    return output;
  }
);
```