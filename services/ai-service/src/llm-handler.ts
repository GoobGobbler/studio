// services/ai-service/src/llm-handler.ts
// Handles direct LLM interactions (completion, chat, embeddings).
// This might call local Langchain/Ollama functions or external APIs.

import { Request, Response } from 'express';
// Import necessary Langchain/Ollama components
import { Ollama } from "@langchain/community/llms/ollama";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// --- Configuration ---
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || "llama3";
const OLLAMA_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";

// --- Route Handlers ---

export const handleCompletion = async (req: Request, res: Response) => {
    try {
        const { prompt, model = OLLAMA_DEFAULT_MODEL, options = {} } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt.' });
        }

        const ollama = new Ollama({
            baseUrl: OLLAMA_BASE_URL,
            model: model,
            ...options // Pass temperature, top_p etc.
        });
        const result = await ollama.invoke(prompt);
        res.status(200).json({ completion: result });

    } catch (error: any) {
        console.error("LLM Completion Error:", error);
        res.status(500).json({ error: 'Failed to get LLM completion.', message: error.message });
    }
};

export const handleChat = async (req: Request, res: Response) => {
    try {
        // TODO: Add support for chat history management (passed in request or retrieved from cache)
        const { messages, model = OLLAMA_DEFAULT_MODEL, options = {} } = req.body;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Missing or invalid messages array.' });
        }

        // Basic example - assumes last message is user input
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role !== 'user' || !lastMessage.content) {
            return res.status(400).json({ error: 'Last message must be from user with content.' });
        }

        const chatOllama = new ChatOllama({
            baseUrl: OLLAMA_BASE_URL,
            model: model,
            ...options
        });

        // Simplistic approach - adapt based on actual Langchain chat model needs
        // This might need proper prompt templating or direct use of invoke with Message objects
        const promptTemplate = PromptTemplate.fromTemplate("{userInput}"); // Very basic
        const chain = promptTemplate.pipe(chatOllama).pipe(new StringOutputParser());
        const result = await chain.invoke({ userInput: lastMessage.content });

        res.status(200).json({ response: result });

    } catch (error: any) {
        console.error("LLM Chat Error:", error);
        res.status(500).json({ error: 'Failed to get LLM chat response.', message: error.message });
    }
};


export const handleEmbed = async (req: Request, res: Response) => {
     try {
        const { texts, model = OLLAMA_EMBEDDING_MODEL } = req.body;
         if (!texts || !Array.isArray(texts) || texts.length === 0) {
            return res.status(400).json({ error: 'Missing or invalid texts array.' });
        }
         if (!texts.every(t => typeof t === 'string')) {
             return res.status(400).json({ error: 'All items in texts array must be strings.' });
         }

        const embeddings = new OllamaEmbeddings({
            model: model,
            baseUrl: OLLAMA_BASE_URL
        });

        const results = await embeddings.embedDocuments(texts);
        res.status(200).json({ embeddings: results });

    } catch (error: any) {
         console.error("Embedding Error:", error);
        res.status(500).json({ error: 'Failed to generate embeddings.', message: error.message });
    }
};
```