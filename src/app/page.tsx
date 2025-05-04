'use client'; // Add this directive because we use client-side hooks

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarRadioGroup, MenubarRadioItem, MenubarCheckboxItem } from "@/components/ui/menubar";
import { Maximize2, Minus, X, Bot, Code, Terminal as TerminalIcon, Files, Puzzle, Mic, Hand, Activity, ShieldCheck, BarChart3, Users, Share2, Cloud, GitBranch, Save, FolderOpen, Search, Settings, LifeBuoy, Replace, SearchIcon, PackageOpen, HelpCircle, BookOpen, CodeXml, GitCommit, GitPullRequest, Database, FileKey, Globe, Palette, Fullscreen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea"; // Currently using Textarea, TODO: Replace with Monaco
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Import Label
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast"; // Import useToast
// TODO: Import collaboration library
// import { connectCollaboration, setLocalAwarenessState, onAwarenessChange, type CollaborationSession } from '@/lib/collaboration';

// --- Retro Window Component ---
const RetroWindow = ({ title, children, className, initialPosition = { top: '25%', left: '25%' }, style, onClose, onMinimize, isMinimized }: { title: string, children: React.ReactNode, className?: string, initialPosition?: { top: string, left: string }, style?: React.CSSProperties, onClose?: () => void, onMinimize?: () => void, isMinimized?: boolean }) => {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const windowRef = React.useRef<HTMLDivElement>(null);
  const [currentStyle, setCurrentStyle] = React.useState<React.CSSProperties>({});

  React.useEffect(() => {
    // Set initial position and style after mount
    if (windowRef.current) {
      const parentRect = windowRef.current.parentElement?.getBoundingClientRect();
      const initialTop = parseFloat(initialPosition.top) / 100 * (parentRect?.height || window.innerHeight);
      const initialLeft = parseFloat(initialPosition.left) / 100 * (parentRect?.width || window.innerWidth);
      const boundedTop = Math.max(0, Math.min(initialTop, (parentRect?.height || window.innerHeight) - 100)); // Assume min height 100
      const boundedLeft = Math.max(0, Math.min(initialLeft, (parentRect?.width || window.innerWidth) - 150)); // Assume min width 150
      setPosition({ top: boundedTop, left: boundedLeft });
      setCurrentStyle({ ...style, top: `${boundedTop}px`, left: `${boundedLeft}px`, cursor: 'default', position: 'absolute' });
    }
  }, [initialPosition, style]); // Rerun if initialPosition or style changes

  React.useEffect(() => {
    // Update style when position changes
    setCurrentStyle(prevStyle => ({ ...prevStyle, top: `${position.top}px`, left: `${position.left}px`, cursor: isDragging ? 'grabbing' : 'default' }));
  }, [position, isDragging]);

  React.useEffect(() => {
    // Apply visibility based on isMinimized prop
     setCurrentStyle(prevStyle => ({ ...prevStyle, display: isMinimized ? 'none' : 'flex' }));
  }, [isMinimized]);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!windowRef.current || (e.target as HTMLElement).closest('.retro-window-control')) {
      return;
    }
    setIsDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.preventDefault();

    // Bring window to front on drag start
    if (windowRef.current && windowRef.current.parentElement) {
        const siblings = Array.from(windowRef.current.parentElement.children) as HTMLElement[];
        const maxZ = siblings.reduce((max, el) => Math.max(max, parseInt(el.style.zIndex || '0', 10)), 0);
        setCurrentStyle(prev => ({ ...prev, zIndex: maxZ + 1 }));
    }
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

    // Boundary collision detection (consider status bar height)
    const statusBarHeight = 30; // Approximate height of status bar + minimized tabs
    newTop = Math.max(0, Math.min(newTop, parentHeight - windowHeight - statusBarHeight));
    newLeft = Math.max(0, Math.min(newLeft, parentWidth - windowWidth));

    setPosition({ top: newTop, left: newLeft });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setCurrentStyle(prev => ({ ...prev, cursor: 'default' }));
  };

   const bringToFront = () => {
        if (windowRef.current && windowRef.current.parentElement) {
            const siblings = Array.from(windowRef.current.parentElement.children) as HTMLElement[];
            const maxZ = siblings.reduce((max, el) => Math.max(max, parseInt(el.style.zIndex || '0', 10)), 0);
            // Only update if not already the top window
            if (parseInt(currentStyle.zIndex?.toString() || '0') <= maxZ) {
               setCurrentStyle(prev => ({ ...prev, zIndex: maxZ + 1 }));
            }
        }
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
  }, [isDragging, dragStart]); // Re-add dragStart if needed

  return (
    <div
      ref={windowRef}
      className={cn("retro-window absolute", className)}
      style={currentStyle}
      onMouseDown={bringToFront} // Bring to front on any click within the window
    >
      <div
        className="retro-window-titlebar"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <span>{title}</span>
        <div className="flex space-x-1">
           {/* Minimize button triggers onMinimize callback */}
          <button className="retro-window-control" onClick={onMinimize} title="Minimize"><Minus size={10} /></button>
           {/* TODO: Implement Maximize functionality */}
          <button className="retro-window-control" title="Maximize (Planned)"><Maximize2 size={10} /></button>
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
  /**
   * Renders a button with a label and click handler.
   * @param {string} label - The text to display on the button.
   * @param {function} onClick - The function to call when clicked.
   */
  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      onClick={onClick}
    >
      {label} {/* Display the label */}
    </button>
  );
}

export default MyButton;

function calculateSum(a, b) {
    // This function calculates the sum of two numbers
    const result = a + b;
    return result; // Return the sum
}

// Example usage:
const num1 = 5;
const num2 = 10;
console.log(\`The sum is: \${calculateSum(num1, num2)}\`); // Output: The sum is: 15
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
            id="main-code-editor" // Add an ID for potential targeting
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
    const { toast } = useToast(); // Use the toast hook
    const [input, setInput] = React.useState('');
    const [messages, setMessages] = React.useState([
        { sender: 'RetroAI', text: 'How can I help you code today? Ask me to generate, explain, or refactor code!' }
    ]);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [selectedModel, setSelectedModel] = React.useState('gemini'); // Default model

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage = { sender: 'User', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsGenerating(true);

        try {
            let aiResponseText = "Sorry, I couldn't get a response.";

            if (selectedModel === 'gemini') {
                 // Example: Using Genkit Flow (generateCodeFromPrompt)
                const { generateCodeFromPrompt } = await import('@/ai/flows/generate-code-from-prompt');
                const response = await generateCodeFromPrompt({ prompt: currentInput });
                aiResponseText = response.code || "Sorry, I couldn't generate code for that.";
            } else if (selectedModel === 'llama') {
                 // Placeholder for Ollama Integration
                 // const { simpleOllamaChat } = await import('@/ai/agents/ollama-agent');
                 // aiResponseText = await simpleOllamaChat(currentInput, 'llama3'); // Example model name
                 console.warn("Ollama integration not fully implemented yet.");
                 aiResponseText = `(Ollama Placeholder) Responding to: ${currentInput}`;
                 await new Promise(res => setTimeout(res, 1000)); // Simulate delay
             } else {
                 // Handle other models (Claude, GPT-4o) - Placeholders for now
                 console.warn(`${selectedModel} integration not implemented yet.`);
                 aiResponseText = `(${selectedModel} Placeholder) Responding to: ${currentInput}`;
                  await new Promise(res => setTimeout(res, 800)); // Simulate delay
            }

            const aiMessage = { sender: 'RetroAI', text: aiResponseText };
            setMessages(prev => [...prev, aiMessage]);
            toast({ title: "AI Response Received", description: `RetroAI (${selectedModel}) generated a response.` });

        } catch (error) {
            console.error("AI Error:", error);
            const errorMessage = { sender: 'RetroAI', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
            toast({ title: "AI Error", description: `Could not get response from ${selectedModel}.`, variant: "destructive" });
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

     // This would typically be managed by a state passed down or context
    const handleModelChange = (modelId: string) => {
         setSelectedModel(modelId);
         toast({ title: "AI Model Changed", description: `Switched to ${modelId}.` });
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
                 <p className="text-muted-foreground animate-pulse">RetroAI ({selectedModel}) is thinking...</p>
            )}
        </ScrollArea>
        <div className="flex items-center">
            <Input
                type="text"
                placeholder={`Ask ${selectedModel}...`}
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
             {/* Make model selection interactive (basic example) */}
              Model:
              <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="retro-input h-5 text-xs ml-1 bg-card border-border-dark"
                  disabled={isGenerating}
              >
                 <option value="gemini">Gemini (Genkit)</option>
                 <option value="claude">Claude (Not Impl.)</option>
                 <option value="gpt4o">GPT-4o (Not Impl.)</option>
                 <option value="llama">Llama (Ollama)</option>
             </select>
         </div>
    </div>
)};


const PluginManagerContent = () => (
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
                 <li className="mb-1 p-1 border border-transparent hover:border-border-dark">
                    <span className="font-semibold">Retro Theme v1.0</span> <span className="text-xs text-muted-foreground">(Theme)</span>
                     <Button size="sm" variant="destructive" className="retro-button !py-0 !px-1 float-right">Uninstall</Button>
                     <p className="text-xs text-muted-foreground clear-both">The classic look.</p>
                </li>
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
         navigator.clipboard.writeText('https://retroide.example.com/join/session-xyz')
             .then(() => toast({ title: "Sharing Link Copied", description: "Collaboration link copied to clipboard (placeholder)." }))
             .catch(err => toast({ title: "Copy Failed", description: "Could not copy sharing link.", variant: "destructive" }));
     };
     const handleJoin = () => {
          // Placeholder: Open modal to enter session ID/link
          const sessionId = prompt("Enter session ID or link to join:");
          if (sessionId) {
            toast({ title: "Joining Session...", description: `Attempting to join ${sessionId} (placeholder).` });
            // TODO: Implement actual joining logic using connectCollaboration
          }
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
    // Error: Attempted to call useToast() from the server but useToast is on the client.
    // Moved useToast inside the component body where it's allowed.
    const { toast } = useToast();
    const [visibleWindows, setVisibleWindows] = React.useState<Record<string, boolean>>({
        pluginManager: false,
        openFile: false,
        openFolder: false,
        saveAs: false,
        manageSecrets: false,
        configureVault: false,
        projectVars: false,
        accountVars: false,
        findReplace: false,
        commandPalette: false,
        marketplace: false,
        installVsix: false,
        manageWorkflows: false,
        generateCode: false,
        refactorCode: false,
        generateTests: false,
        generateDocs: false,
        fixBug: false,
        scaffoldAgent: false,
        queryKnowledge: false,
        ingestKnowledge: false,
        manageKnowledge: false,
        configureOllama: false,
        fineTuneModel: false,
        configureVoiceGesture: false,
        profiling: false,
        security: false,
        telemetry: false,
        debugger: false,
        git: false, // Combined Git window
        devops: false, // Combined DevOps window
        languageEnv: false,
        settings: false,
        welcome: false, // Show by default maybe?
        about: false,
        // Add other potential window IDs here
    });
     const [minimizedWindows, setMinimizedWindows] = React.useState<string[]>([]);
     const [windowZIndices, setWindowZIndices] = React.useState<Record<string, number>>({});
     const nextZIndex = React.useRef(10); // Starting z-index for floating windows

     // Function to get the next available z-index
     const getNextZIndex = () => {
         nextZIndex.current += 1;
         return nextZIndex.current;
     };

     // Function to toggle window visibility and bring to front
    const toggleWindowVisibility = (id: string) => {
        setVisibleWindows(prev => {
            const newState = !prev[id];
            if (newState) {
                // If opening, ensure it's not minimized and bring to front
                setMinimizedWindows(currentMinimized => currentMinimized.filter(minId => minId !== id));
                setWindowZIndices(prevZ => ({ ...prevZ, [id]: getNextZIndex() }));
            }
            return { ...prev, [id]: newState };
        });
    };

    // Function to minimize a window
    const minimizeWindow = (id: string) => {
        setVisibleWindows(prev => ({ ...prev, [id]: false })); // Hide the window
        setMinimizedWindows(prev => [...new Set([...prev, id])]); // Add to minimized list (ensure unique)
    };

    // Function to restore a minimized window
     const restoreWindow = (id: string) => {
        setVisibleWindows(prev => ({ ...prev, [id]: true })); // Show the window
        setMinimizedWindows(prev => prev.filter(minId => minId !== id)); // Remove from minimized list
        setWindowZIndices(prevZ => ({ ...prevZ, [id]: getNextZIndex() })); // Bring to front
     };

      // Get a display name for minimized tabs (improve this mapping)
    const getWindowName = (id: string): string => {
        switch (id) {
            case 'pluginManager': return 'Plugins';
            case 'findReplace': return 'Find/Replace';
            case 'manageSecrets': return 'Secrets';
            case 'projectVars': return 'Env Vars';
            case 'git': return 'Git';
            case 'devops': return 'DevOps';
            case 'languageEnv': return 'Language Env';
            case 'openFile': return 'Open File';
            case 'openFolder': return 'Open Folder';
            case 'saveAs': return 'Save As';
            case 'configureVault': return 'Vault Config';
            case 'accountVars': return 'Account Vars';
            case 'commandPalette': return 'Command Palette';
            case 'marketplace': return 'Marketplace';
            case 'installVsix': return 'Install VSIX';
            case 'manageWorkflows': return 'Workflows';
            case 'generateCode': return 'Generate Code';
            case 'refactorCode': return 'Refactor Code';
            case 'generateTests': return 'Generate Tests';
            case 'generateDocs': return 'Generate Docs';
            case 'fixBug': return 'Fix Bug';
            case 'scaffoldAgent': return 'Scaffold Agent';
            case 'queryKnowledge': return 'Query Knowledge';
            case 'ingestKnowledge': return 'Ingest Knowledge';
            case 'manageKnowledge': return 'Manage Knowledge';
            case 'configureOllama': return 'Ollama Config';
            case 'fineTuneModel': return 'Fine-tune Model';
            case 'configureVoiceGesture': return 'Voice/Gesture';
            case 'profiling': return 'Profiling';
            case 'security': return 'Security';
            case 'telemetry': return 'Telemetry';
            case 'debugger': return 'Debugger';
            case 'settings': return 'Settings';
            case 'welcome': return 'Welcome';
            case 'about': return 'About';
            // Add more mappings as needed
            default: return id.charAt(0).toUpperCase() + id.slice(1); // Simple capitalization
        }
    };


    // --- Placeholder handlers for menu actions ---
    const handleExplainCode = () => toast({ title: "Action: Explain Code", description: "TODO: Get selected code and call AI flow." });
    const handleGenericAction = (title: string, idToClose?: string) => {
        toast({ title: `Action: ${title}`, description: "TODO: Implement this feature." });
        if (idToClose) {
            setVisibleWindows(prev => ({...prev, [idToClose]: false}));
        }
    };

    // --- Full Screen Toggle ---
     const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                toast({ title: "Error", description: `Could not enter full screen: ${err.message}`, variant: "destructive" });
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
     };

    // --- Find/Replace ---
    // Basic browser find - Monaco integration needed for proper find/replace in editor
     const handleFind = () => {
        window.find(prompt("Find text:") || "");
     };
     const handleReplace = () => {
         // Requires editor integration - this is just a placeholder concept
         const findText = prompt("Find text:");
         const replaceText = prompt(`Replace "${findText}" with:`);
         if (findText && replaceText) {
             toast({ title: "Action: Replace", description: `TODO: Replace '${findText}' with '${replaceText}' in editor.` });
         }
     };


     return (
         <div className="flex flex-col h-screen overflow-hidden bg-background">
             {/* Menu Bar */}
             <RetroMenubar
                 onPluginManagerToggle={() => toggleWindowVisibility('pluginManager')}
                 onShowOpenFile={() => toggleWindowVisibility('openFile')}
                 onShowOpenFolder={() => toggleWindowVisibility('openFolder')}
                 onShowSaveAs={() => toggleWindowVisibility('saveAs')}
                 onShowManageSecrets={() => toggleWindowVisibility('manageSecrets')}
                 onShowConfigureVault={() => toggleWindowVisibility('configureVault')}
                 onShowProjectVars={() => toggleWindowVisibility('projectVars')}
                 onShowAccountVars={() => toggleWindowVisibility('accountVars')}
                 onFind={() => toggleWindowVisibility('findReplace')} // Open combined find/replace window
                 onReplace={() => toggleWindowVisibility('findReplace')} // Open combined find/replace window
                 onCommandPalette={() => toggleWindowVisibility('commandPalette')}
                 onToggleFullScreen={toggleFullScreen}
                 onShowMarketplace={() => toggleWindowVisibility('marketplace')}
                 onShowInstallVsix={() => toggleWindowVisibility('installVsix')}
                 onShowManageWorkflows={() => toggleWindowVisibility('manageWorkflows')}
                 onExplainCode={handleExplainCode}
                 onGenerateCode={() => toggleWindowVisibility('generateCode')}
                 onRefactorCode={() => toggleWindowVisibility('refactorCode')}
                 onGenerateTests={() => toggleWindowVisibility('generateTests')}
                 onGenerateDocs={() => toggleWindowVisibility('generateDocs')}
                 onFixBug={() => toggleWindowVisibility('fixBug')}
                 onScaffoldAgent={() => toggleWindowVisibility('scaffoldAgent')}
                 onQueryKnowledge={() => toggleWindowVisibility('queryKnowledge')}
                 onIngestKnowledge={() => toggleWindowVisibility('ingestKnowledge')}
                 onManageKnowledge={() => toggleWindowVisibility('manageKnowledge')}
                 onConfigureOllama={() => toggleWindowVisibility('configureOllama')}
                 onFineTuneModel={() => toggleWindowVisibility('fineTuneModel')}
                 onConfigureVoiceGesture={() => toggleWindowVisibility('configureVoiceGesture')}
                 onShowProfiling={() => toggleWindowVisibility('profiling')} // Show relevant tab in Terminal/Logs panel? Or dedicated window? For now, window.
                 onShowSecurity={() => toggleWindowVisibility('security')} // Show relevant tab in Terminal/Logs panel? Or dedicated window? For now, window.
                 onShowTelemetry={() => toggleWindowVisibility('telemetry')} // Show relevant tab in Terminal/Logs panel? Or dedicated window? For now, window.
                 onStartDebugging={() => toggleWindowVisibility('debugger')} // Show debugger window
                 onAddDebugConfig={() => toggleWindowVisibility('debugger')} // Show debugger window (maybe focus config area)
                 onShowGitCommit={() => toggleWindowVisibility('git')} // Show Git window
                 onGitPush={() => handleGenericAction('Git Push')}
                 onGitPull={() => handleGenericAction('Git Pull')}
                 onShowGitBranches={() => toggleWindowVisibility('git')} // Show Git window (maybe focus branches)
                 onShowImportGithub={() => toggleWindowVisibility('git')} // Show Git window (maybe focus import)
                 onApplyIaC={() => toggleWindowVisibility('devops')} // Show DevOps window
                 onGenerateIaC={() => toggleWindowVisibility('devops')} // Show DevOps window
                 onStartDockerEnv={() => toggleWindowVisibility('devops')} // Show DevOps window
                 onDeployK8s={() => toggleWindowVisibility('devops')} // Show DevOps window
                 onManageDeployments={() => toggleWindowVisibility('devops')} // Show DevOps window
                 onConfigureHosting={() => toggleWindowVisibility('devops')} // Show DevOps window
                 onShowLanguageEnv={() => toggleWindowVisibility('languageEnv')}
                 onShowSettings={() => toggleWindowVisibility('settings')}
                 onShowWelcome={() => toggleWindowVisibility('welcome')}
                 onShowDocs={() => handleGenericAction('Open Documentation')} // Likely opens external URL
                 onShowApiDocs={() => handleGenericAction('Open Plugin API Docs')} // Likely opens external URL
                 onShowVoiceGestureCommands={() => toggleWindowVisibility('welcome')} // Show in welcome guide or dedicated window?
                 onCheckForUpdates={() => handleGenericAction('Check for Updates')}
                 onShowAbout={() => toggleWindowVisibility('about')}
             />

             {/* Main Layout */}
             <ResizablePanelGroup direction="horizontal" className="flex-grow border-t-2 border-border-dark relative"> {/* Added relative positioning for absolute children */}

                 {/* Left Panel: File Explorer */}
                 <ResizablePanel defaultSize={18} minSize={10} maxSize={35}>
                     <div className="h-full border-r-2 border-border-dark bg-card">
                         <FileExplorer />
                     </div>
                 </ResizablePanel>
                 <ResizableHandle className="retro-separator-v !w-2 bg-card" />

                 {/* Center Panel: Editor & Terminal */}
                 <ResizablePanel defaultSize={52} minSize={30}>
                     <ResizablePanelGroup direction="vertical" className="h-full">
                         <ResizablePanel defaultSize={70} minSize={30}>
                             <div className="h-full p-1 bg-card">
                                 <CodeEditor />
                             </div>
                         </ResizablePanel>
                         <ResizableHandle className="retro-separator-h !h-2 bg-card" />
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
                         <ResizablePanel defaultSize={65} minSize={40}>
                             <div className="h-full p-1 border-l-2 border-border-dark bg-card">
                                 <AIChat />
                             </div>
                         </ResizablePanel>
                         <ResizableHandle className="retro-separator-h !h-2 bg-card" />
                         <ResizablePanel defaultSize={35} minSize={20} maxSize={50}>
                             <div className="h-full border-l-2 border-border-dark bg-card">
                                 <CollaborationPanel />
                             </div>
                         </ResizablePanel>
                     </ResizablePanelGroup>
                 </ResizablePanel>

                 {/* Floating Windows Area - Render all possible windows based on state */}
                {Object.entries(visibleWindows).map(([id, isVisible]) => {
                    if (!isVisible) return null;

                     // Extract key prop before spreading
                     const { key: _key, ...restWindowProps } = {
                        key: id, // Use the window ID as the key
                        title: getWindowName(id),
                        onClose: () => toggleWindowVisibility(id),
                        onMinimize: () => minimizeWindow(id),
                        style: { zIndex: windowZIndices[id] || 10 }, // Use stored z-index
                        isMinimized: minimizedWindows.includes(id) // Pass minimized state
                    };

                    // Add more complex windows here
                     switch (id) {
                         case 'pluginManager':
                            return <RetroWindow key={id} {...restWindowProps} className="w-80 h-96" initialPosition={{ top: '20%', left: '30%' }}><PluginManagerContent /></RetroWindow>;
                         case 'openFile':
                             return <RetroWindow key={id} {...restWindowProps} className="w-96 h-auto" initialPosition={{ top: '30%', left: '35%' }}>
                                 <div className="p-4 flex flex-col gap-2">
                                     <p className="text-sm">Select a file to open:</p>
                                     <Input type="file" className="retro-input text-xs h-8" />
                                     <div className="flex justify-end gap-2 mt-2">
                                         <Button className="retro-button" size="sm" onClick={() => toggleWindowVisibility('openFile')}>Cancel</Button>
                                         <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Open Selected File", 'openFile')}>Open</Button>
                                     </div>
                                 </div>
                             </RetroWindow>;
                          case 'openFolder':
                             return <RetroWindow key={id} {...restWindowProps} className="w-96 h-auto" initialPosition={{ top: '35%', left: '40%' }}>
                                  <div className="p-4 flex flex-col gap-2">
                                      <p className="text-sm">Select a folder to open:</p>
                                      <Input type="text" placeholder="Enter folder path or browse..." className="retro-input h-7 text-xs" />
                                      <div className="flex justify-end gap-2 mt-2">
                                          <Button className="retro-button" size="sm" onClick={() => toggleWindowVisibility('openFolder')}>Cancel</Button>
                                          <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Open Selected Folder", 'openFolder')}>Open Folder</Button>
                                      </div>
                                  </div>
                              </RetroWindow>;
                         case 'saveAs':
                             return <RetroWindow key={id} {...restWindowProps} className="w-96 h-auto" initialPosition={{ top: '40%', left: '45%' }}>
                                 <div className="p-4 flex flex-col gap-2">
                                     <Label htmlFor="save-as-input" className="text-sm">Save As:</Label>
                                     <Input id="save-as-input" type="text" defaultValue="untitled.js" className="retro-input h-7 text-xs" />
                                     <div className="flex justify-end gap-2 mt-2">
                                         <Button className="retro-button" size="sm" onClick={() => toggleWindowVisibility('saveAs')}>Cancel</Button>
                                         <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Save File As", 'saveAs')}>Save</Button>
                                     </div>
                                 </div>
                             </RetroWindow>;
                         case 'manageSecrets':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[400px] h-[300px]" initialPosition={{ top: '15%', left: '50%' }}>
                                 <div className="w-full h-full bg-card p-2 text-sm">
                                     <p className="mb-1">Project Secrets:</p>
                                     <ScrollArea className="h-32 retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                         <ul><li>API_KEY</li><li>DATABASE_URL</li><li>JWT_SECRET</li></ul>
                                     </ScrollArea>
                                     <div className="flex gap-2 mt-2">
                                         <Input placeholder="Secret Key" className="retro-input h-7 text-xs flex-grow"/>
                                         <Input type="password" placeholder="Secret Value" className="retro-input h-7 text-xs flex-grow"/>
                                     </div>
                                     <div className="flex justify-between mt-2">
                                         <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Add/Update Secret")}>Add/Update</Button>
                                         <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleGenericAction("Delete Selected Secret")}>Delete Selected</Button>
                                     </div>
                                 </div>
                             </RetroWindow>;
                        case 'configureVault':
                             return <RetroWindow key={id} {...restWindowProps} className="w-80 h-auto" initialPosition={{ top: '20%', left: '55%' }}>
                                  <div className="p-4 flex flex-col gap-2">
                                     <p className="text-sm font-semibold mb-2">Configure Secrets Vault</p>
                                      {/* Add Vault config options */}
                                      <Label htmlFor="vault-type" className="text-xs">Vault Type:</Label>
                                      <select id="vault-type" className="retro-input h-7 text-xs">
                                          <option value="local-aes">Local AES (Default)</option>
                                          <option value="hashicorp">HashiCorp Vault (Planned)</option>
                                          <option value="cloud-kms">Cloud KMS (Planned)</option>
                                      </select>
                                       <Label htmlFor="vault-key" className="text-xs mt-2">Encryption Key (Local):</Label>
                                      <Input id="vault-key" type="password" placeholder="Loaded from env" className="retro-input h-7 text-xs" disabled/>
                                      <div className="flex justify-end gap-2 mt-2">
                                          <Button className="retro-button" size="sm" onClick={() => toggleWindowVisibility('configureVault')}>Cancel</Button>
                                          <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Save Vault Config", 'configureVault')}>Save</Button>
                                      </div>
                                  </div>
                              </RetroWindow>;
                         case 'projectVars':
                            return <RetroWindow key={id} {...restWindowProps} className="w-[450px] h-[350px]" initialPosition={{ top: '25%', left: '30%' }}>
                                <div className="w-full h-full bg-card p-2 text-sm">
                                    <p className="mb-1 font-semibold">Project Environment Variables</p>
                                    <ScrollArea className="h-48 retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                        <ul><li>NODE_ENV=development</li><li>API_BASE_URL=/api</li><li>ENABLE_FEATURE_X=true</li></ul>
                                    </ScrollArea>
                                    <div className="flex gap-2 mt-2">
                                        <Input placeholder="Variable Name" className="retro-input h-7 text-xs flex-grow"/>
                                        <Input placeholder="Variable Value" className="retro-input h-7 text-xs flex-grow"/>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Add/Update Project Var")}>Add/Update</Button>
                                        <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleGenericAction("Delete Selected Project Var")}>Delete Selected</Button>
                                    </div>
                                </div>
                            </RetroWindow>;
                         case 'accountVars':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[450px] h-[350px]" initialPosition={{ top: '30%', left: '35%' }}>
                                <div className="w-full h-full bg-card p-2 text-sm">
                                    <p className="mb-1 font-semibold">Account Environment Variables</p>
                                    <p className="text-xs text-muted-foreground mb-2">These apply across all your projects.</p>
                                    <ScrollArea className="h-48 retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                        <ul><li>GITHUB_TOKEN=**********</li><li>AWS_ACCESS_KEY_ID=**********</li></ul>
                                    </ScrollArea>
                                    <div className="flex gap-2 mt-2">
                                        <Input placeholder="Variable Name" className="retro-input h-7 text-xs flex-grow"/>
                                        <Input placeholder="Variable Value" className="retro-input h-7 text-xs flex-grow"/>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Add/Update Account Var")}>Add/Update</Button>
                                        <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleGenericAction("Delete Selected Account Var")}>Delete Selected</Button>
                                    </div>
                                </div>
                            </RetroWindow>;
                         case 'findReplace':
                             return <RetroWindow key={id} {...restWindowProps} className="w-80 h-auto" initialPosition={{ top: '10%', left: '60%' }}>
                                 <div className="p-2 flex flex-col gap-1">
                                     <div className="flex gap-1 items-center">
                                         <Label htmlFor="find-input" className="text-xs w-12 shrink-0">Find:</Label>
                                         <Input id="find-input" type="text" className="retro-input h-6 text-xs flex-grow" />
                                     </div>
                                     <div className="flex gap-1 items-center">
                                         <Label htmlFor="replace-input" className="text-xs w-12 shrink-0">Replace:</Label>
                                         <Input id="replace-input" type="text" className="retro-input h-6 text-xs flex-grow" />
                                     </div>
                                     <div className="flex justify-end gap-1 mt-1">
                                         <Button className="retro-button !px-2 !py-0.5" size="sm" onClick={() => handleGenericAction('Find Next')}>Next</Button>
                                         <Button className="retro-button !px-2 !py-0.5" size="sm" onClick={() => handleGenericAction('Replace')}>Replace</Button>
                                         <Button className="retro-button !px-2 !py-0.5" size="sm" onClick={() => handleGenericAction('Replace All')}>All</Button>
                                     </div>
                                 </div>
                             </RetroWindow>;
                         case 'commandPalette':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[500px] h-auto" initialPosition={{ top: '10%', left: '30%' }}>
                                 <div className="p-1">
                                     <Input placeholder="Enter command..." className="retro-input h-7 w-full mb-1" />
                                     <ScrollArea className="h-48 retro-scrollbar border border-border-dark bg-white text-sm">
                                         <ul>
                                             <li className="p-1 hover:bg-primary/10 cursor-pointer" onClick={() => handleGenericAction("File: Save", 'commandPalette')}>File: Save</li>
                                             <li className="p-1 hover:bg-primary/10 cursor-pointer" onClick={() => {toggleWindowVisibility('git'); toggleWindowVisibility('commandPalette');}}>Git: Commit</li>
                                             <li className="p-1 hover:bg-primary/10 cursor-pointer" onClick={() => handleExplainCode()}>AI: Explain Code</li>
                                             {/* Add more commands dynamically */}
                                          </ul>
                                     </ScrollArea>
                                 </div>
                             </RetroWindow>;
                          case 'marketplace':
                             return <RetroWindow key={id} {...restWindowProps} title="Plugin Marketplace" className="w-[600px] h-[450px]" initialPosition={{ top: '15%', left: '25%' }}>
                                 <div className="p-2 text-sm flex flex-col h-full">
                                     <Input type="search" placeholder="Search marketplace..." className="retro-input mb-2 h-7" aria-label="Search Plugins"/>
                                     <ScrollArea className="flex-grow retro-scrollbar border border-border-dark p-1 bg-white">
                                         {/* Placeholder plugin list */}
                                         <ul>
                                             <li className="mb-1 p-1 border border-transparent hover:border-border-dark">
                                                 <span className="font-semibold">Awesome Linter v3.0</span> <span className="text-xs text-muted-foreground">(Code Quality)</span> By LinterCorp
                                                 <Button size="sm" className="retro-button !py-0 !px-1 float-right" onClick={() => handleGenericAction("Install Plugin Awesome Linter")}>Install</Button>
                                                 <p className="text-xs text-muted-foreground clear-both mt-0.5">The best linter for JavaScript and TypeScript.</p>
                                             </li>
                                              <li className="mb-1 p-1 border border-transparent hover:border-border-dark">
                                                 <span className="font-semibold">K8s Deploy Helper v1.5</span> <span className="text-xs text-muted-foreground">(DevOps)</span> By CloudTools
                                                 <Button size="sm" className="retro-button !py-0 !px-1 float-right" onClick={() => handleGenericAction("Install Plugin K8s Deploy")}>Install</Button>
                                                 <p className="text-xs text-muted-foreground clear-both mt-0.5">Simplify Kubernetes deployments.</p>
                                             </li>
                                             {/* Add more from marketplace */}
                                         </ul>
                                     </ScrollArea>
                                     <div className="flex justify-between mt-2 text-xs">
                                         <Button size="sm" className="retro-button" onClick={() => toggleWindowVisibility('installVsix')}>Install from VSIX...</Button>
                                         <span>Showing 2 of 150 plugins</span>
                                     </div>
                                 </div>
                              </RetroWindow>;
                         case 'installVsix':
                            return <RetroWindow key={id} {...restWindowProps} className="w-96 h-auto" initialPosition={{ top: '45%', left: '50%' }}>
                                <div className="p-4 flex flex-col gap-2">
                                    <p className="text-sm">Select a .vsix file to install:</p>
                                    <Input type="file" accept=".vsix" className="retro-input text-xs h-8" />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button className="retro-button" size="sm" onClick={() => toggleWindowVisibility('installVsix')}>Cancel</Button>
                                        <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Install Selected VSIX", 'installVsix')}>Install</Button>
                                     </div>
                                  </div>
                              </RetroWindow>;
                         case 'manageWorkflows':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[500px] h-[400px]" initialPosition={{ top: '20%', left: '45%' }}>
                                 <div className="w-full h-full bg-card p-2 text-sm">
                                    <p className="mb-1 font-semibold">Manage YAML Workflows</p>
                                     <ScrollArea className="h-64 retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                         <ul>
                                             <li className="p-1 hover:bg-primary/10 flex justify-between items-center"><span>📄 build.yml (On Push)</span> <Button size="sm" className="retro-button !p-0.5 !h-5 !w-5" title="Edit"><Settings size={12}/></Button></li>
                                             <li className="p-1 hover:bg-primary/10 flex justify-between items-center"><span>📄 test-unit.yml (Manual)</span><Button size="sm" className="retro-button !p-0.5 !h-5 !w-5" title="Edit"><Settings size={12}/></Button></li>
                                             <li className="p-1 hover:bg-primary/10 flex justify-between items-center"><span>📄 deploy-staging.yml (Manual)</span> <Button size="sm" className="retro-button !p-0.5 !h-5 !w-5" title="Edit"><Settings size={12}/></Button></li>
                                         </ul>
                                     </ScrollArea>
                                     <div className="flex justify-between mt-2">
                                         <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Create New Workflow")}>Create New</Button>
                                         <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleGenericAction("Delete Selected Workflow")}>Delete Selected</Button>
                                     </div>
                                 </div>
                             </RetroWindow>;
                        case 'generateCode':
                            return <RetroWindow key={id} {...restWindowProps} className="w-[400px] h-auto" initialPosition={{ top: '25%', left: '50%' }}>
                                <div className="p-2 flex flex-col gap-2">
                                   <Label htmlFor="gen-code-prompt">Prompt:</Label>
                                   <Textarea id="gen-code-prompt" placeholder="e.g., Create a React component for a loading spinner" className="retro-input h-24 text-xs"/>
                                    <Button className="retro-button self-end" size="sm" onClick={() => handleGenericAction("Generate Code", 'generateCode')}>Generate</Button>
                                </div>
                            </RetroWindow>;
                        case 'refactorCode':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[450px] h-auto" initialPosition={{ top: '30%', left: '50%' }}>
                                 <div className="p-2 flex flex-col gap-2">
                                    <p className="text-sm font-semibold">Refactor Selected Code</p>
                                    <p className="text-xs text-muted-foreground">AI will attempt to refactor the code currently selected in the editor.</p>
                                    <Label htmlFor="refactor-instructions" className="text-xs mt-1">Instructions (Optional):</Label>
                                    <Textarea id="refactor-instructions" placeholder="e.g., Improve readability, make it more performant, convert to functional component" className="retro-input h-20 text-xs"/>
                                     <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleGenericAction("Refactor Code", 'refactorCode')}>Refactor</Button>
                                 </div>
                             </RetroWindow>;
                         case 'generateTests':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[400px] h-auto" initialPosition={{ top: '35%', left: '50%' }}>
                                  <div className="p-2 flex flex-col gap-2">
                                     <p className="text-sm font-semibold">Generate Unit Tests</p>
                                     <p className="text-xs text-muted-foreground">Select the scope for test generation based on the current file or selection.</p>
                                     <Label htmlFor="test-framework" className="text-xs mt-1">Test Framework:</Label>
                                      <select id="test-framework" className="retro-input h-7 text-xs">
                                          <option value="jest">Jest</option>
                                          <option value="vitest">Vitest</option>
                                           <option value="mocha">Mocha</option>
                                          <option value="pytest">Pytest (Python)</option>
                                      </select>
                                     <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleGenericAction("Generate Tests", 'generateTests')}>Generate</Button>
                                 </div>
                              </RetroWindow>;
                        case 'generateDocs':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[400px] h-auto" initialPosition={{ top: '40%', left: '50%' }}>
                                 <div className="p-2 flex flex-col gap-2">
                                     <p className="text-sm font-semibold">Generate Documentation</p>
                                     <p className="text-xs text-muted-foreground">Generate docstrings or comments for the selected code or current file.</p>
                                      <Label htmlFor="doc-format" className="text-xs mt-1">Format:</Label>
                                      <select id="doc-format" className="retro-input h-7 text-xs">
                                          <option value="jsdoc">JSDoc</option>
                                          <option value="tsdoc">TSDoc</option>
                                           <option value="google">Google Style (Python)</option>
                                           <option value="numpy">NumPy Style (Python)</option>
                                           <option value="xmldoc">XML Doc (.NET)</option>
                                      </select>
                                      <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleGenericAction("Generate Docs", 'generateDocs')}>Generate</Button>
                                 </div>
                              </RetroWindow>;
                        case 'fixBug':
                            return <RetroWindow key={id} {...restWindowProps} className="w-[450px] h-auto" initialPosition={{ top: '45%', left: '50%' }}>
                                <div className="p-2 flex flex-col gap-2">
                                    <p className="text-sm font-semibold">Fix Bug with AI</p>
                                    <p className="text-xs text-muted-foreground">Describe the bug, and AI will try to fix it in the selected code.</p>
                                    <Label htmlFor="bug-description" className="text-xs mt-1">Bug Description:</Label>
                                    <Textarea id="bug-description" placeholder="e.g., Component not rendering correctly, API call failing" className="retro-input h-20 text-xs"/>
                                     <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleGenericAction("Fix Bug", 'fixBug')}>Fix</Button>
                                </div>
                            </RetroWindow>;
                         case 'scaffoldAgent':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[500px] h-auto" initialPosition={{ top: '50%', left: '50%' }}>
                                  <div className="p-2 flex flex-col gap-2">
                                    <p className="text-sm font-semibold">Scaffold AI Agent</p>
                                    <p className="text-xs text-muted-foreground">Bootstrap a new AI agent with basic structure and tooling.</p>
                                    <Label htmlFor="agent-name" className="text-xs">Agent Name:</Label>
                                    <Input id="agent-name" placeholder="e.g., MyAwesomeAgent" className="retro-input h-7 text-xs"/>
                                     <Label htmlFor="agent-description" className="text-xs mt-1">Description (Optional):</Label>
                                    <Textarea id="agent-description" placeholder="Short description of the agent's purpose" className="retro-input h-16 text-xs"/>
                                     <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleGenericAction("Scaffold Agent", 'scaffoldAgent')}>Scaffold</Button>
                                 </div>
                             </RetroWindow>;
                        case 'queryKnowledge':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[450px] h-auto" initialPosition={{ top: '55%', left: '50%' }}>
                                <div className="p-2 flex flex-col gap-2">
                                    <p className="text-sm font-semibold">Query Knowledge Base</p>
                                    <p className="text-xs text-muted-foreground">Ask questions about the ingested knowledge. AI will try to find relevant info.</p>
                                    <Label htmlFor="query-input" className="text-xs">Query:</Label>
                                    <Input id="query-input" placeholder="e.g., What are the supported plugins?" className="retro-input h-7 text-xs"/>
                                     <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleGenericAction("Query Knowledge", 'queryKnowledge')}>Query</Button>
                                </div>
                            </RetroWindow>;
                         case 'ingestKnowledge':
                            return <RetroWindow key={id} {...restWindowProps} className="w-[500px] h-auto" initialPosition={{ top: '60%', left: '50%' }}>
                                 <div className="p-2 flex flex-col gap-2">
                                     <p className="text-sm font-semibold">Ingest Knowledge into AI</p>
                                     <p className="text-xs text-muted-foreground">Feed data to the AI to improve its understanding. (Vector DB/RAG)</p>
                                      <Label htmlFor="knowledge-source" className="text-xs">Source URL:</Label>
                                      <Input id="knowledge-source" placeholder="URL of document/site" className="retro-input h-7 text-xs"/>
                                       <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleGenericAction("Ingest Knowledge", 'ingestKnowledge')}>Ingest</Button>
                                 </div>
                             </RetroWindow>;
                         case 'manageKnowledge':
                              return <RetroWindow key={id} {...restWindowProps} className="w-[550px] h-[400px]" initialPosition={{ top: '65%', left: '50%' }}>
                                 <div className="p-2 text-sm flex flex-col h-full">
                                      <p className="font-semibold">Manage Knowledge Base</p>
                                      <ScrollArea className="flex-grow retro-scrollbar border border-border-dark p-1 bg-white">
                                           <ul>
                                               <li className="p-1 hover:bg-primary/10 flex justify-between items-center"><span>📄 docs/plugin-api.md</span><Button size="sm" className="retro-button !p-0.5 !h-5 !w-5" title="Delete"><X size={12}/></Button></li>
                                               <li className="p-1 hover:bg-primary/10 flex justify-between items-center"><span>🌐 https://example.com/faq</span><Button size="sm" className="retro-button !p-0.5 !h-5 !w-5" title="Delete"><X size={12}/></Button></li>
                                           </ul>
                                      </ScrollArea>
                                      <div className="flex justify-between mt-1">
                                          <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Rebuild Index")}>Rebuild Index</Button>
                                          <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleGenericAction("Clear Knowledge Base")}>Clear All</Button>
                                      </div>
                                 </div>
                              </RetroWindow>;
                         case 'configureOllama':
                             return <RetroWindow key={id} {...restWindowProps} className="w-80 h-auto" initialPosition={{ top: '25%', left: '60%' }}>
                                   <div className="p-4 flex flex-col gap-2">
                                       <p className="text-sm font-semibold">Configure Ollama Integration</p>
                                       <p className="text-xs text-muted-foreground">Ollama host and model settings for local AI.</p>
                                        <Label htmlFor="ollama-host" className="text-xs">Ollama Host:</Label>
                                        <Input id="ollama-host" placeholder="http://localhost:11434" className="retro-input h-7 text-xs"/>
                                         <Label htmlFor="ollama-model" className="text-xs mt-1">Default Model:</Label>
                                         <Input id="ollama-model" placeholder="llama3" className="retro-input h-7 text-xs"/>
                                          <div className="flex justify-end gap-2 mt-2">
                                               <Button className="retro-button" size="sm" onClick={() => toggleWindowVisibility('configureOllama')}>Cancel</Button>
                                               <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Save Ollama Config", 'configureOllama')}>Save</Button>
                                           </div>
                                   </div>
                              </RetroWindow>;
                          case 'fineTuneModel':
                            return <RetroWindow key={id} {...restWindowProps} className="w-[500px] h-auto" initialPosition={{ top: '30%', left: '60%' }}>
                                  <div className="p-2 flex flex-col gap-2">
                                      <p className="text-sm font-semibold">Fine-Tune AI Model</p>
                                      <p className="text-xs text-muted-foreground">Customize an AI model with your own data for specialized tasks.</p>
                                       <Label htmlFor="training-data" className="text-xs">Training Data (JSONL):</Label>
                                        <Input type="file" id="training-data" accept=".jsonl" className="retro-input h-7 text-xs"/>
                                         <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleGenericAction("Start Fine-Tuning")}>Start Training</Button>
                                  </div>
                              </RetroWindow>;
                         case 'configureVoiceGesture':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[400px] h-auto" initialPosition={{ top: '35%', left: '60%' }}>
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold">Configure Voice/Gesture Control</p>
                                        <p className="text-xs text-muted-foreground">Assign voice commands and gestures to editor actions.</p>
                                        <Label htmlFor="voice-cmd-save" className="text-xs">Voice "Save":</Label>
                                        <Input id="voice-cmd-save" placeholder="Save File" className="retro-input h-7 text-xs"/>
                                        <Label htmlFor="gesture-copy" className="text-xs mt-1">Gesture "Copy":</Label>
                                        <Input id="gesture-copy" placeholder="Two-finger swipe right" className="retro-input h-7 text-xs"/>
                                        <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleGenericAction("Save Voice/Gesture Config", 'configureVoiceGesture')}>Save</Button>
                                    </div>
                                </RetroWindow>;
                         case 'profiling':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[550px] h-[400px]" initialPosition={{ top: '40%', left: '60%' }}>
                                 <div className="p-2 flex flex-col h-full">
                                     <p className="font-semibold">Performance Profiling</p>
                                     <p className="text-xs text-muted-foreground">Analyze performance bottlenecks and optimize your code.</p>
                                     {/* Embed profiling results */}
                                     <div className="flex-grow bg-white border border-border-dark p-2 retro-scrollbar">
                                         {/* Placeholder content */}
                                         <p>TODO: Integrate with profiling tools (e.g., Chrome DevTools Protocol)</p>
                                     </div>
                                      <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleGenericAction("Start Profiling")}>Start Profiling</Button>
                                 </div>
                             </RetroWindow>;
                        case 'security':
                            return <RetroWindow key={id} {...restWindowProps} className="w-[550px] h-[400px]" initialPosition={{ top: '45%', left: '60%' }}>
                                <div className="p-2 flex flex-col h-full">
                                    <p className="font-semibold">Security Analysis</p>
                                    <p className="text-xs text-muted-foreground">Scan for vulnerabilities and insecure code patterns.</p>
                                    <div className="flex-grow bg-white border border-border-dark p-2 retro-scrollbar">
                                         {/* Placeholder SAST results */}
                                        <p>TODO: Integrate with SAST tools (e.g., ESLint security plugins)</p>
                                    </div>
                                     <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleGenericAction("Run Security Scan")}>Run Scan</Button>
                                </div>
                            </RetroWindow>;
                         case 'telemetry':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[550px] h-[400px]" initialPosition={{ top: '50%', left: '60%' }}>
                                <div className="p-2 flex flex-col h-full">
                                    <p className="font-semibold">Telemetry Dashboard</p>
                                    <p className="text-xs text-muted-foreground">Visualize application metrics, errors, and usage patterns.</p>
                                    <div className="flex-grow bg-white border border-border-dark p-2 retro-scrollbar">
                                         {/* Placeholder telemetry data */}
                                        <p>TODO: Integrate with telemetry services (e.g., Sentry, Prometheus)</p>
                                    </div>
                                     <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleGenericAction("Refresh Telemetry")}>Refresh</Button>
                                </div>
                            </RetroWindow>;
                         case 'debugger':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[600px] h-[450px]" initialPosition={{ top: '55%', left: '60%' }}>
                                 <div className="p-2 text-sm flex flex-col h-full">
                                     <p className="font-semibold">Debugger</p>
                                     <p className="text-xs text-muted-foreground">Interactive code debugging with breakpoints, call stack, and variable inspection.</p>
                                     {/* Integrate Debugger UI here */}
                                      <div className="flex-grow bg-white border border-border-dark p-2 retro-scrollbar">
                                          <p>TODO: Integrate with debug adapters (e.g., DAP)</p>
                                       </div>
                                 </div>
                             </RetroWindow>;
                         case 'git':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[500px] h-[400px]" initialPosition={{ top: '60%', left: '60%' }}>
                                 <div className="p-2 text-sm flex flex-col h-full">
                                      <p className="font-semibold">Git</p>
                                      <Tabs defaultValue="commit" className="flex flex-col h-full">
                                          <TabsList className="retro-tabs-list shrink-0">
                                              <TabsTrigger value="commit" className="retro-tab-trigger">Commit</TabsTrigger>
                                              <TabsTrigger value="branches" className="retro-tab-trigger">Branches</TabsTrigger>
                                              <TabsTrigger value="import" className="retro-tab-trigger">Import</TabsTrigger>
                                          </TabsList>
                                          <TabsContent value="commit" className="flex-grow overflow-hidden mt-0 rounded-none border-none">
                                               <p className="text-xs text-muted-foreground mt-1">Commit Message:</p>
                                               <Textarea placeholder="Enter commit message..." className="retro-input h-16 text-xs"/>
                                                <Button className="retro-button mt-2" size="sm" onClick={() => handleGenericAction("Commit Changes")}>Commit</Button>
                                          </TabsContent>
                                          <TabsContent value="branches" className="flex-grow overflow-hidden mt-0 rounded-none border-none">
                                               <p className="text-xs text-muted-foreground mt-1">Git Branches:</p>
                                               {/* List branches here */}
                                               <Button className="retro-button mt-2" size="sm" onClick={() => handleGenericAction("Create New Branch")}>Create Branch</Button>
                                          </TabsContent>
                                          <TabsContent value="import" className="flex-grow overflow-hidden mt-0 rounded-none border-none">
                                                <p className="text-xs text-muted-foreground mt-1">Import from GitHub:</p>
                                                <Input placeholder="GitHub repository URL" className="retro-input h-7 text-xs"/>
                                                 <Button className="retro-button mt-2" size="sm" onClick={() => handleGenericAction("Import Repository")}>Import</Button>
                                          </TabsContent>
                                      </Tabs>
                                 </div>
                             </RetroWindow>;
                         case 'devops':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[500px] h-[400px]" initialPosition={{ top: '65%', left: '60%' }}>
                                 <div className="p-2 text-sm flex flex-col h-full">
                                      <p className="font-semibold">DevOps</p>
                                      <Tabs defaultValue="iac" className="flex flex-col h-full">
                                          <TabsList className="retro-tabs-list shrink-0">
                                              <TabsTrigger value="iac" className="retro-tab-trigger">IaC</TabsTrigger>
                                              <TabsTrigger value="docker" className="retro-tab-trigger">Docker</TabsTrigger>
                                              <TabsTrigger value="k8s" className="retro-tab-trigger">K8s</TabsTrigger>
                                              <TabsTrigger value="hosting" className="retro-tab-trigger">Hosting</TabsTrigger>
                                          </TabsList>
                                          <TabsContent value="iac" className="flex-grow overflow-hidden mt-0 rounded-none border-none">
                                               <p className="text-xs text-muted-foreground mt-1">Infrastructure-as-Code:</p>
                                               <Textarea placeholder="Terraform/Pulumi configuration..." className="retro-input h-16 text-xs"/>
                                                <Button className="retro-button mt-2" size="sm" onClick={() => handleGenericAction("Apply Infrastructure")}>Apply</Button>
                                          </TabsContent>
                                          <TabsContent value="docker" className="flex-grow overflow-hidden mt-0 rounded-none border-none">
                                               <p className="text-xs text-muted-foreground mt-1">Docker Compose:</p>
                                               <Button className="retro-button mt-2" size="sm" onClick={() => handleGenericAction("Start Docker Environment")}>Start Env</Button>
                                          </TabsContent>
                                          <TabsContent value="k8s" className="flex-grow overflow-hidden mt-0 rounded-none border-none">
                                                <p className="text-xs text-muted-foreground mt-1">Kubernetes Deployments:</p>
                                                <Button className="retro-button mt-2" size="sm" onClick={() => handleGenericAction("Deploy to Kubernetes")}>Deploy</Button>
                                          </TabsContent>
                                          <TabsContent value="hosting" className="flex-grow overflow-hidden mt-0 rounded-none border-none">
                                               <p className="text-xs text-muted-foreground mt-1">Hosting Config:</p>
                                               <Button className="retro-button mt-2" size="sm" onClick={() => handleGenericAction("Configure Hosting")}>Configure</Button>
                                          </TabsContent>
                                      </Tabs>
                                 </div>
                             </RetroWindow>;
                         case 'languageEnv':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[450px] h-[350px]" initialPosition={{ top: '30%', left: '35%' }}>
                                 <div className="w-full h-full bg-card p-2 text-sm">
                                     <p className="mb-1 font-semibold">Language Environment</p>
                                     <p className="text-xs text-muted-foreground mb-2">Manage language-specific settings and dependencies.</p>
                                      <div className="flex justify-between mt-2">
                                          <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Install Dependency")}>Install Dep</Button>
                                          <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleGenericAction("Uninstall Dependency")}>Uninstall Dep</Button>
                                      </div>
                                 </div>
                             </RetroWindow>;
                         case 'settings':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[600px] h-[450px]" initialPosition={{ top: '35%', left: '30%' }}>
                                 <div className="p-2 text-sm flex flex-col h-full">
                                     <p className="font-semibold">Settings</p>
                                      <Tabs defaultValue="editor" className="flex flex-col h-full">
                                          <TabsList className="retro-tabs-list shrink-0">
                                              <TabsTrigger value="editor" className="retro-tab-trigger">Editor</TabsTrigger>
                                              <TabsTrigger value="theme" className="retro-tab-trigger">Theme</TabsTrigger>
                                              <TabsTrigger value="keyboard" className="retro-tab-trigger">Keyboard</TabsTrigger>
                                              {/* Add more setting categories */}
                                          </TabsList>
                                          <TabsContent value="editor" className="flex-grow overflow-hidden mt-0 rounded-none border-none">
                                              <p className="text-xs text-muted-foreground mt-1">Editor Settings:</p>
                                              {/* Editor settings controls */}
                                          </TabsContent>
                                          <TabsContent value="theme" className="flex-grow overflow-hidden mt-0 rounded-none border-none">
                                              <p className="text-xs text-muted-foreground mt-1">Theme Settings:</p>
                                              {/* Theme selection controls */}
                                          </TabsContent>
                                          <TabsContent value="keyboard" className="flex-grow overflow-hidden mt-0 rounded-none border-none">
                                               <p className="text-xs text-muted-foreground mt-1">Keyboard Shortcuts:</p>
                                              {/* Keyboard shortcut settings */}
                                          </TabsContent>
                                      </Tabs>
                                 </div>
                             </RetroWindow>;
                         case 'welcome':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[500px] h-[350px]" initialPosition={{ top: '40%', left: '30%' }}>
                                  <div className="p-2 text-sm">
                                     <p className="font-semibold">Welcome to Retro IDE</p>
                                      <p className="mt-1">Get started with these resources:</p>
                                       <ul>
                                          <li><a href="#" onClick={() => handleGenericAction('Open Documentation')} className="text-primary hover:underline">Documentation</a></li>
                                          <li><a href="#" onClick={() => toggleWindowVisibility('configureVoiceGesture')} className="text-primary hover:underline">Voice/Gesture Commands</a></li>
                                          <li><a href="#" onClick={() => handleGenericAction('Take a Tour')} className="text-primary hover:underline">Take a Tour</a></li>
                                       </ul>
                                  </div>
                             </RetroWindow>;
                         case 'about':
                             return <RetroWindow key={id} {...restWindowProps} className="w-[400px] h-[300px]" initialPosition={{ top: '45%', left: '30%' }}>
                                 <div className="p-2 text-sm">
                                     <p className="font-semibold">About Retro IDE</p>
                                     <p className="mt-1">Version: 0.5.0</p>
                                      <p>Developed by Retro Coders</p>
                                      {/* Add copyright, credits, etc. */}
                                 </div>
                             </RetroWindow>;
                         default:
                            return <RetroWindow key={id} {...restWindowProps} className="w-64 h-48" initialPosition={{ top: '50%', left: '50%' }}>{id}</RetroWindow>;
                     }
                 })}

             </ResizablePanelGroup>

             {/* Status Bar */}
             <div className="h-7 border-t-2 border-border-dark flex items-center justify-between text-xs bg-card">
                <div className="px-2">
                    {/* Display project status, Git branch, etc. */}
                     <span>Project: MyProject</span>
                    <span> | Branch: main</span>
                </div>
                <div className="flex items-center px-2 space-x-2">
                    {/* Show minimized window tabs */}
                   {minimizedWindows.map(id => (
                        <button key={id} className="retro-minimized-tab" onClick={() => restoreWindow(id)}>
                            {getWindowName(id)}
                        </button>
                    ))}
                    <Button variant="ghost" size="icon" className="retro-button !border-none !shadow-none" aria-label="Toggle Full Screen" onClick={toggleFullScreen}>
                        <Fullscreen size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="retro-button !border-none !shadow-none" aria-label="Settings" onClick={() => toggleWindowVisibility('settings')}>
                         <Settings size={16} />
                    </Button>
                    <span>Retro IDE</span>
                </div>
            </div>
         </div>
     );
 }

// --- Retro Menu Bar Component ---
interface RetroMenubarProps {
    onPluginManagerToggle: () => void;
    onShowOpenFile: () => void;
    onShowOpenFolder: () => void;
    onShowSaveAs: () => void;
    onShowManageSecrets: () => void;
    onShowConfigureVault: () => void;
    onShowProjectVars: () => void;
    onShowAccountVars: () => void;
    onFind: () => void;
    onReplace: () => void;
    onCommandPalette: () => void;
    onToggleFullScreen: () => void;
    onShowMarketplace: () => void;
    onShowInstallVsix: () => void;
    onShowManageWorkflows: () => void;
    onExplainCode: () => void;
    onGenerateCode: () => void;
    onRefactorCode: () => void;
    onGenerateTests: () => void;
    onGenerateDocs: () => void;
    onFixBug: () => void;
    onScaffoldAgent: () => void;
    onQueryKnowledge: () => void;
    onIngestKnowledge: () => void;
    onManageKnowledge: () => void;
    onConfigureOllama: () => void;
    onFineTuneModel: () => void;
    onConfigureVoiceGesture: () => void;
    onShowProfiling: () => void;
    onShowSecurity: () => void;
    onShowTelemetry: () => void;
    onStartDebugging: () => void;
    onAddDebugConfig: () => void;
    onShowGitCommit: () => void;
    onGitPush: () => void;
    onGitPull: () => void;
    onShowGitBranches: () => void;
    onShowImportGithub: () => void;
    onApplyIaC: () => void;
    onGenerateIaC: () => void;
    onStartDockerEnv: () => void;
    onDeployK8s: () => void;
    onManageDeployments: () => void;
    onConfigureHosting: () => void;
    onShowLanguageEnv: () => void;
    onShowSettings: () => void;
    onShowWelcome: () => void;
    onShowDocs: () => void;
    onShowApiDocs: () => void;
    onShowVoiceGestureCommands: () => void;
    onCheckForUpdates: () => void;
    onShowAbout: () => void;
}

const RetroMenubar = ({
    onPluginManagerToggle,
    onShowOpenFile,
    onShowOpenFolder,
    onShowSaveAs,
    onShowManageSecrets,
    onShowConfigureVault,
    onShowProjectVars,
    onShowAccountVars,
    onFind,
    onReplace,
    onCommandPalette,
    onToggleFullScreen,
    onShowMarketplace,
    onShowInstallVsix,
    onShowManageWorkflows,
    onExplainCode,
    onGenerateCode,
    onRefactorCode,
    onGenerateTests,
    onGenerateDocs,
    onFixBug,
    onScaffoldAgent,
    onQueryKnowledge,
    onIngestKnowledge,
    onManageKnowledge,
    onConfigureOllama,
    onFineTuneModel,
    onConfigureVoiceGesture,
    onShowProfiling,
    onShowSecurity,
    onShowTelemetry,
    onStartDebugging,
    onAddDebugConfig,
    onShowGitCommit,
    onGitPush,
    onGitPull,
    onShowGitBranches,
    onShowImportGithub,
    onApplyIaC,
    onGenerateIaC,
    onStartDockerEnv,
    onDeployK8s,
    onManageDeployments,
    onConfigureHosting,
    onShowLanguageEnv,
    onShowSettings,
    onShowWelcome,
    onShowDocs,
    onShowApiDocs,
    onShowVoiceGestureCommands,
    onCheckForUpdates,
    onShowAbout
}: RetroMenubarProps) => {
    return (
        <Menubar className="border-b-2 border-border-dark rounded-none">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onShowOpenFile}>
                        Open File...
                        <MenubarShortcut>⌘O</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem onSelect={onShowOpenFolder}>
                        Open Folder...
                        <MenubarShortcut>⌘⇧O</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowSaveAs}>
                        Save As...
                        <MenubarShortcut>⌘⇧S</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onCommandPalette}>
                        Command Palette...
                        <MenubarShortcut>⌘P</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onToggleFullScreen}>
                        Toggle Full Screen
                        <MenubarShortcut>F11</MenubarShortcut>
                    </MenubarItem>
                     <MenubarSeparator />
                     <MenubarItem onSelect={onShowWelcome}>
                        Show Welcome Guide
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onFind}>
                        Find...
                        <MenubarShortcut>⌘F</MenubarShortcut>
                    </MenubarItem>
                     <MenubarItem onSelect={onReplace}>
                        Replace...
                        <MenubarShortcut>⌘⇧F</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowManageSecrets}>
                        Manage Secrets...
                    </MenubarItem>
                     <MenubarItem onSelect={onShowConfigureVault}>
                        Configure Vault...
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowProjectVars}>
                        Project Vars...
                    </MenubarItem>
                    <MenubarItem onSelect={onShowAccountVars}>
                        Account Vars...
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>

             <MenubarMenu>
                <MenubarTrigger>AI</MenubarTrigger>
                <MenubarContent>
                     <MenubarItem onSelect={onExplainCode}>
                        Explain Code
                    </MenubarItem>
                     <MenubarSeparator />
                     <MenubarItem onSelect={onGenerateCode}>
                        Generate Code
                    </MenubarItem>
                    <MenubarItem onSelect={onRefactorCode}>
                        Refactor Code
                    </MenubarItem>
                    <MenubarItem onSelect={onGenerateTests}>
                        Generate Tests
                    </MenubarItem>
                    <MenubarItem onSelect={onGenerateDocs}>
                        Generate Docs
                    </MenubarItem>
                     <MenubarSeparator />
                      <MenubarItem onSelect={onFixBug}>
                        Fix Bug
                    </MenubarItem>
                     <MenubarSeparator />
                     <MenubarItem onSelect={onScaffoldAgent}>
                        Scaffold Agent
                    </MenubarItem>
                    <MenubarSeparator />
                     <MenubarItem onSelect={onQueryKnowledge}>
                        Query Knowledge
                    </MenubarItem>
                    <MenubarItem onSelect={onIngestKnowledge}>
                        Ingest Knowledge
                    </MenubarItem>
                    <MenubarItem onSelect={onManageKnowledge}>
                        Manage Knowledge
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onConfigureOllama}>
                        Configure Ollama
                    </MenubarItem>
                    <MenubarItem onSelect={onFineTuneModel}>
                        Fine-tune Model
                    </MenubarItem>
                    <MenubarSeparator />
                     <MenubarItem onSelect={onConfigureVoiceGesture}>
                        Configure Voice/Gesture
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Code</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onStartDebugging}>
                        Start Debugging
                    </MenubarItem>
                    <MenubarItem onSelect={onAddDebugConfig}>
                        Add Debug Config
                    </MenubarItem>
                     <MenubarSeparator />
                     <MenubarItem onSelect={onShowLanguageEnv}>
                        Language Environment
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Git</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onShowGitCommit}>
                        Commit...
                    </MenubarItem>
                    <MenubarItem onSelect={onGitPush}>
                        Push
                    </MenubarItem>
                    <MenubarItem onSelect={onGitPull}>
                        Pull
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowGitBranches}>
                        Show Branches
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowImportGithub}>
                        Import from GitHub...
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>DevOps</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onApplyIaC}>
                        Apply IaC
                    </MenubarItem>
                    <MenubarItem onSelect={onGenerateIaC}>
                        Generate IaC
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onStartDockerEnv}>
                        Start Docker Env
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onDeployK8s}>
                        Deploy K8s
                    </MenubarItem>
                    <MenubarItem onSelect={onManageDeployments}>
                        Manage Deployments
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onConfigureHosting}>
                        Configure Hosting
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onPluginManagerToggle}>
                        Toggle Plugin Manager
                    </MenubarItem>
                     <MenubarSeparator />
                     <MenubarItem onSelect={onShowProfiling}>
                        Show Profiling
                    </MenubarItem>
                    <MenubarItem onSelect={onShowSecurity}>
                        Show Security
                    </MenubarItem>
                    <MenubarItem onSelect={onShowTelemetry}>
                        Show Telemetry
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Plugins</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onShowMarketplace}>
                        Marketplace
                    </MenubarItem>
                    <MenubarItem onSelect={onShowInstallVsix}>
                        Install from VSIX...
                    </MenubarItem>
                     <MenubarSeparator />
                     <MenubarItem onSelect={onShowManageWorkflows}>
                        Manage Workflows
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Help</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onShowDocs}>
                        Documentation
                    </MenubarItem>
                    <MenubarItem onSelect={onShowApiDocs}>
                        Plugin API Docs
                    </MenubarItem>
                     <MenubarSeparator />
                    <MenubarItem onSelect={onShowVoiceGestureCommands}>
                        Voice/Gesture Commands
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onCheckForUpdates}>
                        Check for Updates...
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowAbout}>
                        About
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    );
};
