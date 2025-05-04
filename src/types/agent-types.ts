// src/types/agent-types.ts

/**
 * Standard response structure from the Agent Coordinator service.
 */
export interface AgentExecutionResponse {
    success: boolean;      // Indicates if the agent execution was successful
    result?: any;          // The primary result from the agent (e.g., code, text, data)
    error?: string;        // Error message if success is false
    agentUsed: string;     // The name of the agent that handled the request
    taskId?: string;       // Optional ID for tracking asynchronous tasks
    usage?: {             // Optional usage metrics
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
        latencyMs?: number;
    };
    // Add other relevant fields like confidence scores, citations (for RAG), etc.
}

/**
 * Common input structure for agents (can be extended).
 */
export interface AgentExecutionRequest {
    prompt?: string;        // Primary text input
    context?: {            // Additional context
        code?: string;
        selectedCode?: string;
        filePath?: string;
        chatHistory?: any[]; // Array of previous messages
        errorLogs?: string[];
        vulnerabilities?: any[]; // For SAST
        // Add other context types
    };
    memory?: {             // Memory interaction parameters
        sessionId?: string; // For short-term cache
        query?: string;     // For long-term vector search
        collection?: string; // Target vector collection
        filter?: any;       // Metadata filter for vector search
    };
    config?: {             // Agent-specific configuration
        model?: string;      // Preferred model
        language?: string;   // Target language
        framework?: string;  // Target framework (for tests/scaffolding)
        format?: string;     // Desired output format (for docs)
        // Add other config options
    };
    // Agent-specific payload fields (can overlap with context/config)
    // Example:
    // code?: string; // For refactor/test/fix agents
    // description?: string; // For bug fix/scaffolding
    // text?: string; // For summarization/ingestion
    // source?: string; // For ingestion source tracking
    // metadata?: any; // For ingestion metadata
    [key: string]: any;    // Allow arbitrary additional fields
}
