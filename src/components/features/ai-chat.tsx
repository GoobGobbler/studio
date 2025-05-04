'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Mic, Hand, BrainCircuit, Sparkles } from "lucide-react";
import { requestAgentExecution } from '@/ai/agents/ollama-agent'; // Import the client function
import type { AgentExecutionResponse } from '@/types/agent-types'; // Import shared type

interface Message {
    sender: 'User' | 'QuonxAI';
    text: string;
    timestamp?: string; // Add timestamp for potential sorting/display
}

interface AIChatProps {
    getEditorContent: () => string; // Function to get current editor content
}


export const AIChat: React.FC<AIChatProps> = ({ getEditorContent }) => {
    const { toast } = useToast();
    const [input, setInput] = React.useState('');
    const [messages, setMessages] = React.useState<Message[]>([
        { sender: 'QuonxAI', text: 'How can I help you code today?', timestamp: new Date().toISOString() }
    ]);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [selectedModel, setSelectedModel] = React.useState('llama'); // UI Indicator, backend handles actual model

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage: Message = { sender: 'User', text: input, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsGenerating(true);

        try {
            let agentToCall = 'chatAgent'; // Default agent
            let payload: any = { prompt: currentInput, context: { chatHistory: messages.slice(-10) } }; // Send last 10 messages as history
            let agentTitle = "AI Chat"; // For toast messages

            // --- Simple Intent Routing (Refined) ---
            const lowerInput = currentInput.toLowerCase().trim();
            const editorCode = getEditorContent(); // Get editor content once

             const matchKeyword = (keywords: string[]): string | null => {
                 for (const keyword of keywords) {
                     if (lowerInput.startsWith(keyword + ':') || lowerInput.startsWith(keyword + ' ')) {
                         return lowerInput.substring(lowerInput.indexOf(keyword) + keyword.length + 1).trim();
                     }
                 }
                 return null;
             };

             let matchedContent: string | null;

            if ((matchedContent = matchKeyword(['generate code', 'create code', 'write code'])) !== null) {
                 agentToCall = 'codeGenAgent';
                 agentTitle = "Code Generation";
                 payload = { prompt: matchedContent, context: { code: editorCode } };
            } else if ((matchedContent = matchKeyword(['explain', 'describe'])) !== null) {
                 agentToCall = 'explainCodeAgent';
                 agentTitle = "Code Explanation";
                 // Use matched content if user specifies what to explain, otherwise use editor code
                 const codeToExplain = matchedContent || editorCode;
                 if (!codeToExplain) {
                     toast({ title: "Explain Code Error", description: "No code provided or found in editor.", variant: "destructive" });
                     setIsGenerating(false);
                     return;
                 }
                 payload = { context: { code: codeToExplain } }; // Pass code in context
             } else if ((matchedContent = matchKeyword(['refactor', 'improve code'])) !== null) {
                 agentToCall = 'refactorAgent';
                 agentTitle = "Code Refactoring";
                 if (!editorCode) {
                     toast({ title: "Refactor Code Error", description: "Editor content is empty.", variant: "destructive" });
                     setIsGenerating(false);
                     return;
                 }
                 payload = { context: { code: editorCode }, instructions: matchedContent };
            } else if ((matchedContent = matchKeyword(['test', 'generate tests', 'create tests'])) !== null) {
                 agentToCall = 'testGenAgent';
                 agentTitle = "Test Generation";
                 if (!editorCode) {
                     toast({ title: "Generate Tests Error", description: "Editor content is empty.", variant: "destructive" });
                     setIsGenerating(false);
                     return;
                 }
                 payload = { context: { code: editorCode }, config: { framework: matchedContent } }; // Pass framework hint if provided
            } else if ((matchedContent = matchKeyword(['docs', 'document', 'generate docs'])) !== null) {
                 agentToCall = 'docGenAgent';
                 agentTitle = "Documentation Generation";
                  if (!editorCode) {
                     toast({ title: "Generate Docs Error", description: "Editor content is empty.", variant: "destructive" });
                     setIsGenerating(false);
                     return;
                 }
                 payload = { context: { code: editorCode }, config: { format: matchedContent } }; // Pass format hint if provided
            } else if ((matchedContent = matchKeyword(['fix', 'debug'])) !== null) {
                 agentToCall = 'fixBugAgent';
                 agentTitle = "Bug Fixing";
                  if (!editorCode) {
                      toast({ title: "Fix Bug Error", description: "Editor content is empty.", variant: "destructive" });
                      setIsGenerating(false);
                      return;
                  }
                  payload = { context: { code: editorCode }, description: matchedContent };
            } else if ((matchedContent = matchKeyword(['ask knowledge', 'query knowledge', 'search docs', 'ask'])) !== null) {
                 agentToCall = 'ragAgent';
                 agentTitle = "Knowledge Query";
                 payload = { prompt: matchedContent };
             } else if ((matchedContent = matchKeyword(['ingest knowledge', 'learn this', 'add knowledge'])) !== null) {
                 agentToCall = 'ingestAgent';
                 agentTitle = "Knowledge Ingestion";
                 // Assume the content to ingest is the rest of the message
                  payload = { text: matchedContent, source: "AI Chat Input" }; // Use matched content as text
             }
            // --- End Intent Routing ---

            toast({ title: agentTitle, description: `Sending request to ${agentToCall}...` });

            // Call the Agent Coordinator via the client function
            const response: AgentExecutionResponse = await requestAgentExecution(agentToCall, payload);

            let aiResponseText: string;
            if (response.success) {
                 // Extract text response, handling potential object results
                 if (typeof response.result === 'string') {
                     aiResponseText = response.result;
                 } else if (response.result) {
                     // Prioritize specific fields based on potential agent responses
                     aiResponseText = response.result.response || response.result.explanation || response.result.summary || response.result.message || "";
                     const codeResult = response.result.code || response.result.tests || response.result.files || response.result.documentation;

                     if (codeResult) {
                          // Prepend a note if code was generated/modified
                          const codeNote = `(Code generated/modified by ${response.agentUsed} - check editor/console if not inserted automatically)\n`;
                          // Show a snippet in chat
                          const codeSnippet = typeof codeResult === 'string' ? codeResult.substring(0, 200) + (codeResult.length > 200 ? "..." : "") : JSON.stringify(codeResult).substring(0, 200) + "...";
                          aiResponseText += `${aiResponseText ? '\n\n' : ''}${codeNote}\`\`\`\n${codeSnippet}\n\`\`\``;
                      }

                      // If still no text, stringify the whole result (fallback)
                      if (!aiResponseText && !codeResult) {
                          aiResponseText = `Agent ${response.agentUsed} completed: ${JSON.stringify(response.result, null, 2)}`;
                      } else if (!aiResponseText && codeResult) {
                          // Handle cases where only code is returned
                          aiResponseText = `(Code generated/modified by ${response.agentUsed} - check editor/console if not inserted automatically)`;
                      }

                 } else {
                     aiResponseText = `Agent ${response.agentUsed} completed successfully but returned no specific result.`;
                 }

             } else {
                aiResponseText = `Agent Error (${response.agentUsed || agentToCall}): ${response.error || 'Unknown error'}`;
                toast({ title: "AI Agent Error", description: aiResponseText, variant: "destructive" });
            }

            const aiMessage: Message = { sender: 'QuonxAI', text: aiResponseText, timestamp: new Date().toISOString() };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error: any) {
            console.error("AI Chat Error:", error);
            const errorMessage: Message = { sender: 'QuonxAI', text: 'Sorry, an unexpected error occurred while processing your request.', timestamp: new Date().toISOString() };
            setMessages(prev => [...prev, errorMessage]);
            toast({ title: "Chat Error", description: error.message || "Could not process AI request.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

     const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleModelChange = (modelId: string) => {
         setSelectedModel(modelId);
         toast({ title: "AI Target Model Changed", description: `Backend will now target ${modelId} models (if available).` });
         // Note: This is mostly a UI hint; the actual model is chosen by the backend services.
    };

    // Scroll messages to bottom
    const messageScrollAreaRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (messageScrollAreaRef.current) {
            // Find the viewport element within the ScrollArea component
             const viewportElement = messageScrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewportElement) {
                viewportElement.scrollTop = viewportElement.scrollHeight;
            } else {
                 // Fallback for direct scroll area element if Radix structure changes
                 messageScrollAreaRef.current.scrollTop = messageScrollAreaRef.current.scrollHeight;
            }
        }
    }, [messages]);


    return (
        <div className="flex flex-col h-full p-1">
            <ScrollArea ref={messageScrollAreaRef} className="flex-grow mb-1 retro-scrollbar border border-border-dark p-1 text-sm bg-white">
                {messages.map((msg, index) => (
                    <div key={index} className="mb-1 flex gap-2 group">
                         <span className={`font-bold shrink-0 w-8 text-center ${msg.sender === 'QuonxAI' ? 'text-primary' : 'text-foreground'}`} title={msg.sender}>
                            {msg.sender === 'QuonxAI' ? <BrainCircuit size={14} className="inline" /> : " ইউ"} {/* User Icon Placeholder */}
                         </span>
                         {/* Use pre-wrap to preserve formatting like code blocks */}
                         <div className="flex-grow">
                            <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                             {/* Optional: Show timestamp on hover */}
                            {/* <span className="text-xs text-muted-foreground/50 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                            </span> */}
                         </div>
                     </div>
                ))}
                {isGenerating && (
                    <p className="text-muted-foreground animate-pulse flex items-center gap-1"><BrainCircuit size={14} />QuonxAI ({selectedModel}) is generating...</p>
                )}
            </ScrollArea>
            <div className="flex items-center">
                <Input
                    type="text"
                    placeholder={`Ask ${selectedModel}... (e.g., generate code: ..., fix: ..., ask: ...)`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="retro-input flex-grow mr-1 h-8"
                    aria-label="AI Chat Input"
                    disabled={isGenerating}
                />
                {/* TODO: Implement Voice/Gesture Input - map to AI actions */}
                <Button className="retro-button h-8 mr-1" size="icon" aria-label="Voice Input" disabled={isGenerating} title="Voice Input (Planned)">
                    <Mic size={14} />
                </Button>
                <Button className="retro-button h-8 mr-1" size="icon" aria-label="Gesture Input" disabled={isGenerating} title="Gesture Input (Planned)">
                    <Hand size={14} />
                </Button>
                <Button className="retro-button h-8" onClick={handleSend} disabled={isGenerating || !input.trim()}>
                    Send
                </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
                 Target Model Group:
                <select
                    value={selectedModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="retro-input h-5 text-xs ml-1 bg-card border-border-dark"
                    disabled={isGenerating}
                    title="Select preferred model group (Backend makes final decision)"
                >
                     {/* Ollama is the primary target */}
                    <option value="llama">Llama (Ollama)</option>
                    <option value="gemini" disabled>Gemini (Genkit - Not Configured)</option>
                    <option value="claude" disabled>Claude (Not Configured)</option>
                    <option value="gpt4o" disabled>GPT-4o (Not Configured)</option>
                 </select>
            </div>
        </div>
    );
};
