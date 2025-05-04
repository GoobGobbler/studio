'use server';
/**
 * @fileOverview Client-side functions to interact with AI agents via the Agent Coordinator service.
 * These functions abstract the API calls to the coordinator.
 */

import type { AgentExecutionResponse } from '@/types/agent-types'; // Assuming a shared types definition

const AGENT_COORDINATOR_URL = process.env.NEXT_PUBLIC_AGENT_COORDINATOR_URL || '/api/proxy/agents';

/**
 * Generic function to request agent execution from the coordinator.
 * @param agentName The name of the agent to execute (e.g., 'codeGenAgent', 'summarizationAgent').
 * @param payload The input data for the agent.
 * @param authToken Optional authentication token if required by the coordinator.
 * @returns Promise<AgentExecutionResponse>
 */
export async function requestAgentExecution(
  agentName: string,
  payload: any,
  authToken?: string
): Promise<AgentExecutionResponse> {
  console.log(`Requesting execution of agent '${agentName}' via Coordinator...`);
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${AGENT_COORDINATOR_URL}/${agentName}/execute`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Agent execution failed with status: ${response.status}` }));
      console.error(`Agent execution error (${response.status}):`, errorData);
      return {
        success: false,
        error: errorData?.error || `HTTP error ${response.status}`,
        agentUsed: agentName,
      };
    }

    const result: AgentExecutionResponse = await response.json();
    console.log(`Agent '${agentName}' execution result:`, result.success ? 'Success' : 'Failure');
    return result;

  } catch (error: any) {
    console.error(`Error calling Agent Coordinator for agent '${agentName}':`, error);
    return {
      success: false,
      error: `Network or unexpected error: ${error.message}`,
      agentUsed: agentName,
    };
  }
}

// --- Example Specific Agent Interaction Functions ---

export async function ollamaChatCompletion(prompt: string, chatHistory?: any[]): Promise<AgentExecutionResponse> {
  // This function now delegates to the coordinator, which routes to the appropriate LLM handler in the AI service
  return requestAgentExecution('chatAgent', { prompt, context: { chatHistory } });
}

export async function ollamaCodeGeneration(prompt: string, existingCode?: string): Promise<AgentExecutionResponse> {
  return requestAgentExecution('codeGenAgent', { prompt, existingCode });
}

export async function ollamaExplainCode(code: string, language?: string): Promise<AgentExecutionResponse> {
    return requestAgentExecution('explainCodeAgent', { code, language });
}

export async function ollamaRefactorCode(code: string, instructions?: string): Promise<AgentExecutionResponse> {
    return requestAgentExecution('refactorAgent', { code, instructions });
}

export async function ollamaGenerateTests(code: string, framework?: string): Promise<AgentExecutionResponse> {
    return requestAgentExecution('testGenAgent', { code, framework });
}

export async function ollamaGenerateDocs(code: string, format?: string): Promise<AgentExecutionResponse> {
    return requestAgentExecution('docGenAgent', { code, format });
}

export async function ollamaFixBug(code: string, description: string): Promise<AgentExecutionResponse> {
    return requestAgentExecution('fixBugAgent', { code, description });
}

export async function ollamaScaffoldApp(description: string): Promise<AgentExecutionResponse> {
    return requestAgentExecution('scaffoldAgent', { description });
}

export async function ollamaRAGQuery(queryText: string, collection?: string, filter?: any): Promise<AgentExecutionResponse> {
    return requestAgentExecution('ragAgent', { prompt: queryText, memory: { collection }, context: { filter } });
}

export async function ollamaIngestKnowledge(text: string, source?: string, collection?: string, metadata?: any): Promise<AgentExecutionResponse> {
    return requestAgentExecution('ingestAgent', { text, source, collection, metadata });
}

// Add more functions as needed for other agents (Summarization, Planning, SAST, IaC etc.)
// export async function ollamaSummarizeText(text: string, context?: string): Promise<AgentExecutionResponse> {
//     return requestAgentExecution('summarizationAgent', { text, context });
// }

console.log("Ollama Agent client functions loaded. Interactions are routed through the Agent Coordinator.");
