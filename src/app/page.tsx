

'use client'; // Required for state and event handlers

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarRadioGroup, MenubarRadioItem, MenubarCheckboxItem } from "@/components/ui/menubar";
import { Maximize2, Minus, X, Bot, Code, Terminal as TerminalIcon, Files, Puzzle, Mic, Hand, Activity, ShieldCheck, BarChart3, Users, Share2, Cloud, GitBranch, Save, FolderOpen, Search, Settings, LifeBuoy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea"; // Currently using Textarea, TODO: Replace with Monaco
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast"; // Import useToast
// TODO: Import collaboration library
// import { connectCollaboration, setLocalAwarenessState, onAwarenessChange, type CollaborationSession } from '@/lib/collaboration';

// --- Retro Window Component ---
// Basic draggable window logic (requires useEffect for client-side interaction)
const RetroWindow = ({ title, children, className, initialPosition = { top: '25%', left: '25%' }, style, onClose }: { title: string, children: React.ReactNode, className?: string, initialPosition?: { top: string, left: string }, style?: React.CSSProperties, onClose?: () => void }) => {
  const [position, setPosition] = React.useState({ top: 0, left: 0 }); // Initial position set in useEffect
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const windowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Set initial position based on props after mount to avoid SSR issues
    if (windowRef.current) {
      const parentRect = windowRef.current.parentElement?.getBoundingClientRect();
      const initialTop = parseFloat(initialPosition.top) / 100 * (parentRect?.height || window.innerHeight);
      const initialLeft = parseFloat(initialPosition.left) / 100 * (parentRect?.width || window.innerWidth);
       // Ensure window stays within viewport bounds initially (simple check)
      const boundedTop = Math.max(0, Math.min(initialTop, (parentRect?.height || window.innerHeight) - (windowRef.current.offsetHeight || 100)));
      const boundedLeft = Math.max(0, Math.min(initialLeft, (parentRect?.width || window.innerWidth) - (windowRef.current.offsetWidth || 150)));
      setPosition({ top: boundedTop, left: boundedLeft });
    }
  }, [initialPosition]);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!windowRef.current || (e.target as HTMLElement).closest('.retro-window-control')) {
         // Don't drag if clicking on control buttons
        return;
    }
    setIsDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !windowRef.current) return;
     const parentRect = windowRef.current.parentElement?.getBoundingClientRect();
     const parentWidth = parentRect?.width || window.innerWidth;
     const parentHeight = parentRect?.height || window.innerHeight;
     const windowWidth = windowRef.current.offsetWidth;
     const windowHeight = windowRef.current.offsetHeight;

     let newTop = e.clientY - dragStart.y;
     let newLeft = e.clientX - dragStart.x;

      // Basic boundary collision detection
     newTop = Math.max(0, Math.min(newTop, parentHeight - windowHeight));
     newLeft = Math.max(0, Math.min(newLeft, parentWidth - windowWidth));


    setPosition({
      top: newTop,
      left: newLeft,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]); // Dependency array includes dragStart

  return (
    <div
      ref={windowRef}
      className={cn("retro-window absolute", className)}
      style={{ ...style, top: `${position.top}px`, left: `${position.left}px`, cursor: isDragging ? 'grabbing' : 'default' }}
    >
      <div
        className="retro-window-titlebar"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <span>{title}</span>
        <div className="flex space-x-1">
           {/* TODO: Implement Minimize/Maximize functionality */}
          <button className="retro-window-control" title="Minimize"><Minus size={10} /></button>
          <button className="retro-window-control" title="Maximize"><Maximize2 size={10} /></button>
           {/* Close button triggers onClose callback */}
          <button className="retro-window-control" onClick={onClose} title="Close"><X size={10} /></button>
        </div>
      </div>
      <div className="retro-window-content overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
};


// --- IDE Panel Components ---

const FileExplorer = () => (
  <div className="flex flex-col h-full">
    <div className="p-1 border-b-2 border-border-dark">
      <Input type="search" placeholder="Search files..." className="retro-input h-7 text-xs" />
    </div>
    <ScrollArea className="flex-grow retro-scrollbar">
      <ul className="p-1 text-sm">
        {/* Placeholder file structure */}
        <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> index.html</li>
        <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> style.css</li>
        <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> script.js</li>
        <li className="flex items-center gap-1 font-semibold cursor-default">📁 components</li>
        <ul className="pl-4">
          <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> button.jsx</li>
          <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> modal.jsx</li>
        </ul>
         <li className="flex items-center gap-1 font-semibold cursor-default">📁 services</li>
          <ul className="pl-4">
            <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default">📄 collaboration-service/...</li>
            <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default">📄 secrets-service/...</li>
          </ul>
        <li className="flex items-center gap-1 font-semibold cursor-default">📁 assets</li>
        <ul className="pl-4">
          <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default">🖼️ logo.png</li>
        </ul>
        <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> README.md</li>
        <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> package.json</li>
        <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> Dockerfile</li>
        <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> docker-compose.yml</li>
         <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> firebase.json</li>
         <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> .firebaserc</li>
         <li className="flex items-center gap-1 font-semibold cursor-default">📁 infrastructure</li>
         <ul className="pl-4">
             <li className="flex items-center gap-1 font-semibold cursor-default">📁 terraform</li>
             <ul className="pl-6">
                <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> main.tf</li>
                <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> variables.tf</li>
             </ul>
             <li className="flex items-center gap-1 font-semibold cursor-default">📁 k8s</li>
              <ul className="pl-6">
                 <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> deployment.yaml</li>
                 <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> service.yaml</li>
                 <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> ingress.yaml</li>
              </ul>
             <li className="flex items-center gap-1 font-semibold cursor-default">📁 nix</li>
               <ul className="pl-6">
                  <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> shell.nix</li>
               </ul>
         </ul>
          <li className="flex items-center gap-1 font-semibold cursor-default">📁 .github</li>
           <ul className="pl-4">
               <li className="flex items-center gap-1 font-semibold cursor-default">📁 workflows</li>
               <ul className="pl-6">
                  <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> ci.yml</li>
               </ul>
           </ul>
            <li className="flex items-center gap-1 font-semibold cursor-default">📁 plugins</li>
             <ul className="pl-4">
                 <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> plugin.schema.json</li>
             </ul>
      </ul>
    </ScrollArea>
  </div>
);

const CodeEditor = () => {
    // TODO: Replace this with Monaco Editor Integration
    // - Install `monaco-editor` and `@monaco-editor/react`
    // - Import Editor component from `@monaco-editor/react`
    // - Manage editor state (value, language)
    // - Integrate Yjs binding using `y-monaco` and `src/lib/collaboration.ts`

    const [code, setCode] = React.useState(`'use client';
// TODO: Replace this Textarea with Monaco Editor

import React from 'react';

// Example React component
function MyButton({ label, onClick }) {
  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default MyButton;
`);
    return (
    <div className="h-full w-full bg-white border border-inset"> {/* Added border */}
        {/* Placeholder for Monaco Editor */}
         <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Start coding... (Monaco Editor will replace this)"
            className="retro-input flex-grow w-full h-full resize-none font-mono text-sm whitespace-pre !bg-white !text-black border-none focus-visible:!ring-0" // Adjusted styles
            aria-label="Code Editor"
        />
    </div>
)};


const TerminalAndLogs = () => (
    <Tabs defaultValue="terminal" className="flex flex-col h-full">
        {/* TODO: Make Terminal interactive, connect Logs to backend streams */}
        <TabsList className="retro-tabs-list shrink-0">
            <TabsTrigger value="terminal" className="retro-tab-trigger">Terminal</TabsTrigger>
            <TabsTrigger value="logs" className="retro-tab-trigger">Logs</TabsTrigger>
            <TabsTrigger value="profiling" className="retro-tab-trigger">Profiling</TabsTrigger>
            <TabsTrigger value="security" className="retro-tab-trigger">Security</TabsTrigger>
             <TabsTrigger value="dashboard" className="retro-tab-trigger">Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="terminal" className="flex-grow overflow-hidden mt-0 rounded-none border-none">
            <Terminal />
        </TabsContent>
        <TabsContent value="logs" className="flex-grow overflow-hidden mt-0 rounded-none border-none">
            <Logs />
        </TabsContent>
         <TabsContent value="profiling" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-2 text-sm">
             {/* TODO: Implement AI Profiling Panel */}
            <p>AI Profiling Panel</p>
            <p className="text-muted-foreground text-xs">Performance metrics and bundle analysis will appear here.</p>
             <Button className="retro-button mt-2" size="sm">Run Analysis</Button>
        </TabsContent>
         <TabsContent value="security" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-2 text-sm">
             {/* TODO: Implement SAST/Dependency Scanning */}
            <p>Security Scanner</p>
            <p className="text-muted-foreground text-xs">SAST and dependency scan results.</p>
             <ScrollArea className="h-32 retro-scrollbar border border-border-dark p-1 my-1 bg-white"> {/* Added background */}
                 <ul><li>[INFO] No critical vulnerabilities found.</li>
                 <li>[WARN] Dependency 'old-lib' v1.0 has known security issue.</li>
                 </ul>
             </ScrollArea>
            <Button className="retro-button mt-1" size="sm">Scan Now</Button>
            <Button className="retro-button mt-1 ml-1" size="sm" variant="secondary">Auto-Fix PR</Button>
        </TabsContent>
         <TabsContent value="dashboard" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-2 text-sm">
             {/* TODO: Implement Telemetry Dashboard with Charts */}
            <p>Telemetry Dashboard</p>
            <p className="text-muted-foreground text-xs">Errors, Performance, AI Usage.</p>
             <div className="h-32 border border-border-dark my-1 flex items-center justify-center text-muted-foreground bg-white">Chart Area Placeholder</div>
        </TabsContent>
    </Tabs>
);

const Terminal = () => (
     // TODO: Implement interactive terminal using libraries like xterm.js and connect to backend shell (Nix env)
    <div className="flex flex-col h-full bg-black text-[#00FF00] border-t-2 border-border-dark"> {/* Green text */}
       <ScrollArea className="flex-grow retro-scrollbar p-1 font-mono text-xs">
            <p>RetroTerm v0.3 (Non-interactive)</p>
            <p>user@retroide:/app$ ls -la</p>
            <p>total 24</p>
            <p>drwxr-xr-x 1 user user 4096 Jul 28 10:00 .</p>
            <p>drwxr-xr-x 1 user user 4096 Jul 28 09:55 ..</p>
            <p>-rw-r--r-- 1 user user  150 Jul 28 10:00 index.html</p>
            <p>-rw-r--r-- 1 user user  210 Jul 28 09:58 style.css</p>
             <p>-rw-r--r-- 1 user user  350 Jul 28 09:59 script.js</p>
             <p>drwxr-xr-x 1 user user 4096 Jul 28 09:57 components</p>
            <p>user@retroide:/app$</p>
            <div className="h-4"></div> {/* Spacer */}
        </ScrollArea>
         <Input type="text" placeholder="> (Input disabled)" aria-label="Terminal Input" className="retro-input !bg-black !text-[#00FF00] font-mono text-xs !rounded-none !border-none !border-t-2 !border-t-[#555555] focus:!ring-0 h-6" disabled /> {/* Darker border */}
    </div>
);

const Logs = () => (
     // TODO: Connect to backend log streams (e.g., via WebSocket)
    <div className="flex flex-col h-full bg-card border-t-2 border-border-dark">
         <ScrollArea className="flex-grow retro-scrollbar p-1 font-mono text-xs bg-white"> {/* Added background */}
             <p>[INFO] Application started successfully.</p>
             <p>[DEBUG] Connecting to database...</p>
             <p>[WARN] API endpoint /old/path is deprecated.</p>
             <p>[ERROR] Failed to load module 'xyz'.</p>
             <p>[COLLAB] User 'Alice' connected.</p>
             <p>[SECRETS] Secret 'API_KEY' accessed.</p>
         </ScrollArea>
     </div>
);


const AIChat = () => {
    // TODO: Integrate Ollama/Langchain agent based on user selection
    // TODO: Implement short-term memory (pass message history)
    // TODO: Implement long-term memory (RAG context injection)
    const [input, setInput] = React.useState('');
    const [messages, setMessages] = React.useState([
        { sender: 'RetroAI', text: 'How can I help you code today? Ask me to generate, explain, or refactor code!' }
    ]);
     const [isGenerating, setIsGenerating] = React.useState(false);
     const { toast } = useToast(); // Use the toast hook

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: 'User', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input; // Capture input before clearing
        setInput('');
        setIsGenerating(true);

        // --- AI Integration ---
        try {
            // Example: Using Genkit Flow (current implementation)
            // Replace/augment with Ollama/Langchain calls based on selected model
            const { generateCodeFromPrompt } = await import('@/ai/flows/generate-code-from-prompt');
            // Pass message history for context if supported by the flow/agent
            const response = await generateCodeFromPrompt({ prompt: currentInput });
            const aiMessage = { sender: 'RetroAI', text: response.code || "Sorry, I couldn't generate code for that." };
            setMessages(prev => [...prev, aiMessage]);
            toast({ title: "AI Response Received", description: "RetroAI has generated a response." });

            // --- Placeholder for Ollama/Langchain ---
            // const selectedModel = 'llama3'; // Or get from state
            // if (selectedModel.startsWith('llama')) {
            //      const { simpleOllamaChat } = await import('@/ai/agents/ollama-agent');
            //      const ollamaResponse = await simpleOllamaChat(currentInput, selectedModel);
            //      // ... update messages ...
            // } else {
            //      // Use Genkit flow
            // }
             // --- End Placeholder ---

        } catch (error) {
            console.error("AI Error:", error);
            const errorMessage = { sender: 'RetroAI', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
             toast({ title: "AI Error", description: "Could not get response from AI.", variant: "destructive" });
        } finally {
             setIsGenerating(false);
        }
        // --- End AI Integration ---
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
     <div className="flex flex-col h-full p-1">
        <ScrollArea className="flex-grow mb-1 retro-scrollbar border border-border-dark p-1 text-sm bg-white">
            {messages.map((msg, index) => (
                <p key={index} className="mb-1">
                    <span className={`font-bold ${msg.sender === 'RetroAI' ? 'text-primary' : 'text-foreground'}`}>
                        {msg.sender === 'RetroAI' ? <Bot size={14} className="inline mr-1"/> : null}
                        {msg.sender}:
                    </span>{' '}
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                </p>
            ))}
            {isGenerating && (
                 <p className="text-muted-foreground animate-pulse">RetroAI is thinking...</p>
            )}
        </ScrollArea>
        <div className="flex items-center">
            <Input
                type="text"
                placeholder="Ask AI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="retro-input flex-grow mr-1 h-8"
                aria-label="AI Chat Input"
                disabled={isGenerating}
            />
            {/* TODO: Implement Voice/Gesture Input */}
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
         <div className="text-xs text-muted-foreground mt-1">
             {/* TODO: Make model selection dynamic */}
             Models: Gemini (Genkit), Claude, GPT-4o, Llama (Ollama)
         </div>
    </div>
)};


const PluginManager = () => (
     // TODO: Implement Plugin Marketplace interaction (fetch, install, update)
    <div className="p-2 text-sm flex flex-col h-full">
        <Input type="search" placeholder="Search marketplace..." className="retro-input mb-2 h-7" aria-label="Search Plugins"/>
        <ScrollArea className="flex-grow retro-scrollbar border border-border-dark p-1 bg-white"> {/* Added background */}
            {/* Placeholder plugin list */}
            <ul>
                <li className="mb-1 p-1 border border-transparent hover:border-border-dark">
                    <span className="font-semibold">Linter Pro v2.0</span> <span className="text-xs text-muted-foreground">(Code Quality)</span>
                    <Button size="sm" className="retro-button !py-0 !px-1 float-right ml-1">Update</Button>
                    <Button size="sm" variant="destructive" className="retro-button !py-0 !px-1 float-right">Uninstall</Button>
                    <p className="text-xs text-muted-foreground clear-both">Enforces coding standards.</p>
                </li>
                 <li className="mb-1 p-1 border border-transparent hover:border-border-dark">
                    <span className="font-semibold">Firebase Deployer v1.1</span> <span className="text-xs text-muted-foreground">(Deployment)</span>
                    <Button size="sm" className="retro-button !py-0 !px-1 float-right">Install</Button>
                     <p className="text-xs text-muted-foreground clear-both">One-click deploy to Firebase.</p>
                </li>
                 {/* Add more placeholder plugins */}
            </ul>
        </ScrollArea>
         <div className="mt-2 pt-2 border-t border-border-dark">
             {/* TODO: Implement YAML Workflow management */}
             <h4 className="font-semibold mb-1">YAML Workflows</h4>
              <ScrollArea className="h-24 retro-scrollbar border border-border-dark p-1 bg-white"> {/* Added background */}
                  {/* Placeholder workflows */}
                  <ul>
                      <li>📄 build.yml</li>
                      <li>📄 test-unit.yml</li>
                      <li>📄 deploy-staging.yml</li>
                  </ul>
              </ScrollArea>
               <Button size="sm" className="retro-button mt-1">Create Workflow</Button>
         </div>
    </div>
);

// --- Collaboration Components ---
const CollaborationPanel = () => {
     // TODO: Integrate with src/lib/collaboration.ts
     // - Connect to session on component mount
     // - Use awareness to display active users and cursors
     // - Implement chat functionality using Yjs shared types
     const { toast } = useToast();
     // const [session, setSession] = React.useState<CollaborationSession | null>(null);
     // const [onlineUsers, setOnlineUsers] = React.useState<Map<number, any>>(new Map());

     // React.useEffect(() => {
     //     // TODO: Get document ID from context or props
     //     const docId = 'shared-project-document'; // Example ID
     //     const currentSession = connectCollaboration(docId);
     //     setSession(currentSession);

     //     if (currentSession) {
     //         // Set initial awareness state
     //         setLocalAwarenessState(currentSession.awareness, { user: { name: 'CurrentUser', color: '#008080' } }); // Example state

     //         // Listen for awareness changes
     //         const unsubscribe = onAwarenessChange(currentSession.awareness, (changes) => {
     //             console.log('Awareness changed:', changes);
     //             setOnlineUsers(new Map(currentSession.awareness.getStates()));
     //         });

     //         // Clean up on unmount
     //         return () => {
     //             unsubscribe();
     //             currentSession.destroy();
     //         };
     //     }
     // }, []);


    const handleShare = () => {
         // Placeholder: Generate share link or open sharing modal
         toast({ title: "Sharing (Planned)", description: "Share link copied to clipboard (placeholder)." });
     };
     const handleJoin = () => {
          // Placeholder: Open modal to enter session ID/link
          toast({ title: "Joining Session (Planned)", description: "Joining session... (placeholder)." });
      };

    return (
    <div className="p-2 text-sm flex flex-col items-center gap-2 border-l border-border-dark bg-card h-full">
         <h3 className="font-semibold mb-2">Collaboration</h3>
          {/* TODO: Dynamically render avatars based on 'onlineUsers' state */}
          <div className="flex gap-2 mb-2" title="Online Users (Placeholder)">
            <Avatar className="h-6 w-6 border border-border-dark ring-1 ring-green-500"> {/* Example online indicator */}
                <AvatarImage src="https://picsum.photos/id/237/32/32" data-ai-hint="user avatar" alt="User 1" />
                <AvatarFallback>U1</AvatarFallback>
            </Avatar>
             <Avatar className="h-6 w-6 border border-border-dark">
                 <AvatarImage src="https://picsum.photos/id/12/32/32" data-ai-hint="user avatar" alt="User 2" />
                 <AvatarFallback>U2</AvatarFallback>
             </Avatar>
              {/* Add more avatars */}
         </div>
          <Button size="sm" className="retro-button w-full" onClick={handleShare}>
              <Share2 size={14} className="mr-1"/> Share Session
          </Button>
           <Button size="sm" className="retro-button w-full" onClick={handleJoin}>
               Join Session
           </Button>
            {/* TODO: Implement Live Chat */}
            <div className="flex-grow w-full mt-2">
                <h4 className="text-xs font-semibold mb-1">Live Chat (Planned)</h4>
                <ScrollArea className="h-20 retro-scrollbar border border-border-dark p-1 bg-white text-xs mb-1">
                     <p>Alice: Hey!</p>
                     <p>Bob: Hi there!</p>
                 </ScrollArea>
                 <Input type="text" placeholder="Chat..." className="retro-input h-6 text-xs" />
            </div>
          {/* TODO: Implement Voice/Video controls */}
          <div className="mt-auto w-full flex justify-around">
              <Button variant="ghost" size="icon" className="retro-button !border-none !shadow-none" aria-label="Toggle Microphone" title="Toggle Microphone (Planned)">
                  <Mic size={16} />
              </Button>
               <Button variant="ghost" size="icon" className="retro-button !border-none !shadow-none" aria-label="Toggle Video" title="Toggle Video (Planned)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
              </Button>
          </div>
      </div>
    )
};


// --- Main Page Component ---
export default function Home() {
  const [showPluginManager, setShowPluginManager] = React.useState(false); // State for floating window

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Menu Bar */}
       <RetroMenubar onPluginManagerToggle={() => setShowPluginManager(prev => !prev)} />

      {/* Main Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-grow border-t-2 border-border-dark">

        {/* Left Panel: File Explorer */}
        <ResizablePanel defaultSize={18} minSize={10} maxSize={35}>
            <div className="h-full border-r-2 border-border-dark bg-card"> {/* Ensure panel has background */}
                 <FileExplorer />
            </div>
        </ResizablePanel>
        <ResizableHandle className="retro-separator-v !w-2 bg-card" />

        {/* Center Panel: Editor & Terminal */}
        <ResizablePanel defaultSize={52} minSize={30}>
          <ResizablePanelGroup direction="vertical" className="h-full">
            {/* Code Editor */}
            <ResizablePanel defaultSize={70} minSize={30}>
                 <div className="h-full p-1 bg-card"> {/* Editor container */}
                     <CodeEditor /> {/* Monaco replaces Textarea inside this */}
                 </div>
            </ResizablePanel>
            <ResizableHandle className="retro-separator-h !h-2 bg-card" />
            {/* Terminal/Logs/etc. */}
            <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
              <div className="h-full bg-card">
                <TerminalAndLogs />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle className="retro-separator-v !w-2 bg-card" />

        {/* Right Panel: AI Chat & Collaboration */}
         <ResizablePanel defaultSize={30} minSize={20} maxSize={45}>
           <ResizablePanelGroup direction="vertical" className="h-full">
               {/* AI Chat */}
               <ResizablePanel defaultSize={65} minSize={40}> {/* Adjusted size */}
                  <div className="h-full p-1 border-l-2 border-border-dark bg-card">
                      <AIChat />
                  </div>
               </ResizablePanel>
               <ResizableHandle className="retro-separator-h !h-2 bg-card" />
                {/* Collaboration */}
               <ResizablePanel defaultSize={35} minSize={20} maxSize={50}> {/* Adjusted size */}
                   <div className="h-full border-l-2 border-border-dark bg-card">
                       <CollaborationPanel />
                   </div>
               </ResizablePanel>
           </ResizablePanelGroup>
        </ResizablePanel>


      </ResizablePanelGroup>

      {/* Floating Plugin Manager */}
      {showPluginManager && (
          <RetroWindow
              title="Plugin Manager"
              className="w-80 h-96" // Adjusted size
              initialPosition={{ top: '20%', left: '30%' }}
              style={{ zIndex: 50 }} // Ensure it's above other elements
              onClose={() => setShowPluginManager(false)} // Add close handler
          >
            <PluginManager />
          </RetroWindow>
       )}


       {/* Status Bar */}
      {/* TODO: Make status bar dynamic (Git status, Env status, Line/Col from Monaco) */}
      <div className="h-6 border-t-2 border-border-light bg-card flex items-center px-2 text-xs text-foreground">
        <span>Ln 1, Col 1</span>
        <span className="mx-2 retro-separator-v !h-4 !my-auto border-l-border-dark border-r-border-light"></span>
        <span>UTF-8</span>
         <span className="mx-2 retro-separator-v !h-4 !my-auto border-l-border-dark border-r-border-light"></span>
         <span>Spaces: 2</span>
        <span className="flex-grow"></span> {/* Spacer */}
         {/* DevOps/Env Status Placeholders */}
         <span className="flex items-center gap-1 mr-2" title="IaC Status (Placeholder)">
             <Cloud size={12} /> IaC: Synced
         </span>
         <span className="flex items-center gap-1 mr-2" title="Container Status (Placeholder)">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.4 9.1c-.4-.5-.8-1-1.3-1.3l-4-2.7c-.6-.4-1.3-.4-1.9 0l-4 2.7c-.5.3-.9.8-1.3 1.3l-2.7 4c-.4.6-.4 1.3 0 1.9l2.7 4c.3.5.8.9 1.3 1.3l4 2.7c.6.4 1.3.4 1.9 0l4-2.7c.5-.3.9-.8 1.3-1.3l2.7-4c.4-.6.4-1.3 0-1.9Z"/><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"/></svg>
             Dev Env: Ready
         </span>
        <span className="mr-2">Ready</span>
        <span className="mx-2 retro-separator-v !h-4 !my-auto border-l-border-dark border-r-border-light"></span>
        <span className="flex items-center gap-1" title="Git Branch (Placeholder)"><GitBranch size={12} /> main</span>
      </div>
    </div>
  );
}


// --- Retro Menubar Component ---
// TODO: Implement functionality for menu items (Save, Open, AI actions, Tool actions etc.)
const RetroMenubar = ({ onPluginManagerToggle }: { onPluginManagerToggle: () => void }) => (
    <Menubar className="rounded-none border-b-2 border-t-0 border-x-0 border-border-dark bg-card h-7 min-h-7">
        {/* --- File Menu --- */}
        <MenubarMenu>
            <MenubarTrigger className="retro-menu-trigger">File</MenubarTrigger>
            <MenubarContent className="retro-menu-content">
                <MenubarItem className="retro-menu-item">New File <MenubarShortcut>Ctrl+N</MenubarShortcut></MenubarItem>
                {/* Add Open, Save, etc. */}
                 <MenubarItem className="retro-menu-item">Open File... <MenubarShortcut>Ctrl+O</MenubarShortcut></MenubarItem>
                <MenubarItem className="retro-menu-item">Open Folder... <MenubarShortcut>Ctrl+K Ctrl+O</MenubarShortcut></MenubarItem>
                 <MenubarSeparator className="retro-separator-h !my-0" />
                <MenubarItem className="retro-menu-item">Save <MenubarShortcut>Ctrl+S</MenubarShortcut></MenubarItem>
                <MenubarItem className="retro-menu-item">Save As... <MenubarShortcut>Ctrl+Shift+S</MenubarShortcut></MenubarItem>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                 {/* Secrets Menu Item */}
                 <MenubarSub>
                      <MenubarSubTrigger className="retro-menu-item">Secrets</MenubarSubTrigger>
                      <MenubarSubContent className="retro-menu-content">
                           <MenubarItem className="retro-menu-item">Manage Secrets...</MenubarItem>
                            <MenubarItem className="retro-menu-item">Configure Vault...</MenubarItem>
                      </MenubarSubContent>
                  </MenubarSub>
                   <MenubarSub>
                      <MenubarSubTrigger className="retro-menu-item">Environment</MenubarSubTrigger>
                      <MenubarSubContent className="retro-menu-content">
                           <MenubarItem className="retro-menu-item">Project Variables...</MenubarItem>
                            <MenubarItem className="retro-menu-item">Account Variables...</MenubarItem>
                      </MenubarSubContent>
                  </MenubarSub>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                 <MenubarItem className="retro-menu-item">Exit</MenubarItem>
            </MenubarContent>
        </MenubarMenu>

        {/* --- Edit Menu --- */}
         <MenubarMenu>
            <MenubarTrigger className="retro-menu-trigger">Edit</MenubarTrigger>
             <MenubarContent className="retro-menu-content">
                 <MenubarItem className="retro-menu-item">Undo <MenubarShortcut>Ctrl+Z</MenubarShortcut></MenubarItem>
                 {/* Add Redo, Cut, Copy, Paste, Find, Replace */}
                 <MenubarItem className="retro-menu-item">Redo <MenubarShortcut>Ctrl+Y</MenubarShortcut></MenubarItem>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                 <MenubarItem className="retro-menu-item">Cut <MenubarShortcut>Ctrl+X</MenubarShortcut></MenubarItem>
                 <MenubarItem className="retro-menu-item">Copy <MenubarShortcut>Ctrl+C</MenubarShortcut></MenubarItem>
                 <MenubarItem className="retro-menu-item">Paste <MenubarShortcut>Ctrl+V</MenubarShortcut></MenubarItem>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                 <MenubarItem className="retro-menu-item">Find <MenubarShortcut>Ctrl+F</MenubarShortcut></MenubarItem>
                 <MenubarItem className="retro-menu-item">Replace <MenubarShortcut>Ctrl+H</MenubarShortcut></MenubarItem>
             </MenubarContent>
        </MenubarMenu>

         {/* --- View Menu --- */}
        <MenubarMenu>
            <MenubarTrigger className="retro-menu-trigger">View</MenubarTrigger>
             <MenubarContent className="retro-menu-content">
                 {/* Add Toggles for Panels */}
                <MenubarCheckboxItem className="retro-menu-item" checked>File Explorer</MenubarCheckboxItem>
                 <MenubarCheckboxItem className="retro-menu-item" checked>Editor</MenubarCheckboxItem>
                 <MenubarCheckboxItem className="retro-menu-item" checked>Terminal/Logs</MenubarCheckboxItem>
                  <MenubarCheckboxItem className="retro-menu-item" checked>AI Chat</MenubarCheckboxItem>
                   <MenubarCheckboxItem className="retro-menu-item" checked>Collaboration</MenubarCheckboxItem>
                  <MenubarSeparator className="retro-separator-h !my-0"/>
                  {/* Add Appearance, Full Screen */}
                   <MenubarItem className="retro-menu-item">Command Palette...</MenubarItem>
                   <MenubarSeparator className="retro-separator-h !my-0"/>
                   <MenubarItem className="retro-menu-item">Toggle Full Screen</MenubarItem>
             </MenubarContent>
        </MenubarMenu>

        {/* --- Plugins Menu --- */}
        <MenubarMenu>
            <MenubarTrigger className="retro-menu-trigger">Plugins</MenubarTrigger>
             <MenubarContent className="retro-menu-content">
                 <MenubarItem className="retro-menu-item" onClick={onPluginManagerToggle}>
                     <Puzzle size={14} className="mr-1"/> Manage Plugins...
                 </MenubarItem>
                 {/* Add Browse Marketplace, Install VSIX, Workflows */}
                  <MenubarItem className="retro-menu-item">Browse Marketplace...</MenubarItem>
                  <MenubarSeparator className="retro-separator-h !my-0"/>
                  <MenubarItem className="retro-menu-item">Install from VSIX...</MenubarItem>
                  <MenubarSeparator className="retro-separator-h !my-0"/>
                  <MenubarSub>
                       <MenubarSubTrigger className="retro-menu-item">Workflows</MenubarSubTrigger>
                       <MenubarSubContent className="retro-menu-content">
                            <MenubarItem className="retro-menu-item">Run Build Workflow</MenubarItem>
                            <MenubarItem className="retro-menu-item">Run Test Workflow</MenubarItem>
                            <MenubarItem className="retro-menu-item">Manage Workflows...</MenubarItem>
                       </MenubarSubContent>
                  </MenubarSub>
             </MenubarContent>
        </MenubarMenu>

         {/* --- AI Menu --- */}
         <MenubarMenu>
            <MenubarTrigger className="retro-menu-trigger">AI</MenubarTrigger>
             <MenubarContent className="retro-menu-content">
                 {/* AI Actions */}
                 <MenubarItem className="retro-menu-item">
                     <Bot size={14} className="mr-1"/> Explain Selected Code
                 </MenubarItem>
                 <MenubarItem className="retro-menu-item">Generate Code from Prompt...</MenubarItem>
                 <MenubarItem className="retro-menu-item">Refactor Selection...</MenubarItem>
                 <MenubarItem className="retro-menu-item">Generate Unit Tests</MenubarItem>
                  <MenubarItem className="retro-menu-item">Generate Documentation</MenubarItem>
                  <MenubarItem className="retro-menu-item">Fix Bug (Experimental)...</MenubarItem>
                  <MenubarItem className="retro-menu-item">Scaffold Component/App (Agent)...</MenubarItem>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                  {/* RAG / Knowledge */}
                  <MenubarSub>
                      <MenubarSubTrigger className="retro-menu-item">Knowledge Base (RAG)</MenubarSubTrigger>
                       <MenubarSubContent className="retro-menu-content">
                           <MenubarItem className="retro-menu-item">Query Documents...</MenubarItem>
                           <MenubarItem className="retro-menu-item">Ingest Document/PDF...</MenubarItem>
                           <MenubarItem className="retro-menu-item">Manage Knowledge Sources...</MenubarItem>
                       </MenubarSubContent>
                  </MenubarSub>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                  {/* Model Selection */}
                 <MenubarSub>
                      <MenubarSubTrigger className="retro-menu-item">AI Model</MenubarSubTrigger>
                      <MenubarSubContent className="retro-menu-content">
                          <MenubarRadioGroup value="gemini"> {/* TODO: Link to state */}
                             <MenubarRadioItem value="gemini" className="retro-menu-item">Gemini (Genkit)</MenubarRadioItem>
                             <MenubarRadioItem value="claude" className="retro-menu-item">Claude (Not Impl.)</MenubarRadioItem>
                              <MenubarRadioItem value="gpt4o" className="retro-menu-item">GPT-4o (Not Impl.)</MenubarRadioItem>
                             <MenubarRadioItem value="llama" className="retro-menu-item">Llama (Ollama)</MenubarRadioItem>
                           </MenubarRadioGroup>
                           <MenubarSeparator className="retro-separator-h !my-0"/>
                            <MenubarItem className="retro-menu-item">Configure Ollama...</MenubarItem>
                             <MenubarItem className="retro-menu-item">Fine-tune Model...</MenubarItem>
                      </MenubarSubContent>
                 </MenubarSub>
                 {/* Voice/Gesture */}
                 <MenubarSub>
                      <MenubarSubTrigger className="retro-menu-item">Voice/Gesture</MenubarSubTrigger>
                      <MenubarSubContent className="retro-menu-content">
                          <MenubarCheckboxItem className="retro-menu-item">Enable Voice Commands</MenubarCheckboxItem>
                           <MenubarCheckboxItem className="retro-menu-item">Enable Gesture Commands</MenubarCheckboxItem>
                           <MenubarItem className="retro-menu-item">Configure Commands...</MenubarItem>
                      </MenubarSubContent>
                 </MenubarSub>
             </MenubarContent>
        </MenubarMenu>

        {/* --- Tools Menu --- */}
        <MenubarMenu>
            <MenubarTrigger className="retro-menu-trigger">Tools</MenubarTrigger>
            <MenubarContent className="retro-menu-content">
                 <MenubarItem className="retro-menu-item"><Activity size={14} className="mr-1"/> Profiling Panel</MenubarItem>
                 <MenubarItem className="retro-menu-item"><ShieldCheck size={14} className="mr-1"/> Security Scan</MenubarItem>
                 <MenubarItem className="retro-menu-item"><BarChart3 size={14} className="mr-1"/> Telemetry Dashboard</MenubarItem>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                  {/* Debugger */}
                  <MenubarSub>
                      <MenubarSubTrigger className="retro-menu-item">Debugger</MenubarSubTrigger>
                       <MenubarSubContent className="retro-menu-content">
                           <MenubarItem className="retro-menu-item">Start Debugging</MenubarItem>
                           <MenubarItem className="retro-menu-item">Add Configuration...</MenubarItem>
                       </MenubarSubContent>
                  </MenubarSub>
                   {/* Version Control */}
                  <MenubarSub>
                      <MenubarSubTrigger className="retro-menu-item">Version Control (Git)</MenubarSubTrigger>
                       <MenubarSubContent className="retro-menu-content">
                           <MenubarItem className="retro-menu-item">Commit...</MenubarItem>
                           <MenubarItem className="retro-menu-item">Push</MenubarItem>
                           <MenubarItem className="retro-menu-item">Pull</MenubarItem>
                           <MenubarItem className="retro-menu-item">Branches...</MenubarItem>
                           <MenubarItem className="retro-menu-item">Import from GitHub...</MenubarItem>
                       </MenubarSubContent>
                  </MenubarSub>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                  {/* DevOps */}
                 <MenubarSub>
                      <MenubarSubTrigger className="retro-menu-item"><Cloud size={14} className="mr-1"/> DevOps</MenubarSubTrigger>
                      <MenubarSubContent className="retro-menu-content">
                           <MenubarItem className="retro-menu-item">Apply IaC Changes (TF/K8s)</MenubarItem>
                           <MenubarItem className="retro-menu-item">Generate IaC Module...</MenubarItem>
                            <MenubarSeparator className="retro-separator-h !my-0"/>
                           <MenubarItem className="retro-menu-item">Start Docker Dev Env</MenubarItem>
                            <MenubarItem className="retro-menu-item">Deploy to K8s...</MenubarItem>
                            <MenubarSeparator className="retro-separator-h !my-0"/>
                            <MenubarItem className="retro-menu-item">Manage Deployments...</MenubarItem>
                             <MenubarItem className="retro-menu-item">Configure Hosting...</MenubarItem>
                      </MenubarSubContent>
                 </MenubarSub>
                  {/* Language Environments */}
                   <MenubarSub>
                      <MenubarSubTrigger className="retro-menu-item">Language Environments (Nix)</MenubarSubTrigger>
                       <MenubarSubContent className="retro-menu-content">
                           <MenubarItem className="retro-menu-item">Switch Shell (Python)...</MenubarItem>
                           <MenubarItem className="retro-menu-item">Switch Shell (Go)...</MenubarItem>
                           <MenubarItem className="retro-menu-item">Configure nix/shell.nix...</MenubarItem>
                       </MenubarSubContent>
                  </MenubarSub>
                  <MenubarSeparator className="retro-separator-h !my-0"/>
                 <MenubarItem className="retro-menu-item"><Settings size={14} className="mr-1"/> Settings</MenubarItem>
            </MenubarContent>
        </MenubarMenu>

        {/* --- Help Menu --- */}
         <MenubarMenu>
            <MenubarTrigger className="retro-menu-trigger">Help</MenubarTrigger>
             <MenubarContent className="retro-menu-content">
                 <MenubarItem className="retro-menu-item">Welcome Guide</MenubarItem>
                 {/* Add Docs, API Docs, Commands, Check Updates, About */}
                 <MenubarItem className="retro-menu-item">Documentation</MenubarItem>
                 <MenubarItem className="retro-menu-item">Plugin API Docs</MenubarItem>
                 <MenubarItem className="retro-menu-item">Voice/Gesture Commands</MenubarItem>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                 <MenubarItem className="retro-menu-item">Check for Updates...</MenubarItem>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                 <MenubarItem className="retro-menu-item">About RetroIDE</MenubarItem>
             </MenubarContent>
        </MenubarMenu>
    </Menubar>
);

// Helper utility for class names (assuming it exists in lib/utils)
// import { cn } from "@/lib/utils"; // Ensure this import is present
