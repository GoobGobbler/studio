'use server';

/**
 * @fileOverview Placeholder for text summarization functionality.
 * The actual implementation is handled by the AI Service and Agent Coordinator using Ollama/Langchain.
 * This file remains primarily for type definitions if needed elsewhere, but the flow logic is removed.
 */

import { z } from 'zod';

// --- Input/Output Schemas (can be reused by Coordinator/Service) ---

export const SummarizeTextInputSchema = z.object({
  text: z.string().describe('The text content to summarize.'),
  context: z.string().optional().describe('Optional context about the text (e.g., "code comments", "chat discussion", "document section"). Helps guide the summary focus.'),
  maxLength: z.number().optional().describe('Optional maximum length (in words or tokens, model-dependent) for the summary.')
});
export type SummarizeTextInput = z.infer<typeof SummarizeTextInputSchema>;

export const SummarizeTextOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the input text.'),
});
export type SummarizeTextOutput = z.infer<typeof SummarizeTextOutputSchema>;

// The Genkit ai.definePrompt and ai.defineFlow implementations are removed.
// The exported `summarizeText` function is removed as direct calls should go through the agent coordinator client.

// Example usage (conceptual - call would be made via agent coordinator client):
// import { requestAgentExecution } from '@/ai/agents/ollama-agent'; // Or similar client
// const result = await requestAgentExecution('summarizationAgent', { text: "...", context: "code" });
// if (result.success) { console.log(result.result.summary); }

console.log("SummarizeText flow definition removed. Logic handled by AI Service/Agent Coordinator.");
