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
}

interface AIChatProps {
    getEditorContent: () => string; // Function to get current editor content
}


export const AIChat: React.FC<AIChatProps> = ({ getEditorContent }) => {
    const { toast } = useToast();
    const [input, setInput] = React.useState('');
    const [messages, setMessages] = React.useState<Message[]>([
        { sender: 'QuonxAI', text: 'How can I help you code today?' }
    ]);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [selectedModel, setSelectedModel] = React.useState('llama'); // UI Indicator, backend handles actual model

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage: Message = { sender: 'User', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsGenerating(true);

        try {
            let agentToCall = 'chatAgent'; // Default agent
            let payload: any = { prompt: currentInput, context: { chatHistory: messages.slice(-10) } }; // Send last 10 messages as history

            // --- Simple Intent Routing (Placeholder) ---
            // More sophisticated routing should happen in the Agent Coordinator
            const lowerInput = currentInput.toLowerCase();
            if (lowerInput.startsWith("generate code:")) {
                agentToCall = 'codeGenAgent';
                payload = { prompt: lowerInput.substring("generate code:".length).trim(), context: { code: getEditorContent() } }; // Add current code as context
            } else if (lowerInput.startsWith("explain:")) {
                agentToCall = 'explainCodeAgent';
                const selectedCode = getEditorContent(); // Use entire editor content for now
                if (!selectedCode) {
                     toast({ title: "Explain Code Error", description: "Editor content is empty.", variant: "destructive" });
                     setIsGenerating(false);
                     return;
                }
                payload = { code: selectedCode };
            } else if (lowerInput.startsWith("refactor:")) {
                agentToCall = 'refactorAgent';
                const selectedCode = getEditorContent(); // Use entire editor content
                 if (!selectedCode) {
                      toast({ title: "Refactor Code Error", description: "Editor content is empty.", variant: "destructive" });
                      setIsGenerating(false);
                      return;
                 }
                 payload = { code: selectedCode, instructions: lowerInput.substring("refactor:".length).trim() };
            } else if (lowerInput.startsWith("test:")) {
                agentToCall = 'testGenAgent';
                 const selectedCode = getEditorContent(); // Use entire file content
                 if (!selectedCode) {
                      toast({ title: "Generate Tests Error", description: "Editor content is empty.", variant: "destructive" });
                      setIsGenerating(false);
                      return;
                 }
                 payload = { code: selectedCode };
            } else if (lowerInput.startsWith("docs:")) {
                agentToCall = 'docGenAgent';
                 const selectedCode = getEditorContent(); // Use entire file content
                 if (!selectedCode) {
                      toast({ title: "Generate Docs Error", description: "Editor content is empty.", variant: "destructive" });
                      setIsGenerating(false);
                      return;
                 }
                 payload = { code: selectedCode };
            } else if (lowerInput.startsWith("fix:")) {
                 agentToCall = 'fixBugAgent';
                 const selectedCode = getEditorContent(); // Use entire file content
                 if (!selectedCode) {
                      toast({ title: "Fix Bug Error", description: "Editor content is empty.", variant: "destructive" });
                      setIsGenerating(false);
                      return;
                 }
                 payload = { code: selectedCode, description: lowerInput.substring("fix:".length).trim() };
            } else if (lowerInput.startsWith("query knowledge:") || lowerInput.startsWith("ask:")) {
                 agentToCall = 'ragAgent';
                 payload = { prompt: lowerInput.substring(lowerInput.indexOf(':') + 1).trim() };
            }
            // --- End Placeholder Routing ---


            // Call the Agent Coordinator via the client function
            const response: AgentExecutionResponse = await requestAgentExecution(agentToCall, payload);

            let aiResponseText: string;
            if (response.success) {
                // Extract text response, handling potential object results
                if (typeof response.result === 'string') {
                    aiResponseText = response.result;
                } else if (response.result) {
                    aiResponseText = response.result.response || response.result.completion || response.result.summary || response.result.explanation || JSON.stringify(response.result, null, 2);
                     // Special handling for code results - show snippet and mention insertion
                     if (response.result.code || response.result.tests) {
                         const codeSnippet = (response.result.code || response.result.tests).substring(0, 150) + "...";
                         aiResponseText = `\`\`\`\n${codeSnippet}\n\`\`\`\n(Code generated/modified - check editor/console)`;
                     }
                } else {
                    aiResponseText = "Agent completed successfully but returned no specific result.";
                }

             } else {
                aiResponseText = `Agent Error (${response.agentUsed || agentToCall}): ${response.error || 'Unknown error'}`;
                toast({ title: "AI Agent Error", description: aiResponseText, variant: "destructive" });
            }

            const aiMessage: Message = { sender: 'QuonxAI', text: aiResponseText };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error: any) {
            console.error("AI Chat Error:", error);
            const errorMessage: Message = { sender: 'QuonxAI', text: 'Sorry, an unexpected error occurred.' };
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
             const scrollElement = messageScrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
             if (scrollElement) {
                 scrollElement.scrollTop = scrollElement.scrollHeight;
             }
        }
    }, [messages]);


    return (
        <div className="flex flex-col h-full p-1">
            <ScrollArea ref={messageScrollAreaRef} className="flex-grow mb-1 retro-scrollbar border border-border-dark p-1 text-sm bg-white">
                {messages.map((msg, index) => (
                    <div key={index} className="mb-1 flex gap-2">
                         <span className={`font-bold shrink-0 ${msg.sender === 'QuonxAI' ? 'text-primary' : 'text-foreground'}`}>
                            {msg.sender === 'QuonxAI' ? <BrainCircuit size={14} className="inline" /> : " ইউ"} {/* User Icon Placeholder */}
                            {/* {msg.sender}: */}
                         </span>
                         {/* Use pre-wrap to preserve formatting like code blocks */}
                         <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                     </div>
                ))}
                {isGenerating && (
                    <p className="text-muted-foreground animate-pulse flex items-center gap-1"><BrainCircuit size={14} />QuonxAI ({selectedModel}) is thinking...</p>
                )}
            </ScrollArea>
            <div className="flex items-center">
                <Input
                    type="text"
                    placeholder={`Ask ${selectedModel}... (e.g., generate code: ...)`}
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
                    <option value="gemini" disabled>Gemini (Genkit - Placeholder)</option>
                    <option value="claude" disabled>Claude (Placeholder)</option>
                    <option value="gpt4o" disabled>GPT-4o (Placeholder)</option>
                 </select>
            </div>
        </div>
    );
};
