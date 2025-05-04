
'use client'; // Required for state and event handlers

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarRadioGroup, MenubarRadioItem, MenubarCheckboxItem } from "@/components/ui/menubar";
import { Maximize2, Minus, X, Bot, Code, Terminal as TerminalIcon, Files, Puzzle, Mic, Hand, Activity, ShieldCheck, BarChart3, Users, Share2, Cloud, GitBranch, Save, FolderOpen, Search, Settings, LifeBuoy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast"; // Import useToast

// --- Retro Window Component ---
// Basic draggable window logic (requires useEffect for client-side interaction)
const RetroWindow = ({ title, children, className, initialPosition = { top: '25%', left: '25%' }, style }: { title: string, children: React.ReactNode, className?: string, initialPosition?: { top: string, left: string }, style?: React.CSSProperties }) => {
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
      setPosition({ top: initialTop, left: initialLeft });
    }
  }, [initialPosition]);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!windowRef.current) return;
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
    setPosition({
      top: e.clientY - dragStart.y,
      left: e.clientX - dragStart.x,
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
          <button className="retro-window-control"><Minus size={10} /></button>
          <button className="retro-window-control"><Maximize2 size={10} /></button>
          <button className="retro-window-control"><X size={10} /></button>
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
        <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> index.html</li>
        <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> style.css</li>
        <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> script.js</li>
        <li className="flex items-center gap-1 font-semibold cursor-default">📁 components</li>
        <ul className="pl-4">
          <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> button.jsx</li>
          <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> modal.jsx</li>
        </ul>
        <li className="flex items-center gap-1 font-semibold cursor-default">📁 assets</li>
        <ul className="pl-4">
          <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default">🖼️ logo.png</li>
        </ul>
        <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> README.md</li>
        <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> package.json</li>
        <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> Dockerfile</li>
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
               {/* Placeholder */}
         </ul>
          <li className="flex items-center gap-1 font-semibold cursor-default">📁 .github</li>
           <ul className="pl-4">
               <li className="flex items-center gap-1 font-semibold cursor-default">📁 workflows</li>
               <ul className="pl-6">
                  <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default"><Files size={14} /> ci.yml</li>
               </ul>
           </ul>
      </ul>
    </ScrollArea>
  </div>
);

const CodeEditor = () => {
    const [code, setCode] = React.useState(`'use client';

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
    <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="// Start coding..."
        className="retro-input flex-grow w-full h-full resize-none font-mono text-sm whitespace-pre !bg-white !text-black" // Explicit white background
        aria-label="Code Editor"
    />
)};


const TerminalAndLogs = () => (
    <Tabs defaultValue="terminal" className="flex flex-col h-full">
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
            <p>AI Profiling Panel</p>
            <p className="text-muted-foreground text-xs">Performance metrics and bundle analysis will appear here.</p>
            {/* Placeholder for profiling charts/data */}
             <Button className="retro-button mt-2" size="sm">Run Analysis</Button>
        </TabsContent>
         <TabsContent value="security" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-2 text-sm">
            <p>Security Scanner</p>
            <p className="text-muted-foreground text-xs">SAST and dependency scan results.</p>
             <ScrollArea className="h-32 retro-scrollbar border border-border-dark p-1 my-1">
                 <ul><li>[INFO] No critical vulnerabilities found.</li>
                 <li>[WARN] Dependency 'old-lib' v1.0 has known security issue.</li>
                 </ul>
             </ScrollArea>
            <Button className="retro-button mt-1" size="sm">Scan Now</Button>
            <Button className="retro-button mt-1 ml-1" size="sm" variant="secondary">Auto-Fix PR</Button>
        </TabsContent>
         <TabsContent value="dashboard" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-2 text-sm">
            <p>Telemetry Dashboard</p>
            <p className="text-muted-foreground text-xs">Errors, Performance, AI Usage.</p>
             {/* Placeholder for charts - Requires recharts integration */}
             <div className="h-32 border border-border-dark my-1 flex items-center justify-center text-muted-foreground">Chart Area</div>
        </TabsContent>
    </Tabs>
);

const Terminal = () => (
    <div className="flex flex-col h-full bg-black text-[#00FF00] border-t-2 border-border-dark"> {/* Green text */}
       <ScrollArea className="flex-grow retro-scrollbar p-1 font-mono text-xs">
            <p>RetroTerm v0.2</p>
            <p>user@retroide:/app$ ls -la</p>
            <p>total 24</p>
            <p>drwxr-xr-x 1 user user 4096 Jul 28 10:00 .</p>
            <p>drwxr-xr-x 1 user user 4096 Jul 28 09:55 ..</p>
            <p>-rw-r--r-- 1 user user  150 Jul 28 10:00 index.html</p>
            <p>-rw-r--r-- 1 user user  210 Jul 28 09:58 style.css</p>
             <p>-rw-r--r-- 1 user user  350 Jul 28 09:59 script.js</p>
             <p>drwxr-xr-x 1 user user 4096 Jul 28 09:57 components</p>
            <p>user@retroide:/app$</p>
            {/* Add more lines or dynamic content here */}
            <div className="h-4"></div> {/* Spacer */}
        </ScrollArea>
         <Input type="text" placeholder=">" aria-label="Terminal Input" className="retro-input !bg-black !text-[#00FF00] font-mono text-xs !rounded-none !border-none !border-t-2 !border-t-[#555555] focus:!ring-0 h-6" /> {/* Darker border */}
    </div>
);

const Logs = () => (
    <div className="flex flex-col h-full bg-card border-t-2 border-border-dark">
         <ScrollArea className="flex-grow retro-scrollbar p-1 font-mono text-xs">
             <p>[INFO] Application started successfully.</p>
             <p>[DEBUG] Connecting to database...</p>
             <p>[WARN] API endpoint /old/path is deprecated.</p>
             <p>[ERROR] Failed to load module 'xyz'.</p>
             {/* More log lines */}
         </ScrollArea>
     </div>
);


const AIChat = () => {
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
        setInput('');
        setIsGenerating(true);

        // --- AI Integration Placeholder ---
        // Replace with actual API call to your Genkit flow
        try {
            // Example: Call generate code flow (adjust flow name and params)
            // const { generateCodeFromPrompt } = await import('@/ai/flows/generate-code-from-prompt');
            // const response = await generateCodeFromPrompt({ prompt: input });
            // const aiMessage = { sender: 'RetroAI', text: response.code };

            // Simulate AI response for now
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
            const aiResponse = `Okay, here's a snippet based on "${userMessage.text.substring(0, 20)}...":\n\n// Placeholder code\nconsole.log('Generated code for: ${userMessage.text}');`;
            const aiMessage = { sender: 'RetroAI', text: aiResponse };


            setMessages(prev => [...prev, aiMessage]);
             toast({ title: "AI Response Received", description: "The AI has generated a response." });
        } catch (error) {
            console.error("AI Error:", error);
            const errorMessage = { sender: 'RetroAI', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
             toast({ title: "AI Error", description: "Could not get response from AI.", variant: "destructive" });
        } finally {
             setIsGenerating(false);
        }
        // --- End AI Integration Placeholder ---
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
            {/* Placeholder Voice/Gesture Buttons */}
             <Button className="retro-button h-8 mr-1" size="icon" aria-label="Voice Input" disabled={isGenerating}>
                <Mic size={14} />
            </Button>
            <Button className="retro-button h-8 mr-1" size="icon" aria-label="Gesture Input" disabled={isGenerating}>
                 <Hand size={14} />
            </Button>
            <Button className="retro-button h-8" onClick={handleSend} disabled={isGenerating || !input.trim()}>
                Send
            </Button>
        </div>
         <div className="text-xs text-muted-foreground mt-1">
             Models: Gemini, Claude, GPT-4o, Llama (Ollama)
         </div>
    </div>
)};


const PluginManager = () => (
    <div className="p-2 text-sm flex flex-col h-full">
        <Input type="search" placeholder="Search marketplace..." className="retro-input mb-2 h-7" aria-label="Search Plugins"/>
        <ScrollArea className="flex-grow retro-scrollbar border border-border-dark p-1">
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
                 <li className="mb-1 p-1 border border-transparent hover:border-border-dark">
                    <span className="font-semibold">Doc Generator v0.8</span> <span className="text-xs text-muted-foreground">(Documentation)</span>
                     <span className="text-muted-foreground float-right text-xs mr-2">Installed</span>
                     <p className="text-xs text-muted-foreground clear-both">Generates function documentation.</p>
                </li>
                 <li className="mb-1 p-1 border border-transparent hover:border-border-dark">
                    <span className="font-semibold">Terraform Assist v1.0</span> <span className="text-xs text-muted-foreground">(IaC)</span>
                     <Button size="sm" className="retro-button !py-0 !px-1 float-right">Install</Button>
                     <p className="text-xs text-muted-foreground clear-both">Helps manage Terraform config.</p>
                </li>
            </ul>
        </ScrollArea>
         <div className="mt-2 pt-2 border-t border-border-dark">
             <h4 className="font-semibold mb-1">YAML Workflows</h4>
              <ScrollArea className="h-24 retro-scrollbar border border-border-dark p-1">
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
     const { toast } = useToast();
    const handleShare = () => {
         // Placeholder: Generate share link or open sharing modal
         toast({ title: "Sharing", description: "Share link copied to clipboard (placeholder)." });
     };
     const handleJoin = () => {
          // Placeholder: Open modal to enter session ID/link
          toast({ title: "Joining Session", description: "Joining session... (placeholder)." });
      };

    return (
    <div className="p-2 text-sm flex flex-col items-center gap-2 border-l border-border-dark bg-card h-full">
         <h3 className="font-semibold mb-2">Collaboration</h3>
          <div className="flex gap-2 mb-2">
            <Avatar className="h-6 w-6 border border-border-dark">
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
          <div className="mt-auto w-full flex justify-around">
              <Button variant="ghost" size="icon" className="retro-button !border-none !shadow-none" aria-label="Toggle Microphone">
                  <Mic size={16} />
              </Button>
              {/* Placeholder for Video Button */}
               <Button variant="ghost" size="icon" className="retro-button !border-none !shadow-none" aria-label="Toggle Video">
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
            <div className="h-full border-r-2 border-border-dark">
                 <FileExplorer />
            </div>
        </ResizablePanel>
        <ResizableHandle className="retro-separator-v !w-2 bg-card" />

        {/* Center Panel: Editor & Terminal */}
        <ResizablePanel defaultSize={52} minSize={30}>
          <ResizablePanelGroup direction="vertical" className="h-full">
            {/* Code Editor */}
            <ResizablePanel defaultSize={70} minSize={30}>
                 <div className="h-full p-1 bg-white"> {/* Editor area slightly inset */}
                     <CodeEditor />
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
               <ResizablePanel defaultSize={75} minSize={40}>
                  <div className="h-full p-1 border-l-2 border-border-dark bg-card">
                      <AIChat />
                  </div>
               </ResizablePanel>
               <ResizableHandle className="retro-separator-h !h-2 bg-card" />
                {/* Collaboration */}
               <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
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
          >
            <PluginManager />
          </RetroWindow>
       )}


       {/* Status Bar */}
      <div className="h-6 border-t-2 border-border-light bg-card flex items-center px-2 text-xs text-foreground">
        <span>Ln 1, Col 1</span>
        <span className="mx-2 retro-separator-v !h-4 !my-auto border-l-border-dark border-r-border-light"></span>
        <span>UTF-8</span>
         <span className="mx-2 retro-separator-v !h-4 !my-auto border-l-border-dark border-r-border-light"></span>
         <span>Spaces: 2</span>
        <span className="flex-grow"></span> {/* Spacer */}
         {/* DevOps Status Placeholders */}
         <span className="flex items-center gap-1 mr-2">
             <Cloud size={12} /> Terraform: Applied
         </span>
         <span className="flex items-center gap-1 mr-2">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.4 9.1c-.4-.5-.8-1-1.3-1.3l-4-2.7c-.6-.4-1.3-.4-1.9 0l-4 2.7c-.5.3-.9.8-1.3 1.3l-2.7 4c-.4.6-.4 1.3 0 1.9l2.7 4c.3.5.8.9 1.3 1.3l4 2.7c.6.4 1.3.4 1.9 0l4-2.7c.5-.3.9-.8 1.3-1.3l2.7-4c.4-.6.4-1.3 0-1.9Z"/><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"/></svg>
             K8s: Ready
         </span>
        <span>Ready</span>
        <span className="mx-2 retro-separator-v !h-4 !my-auto border-l-border-dark border-r-border-light"></span>
        <span className="flex items-center gap-1"><GitBranch size={12} /> main</span>
      </div>
    </div>
  );
}


// --- Retro Menubar Component ---
const RetroMenubar = ({ onPluginManagerToggle }: { onPluginManagerToggle: () => void }) => (
    <Menubar className="rounded-none border-b-2 border-t-0 border-x-0 border-border-dark bg-card h-7 min-h-7">
        {/* --- File Menu --- */}
        <MenubarMenu>
            <MenubarTrigger className="retro-menu-trigger">File</MenubarTrigger>
            <MenubarContent className="retro-menu-content">
                <MenubarItem className="retro-menu-item">New File <MenubarShortcut>Ctrl+N</MenubarShortcut></MenubarItem>
                <MenubarItem className="retro-menu-item">New Window <MenubarShortcut>Ctrl+Shift+N</MenubarShortcut></MenubarItem>
                 <MenubarItem className="retro-menu-item">Open File... <MenubarShortcut>Ctrl+O</MenubarShortcut></MenubarItem>
                <MenubarItem className="retro-menu-item">Open Folder... <MenubarShortcut>Ctrl+K Ctrl+O</MenubarShortcut></MenubarItem>
                 <MenubarSeparator className="retro-separator-h !my-0" />
                <MenubarItem className="retro-menu-item">Save <MenubarShortcut>Ctrl+S</MenubarShortcut></MenubarItem>
                <MenubarItem className="retro-menu-item">Save As... <MenubarShortcut>Ctrl+Shift+S</MenubarShortcut></MenubarItem>
                <MenubarItem className="retro-menu-item">Save All</MenubarItem>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                 <MenubarSub>
                      <MenubarSubTrigger className="retro-menu-item">Share</MenubarSubTrigger>
                      <MenubarSubContent className="retro-menu-content">
                           <MenubarItem className="retro-menu-item">Copy Session Link</MenubarItem>
                            <MenubarItem className="retro-menu-item">Invite Collaborator...</MenubarItem>
                      </MenubarSubContent>
                  </MenubarSub>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                 <MenubarItem className="retro-menu-item">Close Editor</MenubarItem>
                 <MenubarItem className="retro-menu-item">Close Window</MenubarItem>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                <MenubarItem className="retro-menu-item">Exit</MenubarItem>
            </MenubarContent>
        </MenubarMenu>

        {/* --- Edit Menu --- */}
         <MenubarMenu>
            <MenubarTrigger className="retro-menu-trigger">Edit</MenubarTrigger>
             <MenubarContent className="retro-menu-content">
                 <MenubarItem className="retro-menu-item">Undo <MenubarShortcut>Ctrl+Z</MenubarShortcut></MenubarItem>
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
                <MenubarCheckboxItem className="retro-menu-item">File Explorer</MenubarCheckboxItem>
                 <MenubarCheckboxItem className="retro-menu-item" checked>Editor</MenubarCheckboxItem>
                 <MenubarCheckboxItem className="retro-menu-item" checked>Terminal</MenubarCheckboxItem>
                  <MenubarCheckboxItem className="retro-menu-item" checked>AI Chat</MenubarCheckboxItem>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                 <MenubarSub>
                     <MenubarSubTrigger className="retro-menu-item">Appearance</MenubarSubTrigger>
                     <MenubarSubContent className="retro-menu-content">
                         <MenubarCheckboxItem className="retro-menu-item">Status Bar</MenubarCheckboxItem>
                         <MenubarCheckboxItem className="retro-menu-item">Activity Bar</MenubarCheckboxItem>
                         <MenubarSeparator className="retro-separator-h !my-0"/>
                           <MenubarRadioGroup value="light">
                              <MenubarRadioItem value="light" className="retro-menu-item">Light Theme</MenubarRadioItem>
                              <MenubarRadioItem value="dark" className="retro-menu-item">Dark Theme</MenubarRadioItem>
                            </MenubarRadioGroup>
                     </MenubarSubContent>
                 </MenubarSub>
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
                 <MenubarItem className="retro-menu-item">
                     <Bot size={14} className="mr-1"/> Explain Selected Code
                 </MenubarItem>
                 <MenubarItem className="retro-menu-item">Generate Code from Prompt...</MenubarItem>
                 <MenubarItem className="retro-menu-item">Refactor Selection...</MenubarItem>
                 <MenubarItem className="retro-menu-item">Generate Unit Tests</MenubarItem>
                  <MenubarItem className="retro-menu-item">Generate Documentation</MenubarItem>
                 <MenubarSeparator className="retro-separator-h !my-0"/>
                 <MenubarSub>
                      <MenubarSubTrigger className="retro-menu-item">AI Model</MenubarSubTrigger>
                      <MenubarSubContent className="retro-menu-content">
                          <MenubarRadioGroup value="gemini">
                             <MenubarRadioItem value="gemini" className="retro-menu-item">Gemini</MenubarRadioItem>
                             <MenubarRadioItem value="claude" className="retro-menu-item">Claude</MenubarRadioItem>
                              <MenubarRadioItem value="gpt4o" className="retro-menu-item">GPT-4o</MenubarRadioItem>
                             <MenubarRadioItem value="llama" className="retro-menu-item">Llama (Ollama)</MenubarRadioItem>
                           </MenubarRadioGroup>
                           <MenubarSeparator className="retro-separator-h !my-0"/>
                            <MenubarItem className="retro-menu-item">Fine-tune Model...</MenubarItem>
                      </MenubarSubContent>
                 </MenubarSub>
                 <MenubarSub>
                      <MenubarSubTrigger className="retro-menu-item">Voice/Gesture</MenubarSubTrigger>
                      <MenubarSubContent className="retro-menu-content">
                          <MenubarCheckboxItem className="retro-menu-item">Enable Voice Commands</MenubarCheckboxItem>
                           <MenubarCheckboxItem className="retro-menu-item">Enable Gesture Commands</MenubarCheckboxItem>
                           <MenubarItem className="retro-menu-item">Configure Commands...</MenubarItem>
                      </MenubarSubContent>
                 </MenubarSub>
                  <MenubarItem className="retro-menu-item">AI Settings...</MenubarItem>
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
                 <MenubarSub>
                      <MenubarSubTrigger className="retro-menu-item"><Cloud size={14} className="mr-1"/> DevOps</MenubarSubTrigger>
                      <MenubarSubContent className="retro-menu-content">
                           <MenubarItem className="retro-menu-item">Apply Terraform Changes</MenubarItem>
                           <MenubarItem className="retro-menu-item">Generate Terraform Module...</MenubarItem>
                            <MenubarSeparator className="retro-separator-h !my-0"/>
                           <MenubarItem className="retro-menu-item">Start Docker Dev Env</MenubarItem>
                            <MenubarItem className="retro-menu-item">Deploy to K8s...</MenubarItem>
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
