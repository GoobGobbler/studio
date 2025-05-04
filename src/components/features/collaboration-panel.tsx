'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Share2, Mic, MessageSquare, Sparkles } from "lucide-react"; // Assuming Sparkles for AI Suggestion
import { useToast } from "@/hooks/use-toast";
import type { CollaborationSession } from '@/lib/collaboration'; // Import session type
import * as Y from 'yjs'; // Import Yjs for chat messages type

interface CollaborationPanelProps {
    session: CollaborationSession | null; // Accept session as prop
}

export const CollaborationPanel = ({ session }: CollaborationPanelProps) => {
    const { toast } = useToast();
    const [onlineUsers, setOnlineUsers] = React.useState<Map<number, any>>(new Map());
    const [chatMessages, setChatMessages] = React.useState<Record<string, string>[]>([]); // Local state for rendering chat
    const [chatInput, setChatInput] = React.useState('');
    const yChatRef = React.useRef<Y.Array<Record<string, string>> | null>(null);

    // --- Effects for Collaboration ---
    React.useEffect(() => {
        if (!session) return;

        // Update online users state when awareness changes
        const awarenessHandler = () => {
            setOnlineUsers(new Map(session.awareness.getStates()));
        };
        session.awareness.on('change', awarenessHandler);
        // Set initial state
        awarenessHandler();


        // Setup Chat
        yChatRef.current = session.doc.getArray<Record<string, string>>('chat');
        const chatObserver = () => {
            setChatMessages(yChatRef.current?.toArray() || []);
        };
        yChatRef.current.observe(chatObserver);
        // Set initial chat messages
        chatObserver();

        // Clean up on unmount or session change
        return () => {
            session.awareness.off('change', awarenessHandler);
            yChatRef.current?.unobserve(chatObserver);
        };
    }, [session]); // Rerun effect if session changes

     // --- Action Handlers ---
    const handleShare = () => {
        const shareLink = `${window.location.origin}/join/${session?.doc.guid || 'default-session'}`; // Example link
        navigator.clipboard.writeText(shareLink)
            .then(() => toast({ title: "Sharing Link Copied", description: "Collaboration link copied to clipboard." }))
            .catch(err => toast({ title: "Copy Failed", description: "Could not copy sharing link.", variant: "destructive" }));
    };

    const handleJoin = () => {
        const sessionId = prompt("Enter session ID or link to join:");
        if (sessionId) {
            toast({ title: "Joining Session...", description: `Attempting to join ${sessionId} (TODO: Implement actual joining).` });
            // TODO: Implement actual joining logic using connectCollaboration and potentially navigating or updating state
        }
    };

    const handleAiSuggestion = () => {
        toast({ title: "AI Suggestion", description: "TODO: Trigger AI context-aware suggestion via Agent Coordinator." });
        // TODO: Call requestAgentExecution('suggestionAgent', { context: currentEditorContent, chat: chatMessages })
    };

     const sendChatMessage = () => {
        if (session && yChatRef.current && chatInput.trim()) {
            const localState = session.awareness.getLocalState();
            const userName = localState?.user?.name || 'Anonymous';
            yChatRef.current.push([{ user: userName, text: chatInput, timestamp: new Date().toISOString() }]);
            setChatInput(''); // Clear input field
        }
    };

     const handleChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    };

    const userList = Array.from(onlineUsers.values()); // Convert map values to array for rendering


    return (
        <div className="p-2 text-sm flex flex-col items-center gap-2 border-l border-border-dark bg-card h-full">
            <h3 className="font-semibold mb-2 flex items-center gap-1"><Users size={16} />Collaboration</h3>
            <div className="flex gap-2 mb-2 flex-wrap justify-center" title="Online Users">
                 {userList.length > 0 ? userList.map((state, index) => (
                    <Avatar key={state.user?.clientId || index} className="h-6 w-6 border" style={{ borderColor: state.user?.color || 'hsl(var(--border-dark))' }}>
                         {/* Use a placeholder image or generate one based on user info */}
                        <AvatarImage src={`https://avatar.vercel.sh/${state.user?.name || `user${index}`}.png?size=32`} data-ai-hint="user avatar" alt={state.user?.name || `User ${index + 1}`} />
                        <AvatarFallback style={{ backgroundColor: state.user?.color || 'hsl(var(--muted))', color: '#fff', fontSize: '0.6rem' }}>
                            {state.user?.name?.substring(0, 2).toUpperCase() || `U${index + 1}`}
                         </AvatarFallback>
                    </Avatar>
                )) : <span className="text-xs text-muted-foreground">No other users online.</span>}
            </div>
            <Button size="sm" className="retro-button w-full" onClick={handleShare} disabled={!session}>
                <Share2 size={14} className="mr-1" /> Share Session
            </Button>
            <Button size="sm" className="retro-button w-full" onClick={handleJoin}>
                Join Session
            </Button>
            <Button size="sm" className="retro-button w-full mt-1" onClick={handleAiSuggestion} disabled={!session}>
                <Sparkles size={14} className="mr-1" /> AI Suggestion (Planned)
            </Button>
            {/* Live Chat */}
            <div className="flex-grow w-full mt-2 flex flex-col">
                <h4 className="text-xs font-semibold mb-1 flex items-center gap-1"><MessageSquare size={12} />Live Chat</h4>
                <ScrollArea className="h-20 flex-grow retro-scrollbar border border-border-dark p-1 bg-white text-xs mb-1">
                    {chatMessages.map((msg, index) => (
                        <p key={index}><span className="font-bold" style={{color: onlineUsers.get(parseInt(Object.keys(onlineUsers)[0] || '0'))?.user?.color || 'inherit'}}>{msg.user}:</span> {msg.text}</p>
                        // Find user color mapping if possible - simplified above
                    ))}
                </ScrollArea>
                 <div className="flex">
                    <Input
                        type="text"
                        placeholder="Chat..."
                        className="retro-input h-6 text-xs flex-grow"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleChatKeyDown}
                        disabled={!session}
                        />
                    <Button size="sm" className="retro-button !px-2 !h-6 ml-1" onClick={sendChatMessage} disabled={!session || !chatInput.trim()}>Send</Button>
                </div>
            </div>
            {/* Voice/Video controls (Placeholder) */}
            <div className="mt-auto w-full flex justify-around pt-2 border-t border-border-dark">
                <Button variant="ghost" size="icon" className="retro-button !border-none !shadow-none" aria-label="Toggle Microphone" title="Toggle Microphone (Planned)" disabled>
                    <Mic size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="retro-button !border-none !shadow-none" aria-label="Toggle Video" title="Toggle Video (Planned)" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
                </Button>
            </div>
        </div>
    );
};
