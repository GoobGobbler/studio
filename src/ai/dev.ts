// src/ai/dev.ts
// This file was previously used to register Genkit flows for the dev UI.
// As we shift towards Ollama/Langchain managed by backend services,
// this file might become less relevant or used differently (e.g., for local Langchain chain testing).

// Remove Genkit flow imports:
// import '@/ai/flows/summarize-text';
// import '@/ai/flows/generate-code-from-prompt';
// import '@/ai/flows/explain-selected-code';

// Remove Genkit tool imports if they are not used directly by a local Genkit setup:
// import '@/ai/agents/genkit-agent'; // Keep if Genkit tools are still relevant for some local testing

console.log("Genkit Dev entrypoint: Flow registrations removed. Ensure backend services handle AI logic.");

// If you want to test LangChain chains locally using a similar mechanism,
// you might import and potentially register them here using a different tool/framework.
