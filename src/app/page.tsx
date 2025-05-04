'use client'; // Add this directive because we use client-side hooks

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarRadioGroup, MenubarRadioItem, MenubarCheckboxItem } from "@/components/ui/menubar";
import { Maximize2, Minus, X, Bot, Code, Terminal as TerminalIcon, Files, Puzzle, Mic, Hand, Activity, ShieldCheck, BarChart3, Users, Share2, Cloud, GitBranch, Save, FolderOpen, Search, Settings, LifeBuoy, Replace, SearchIcon, PackageOpen, HelpCircle, BookOpen, CodeXml, GitCommit, GitPullRequest, Database, FileKey, Globe, Palette, Fullscreen, BrainCircuit, FileCode, FlaskConical, Recycle, Lightbulb, MessageSquare, Brain, Sparkles, FileQuestion, FileInput, DatabaseZap, Cpu, Wrench, Route, TestTubeDiagonal } from "lucide-react"; // Added new icons
import { Textarea } from "@/components/ui/textarea"; // Currently using Textarea, TODO: Replace with Monaco
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Import Label
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast"; // Import useToast
// TODO: Import collaboration library
// import { connectCollaboration, setLocalAwarenessState, onAwarenessChange, type CollaborationSession } from '@/lib/collaboration';
// TODO: Import secrets library
// import { getSecret, setSecret, deleteSecret, listSecretKeys } from '@/lib/secrets';
// TODO: Import AI agent functions or coordinator client
// import { generateCodeFromPrompt, explainSelectedCode } from '@/ai/flows'; // Example Genkit flows
// import { requestAgentExecution } from '@/services/agent-coordinator-client'; // Hypothetical client

// --- Agent Response Type (Placeholder) ---
// This should match the structure returned by the Agent Coordinator
interface AgentExecutionResponse {
    success: boolean;
    result?: any;
    error?: string;
    agentUsed: string;
    // Add other relevant fields like usage metrics if needed
}


// --- Retro Window Component ---
const RetroWindow = ({ id: windowId, title, children, className, initialPosition = { top: '25%', left: '25%' }, style, onClose, onMinimize, isMinimized }: { id: string, title: string, children: React.ReactNode, className?: string, initialPosition?: { top: string, left: string }, style?: React.CSSProperties, onClose?: () => void, onMinimize?: () => void, isMinimized?: boolean }) => {
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
            data-window-id={windowId} // Add data attribute for potential targeting
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
                    <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default">📄 ai-service/...</li>
                    <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default">📄 agent-coordinator/...</li>
                    <li className="flex items-center gap-1 hover:bg-primary/10 cursor-default">📄 observability-service/...</li>
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
    // - Add AI inline suggestions (potentially via Monaco's API and AI Service)

    const [code, setCode] = React.useState(`'use client';
// TODO: Replace this Textarea with Monaco Editor
// TODO: Implement AI inline suggestions
// TODO: Implement token-based memory highlights

import React from 'react';

// Example React component
function MyButton({ label, onClick }) {
  /**
   * Renders a button with a label and click handler.
   * @param {string} label - The text to display on the button.
   * @param {function} onClick - The function to call when clicked.
   */
  // MEMORY_TOKEN: component:MyButton:signature
  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      onClick={onClick}
    >
      {label} {/* Display the label */}
    </button>
  );
}

export default MyButton; // MEMORY_TOKEN: export:MyButton

function calculateSum(a, b) {
    // This function calculates the sum of two numbers
    // MEMORY_TOKEN: function:calculateSum:body
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
    )
};


const TerminalAndLogs = () => (
    <Tabs defaultValue="terminal" className="flex flex-col h-full">
        {/* TODO: Make Terminal interactive, connect Logs to backend streams */}
        <TabsList className="retro-tabs-list shrink-0">
            <TabsTrigger value="terminal" className="retro-tab-trigger"><TerminalIcon size={14} className="mr-1" />Terminal</TabsTrigger>
            <TabsTrigger value="logs" className="retro-tab-trigger"><FileCode size={14} className="mr-1" />Logs</TabsTrigger>
            <TabsTrigger value="profiling" className="retro-tab-trigger"><Cpu size={14} className="mr-1" />Profiling</TabsTrigger>
            <TabsTrigger value="security" className="retro-tab-trigger"><ShieldCheck size={14} className="mr-1" />Security</TabsTrigger>
            <TabsTrigger value="dashboard" className="retro-tab-trigger"><BarChart3 size={14} className="mr-1" />Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="terminal" className="flex-grow overflow-hidden mt-0 rounded-none border-none">
            <Terminal />
        </TabsContent>
        <TabsContent value="logs" className="flex-grow overflow-hidden mt-0 rounded-none border-none">
            <Logs />
        </TabsContent>
        <TabsContent value="profiling" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-2 text-sm">
            {/* TODO: Implement AI Profiling Panel - Fetch data from Observability Service */}
            <p className="font-semibold flex items-center gap-1"><Cpu size={14} />AI Profiling Panel</p>
            <p className="text-muted-foreground text-xs mb-2">Performance metrics and bundle analysis. (Placeholder)</p>
            <div className="h-32 border border-border-dark my-1 flex items-center justify-center text-muted-foreground bg-white">Chart Area Placeholder (Frontend Bundle)</div>
            <div className="h-32 border border-border-dark my-1 flex items-center justify-center text-muted-foreground bg-white">Chart Area Placeholder (Backend Traces)</div>
            <Button className="retro-button mt-2" size="sm">Run Analysis</Button>
        </TabsContent>
        <TabsContent value="security" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-2 text-sm">
            {/* TODO: Implement SAST/Dependency Scanning - Call Agent Coordinator */}
            <p className="font-semibold flex items-center gap-1"><ShieldCheck size={14} />Security Scanner</p>
            <p className="text-muted-foreground text-xs mb-1">SAST and dependency scan results. (Placeholder)</p>
            <ScrollArea className="h-32 retro-scrollbar border border-border-dark p-1 my-1 bg-white"> {/* Added background */}
                <ul><li>[INFO] No critical vulnerabilities found.</li>
                    <li>[WARN] Dependency 'old-lib' v1.0 has known CVE-XXXX-YYYY.</li>
                    <li>[LOW] Potential XSS vector in `user-input.js`.</li>
                </ul>
            </ScrollArea>
            <Button className="retro-button mt-1" size="sm">Scan Now</Button>
            <Button className="retro-button mt-1 ml-1" size="sm" variant="secondary" title="Attempt automated fix and create Pull Request (Planned)">Auto-Fix PR</Button>
        </TabsContent>
        <TabsContent value="dashboard" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-2 text-sm">
            {/* TODO: Implement Telemetry Dashboard with Charts - Fetch data from Observability Service */}
            <p className="font-semibold flex items-center gap-1"><BarChart3 size={14} />Telemetry Dashboard</p>
            <p className="text-muted-foreground text-xs mb-2">Errors, Performance, AI Usage. (Placeholder)</p>
            <div className="h-20 border border-border-dark my-1 flex items-center justify-center text-muted-foreground bg-white">Errors Chart Placeholder</div>
            <div className="h-20 border border-border-dark my-1 flex items-center justify-center text-muted-foreground bg-white">Performance Chart Placeholder</div>
            <div className="h-20 border border-border-dark my-1 flex items-center justify-center text-muted-foreground bg-white">AI Usage Chart Placeholder</div>
        </TabsContent>
    </Tabs>
);

const Terminal = () => (
    // TODO: Implement interactive terminal using libraries like xterm.js and connect to backend shell (LanguageEnvService / Nix env)
    <div className="flex flex-col h-full bg-black text-[#00FF00] border-t-2 border-border-dark"> {/* Green text */}
        <ScrollArea className="flex-grow retro-scrollbar p-1 font-mono text-xs">
            <p>QuonxTerm v0.1 (Non-interactive)</p>
            <p>user@quonxcoder:/app$ ls -la</p>
            <p>total 32</p>
            <p>drwxr-xr-x 1 user user 4096 Jul 29 11:00 .</p>
            <p>drwxr-xr-x 1 user user 4096 Jul 29 10:55 ..</p>
            <p>drwxr-xr-x 1 user user 4096 Jul 29 10:58 services</p>
            <p>-rw-r--r-- 1 user user  150 Jul 29 10:00 index.html</p>
            <p>-rw-r--r-- 1 user user  210 Jul 29 09:58 style.css</p>
            <p>-rw-r--r-- 1 user user  350 Jul 29 09:59 script.js</p>
            <p>drwxr-xr-x 1 user user 4096 Jul 29 09:57 components</p>
            <p>-rw-r--r-- 1 user user 1234 Jul 29 11:01 package.json</p>
            <p>user@quonxcoder:/app$</p>
            <div className="h-4"></div> {/* Spacer */}
        </ScrollArea>
        <Input type="text" placeholder="> (Input disabled)" aria-label="Terminal Input" className="retro-input !bg-black !text-[#00FF00] font-mono text-xs !rounded-none !border-none !border-t-2 !border-t-[#555555] focus:!ring-0 h-6" disabled /> {/* Darker border */}
    </div>
);

const Logs = () => (
    // TODO: Connect to backend log streams (e.g., via WebSocket from Observability Service)
    <div className="flex flex-col h-full bg-card border-t-2 border-border-dark">
        <ScrollArea className="flex-grow retro-scrollbar p-1 font-mono text-xs bg-white"> {/* Added background */}
            <p>[INFO] Application started successfully.</p>
            <p>[DEBUG][AI Service] Connecting to Vector DB at {process.env.VECTOR_DB_URL || 'vector-db:6333'}</p>
            <p>[WARN][Agent Coordinator] Agent 'testGenAgent' took 3.5s to execute.</p>
            <p>[ERROR][Secrets Service] Failed to decrypt secret 'OLD_KEY'.</p>
            <p>[COLLAB] User 'Alice' connected.</p>
            <p>[SECRETS] Secret 'API_KEY' accessed by Agent Coordinator.</p>
            <p>[AI Service][RAG] Ingested document 'docs/new-feature.md'.</p>
        </ScrollArea>
    </div>
);


const AIChat = () => {
    const { toast } = useToast(); // Use the toast hook
    const [input, setInput] = React.useState('');
    const [messages, setMessages] = React.useState([
        { sender: 'QuonxAI', text: 'How can I help you code today? Ask me to generate, explain, refactor, or test code!' }
    ]);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [selectedModel, setSelectedModel] = React.useState('llama'); // Default to Ollama

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage = { sender: 'User', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsGenerating(true);

        try {
            let aiResponseText = "Sorry, I couldn't get a response.";

            // Determine which agent/flow to call based on input or maybe explicit commands
            // For simplicity, route most things through a generic chat handler now,
            // but ideally Coordinator would route based on intent.
            let agentToCall = 'chatAgent'; // Default, might need better routing
            let requestPayload: any = { prompt: currentInput, context: { chatHistory: messages } }; // Include history

            if (currentInput.toLowerCase().startsWith("generate code:")) {
                agentToCall = 'codeGenAgent';
                requestPayload = { prompt: currentInput.substring("generate code:".length).trim() };
            } else if (currentInput.toLowerCase().startsWith("explain:")) {
                // Need to get selected code from editor state
                const selectedCode = "// TODO: Get selected code";
                agentToCall = 'explainCodeAgent'; // Assuming an explain agent exists
                requestPayload = { code: selectedCode, prompt: `Explain this code: ${selectedCode}` };
                toast({ title: "Explain Code", description: "TODO: Get selected code from editor." });
                // Replace placeholder below
                aiResponseText = `(Placeholder) Explanation for: ${selectedCode}`;
                await new Promise(res => setTimeout(res, 500));
                setIsGenerating(false);
                setMessages(prev => [...prev, { sender: 'QuonxAI', text: aiResponseText }]);
                return; // Early return for placeholder
            }
            // Add more routing logic for refactor, test, etc.

            // --- Call Agent Coordinator ---
            // Use fetch or a dedicated client library to call the coordinator service
            console.log(`Calling Agent Coordinator for ${agentToCall} with payload:`, requestPayload);
            const coordinatorUrl = process.env.NEXT_PUBLIC_AGENT_COORDINATOR_URL || '/api/proxy/agents'; // Use proxy path

            try {
                const response = await fetch(`${coordinatorUrl}/${agentToCall}/execute`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestPayload)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                    throw new Error(`Agent execution failed: ${response.status} - ${errorData?.error || response.statusText}`);
                }

                const result: AgentExecutionResponse = await response.json(); // Use type from coordinator

                if (result.success) {
                    aiResponseText = typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2);
                } else {
                    aiResponseText = `Agent Error: ${result.error || 'Unknown error'}`;
                    toast({ title: "AI Agent Error", description: aiResponseText, variant: "destructive" });
                }
            } catch (fetchError: any) {
                console.error("Error calling Agent Coordinator:", fetchError);
                aiResponseText = `Error contacting AI services: ${fetchError.message}`;
                toast({ title: "Service Communication Error", description: aiResponseText, variant: "destructive" });
            }


            const aiMessage = { sender: 'QuonxAI', text: aiResponseText };
            setMessages(prev => [...prev, aiMessage]);
            // toast({ title: "AI Response Received", description: `QuonxAI (${selectedModel}) generated a response.` }); // Maybe too noisy

        } catch (error) { // Catch errors in the handleSend logic itself
            console.error("AI Chat Error:", error);
            const errorMessage = { sender: 'QuonxAI', text: 'Sorry, I encountered an internal error processing your request.' };
            setMessages(prev => [...prev, errorMessage]);
            toast({ title: "Chat Error", description: "Could not process AI request.", variant: "destructive" });
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

    // Model selection primarily affects which backend model the AI Service / Coordinator targets
    const handleModelChange = (modelId: string) => {
        setSelectedModel(modelId);
        toast({ title: "AI Target Model Changed", description: `AI Service will now target ${modelId} (if available).` });
        // Note: This doesn't directly change the model used unless the backend logic adapts.
        // For now, it's more of a UI indicator.
    };

    return (
        <div className="flex flex-col h-full p-1">
            <ScrollArea className="flex-grow mb-1 retro-scrollbar border border-border-dark p-1 text-sm bg-white">
                {messages.map((msg, index) => (
                    <p key={index} className="mb-1">
                        <span className={`font-bold ${msg.sender === 'QuonxAI' ? 'text-primary' : 'text-foreground'}`}>
                            {msg.sender === 'QuonxAI' ? <BrainCircuit size={14} className="inline mr-1" /> : null} {/* Updated Icon */}
                            {msg.sender}:
                        </span>{' '}
                        <span className="whitespace-pre-wrap">{msg.text}</span>
                    </p>
                ))}
                {isGenerating && (
                    <p className="text-muted-foreground animate-pulse">QuonxAI ({selectedModel}) is thinking...</p>
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
            <div className="text-xs text-muted-foreground mt-1">
                {/* Make model selection interactive (basic example) */}
                Target Model: {/* Clarified label */}
                <select
                    value={selectedModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="retro-input h-5 text-xs ml-1 bg-card border-border-dark"
                    disabled={isGenerating}
                >
                    <option value="llama">Llama (Ollama)</option>
                    <option value="gemini">Gemini (Genkit)</option>
                    <option value="claude">Claude (Not Impl.)</option>
                    <option value="gpt4o">GPT-4o (Not Impl.)</option>
                </select>
            </div>
        </div>
    )
};


const PluginManagerContent = () => (
    // TODO: Implement Plugin Marketplace interaction (fetch, install, update via backend service)
    <div className="p-2 text-sm flex flex-col h-full">
        <Input type="search" placeholder="Search installed plugins..." className="retro-input mb-2 h-7" aria-label="Search Plugins" />
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
                    <Button size="sm" className="retro-button !py-0 !px-1 float-right">Install</Button> {/* Should say Uninstall if installed */}
                    <p className="text-xs text-muted-foreground clear-both">One-click deploy to Firebase.</p>
                </li>
                {/* Add more placeholder plugins */}
                <li className="mb-1 p-1 border border-transparent hover:border-border-dark">
                    <span className="font-semibold">Retro Theme v1.0</span> <span className="text-xs text-muted-foreground">(Theme)</span>
                    <Button size="sm" variant="destructive" className="retro-button !py-0 !px-1 float-right">Uninstall</Button>
                    <p className="text-xs text-muted-foreground clear-both">The classic look.</p>
                </li>
                <li className="mb-1 p-1 border border-transparent hover:border-border-dark">
                    <span className="font-semibold">AI Security Scanner v0.9</span> <span className="text-xs text-muted-foreground">(Security)</span>
                    <Button size="sm" className="retro-button !py-0 !px-1 float-right">Install</Button>
                    <p className="text-xs text-muted-foreground clear-both">LLM-powered vulnerability detection.</p>
                </li>
            </ul>
        </ScrollArea>
        <div className="mt-2 pt-2 border-t border-border-dark">
            {/* Moved Marketplace/Install to main Plugins menu */}
            <h4 className="font-semibold mb-1">Loaded Plugins (Example)</h4>
            {/* This section might not be needed if list above shows installed */}
        </div>
    </div>
);

// --- Collaboration Components ---
const CollaborationPanel = () => {
    // TODO: Integrate with src/lib/collaboration.ts
    // - Connect to session on component mount
    // - Use awareness to display active users and cursors
    // - Implement chat functionality using Yjs shared types
    // - Integrate AI suggestions based on collaborative context (via Agent Coordinator)
    const { toast } = useToast();
    // const [session, setSession] = React.useState<CollaborationSession | null>(null);
    // const [onlineUsers, setOnlineUsers] = React.useState<Map<number, any>>(new Map());
    // const [chatMessages, setChatMessages] = React.useState<Y.Array<Record<string, string>> | null>(null); // Yjs Array for chat

    // React.useEffect(() => {
    //     // TODO: Get document ID from context or props
    //     const docId = 'shared-project-document'; // Example ID
    //     const currentSession = connectCollaboration(docId);
    //     setSession(currentSession);

    //     if (currentSession) {
    //         // Set initial awareness state
    //         setLocalAwarenessState(currentSession.awareness, { user: { name: 'CurrentUser', color: '#008080' } }); // Example state

    //         // Listen for awareness changes
    //         const awarenessHandler = () => setOnlineUsers(new Map(currentSession.awareness.getStates()));
    //         currentSession.awareness.on('change', awarenessHandler);

    //         // Setup Chat
    //         const yChat = currentSession.doc.getArray<Record<string, string>>('chat');
    //         setChatMessages(yChat);
    //         const chatObserver = () => { /* Update local React state from yChat.toArray() */ };
    //         yChat.observe(chatObserver);

    //         // Clean up on unmount
    //         return () => {
    //             currentSession.awareness.off('change', awarenessHandler);
    //             yChat.unobserve(chatObserver);
    //             currentSession.destroy();
    //         };
    //     }
    // }, []);

    // const sendChatMessage = (text: string) => {
    //    if (chatMessages && text.trim()) {
    //        chatMessages.push([{ user: 'CurrentUser', text: text, timestamp: new Date().toISOString() }]);
    //    }
    // }


    const handleShare = () => {
        // Placeholder: Generate share link or open sharing modal
        navigator.clipboard.writeText('https://quonxcoder.example.com/join/session-xyz')
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
    const handleAiSuggestion = () => {
        toast({ title: "AI Suggestion", description: "TODO: Trigger AI context-aware suggestion via Agent Coordinator." });
    }

    return (
        <div className="p-2 text-sm flex flex-col items-center gap-2 border-l border-border-dark bg-card h-full">
            <h3 className="font-semibold mb-2 flex items-center gap-1"><Users size={16} />Collaboration</h3>
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
                <Share2 size={14} className="mr-1" /> Share Session
            </Button>
            <Button size="sm" className="retro-button w-full" onClick={handleJoin}>
                Join Session
            </Button>
            <Button size="sm" className="retro-button w-full mt-1" onClick={handleAiSuggestion}>
                <Sparkles size={14} className="mr-1" /> AI Suggestion (Planned)
            </Button>
            {/* TODO: Implement Live Chat */}
            <div className="flex-grow w-full mt-2 flex flex-col">
                <h4 className="text-xs font-semibold mb-1 flex items-center gap-1"><MessageSquare size={12} />Live Chat</h4>
                <ScrollArea className="h-20 flex-grow retro-scrollbar border border-border-dark p-1 bg-white text-xs mb-1">
                    <p><span className="font-bold text-blue-600">Alice:</span> Hey!</p>
                    <p><span className="font-bold text-green-600">Bob:</span> Hi there! Working on the button component?</p>
                    {/* TODO: Render from chatMessages Y.Array */}
                </ScrollArea>
                <Input type="text" placeholder="Chat..." className="retro-input h-6 text-xs" />
            </div>
            {/* TODO: Implement Voice/Video controls */}
            <div className="mt-auto w-full flex justify-around pt-2 border-t border-border-dark">
                <Button variant="ghost" size="icon" className="retro-button !border-none !shadow-none" aria-label="Toggle Microphone" title="Toggle Microphone (Planned)">
                    <Mic size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="retro-button !border-none !shadow-none" aria-label="Toggle Video" title="Toggle Video (Planned)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
                </Button>
            </div>
        </div>
    )
};


// --- Main Page Component ---
export default function Home() {
    const { toast } = useToast();
    // Consolidate window visibility and state into a single object
    type WindowState = {
        isVisible: boolean;
        isMinimized: boolean;
        zIndex: number;
        id: string; // Ensure id is part of the state
    };
    const [windowStates, setWindowStates] = React.useState<Record<string, WindowState>>({
        pluginManager: { id: 'pluginManager', isVisible: false, isMinimized: false, zIndex: 10 },
        openFile: { id: 'openFile', isVisible: false, isMinimized: false, zIndex: 10 },
        openFolder: { id: 'openFolder', isVisible: false, isMinimized: false, zIndex: 10 },
        saveAs: { id: 'saveAs', isVisible: false, isMinimized: false, zIndex: 10 },
        manageSecrets: { id: 'manageSecrets', isVisible: false, isMinimized: false, zIndex: 10 },
        configureVault: { id: 'configureVault', isVisible: false, isMinimized: false, zIndex: 10 },
        projectVars: { id: 'projectVars', isVisible: false, isMinimized: false, zIndex: 10 },
        accountVars: { id: 'accountVars', isVisible: false, isMinimized: false, zIndex: 10 },
        findReplace: { id: 'findReplace', isVisible: false, isMinimized: false, zIndex: 10 },
        commandPalette: { id: 'commandPalette', isVisible: false, isMinimized: false, zIndex: 10 },
        marketplace: { id: 'marketplace', isVisible: false, isMinimized: false, zIndex: 10 },
        installVsix: { id: 'installVsix', isVisible: false, isMinimized: false, zIndex: 10 },
        manageWorkflows: { id: 'manageWorkflows', isVisible: false, isMinimized: false, zIndex: 10 },
        generateCode: { id: 'generateCode', isVisible: false, isMinimized: false, zIndex: 10 },
        explainCode: { id: 'explainCode', isVisible: false, isMinimized: false, zIndex: 10 }, // Added Explain Code Window
        refactorCode: { id: 'refactorCode', isVisible: false, isMinimized: false, zIndex: 10 },
        generateTests: { id: 'generateTests', isVisible: false, isMinimized: false, zIndex: 10 },
        generateDocs: { id: 'generateDocs', isVisible: false, isMinimized: false, zIndex: 10 },
        fixBug: { id: 'fixBug', isVisible: false, isMinimized: false, zIndex: 10 },
        scaffoldAgent: { id: 'scaffoldAgent', isVisible: false, isMinimized: false, zIndex: 10 },
        queryKnowledge: { id: 'queryKnowledge', isVisible: false, isMinimized: false, zIndex: 10 },
        ingestKnowledge: { id: 'ingestKnowledge', isVisible: false, isMinimized: false, zIndex: 10 },
        manageKnowledge: { id: 'manageKnowledge', isVisible: false, isMinimized: false, zIndex: 10 },
        configureOllama: { id: 'configureOllama', isVisible: false, isMinimized: false, zIndex: 10 },
        fineTuneModel: { id: 'fineTuneModel', isVisible: false, isMinimized: false, zIndex: 10 },
        configureVoiceGesture: { id: 'configureVoiceGesture', isVisible: false, isMinimized: false, zIndex: 10 },
        profiling: { id: 'profiling', isVisible: false, isMinimized: false, zIndex: 10 },
        security: { id: 'security', isVisible: false, isMinimized: false, zIndex: 10 },
        telemetry: { id: 'telemetry', isVisible: false, isMinimized: false, zIndex: 10 },
        debugger: { id: 'debugger', isVisible: false, isMinimized: false, zIndex: 10 },
        git: { id: 'git', isVisible: false, isMinimized: false, zIndex: 10 }, // Combined Git window
        devops: { id: 'devops', isVisible: false, isMinimized: false, zIndex: 10 }, // Combined DevOps window
        languageEnv: { id: 'languageEnv', isVisible: false, isMinimized: false, zIndex: 10 },
        settings: { id: 'settings', isVisible: false, isMinimized: false, zIndex: 10 },
        welcome: { id: 'welcome', isVisible: false, isMinimized: false, zIndex: 10 }, // Don't show by default
        about: { id: 'about', isVisible: false, isMinimized: false, zIndex: 10 },
        // Add other potential window IDs here
    });

    const nextZIndex = React.useRef(10); // Starting z-index for floating windows

    // Function to get the next available z-index
    const getNextZIndex = () => {
        nextZIndex.current += 1;
        return nextZIndex.current;
    };

    // Function to toggle window visibility and bring to front
    const toggleWindowVisibility = (id: string) => {
        setWindowStates(prev => {
            const currentState = prev[id];
            if (!currentState) return prev; // Should not happen if ID is valid

            const newState: WindowState = {
                ...currentState,
                isVisible: !currentState.isVisible,
                isMinimized: !currentState.isVisible ? false : currentState.isMinimized, // Unminimize if making visible
                zIndex: !currentState.isVisible ? getNextZIndex() : currentState.zIndex, // Bring to front if making visible
            };

            return { ...prev, [id]: newState };
        });
    };

    // Function to minimize a window
    const minimizeWindow = (id: string) => {
        setWindowStates(prev => {
            const currentState = prev[id];
            if (!currentState || !currentState.isVisible) return prev; // Only minimize visible windows

            return { ...prev, [id]: { ...currentState, isVisible: false, isMinimized: true } };
        });
    };

    // Function to restore a minimized window
    const restoreWindow = (id: string) => {
        setWindowStates(prev => {
            const currentState = prev[id];
            if (!currentState || !currentState.isMinimized) return prev; // Only restore minimized windows

            return {
                ...prev,
                [id]: {
                    ...currentState,
                    isVisible: true,
                    isMinimized: false,
                    zIndex: getNextZIndex() // Bring to front
                }
            };
        });
    };

    // Get a display name for minimized tabs (improve this mapping)
    const getWindowName = (id: string): string => {
        switch (id) {
            case 'pluginManager': return 'Plugins';
            case 'findReplace': return 'Find/Replace';
            case 'manageSecrets': return 'Secrets';
            case 'projectVars': return 'Env Vars (Project)';
            case 'accountVars': return 'Env Vars (Account)';
            case 'git': return 'Git Control';
            case 'devops': return 'DevOps Panel';
            case 'languageEnv': return 'Language Env';
            case 'openFile': return 'Open File';
            case 'openFolder': return 'Open Folder';
            case 'saveAs': return 'Save As';
            case 'configureVault': return 'Vault Config';
            case 'commandPalette': return 'Command Palette';
            case 'marketplace': return 'Marketplace';
            case 'installVsix': return 'Install VSIX';
            case 'manageWorkflows': return 'Workflows';
            case 'generateCode': return 'AI: Generate Code';
            case 'explainCode': return 'AI: Explain Code';
            case 'refactorCode': return 'AI: Refactor Code';
            case 'generateTests': return 'AI: Generate Tests';
            case 'generateDocs': return 'AI: Generate Docs';
            case 'fixBug': return 'AI: Fix Bug';
            case 'scaffoldAgent': return 'AI: Scaffold Agent';
            case 'queryKnowledge': return 'AI: Query Knowledge';
            case 'ingestKnowledge': return 'AI: Ingest Knowledge';
            case 'manageKnowledge': return 'AI: Manage Knowledge';
            case 'configureOllama': return 'Ollama Config';
            case 'fineTuneModel': return 'AI: Fine-tune Model';
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
    const handleExplainCode = () => {
        // TODO: Get selected code from editor before opening window or pass to agent
        toggleWindowVisibility('explainCode');
        toast({ title: "Action: Explain Code", description: "TODO: Get selected code and call AI flow." });
    };
    const handleGenericAction = (title: string, idToToggle?: string) => {
        toast({ title: `Action: ${title}`, description: "TODO: Implement this feature." });
        if (idToToggle) {
            toggleWindowVisibility(idToToggle); // Use toggle which handles closing too
        }
    };
    const handleAgentAction = async (title: string, idToToggle: string, agentName: string, payload: any = {}) => {
        // Placeholder for triggering agent actions via Coordinator
        toast({ title: title, description: `Calling Agent Coordinator for '${agentName}'...` });
        toggleWindowVisibility(idToToggle); // Close the prompt window

        // Example call:
        const coordinatorUrl = process.env.NEXT_PUBLIC_AGENT_COORDINATOR_URL || '/api/proxy/agents';
        try {
             const response = await fetch(`${coordinatorUrl}/${agentName}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
             });
             if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(`Agent ${agentName} failed: ${response.status} - ${errorData.error || response.statusText}`);
             }
             const result: AgentExecutionResponse = await response.json();
             if (result.success) {
                 toast({ title: `${title} Succeeded`, description: `Agent ${agentName} completed. Result: ${JSON.stringify(result.result).substring(0, 100)}...` });
                 // TODO: Handle the result (e.g., insert code into editor, display explanation)
             } else {
                 toast({ title: `${title} Failed`, description: `Agent ${agentName} error: ${result.error}`, variant: "destructive" });
             }
         } catch (error: any) {
             console.error(`Error calling agent ${agentName}:`, error);
             toast({ title: "Agent Call Error", description: error.message, variant: "destructive" });
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
        // This is just a browser find, Monaco integration needed
        // window.find(prompt("Find text:") || "");
        toast({ title: "Find", description: "TODO: Implement editor find." });
    };
    const handleReplace = () => {
        // Requires editor integration - this is just a placeholder concept
        toast({ title: "Replace", description: `TODO: Implement editor replace.` });
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
                onExplainCode={handleExplainCode} // Use specific handler
                onGenerateCode={() => toggleWindowVisibility('generateCode')}
                onRefactorCode={() => toggleWindowVisibility('refactorCode')} // Toggle window
                onGenerateTests={() => toggleWindowVisibility('generateTests')} // Toggle window
                onGenerateDocs={() => toggleWindowVisibility('generateDocs')} // Toggle window
                onFixBug={() => toggleWindowVisibility('fixBug')} // Toggle window
                onScaffoldAgent={() => toggleWindowVisibility('scaffoldAgent')} // Toggle window
                onQueryKnowledge={() => toggleWindowVisibility('queryKnowledge')} // Toggle window
                onIngestKnowledge={() => toggleWindowVisibility('ingestKnowledge')} // Toggle window
                onManageKnowledge={() => toggleWindowVisibility('manageKnowledge')} // Toggle window
                onConfigureOllama={() => toggleWindowVisibility('configureOllama')}
                onFineTuneModel={() => toggleWindowVisibility('fineTuneModel')} // Toggle window
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
                onGenerateIaC={() => toggleWindowVisibility('devops')} // Show DevOps window (focus IaC)
                onStartDockerEnv={() => toggleWindowVisibility('devops')} // Show DevOps window
                onDeployK8s={() => toggleWindowVisibility('devops')} // Show DevOps window
                onManageDeployments={() => toggleWindowVisibility('devops')} // Show DevOps window
                onConfigureHosting={() => toggleWindowVisibility('devops')} // Show DevOps window
                onShowLanguageEnv={() => toggleWindowVisibility('languageEnv')}
                onShowSettings={() => toggleWindowVisibility('settings')}
                onShowWelcome={() => toggleWindowVisibility('welcome')}
                onShowDocs={() => handleGenericAction('Open Documentation')} // Likely opens external URL
                onShowApiDocs={() => handleGenericAction('Open Plugin API Docs')} // Likely opens external URL
                onShowVoiceGestureCommands={() => toggleWindowVisibility('configureVoiceGesture')} // Open config window
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
                {/* Filtering out non-visible states before mapping */}
                {Object.values(windowStates)
                    .filter(state => state.isVisible || state.isMinimized) // Render if visible OR minimized (to handle minimize animation/logic if needed)
                    .map((state) => {
                        // Define props common to all windows
                        const windowProps = {
                            id: state.id, // Pass the id here
                            title: getWindowName(state.id),
                            onClose: () => toggleWindowVisibility(state.id), // Simple toggle handles closing
                            onMinimize: () => minimizeWindow(state.id),
                            style: { zIndex: state.zIndex || 10 }, // Use stored z-index
                            isMinimized: state.isMinimized // Pass minimized state
                        };

                        // Add more complex windows here
                        switch (state.id) {
                            case 'pluginManager':
                                return <RetroWindow key={state.id} {...windowProps} className="w-80 h-96" initialPosition={{ top: '20%', left: '30%' }}><PluginManagerContent /></RetroWindow>;
                            case 'openFile':
                                return <RetroWindow key={state.id} {...windowProps} className="w-96 h-auto" initialPosition={{ top: '30%', left: '35%' }}>
                                    <div className="p-4 flex flex-col gap-2">
                                        <p className="text-sm">Select a file to open:</p>
                                        <Input type="file" className="retro-input text-xs h-8" />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button className="retro-button" size="sm" onClick={windowProps.onClose}>Cancel</Button>
                                            <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Open Selected File", state.id)}>Open</Button>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'openFolder':
                                return <RetroWindow key={state.id} {...windowProps} className="w-96 h-auto" initialPosition={{ top: '35%', left: '40%' }}>
                                    <div className="p-4 flex flex-col gap-2">
                                        <p className="text-sm">Select a folder to open:</p>
                                        {/* Input type=file with webkitdirectory is non-standard but common */}
                                        <Input type="file" webkitdirectory="" directory="" className="retro-input h-7 text-xs" />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button className="retro-button" size="sm" onClick={windowProps.onClose}>Cancel</Button>
                                            <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Open Selected Folder", state.id)}>Open Folder</Button>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'saveAs':
                                return <RetroWindow key={state.id} {...windowProps} className="w-96 h-auto" initialPosition={{ top: '40%', left: '45%' }}>
                                    <div className="p-4 flex flex-col gap-2">
                                        <Label htmlFor="save-as-input" className="text-sm">Save As:</Label>
                                        <Input id="save-as-input" type="text" defaultValue="untitled.js" className="retro-input h-7 text-xs" />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button className="retro-button" size="sm" onClick={windowProps.onClose}>Cancel</Button>
                                            <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Save File As", state.id)}>Save</Button>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'manageSecrets':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[400px] h-[300px]" initialPosition={{ top: '15%', left: '50%' }}>
                                    <div className="w-full h-full bg-card p-2 text-sm">
                                        <p className="mb-1 font-semibold flex items-center gap-1"><FileKey size={14} />Project Secrets</p>
                                        <ScrollArea className="h-32 retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                            <ul>
                                                {/* TODO: Fetch secrets via src/lib/secrets.ts */}
                                                <li className="flex justify-between items-center hover:bg-primary/10 px-1"><span>API_KEY</span> <span className="text-muted-foreground">********</span></li>
                                                <li className="flex justify-between items-center hover:bg-primary/10 px-1"><span>DATABASE_URL</span> <span className="text-muted-foreground">********</span></li>
                                                <li className="flex justify-between items-center hover:bg-primary/10 px-1"><span>JWT_SECRET</span> <span className="text-muted-foreground">********</span></li>
                                            </ul>
                                        </ScrollArea>
                                        <div className="flex gap-2 mt-2">
                                            <Input placeholder="Secret Key" className="retro-input h-7 text-xs flex-grow" />
                                            <Input type="password" placeholder="Secret Value" className="retro-input h-7 text-xs flex-grow" />
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Add/Update Secret")}>Add/Update</Button>
                                            <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleGenericAction("Delete Selected Secret")}>Delete Selected</Button>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'configureVault':
                                return <RetroWindow key={state.id} {...windowProps} className="w-80 h-auto" initialPosition={{ top: '20%', left: '55%' }}>
                                    <div className="p-4 flex flex-col gap-2">
                                        <p className="text-sm font-semibold mb-2 flex items-center gap-1"><DatabaseZap size={14} />Configure Secrets Vault</p>
                                        {/* Add Vault config options */}
                                        <Label htmlFor="vault-type" className="text-xs">Vault Type:</Label>
                                        <select id="vault-type" className="retro-input h-7 text-xs">
                                            <option value="local-aes">Local AES (Default)</option>
                                            <option value="hashicorp" disabled>HashiCorp Vault (Planned)</option>
                                            <option value="cloud-kms" disabled>Cloud KMS (Planned)</option>
                                        </select>
                                        <Label htmlFor="vault-key" className="text-xs mt-2">Encryption Key (Local):</Label>
                                        <Input id="vault-key" type="password" placeholder="Loaded from env" className="retro-input h-7 text-xs" disabled />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button className="retro-button" size="sm" onClick={windowProps.onClose}>Cancel</Button>
                                            <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Save Vault Config", state.id)}>Save</Button>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'projectVars':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[450px] h-[350px]" initialPosition={{ top: '25%', left: '30%' }}>
                                    <div className="w-full h-full bg-card p-2 text-sm">
                                        <p className="mb-1 font-semibold flex items-center gap-1"><Database size={14} />Project Environment Variables</p>
                                        <ScrollArea className="h-48 retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                            {/* TODO: Fetch/manage project env vars */}
                                            <ul>
                                                <li className="flex justify-between items-center hover:bg-primary/10 px-1"><span>NODE_ENV</span> <span className="text-muted-foreground">development</span></li>
                                                <li className="flex justify-between items-center hover:bg-primary/10 px-1"><span>API_BASE_URL</span> <span className="text-muted-foreground">/api</span></li>
                                                <li className="flex justify-between items-center hover:bg-primary/10 px-1"><span>ENABLE_FEATURE_X</span> <span className="text-muted-foreground">true</span></li>
                                            </ul>
                                        </ScrollArea>
                                        <div className="flex gap-2 mt-2">
                                            <Input placeholder="Variable Name" className="retro-input h-7 text-xs flex-grow" />
                                            <Input placeholder="Variable Value" className="retro-input h-7 text-xs flex-grow" />
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Add/Update Project Var")}>Add/Update</Button>
                                            <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleGenericAction("Delete Selected Project Var")}>Delete Selected</Button>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'accountVars':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[450px] h-[350px]" initialPosition={{ top: '30%', left: '35%' }}>
                                    <div className="w-full h-full bg-card p-2 text-sm">
                                        <p className="mb-1 font-semibold flex items-center gap-1"><Globe size={14} />Account Environment Variables</p>
                                        <p className="text-xs text-muted-foreground mb-2">These apply across all your projects.</p>
                                        <ScrollArea className="h-48 retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                            {/* TODO: Fetch/manage account env vars */}
                                            <ul>
                                                <li className="flex justify-between items-center hover:bg-primary/10 px-1"><span>GITHUB_TOKEN</span> <span className="text-muted-foreground">********</span></li>
                                                <li className="flex justify-between items-center hover:bg-primary/10 px-1"><span>AWS_ACCESS_KEY_ID</span> <span className="text-muted-foreground">********</span></li>
                                            </ul>
                                        </ScrollArea>
                                        <div className="flex gap-2 mt-2">
                                            <Input placeholder="Variable Name" className="retro-input h-7 text-xs flex-grow" />
                                            <Input placeholder="Variable Value" className="retro-input h-7 text-xs flex-grow" />
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Add/Update Account Var")}>Add/Update</Button>
                                            <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleGenericAction("Delete Selected Account Var")}>Delete Selected</Button>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'findReplace':
                                return <RetroWindow key={state.id} {...windowProps} className="w-80 h-auto" initialPosition={{ top: '10%', left: '60%' }}>
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
                                            {/* TODO: Connect these buttons to Monaco Editor actions */}
                                            <Button className="retro-button !px-2 !py-0.5" size="sm" onClick={handleFind}>Next</Button>
                                            <Button className="retro-button !px-2 !py-0.5" size="sm" onClick={handleReplace}>Replace</Button>
                                            <Button className="retro-button !px-2 !py-0.5" size="sm" onClick={handleReplace}>All</Button>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'commandPalette':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[500px] h-auto" initialPosition={{ top: '10%', left: '30%' }}>
                                    <div className="p-1">
                                        <Input placeholder="Enter command..." className="retro-input h-7 w-full mb-1" autoFocus />
                                        <ScrollArea className="h-48 retro-scrollbar border border-border-dark bg-white text-sm">
                                            {/* TODO: Dynamically populate commands */}
                                            <ul>
                                                <li className="p-1 hover:bg-primary/10 cursor-pointer" onClick={() => handleGenericAction("File: Save", state.id)}><Save size={14} className="inline mr-1" />File: Save</li>
                                                <li className="p-1 hover:bg-primary/10 cursor-pointer" onClick={() => { toggleWindowVisibility('git'); toggleWindowVisibility(state.id); }}><GitCommit size={14} className="inline mr-1" />Git: Commit</li>
                                                <li className="p-1 hover:bg-primary/10 cursor-pointer" onClick={() => { handleExplainCode(); toggleWindowVisibility(state.id); }}><Lightbulb size={14} className="inline mr-1" />AI: Explain Selected Code</li>
                                                <li className="p-1 hover:bg-primary/10 cursor-pointer" onClick={() => { toggleWindowVisibility('refactorCode'); toggleWindowVisibility(state.id); }}><Recycle size={14} className="inline mr-1" />AI: Refactor Selected Code</li>
                                                <li className="p-1 hover:bg-primary/10 cursor-pointer" onClick={() => { toggleWindowVisibility('generateTests'); toggleWindowVisibility(state.id); }}><TestTubeDiagonal size={14} className="inline mr-1" />AI: Generate Tests</li>
                                                <li className="p-1 hover:bg-primary/10 cursor-pointer" onClick={() => { toggleWindowVisibility('fixBug'); toggleWindowVisibility(state.id); }}><Wrench size={14} className="inline mr-1" />AI: Fix Bug in Selection</li>
                                                <li className="p-1 hover:bg-primary/10 cursor-pointer" onClick={() => { toggleWindowVisibility('settings'); toggleWindowVisibility(state.id); }}><Settings size={14} className="inline mr-1" />Preferences: Open Settings</li>
                                                {/* Add more commands dynamically */}
                                            </ul>
                                        </ScrollArea>
                                    </div>
                                </RetroWindow>;
                            case 'marketplace':
                                return <RetroWindow key={state.id} {...windowProps} title="Plugin Marketplace" className="w-[600px] h-[450px]" initialPosition={{ top: '15%', left: '25%' }}>
                                    <div className="p-2 text-sm flex flex-col h-full">
                                        <Input type="search" placeholder="Search marketplace..." className="retro-input mb-2 h-7" aria-label="Search Plugins" />
                                        <ScrollArea className="flex-grow retro-scrollbar border border-border-dark p-1 bg-white">
                                            {/* TODO: Fetch plugins from marketplace backend */}
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
                                                <li className="mb-1 p-1 border border-transparent hover:border-border-dark">
                                                    <span className="font-semibold">Nix Env Manager v0.5</span> <span className="text-xs text-muted-foreground">(Environment)</span> By NixFans
                                                    <Button size="sm" className="retro-button !py-0 !px-1 float-right" onClick={() => handleGenericAction("Install Plugin Nix Env")}>Install</Button>
                                                    <p className="text-xs text-muted-foreground clear-both mt-0.5">Manage Nix environments easily.</p>
                                                </li>
                                            </ul>
                                        </ScrollArea>
                                        <div className="flex justify-between items-center mt-2 text-xs">
                                            <Button size="sm" className="retro-button" onClick={() => toggleWindowVisibility('installVsix')}>Install from VSIX...</Button>
                                            <span className="text-muted-foreground">Showing 3 of 150 plugins (Placeholder)</span>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'installVsix':
                                return <RetroWindow key={state.id} {...windowProps} className="w-96 h-auto" initialPosition={{ top: '45%', left: '50%' }}>
                                    <div className="p-4 flex flex-col gap-2">
                                        <p className="text-sm">Select a .vsix or .qcx (QuonxCoder Extension) file to install:</p>
                                        <Input type="file" accept=".vsix,.qcx" className="retro-input text-xs h-8" />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button className="retro-button" size="sm" onClick={windowProps.onClose}>Cancel</Button>
                                            <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Install Selected VSIX/QCX", state.id)}>Install</Button>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'manageWorkflows':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[500px] h-[400px]" initialPosition={{ top: '20%', left: '45%' }}>
                                    <div className="w-full h-full bg-card p-2 text-sm">
                                        <p className="mb-1 font-semibold flex items-center gap-1"><Route size={14} />Manage YAML Workflows</p>
                                        <ScrollArea className="h-64 retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                            {/* TODO: List workflows from project */}
                                            <ul>
                                                <li className="p-1 hover:bg-primary/10 flex justify-between items-center"><span>📄 build.yml (On Push: main)</span> <Button size="sm" className="retro-button !p-0.5 !h-5 !w-5" title="Edit"><Settings size={12} /></Button></li>
                                                <li className="p-1 hover:bg-primary/10 flex justify-between items-center"><span>📄 test-unit.yml (Manual)</span><Button size="sm" className="retro-button !p-0.5 !h-5 !w-5" title="Edit"><Settings size={12} /></Button></li>
                                                <li className="p-1 hover:bg-primary/10 flex justify-between items-center"><span>📄 deploy-staging.yml (Manual)</span> <Button size="sm" className="retro-button !p-0.5 !h-5 !w-5" title="Edit"><Settings size={12} /></Button></li>
                                            </ul>
                                        </ScrollArea>
                                        <div className="flex justify-between mt-2">
                                            <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Create New Workflow")}>Create New</Button>
                                            <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleGenericAction("Delete Selected Workflow")}>Delete Selected</Button>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'generateCode':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[400px] h-auto" initialPosition={{ top: '25%', left: '50%' }}>
                                    <div className="p-2 flex flex-col gap-2">
                                        <Label htmlFor="gen-code-prompt" className="flex items-center gap-1"><Sparkles size={14} />Generate Code Prompt:</Label>
                                        <Textarea id="gen-code-prompt" placeholder="e.g., Create a React component for a retro modal dialog using shadcn/ui" className="retro-input h-24 text-xs" />
                                        <Button className="retro-button self-end" size="sm" onClick={() => handleAgentAction("Generate Code", state.id, 'codeGenAgent', { prompt: (document.getElementById('gen-code-prompt') as HTMLTextAreaElement)?.value })}>Generate</Button>
                                    </div>
                                </RetroWindow>;
                            case 'explainCode': // Specific window for Explain Code
                                return <RetroWindow key={state.id} {...windowProps} className="w-[450px] h-auto" initialPosition={{ top: '28%', left: '52%' }}>
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><Lightbulb size={14} />Explain Selected Code</p>
                                        <p className="text-xs text-muted-foreground">AI will explain the code currently selected in the editor.</p>
                                        <ScrollArea className="h-32 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                            {/* TODO: Display selected code here */}
                                            <pre><code>// Selected code will appear here...</code></pre>
                                        </ScrollArea>
                                        <Button className="retro-button self-end" size="sm" onClick={() => handleAgentAction("Explain Code", state.id, 'explainCodeAgent', { code: "// TODO: Get selected code" })}>Explain</Button>
                                    </div>
                                </RetroWindow>;
                            case 'refactorCode':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[450px] h-auto" initialPosition={{ top: '30%', left: '50%' }}>
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><Recycle size={14} />Refactor Selected Code</p>
                                        <p className="text-xs text-muted-foreground">AI will attempt to refactor the code currently selected in the editor.</p>
                                        <ScrollArea className="h-24 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                            {/* TODO: Display selected code here */}
                                            <pre><code>// Selected code for refactoring...</code></pre>
                                        </ScrollArea>
                                        <Label htmlFor="refactor-instructions" className="text-xs mt-1">Instructions (Optional):</Label>
                                        <Textarea id="refactor-instructions" placeholder="e.g., Improve readability, make it more performant, convert to functional component" className="retro-input h-20 text-xs" />
                                        <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleAgentAction("Refactor Code", state.id, 'refactorAgent', { code: "// TODO: Get selected code", instructions: (document.getElementById('refactor-instructions') as HTMLTextAreaElement)?.value })}>Refactor</Button>
                                    </div>
                                </RetroWindow>;
                            case 'generateTests':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[400px] h-auto" initialPosition={{ top: '35%', left: '50%' }}>
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><TestTubeDiagonal size={14} />Generate Unit Tests</p>
                                        <p className="text-xs text-muted-foreground">Select the scope for test generation based on the current file or selection.</p>
                                        <ScrollArea className="h-20 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                            {/* TODO: Display selected code/file context here */}
                                            <pre><code>// Code to generate tests for...</code></pre>
                                        </ScrollArea>
                                        <Label htmlFor="test-framework" className="text-xs mt-1">Test Framework:</Label>
                                        <select id="test-framework" className="retro-input h-7 text-xs">
                                            <option value="jest">Jest</option>
                                            <option value="vitest">Vitest</option>
                                            <option value="mocha">Mocha</option>
                                            <option value="pytest">Pytest (Python)</option>
                                        </select>
                                        <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleAgentAction("Generate Tests", state.id, 'testGenAgent', { code: "// TODO: Get context", framework: (document.getElementById('test-framework') as HTMLSelectElement)?.value })}>Generate</Button>
                                    </div>
                                </RetroWindow>;
                            case 'generateDocs':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[400px] h-auto" initialPosition={{ top: '40%', left: '50%' }}>
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><BookOpen size={14} />Generate Documentation</p>
                                        <p className="text-xs text-muted-foreground">Generate docstrings or comments for the selected code or current file.</p>
                                        <ScrollArea className="h-24 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                            {/* TODO: Display selected code/file context here */}
                                            <pre><code>// Code to generate docs for...</code></pre>
                                        </ScrollArea>
                                        <Label htmlFor="doc-format" className="text-xs mt-1">Format:</Label>
                                        <select id="doc-format" className="retro-input h-7 text-xs">
                                            <option value="jsdoc">JSDoc</option>
                                            <option value="tsdoc">TSDoc</option>
                                            <option value="google">Google Style (Python)</option>
                                            <option value="numpy">NumPy Style (Python)</option>
                                            <option value="xmldoc">XML Doc (.NET)</option>
                                        </select>
                                        <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleAgentAction("Generate Docs", state.id, 'docGenAgent', { code: "// TODO: Get context", format: (document.getElementById('doc-format') as HTMLSelectElement)?.value })}>Generate</Button>
                                    </div>
                                </RetroWindow>;
                            case 'fixBug':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[450px] h-auto" initialPosition={{ top: '45%', left: '50%' }}>
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><Wrench size={14} />Fix Bug with AI</p>
                                        <p className="text-xs text-muted-foreground">Describe the bug, and AI will try to fix it in the selected code.</p>
                                        <ScrollArea className="h-20 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                            {/* TODO: Display selected code context here */}
                                            <pre><code>// Code containing the bug...</code></pre>
                                        </ScrollArea>
                                        <Label htmlFor="bug-description" className="text-xs mt-1">Bug Description:</Label>
                                        <Textarea id="bug-description" placeholder="e.g., Component not rendering correctly when prop 'X' is true. API call fails with 403 error." className="retro-input h-20 text-xs" />
                                        <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleAgentAction("Fix Bug", state.id, 'fixBugAgent', { code: "// TODO: Get selected code", description: (document.getElementById('bug-description') as HTMLTextAreaElement)?.value })}>Attempt Fix</Button>
                                    </div>
                                </RetroWindow>;
                            case 'scaffoldAgent':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[500px] h-auto" initialPosition={{ top: '50%', left: '50%' }}>
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><BrainCircuit size={14} />Scaffold AI Agent Application</p>
                                        <p className="text-xs text-muted-foreground">Describe the application or feature you want to build.</p>
                                        <Label htmlFor="scaffold-description" className="text-xs">Description:</Label>
                                        <Textarea id="scaffold-description" placeholder="e.g., A simple Express.js API for managing tasks with CRUD operations and user authentication." className="retro-input h-24 text-xs" />
                                        {/* Add options for language, framework, features */}
                                        <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleAgentAction("Scaffold Application", state.id, 'scaffoldAgent', { description: (document.getElementById('scaffold-description') as HTMLTextAreaElement)?.value })}>Scaffold</Button>
                                    </div>
                                </RetroWindow>;
                            case 'queryKnowledge':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[450px] h-auto" initialPosition={{ top: '55%', left: '50%' }}>
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><FileQuestion size={14} />Query Knowledge Base (RAG)</p>
                                        <p className="text-xs text-muted-foreground">Ask questions about the ingested knowledge.</p>
                                        <Label htmlFor="query-input" className="text-xs">Query:</Label>
                                        <Input id="query-input" placeholder="e.g., What is the coding standard for error handling?" className="retro-input h-7 text-xs" />
                                        {/* Add option to select collection */}
                                        <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleAgentAction("Query Knowledge", state.id, 'ragAgent', { prompt: (document.getElementById('query-input') as HTMLInputElement)?.value })}>Query</Button>
                                    </div>
                                </RetroWindow>;
                            case 'ingestKnowledge':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[500px] h-auto" initialPosition={{ top: '60%', left: '50%' }}>
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><FileInput size={14} />Ingest Knowledge into AI (RAG)</p>
                                        <p className="text-xs text-muted-foreground">Add documents or text to the long-term memory.</p>
                                        <Label htmlFor="knowledge-text" className="text-xs">Text Content:</Label>
                                        <Textarea id="knowledge-text" placeholder="Paste text or provide URL/File below" className="retro-input h-20 text-xs" />
                                        <Label htmlFor="knowledge-source" className="text-xs mt-1">Source URL or File:</Label>
                                        <Input id="knowledge-source" type="text" placeholder="URL or select file..." className="retro-input h-7 text-xs" />
                                        <Input type="file" className="retro-input text-xs h-8 mt-1" />
                                        {/* Add option to select target collection */}
                                        <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleAgentAction("Ingest Knowledge", state.id, 'ingestAgent', { text: (document.getElementById('knowledge-text') as HTMLTextAreaElement)?.value, source: (document.getElementById('knowledge-source') as HTMLInputElement)?.value })}>Ingest</Button>
                                    </div>
                                </RetroWindow>;
                            case 'manageKnowledge':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[550px] h-[400px]" initialPosition={{ top: '65%', left: '50%' }}>
                                    <div className="p-2 text-sm flex flex-col h-full">
                                        <p className="font-semibold flex items-center gap-1"><DatabaseZap size={14} />Manage Knowledge Base (Vector DB)</p>
                                        {/* TODO: Add collection management */}
                                        <ScrollArea className="flex-grow retro-scrollbar border border-border-dark p-1 bg-white">
                                            {/* TODO: List indexed documents/sources */}
                                            <ul>
                                                <li className="p-1 hover:bg-primary/10 flex justify-between items-center"><span>📄 docs/plugin-api.md (ID: xyz)</span><Button size="sm" variant="destructive" className="retro-button !py-0 !px-1" title="Delete"><X size={12} /></Button></li>
                                                <li className="p-1 hover:bg-primary/10 flex justify-between items-center"><span>🌐 https://example.com/faq (ID: abc)</span><Button size="sm" variant="destructive" className="retro-button !py-0 !px-1" title="Delete"><X size={12} /></Button></li>
                                            </ul>
                                        </ScrollArea>
                                        <div className="flex justify-between mt-1">
                                            <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Rebuild Index")}>Rebuild Index</Button>
                                            <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleGenericAction("Clear Knowledge Base")}>Clear Collection</Button>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'configureOllama':
                                return <RetroWindow key={state.id} {...windowProps} className="w-80 h-auto" initialPosition={{ top: '25%', left: '60%' }}>
                                    <div className="p-4 flex flex-col gap-2">
                                        <p className="text-sm font-semibold">Configure Ollama Integration</p>
                                        <p className="text-xs text-muted-foreground">Ollama host and model settings for local AI.</p>
                                        <Label htmlFor="ollama-host" className="text-xs">Ollama Host URL:</Label>
                                        <Input id="ollama-host" defaultValue={process.env.OLLAMA_BASE_URL || "http://localhost:11434"} placeholder="http://localhost:11434" className="retro-input h-7 text-xs" />
                                        <Label htmlFor="ollama-model" className="text-xs mt-1">Default Model:</Label>
                                        <Input id="ollama-model" defaultValue={process.env.OLLAMA_DEFAULT_MODEL || "llama3"} placeholder="llama3" className="retro-input h-7 text-xs" />
                                        <Label htmlFor="ollama-embed-model" className="text-xs mt-1">Embedding Model:</Label>
                                        <Input id="ollama-embed-model" defaultValue={process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text"} placeholder="nomic-embed-text" className="retro-input h-7 text-xs" />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button className="retro-button" size="sm" onClick={windowProps.onClose}>Cancel</Button>
                                            <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Save Ollama Config", state.id)}>Save</Button>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'fineTuneModel':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[500px] h-auto" initialPosition={{ top: '30%', left: '60%' }}>
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><Brain size={14} />Fine-Tune AI Model (Planned)</p>
                                        <p className="text-xs text-muted-foreground">Customize an Ollama model with your own data.</p>
                                        <Label htmlFor="base-model" className="text-xs">Base Model:</Label>
                                        <Input id="base-model" placeholder="e.g., llama3" className="retro-input h-7 text-xs" />
                                        <Label htmlFor="training-data" className="text-xs mt-1">Training Data (JSONL):</Label>
                                        <Input type="file" id="training-data" accept=".jsonl" className="retro-input h-7 text-xs" />
                                        <Label htmlFor="new-model-name" className="text-xs mt-1">New Model Name:</Label>
                                        <Input id="new-model-name" placeholder="e.g., my-custom-llama3" className="retro-input h-7 text-xs" />
                                        <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleGenericAction("Start Fine-Tuning")} disabled>Start Training</Button>
                                    </div>
                                </RetroWindow>;
                            case 'configureVoiceGesture':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[400px] h-auto" initialPosition={{ top: '35%', left: '60%' }}>
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><Mic size={14} /> / <Hand size={14} />Configure Voice/Gesture</p>
                                        <p className="text-xs text-muted-foreground">Assign voice commands and gestures to actions.</p>
                                        {/* TODO: Implement mapping UI */}
                                        <Label htmlFor="voice-cmd-save" className="text-xs">Voice "Save File":</Label>
                                        <Input id="voice-cmd-save" placeholder='"save file"' className="retro-input h-7 text-xs" />
                                        <Label htmlFor="gesture-copy" className="text-xs mt-1">Gesture "Explain Code":</Label>
                                        <Input id="gesture-copy" placeholder="Two-finger tap" className="retro-input h-7 text-xs" />
                                        <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleGenericAction("Save Voice/Gesture Config", state.id)} disabled>Save Config (Planned)</Button>
                                    </div>
                                </RetroWindow>;
                            case 'profiling':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[550px] h-[400px]" initialPosition={{ top: '40%', left: '60%' }}>
                                    <div className="p-2 flex flex-col h-full">
                                        <p className="font-semibold flex items-center gap-1"><Cpu size={14} />Performance Profiling</p>
                                        <p className="text-xs text-muted-foreground">Analyze performance bottlenecks. (Connects to Observability Service)</p>
                                        {/* Embed profiling results */}
                                        <div className="flex-grow bg-white border border-border-dark p-2 retro-scrollbar">
                                            {/* Placeholder content */}
                                            <p>TODO: Display profiling data (flame graphs, traces).</p>
                                        </div>
                                        <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleGenericAction("Start Profiling Session")}>Start Profiling</Button>
                                    </div>
                                </RetroWindow>;
                            case 'security':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[550px] h-[400px]" initialPosition={{ top: '45%', left: '60%' }}>
                                    <div className="p-2 flex flex-col h-full">
                                        <p className="font-semibold flex items-center gap-1"><ShieldCheck size={14} />Security Analysis</p>
                                        <p className="text-xs text-muted-foreground">SAST and dependency scanning results. (Connects to Agent Coordinator/Observability)</p>
                                        <div className="flex-grow bg-white border border-border-dark p-2 retro-scrollbar">
                                            {/* Placeholder SAST results */}
                                            <p>TODO: Display scan results and vulnerability details.</p>
                                            <ul>
                                                <li>[HIGH] CVE-XXXX-YYYY in 'vulnerable-lib'</li>
                                                <li>[MED] Potential SQL Injection in 'db-query.js'</li>
                                            </ul>
                                        </div>
                                        <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleAgentAction("Run Security Scan", '', 'sastAgent', {})}>Run Scan</Button>
                                    </div>
                                </RetroWindow>;
                            case 'telemetry':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[550px] h-[400px]" initialPosition={{ top: '50%', left: '60%' }}>
                                    <div className="p-2 flex flex-col h-full">
                                        <p className="font-semibold flex items-center gap-1"><Activity size={14} />Telemetry Dashboard</p>
                                        <p className="text-xs text-muted-foreground">Visualize application metrics. (Connects to Observability Service)</p>
                                        <div className="flex-grow bg-white border border-border-dark p-2 retro-scrollbar">
                                            {/* Placeholder telemetry data */}
                                            <p>TODO: Embed Grafana dashboards or display charts directly.</p>
                                        </div>
                                        <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleGenericAction("Refresh Telemetry")}>Refresh</Button>
                                    </div>
                                </RetroWindow>;
                            case 'debugger':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[600px] h-[450px]" initialPosition={{ top: '55%', left: '60%' }}>
                                    <div className="p-2 text-sm flex flex-col h-full">
                                        <p className="font-semibold">Debugger (Planned)</p>
                                        <p className="text-xs text-muted-foreground">Interactive code debugging.</p>
                                        {/* TODO: Integrate Debugger UI (e.g., using DAP client) */}
                                        <div className="flex-grow bg-white border border-border-dark p-2 retro-scrollbar">
                                            <p>Debugger Controls Placeholder</p>
                                            <p>Call Stack | Variables | Breakpoints</p>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'git':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[500px] h-[400px]" initialPosition={{ top: '60%', left: '60%' }}>
                                    <div className="p-2 text-sm flex flex-col h-full">
                                        <p className="font-semibold flex items-center gap-1"><GitBranch size={14} />Git Control</p>
                                        <Tabs defaultValue="commit" className="flex flex-col h-full">
                                            <TabsList className="retro-tabs-list shrink-0">
                                                <TabsTrigger value="commit" className="retro-tab-trigger">Commit</TabsTrigger>
                                                <TabsTrigger value="branches" className="retro-tab-trigger">Branches</TabsTrigger>
                                                <TabsTrigger value="remotes" className="retro-tab-trigger">Remotes</TabsTrigger>
                                                <TabsTrigger value="import" className="retro-tab-trigger">Import</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="commit" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-1">
                                                <p className="text-xs text-muted-foreground">Staged Changes (Placeholder):</p>
                                                <ScrollArea className="h-20 retro-scrollbar border border-border-dark p-1 bg-white text-xs mb-1">
                                                    {/* List staged files */}
                                                    <ul><li>M src/app/page.tsx</li></ul>
                                                </ScrollArea>
                                                <p className="text-xs text-muted-foreground mt-1">Commit Message:</p>
                                                <Textarea placeholder="Enter commit message..." className="retro-input h-16 text-xs" />
                                                <Button className="retro-button mt-2" size="sm" onClick={() => handleGenericAction("Commit Changes")}>Commit</Button>
                                            </TabsContent>
                                            <TabsContent value="branches" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-1">
                                                <p className="text-xs text-muted-foreground mt-1">Branches (Placeholder):</p>
                                                <ScrollArea className="h-40 retro-scrollbar border border-border-dark p-1 bg-white text-xs mb-1">
                                                    {/* List branches */}
                                                    <ul><li>* main</li><li>  feature/new-ai</li><li>  develop</li></ul>
                                                </ScrollArea>
                                                <Button className="retro-button mt-2" size="sm" onClick={() => handleGenericAction("Create New Branch")}>Create Branch</Button>
                                                <Button className="retro-button mt-2 ml-1" size="sm" onClick={() => handleGenericAction("Switch Branch")}>Switch/Checkout</Button>
                                                <Button className="retro-button mt-2 ml-1" size="sm" variant="destructive" onClick={() => handleGenericAction("Delete Branch")}>Delete Branch</Button>
                                            </TabsContent>
                                            <TabsContent value="remotes" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-1">
                                                <p className="text-xs text-muted-foreground mt-1">Remotes (Placeholder):</p>
                                                <ScrollArea className="h-40 retro-scrollbar border border-border-dark p-1 bg-white text-xs mb-1">
                                                    <ul><li>origin (fetch): git@github.com:user/repo.git</li><li>origin (push): git@github.com:user/repo.git</li></ul>
                                                </ScrollArea>
                                                <Button className="retro-button mt-2" size="sm" onClick={() => handleGenericAction("Fetch")}>Fetch</Button>
                                                <Button className="retro-button mt-2 ml-1" size="sm" onClick={() => handleGenericAction("Push")}>Push</Button>
                                                <Button className="retro-button mt-2 ml-1" size="sm" onClick={() => handleGenericAction("Pull")}>Pull</Button>
                                            </TabsContent>
                                            <TabsContent value="import" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-1">
                                                <p className="text-xs text-muted-foreground mt-1">Import from GitHub:</p>
                                                <Input placeholder="GitHub repository URL (e.g., https://github.com/user/repo.git)" className="retro-input h-7 text-xs" />
                                                {/* TODO: Add OAuth flow */}
                                                <Button className="retro-button mt-2" size="sm" onClick={() => handleGenericAction("Clone Repository")}>Clone/Import</Button>
                                                <p className="text-xs text-muted-foreground mt-1">(OAuth integration planned)</p>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </RetroWindow>;
                            case 'devops':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[500px] h-[400px]" initialPosition={{ top: '65%', left: '60%' }}>
                                    <div className="p-2 text-sm flex flex-col h-full">
                                        <p className="font-semibold flex items-center gap-1"><Cloud size={14} />DevOps Panel</p>
                                        <Tabs defaultValue="iac" className="flex flex-col h-full">
                                            <TabsList className="retro-tabs-list shrink-0">
                                                <TabsTrigger value="iac" className="retro-tab-trigger">IaC</TabsTrigger>
                                                <TabsTrigger value="docker" className="retro-tab-trigger">Docker</TabsTrigger>
                                                <TabsTrigger value="k8s" className="retro-tab-trigger">K8s</TabsTrigger>
                                                <TabsTrigger value="hosting" className="retro-tab-trigger">Hosting</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="iac" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-1">
                                                <p className="text-xs text-muted-foreground mt-1">Infrastructure-as-Code (Terraform/Pulumi):</p>
                                                <ScrollArea className="h-40 retro-scrollbar border border-border-dark p-1 bg-white text-xs mb-1">
                                                    {/* Display detected IaC files/status */}
                                                    <pre><code># main.tf content or status...</code></pre>
                                                </ScrollArea>
                                                <Button className="retro-button mt-2" size="sm" onClick={() => handleAgentAction("Generate IaC", '', 'iacGenAgent', {})}>Generate IaC</Button>
                                                <Button className="retro-button mt-2 ml-1" size="sm" onClick={() => handleGenericAction("Apply IaC")}>Apply IaC</Button>
                                                <Button className="retro-button mt-2 ml-1" size="sm" variant="destructive" onClick={() => handleGenericAction("Destroy IaC")}>Destroy IaC</Button>
                                            </TabsContent>
                                            <TabsContent value="docker" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-1">
                                                <p className="text-xs text-muted-foreground mt-1">Docker Compose Environment:</p>
                                                <ScrollArea className="h-40 retro-scrollbar border border-border-dark p-1 bg-white text-xs mb-1">
                                                    {/* Display docker-compose status */}
                                                    <p>frontend: Running</p>
                                                    <p>redis: Running</p>
                                                    <p>ai-service: Running</p>
                                                    {/* ... */}
                                                </ScrollArea>
                                                <Button className="retro-button mt-2" size="sm" onClick={() => handleGenericAction("Start Docker Environment")}>Start/Up Env</Button>
                                                <Button className="retro-button mt-2 ml-1" size="sm" onClick={() => handleGenericAction("Stop Docker Environment")}>Stop Env</Button>
                                                <Button className="retro-button mt-2 ml-1" size="sm" onClick={() => handleGenericAction("Rebuild Docker Environment")}>Rebuild Env</Button>
                                            </TabsContent>
                                            <TabsContent value="k8s" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-1">
                                                <p className="text-xs text-muted-foreground mt-1">Kubernetes Deployments:</p>
                                                <ScrollArea className="h-40 retro-scrollbar border border-border-dark p-1 bg-white text-xs mb-1">
                                                    {/* Display K8s deployment status */}
                                                    <p>quonxcoder-frontend: 2/2 Ready</p>
                                                    <p>quonxcoder-redis: 1/1 Ready</p>
                                                    {/* ... */}
                                                </ScrollArea>
                                                <Button className="retro-button mt-2" size="sm" onClick={() => handleGenericAction("Deploy to Kubernetes")}>Deploy/Apply K8s</Button>
                                                <Button className="retro-button mt-2 ml-1" size="sm" onClick={() => handleGenericAction("View K8s Logs")}>View Logs</Button>
                                                <Button className="retro-button mt-2 ml-1" size="sm" onClick={() => handleGenericAction("Manage K8s Deployments")}>Manage Deployments</Button>
                                            </TabsContent>
                                            <TabsContent value="hosting" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-1">
                                                <p className="text-xs text-muted-foreground mt-1">Hosting Configuration (Domains, SSL):</p>
                                                <ScrollArea className="h-40 retro-scrollbar border border-border-dark p-1 bg-white text-xs mb-1">
                                                    {/* Display hosting details */}
                                                    <p>Domain: quonxcoder.yourdomain.com</p>
                                                    <p>SSL: Active (Let's Encrypt)</p>
                                                </ScrollArea>
                                                <Button className="retro-button mt-2" size="sm" onClick={() => handleGenericAction("Configure Hosting Provider")}>Configure Provider</Button>
                                                <Button className="retro-button mt-2 ml-1" size="sm" onClick={() => handleGenericAction("Add Custom Domain")}>Add Domain</Button>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </RetroWindow>;
                            case 'languageEnv':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[450px] h-[350px]" initialPosition={{ top: '30%', left: '35%' }}>
                                    <div className="w-full h-full bg-card p-2 text-sm">
                                        <p className="mb-1 font-semibold flex items-center gap-1"><FlaskConical size={14} />Language Environment (Nix)</p>
                                        <p className="text-xs text-muted-foreground mb-2">Manage language versions and dependencies via Nix.</p>
                                        <ScrollArea className="h-48 retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                            {/* TODO: Display nix-shell info */}
                                            <pre><code># shell.nix content or status...</code></pre>
                                        </ScrollArea>
                                        <div className="flex justify-between mt-2">
                                            <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Add Nix Dependency")}>Add Dependency</Button>
                                            <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Update Nix Environment")}>Update Environment</Button>
                                        </div>
                                    </div>
                                </RetroWindow>;
                            case 'settings':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[600px] h-[450px]" initialPosition={{ top: '35%', left: '30%' }}>
                                    <div className="p-2 text-sm flex flex-col h-full">
                                        <p className="font-semibold flex items-center gap-1"><Settings size={14} />Settings</p>
                                        <Tabs defaultValue="editor" className="flex flex-col h-full">
                                            <TabsList className="retro-tabs-list shrink-0">
                                                <TabsTrigger value="editor" className="retro-tab-trigger">Editor</TabsTrigger>
                                                <TabsTrigger value="theme" className="retro-tab-trigger">Theme</TabsTrigger>
                                                <TabsTrigger value="ai" className="retro-tab-trigger">AI</TabsTrigger>
                                                <TabsTrigger value="keyboard" className="retro-tab-trigger">Keyboard</TabsTrigger>
                                                <TabsTrigger value="account" className="retro-tab-trigger">Account</TabsTrigger>
                                                {/* Add more setting categories */}
                                            </TabsList>
                                            <TabsContent value="editor" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-1">
                                                <p className="text-xs text-muted-foreground mt-1">Editor Settings (Placeholder):</p>
                                                {/* Editor settings controls */}
                                                <p>Font Size: 14px</p>
                                                <p>Tab Size: 4</p>
                                            </TabsContent>
                                            <TabsContent value="theme" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-1">
                                                <p className="text-xs text-muted-foreground mt-1">Theme Settings:</p>
                                                {/* Theme selection controls */}
                                                <Label htmlFor="theme-select">UI Theme:</Label>
                                                <select id="theme-select" className="retro-input h-7 text-xs mt-1">
                                                    <option>Retro Light (Default)</option>
                                                    <option>Retro Dark</option>
                                                    <option>Modern (Planned)</option>
                                                </select>
                                            </TabsContent>
                                            <TabsContent value="ai" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-1">
                                                <p className="text-xs text-muted-foreground mt-1">AI Settings:</p>
                                                {/* AI Provider/Model settings */}
                                                <Button className="retro-button mt-1" size="sm" onClick={() => toggleWindowVisibility('configureOllama')}>Configure Ollama...</Button>
                                                <Button className="retro-button mt-1 ml-1" size="sm" onClick={() => toggleWindowVisibility('configureVoiceGesture')}>Configure Voice/Gesture...</Button>
                                            </TabsContent>
                                            <TabsContent value="keyboard" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-1">
                                                <p className="text-xs text-muted-foreground mt-1">Keyboard Shortcuts (Placeholder):</p>
                                                {/* Keyboard shortcut settings */}
                                                <p>Cmd+P: Command Palette</p>
                                                <p>Cmd+S: Save File</p>
                                            </TabsContent>
                                            <TabsContent value="account" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-1">
                                                <p className="text-xs text-muted-foreground mt-1">Account Settings:</p>
                                                {/* Account details, linked accounts (GitHub), env vars */}
                                                <Button className="retro-button mt-1" size="sm" onClick={() => toggleWindowVisibility('accountVars')}>Account Environment Variables...</Button>
                                                <Button className="retro-button mt-1 ml-1" size="sm" onClick={() => handleGenericAction('Link GitHub Account')}>Link GitHub Account...</Button>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </RetroWindow>;
                            case 'welcome':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[500px] h-[350px]" initialPosition={{ top: '40%', left: '30%' }}>
                                    <div className="p-2 text-sm">
                                        <p className="font-semibold">Welcome to QuonxCoder!</p>
                                        <p className="mt-1">Get started with these resources:</p>
                                        <ul>
                                            <li><a href="#" onClick={() => handleGenericAction('Open Documentation')} className="text-primary hover:underline">Documentation</a></li>
                                            <li><a href="#" onClick={() => toggleWindowVisibility('configureVoiceGesture')} className="text-primary hover:underline">Configure Voice/Gesture Commands</a></li>
                                            <li><a href="#" onClick={() => toggleWindowVisibility('commandPalette')} className="text-primary hover:underline">Open Command Palette (Cmd+P)</a></li>
                                            <li><a href="#" onClick={() => toggleWindowVisibility('marketplace')} className="text-primary hover:underline">Explore Plugins</a></li>
                                            <li><a href="#" onClick={() => handleGenericAction('Take Interactive Tour')} className="text-primary hover:underline">Take an Interactive Tour (Planned)</a></li>
                                        </ul>
                                    </div>
                                </RetroWindow>;
                            case 'about':
                                return <RetroWindow key={state.id} {...windowProps} className="w-[400px] h-[300px]" initialPosition={{ top: '45%', left: '30%' }}>
                                    <div className="p-2 text-sm">
                                        <p className="font-semibold">About QuonxCoder</p>
                                        <p className="mt-1">Version: 0.7.0 (Enhanced Windows)</p>
                                        <p>Developed by: Advanced AI Concepts Inc.</p>
                                        <p className="mt-2 text-xs text-muted-foreground">Built with Next.js, React, Tailwind, shadcn/ui, Ollama, Langchain, Yjs, and more.</p>
                                        {/* Add copyright, credits, etc. */}
                                    </div>
                                </RetroWindow>;
                            default:
                                // Render a default placeholder for any unknown/unimplemented window IDs
                                return <RetroWindow key={state.id} {...windowProps} className="w-64 h-48" initialPosition={{ top: '50%', left: '50%' }}>
                                    <p className="p-2 text-sm text-muted-foreground">Window content for '{state.id}' not implemented yet.</p>
                                </RetroWindow>;
                        }
                    })}

            </ResizablePanelGroup>

            {/* Status Bar */}
            <div className="h-7 border-t-2 border-border-dark flex items-center justify-between text-xs bg-card">
                <div className="px-2 flex items-center gap-2">
                    {/* Display project status, Git branch, etc. */}
                    <span>Project: MyProject</span>
                    <span className="flex items-center gap-1"><GitBranch size={12} /> main</span>
                    {/* TODO: Add status indicators (Saving, AI Idle/Busy, etc.) */}
                    <span className="text-green-600 flex items-center gap-1"><BrainCircuit size={12} /> AI Ready</span>
                </div>
                <div className="flex items-center px-2 space-x-1">
                    {/* Show minimized window tabs */}
                    {Object.values(windowStates)
                        .filter(state => state.isMinimized)
                        .map(state => (
                            <button key={state.id} className="retro-minimized-tab" onClick={() => restoreWindow(state.id)} title={`Restore ${getWindowName(state.id)}`}>
                                {getWindowName(state.id)}
                            </button>
                        ))}
                    {/* Separator */}
                    {Object.values(windowStates).some(s => s.isMinimized) && <div className="retro-separator-v !h-4 !mx-0.5"></div>}
                    <Button variant="ghost" size="icon" className="retro-button !border-none !shadow-none !w-6 !h-5" aria-label="Toggle Full Screen" onClick={toggleFullScreen} title="Toggle Full Screen">
                        <Fullscreen size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="retro-button !border-none !shadow-none !w-6 !h-5" aria-label="Settings" onClick={() => toggleWindowVisibility('settings')} title="Settings">
                        <Settings size={14} />
                    </Button>
                    <span className="font-bold">QuonxCoder</span>
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
    onRefactorCode: () => void; // Added
    onGenerateTests: () => void; // Added
    onGenerateDocs: () => void; // Added
    onFixBug: () => void; // Added
    onScaffoldAgent: () => void; // Added
    onQueryKnowledge: () => void; // Added
    onIngestKnowledge: () => void; // Added
    onManageKnowledge: () => void; // Added
    onConfigureOllama: () => void;
    onFineTuneModel: () => void; // Added
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
    onGenerateIaC: () => void; // Added
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

const RetroMenubar = (props: RetroMenubarProps) => {
    // Destructure props for easier access
    const {
        onPluginManagerToggle, onShowOpenFile, onShowOpenFolder, onShowSaveAs,
        onShowManageSecrets, onShowConfigureVault, onShowProjectVars, onShowAccountVars,
        onFind, onReplace, onCommandPalette, onToggleFullScreen, onShowMarketplace,
        onShowInstallVsix, onShowManageWorkflows, onExplainCode, onGenerateCode,
        onRefactorCode, onGenerateTests, onGenerateDocs, onFixBug, onScaffoldAgent,
        onQueryKnowledge, onIngestKnowledge, onManageKnowledge, onConfigureOllama,
        onFineTuneModel, onConfigureVoiceGesture, onShowProfiling, onShowSecurity,
        onShowTelemetry, onStartDebugging, onAddDebugConfig, onShowGitCommit, onGitPush,
        onGitPull, onShowGitBranches, onShowImportGithub, onApplyIaC, onGenerateIaC,
        onStartDockerEnv, onDeployK8s, onManageDeployments, onConfigureHosting,
        onShowLanguageEnv, onShowSettings, onShowWelcome, onShowDocs, onShowApiDocs,
        onShowVoiceGestureCommands, onCheckForUpdates, onShowAbout
    } = props;

    return (
        <Menubar className="border-b-2 border-border-dark rounded-none">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onShowOpenFile}><FolderOpen size={14} className="mr-2" />Open File...</MenubarItem>
                    <MenubarItem onSelect={onShowOpenFolder}><FolderOpen size={14} className="mr-2" />Open Folder...</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem><Save size={14} className="mr-2" />Save <MenubarShortcut>⌘S</MenubarShortcut></MenubarItem>
                    <MenubarItem onSelect={onShowSaveAs}><Save size={14} className="mr-2" />Save As...<MenubarShortcut>⌘⇧S</MenubarShortcut></MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onCommandPalette}><SearchIcon size={14} className="mr-2" />Command Palette...<MenubarShortcut>⌘P</MenubarShortcut></MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowSettings}><Settings size={14} className="mr-2" />Settings</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onToggleFullScreen}><Fullscreen size={14} className="mr-2" />Toggle Full Screen<MenubarShortcut>F11</MenubarShortcut></MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowWelcome}><Hand size={14} className="mr-2" />Show Welcome Guide</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    {/* TODO: Add Undo/Redo */}
                    <MenubarItem disabled>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
                    <MenubarItem disabled>Redo <MenubarShortcut>⌘⇧Z</MenubarShortcut></MenubarItem>
                    <MenubarSeparator />
                    {/* TODO: Add Cut/Copy/Paste */}
                    <MenubarItem disabled>Cut <MenubarShortcut>⌘X</MenubarShortcut></MenubarItem>
                    <MenubarItem disabled>Copy <MenubarShortcut>⌘C</MenubarShortcut></MenubarItem>
                    <MenubarItem disabled>Paste <MenubarShortcut>⌘V</MenubarShortcut></MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onFind}><Search size={14} className="mr-2" />Find...<MenubarShortcut>⌘F</MenubarShortcut></MenubarItem>
                    <MenubarItem onSelect={onReplace}><Replace size={14} className="mr-2" />Replace...<MenubarShortcut>⌘⇧F</MenubarShortcut></MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowManageSecrets}><FileKey size={14} className="mr-2" />Manage Secrets...</MenubarItem>
                    <MenubarItem onSelect={onShowConfigureVault}><DatabaseZap size={14} className="mr-2" />Configure Vault...</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowProjectVars}><Database size={14} className="mr-2" />Project Env Vars...</MenubarItem>
                    <MenubarItem onSelect={onShowAccountVars}><Globe size={14} className="mr-2" />Account Env Vars...</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>AI</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onGenerateCode}><Sparkles size={14} className="mr-2" />Generate Code...</MenubarItem>
                    <MenubarItem onSelect={onExplainCode}><Lightbulb size={14} className="mr-2" />Explain Code</MenubarItem>
                    <MenubarItem onSelect={onRefactorCode}><Recycle size={14} className="mr-2" />Refactor Code...</MenubarItem>
                    <MenubarItem onSelect={onGenerateTests}><TestTubeDiagonal size={14} className="mr-2" />Generate Tests...</MenubarItem>
                    <MenubarItem onSelect={onGenerateDocs}><BookOpen size={14} className="mr-2" />Generate Docs...</MenubarItem>
                    <MenubarItem onSelect={onFixBug}><Wrench size={14} className="mr-2" />Fix Bug...</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onScaffoldAgent}><BrainCircuit size={14} className="mr-2" />Scaffold App/Agent...</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onQueryKnowledge}><FileQuestion size={14} className="mr-2" />Query Knowledge (RAG)...</MenubarItem>
                    <MenubarItem onSelect={onIngestKnowledge}><FileInput size={14} className="mr-2" />Ingest Knowledge...</MenubarItem>
                    <MenubarItem onSelect={onManageKnowledge}><DatabaseZap size={14} className="mr-2" />Manage Knowledge Base...</MenubarItem>
                    <MenubarSeparator />
                    <MenubarSub>
                        <MenubarSubTrigger><Brain size={14} className="mr-2" />Advanced</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem onSelect={onConfigureOllama}>Configure Ollama...</MenubarItem>
                            <MenubarItem onSelect={onFineTuneModel}>Fine-tune Model... (Planned)</MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onConfigureVoiceGesture}><Mic size={14} className="mr-2" />Configure Voice/Gesture...</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Code</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onStartDebugging}>Start Debugging (Planned)</MenubarItem>
                    <MenubarItem onSelect={onAddDebugConfig}>Add Debug Config (Planned)</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowLanguageEnv}><FlaskConical size={14} className="mr-2" />Language Environment...</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Git</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onShowGitCommit}><GitCommit size={14} className="mr-2" />Commit...</MenubarItem>
                    <MenubarItem onSelect={onGitPush}>Push</MenubarItem>
                    <MenubarItem onSelect={onGitPull}>Pull</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowGitBranches}><GitBranch size={14} className="mr-2" />Show Branches</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowImportGithub}><GitPullRequest size={14} className="mr-2" />Import from GitHub...</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={() => toggleWindowVisibility('git')}><GitBranch size={14} className="mr-2" />Open Git Control Panel</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>DevOps</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onGenerateIaC}><FileCode size={14} className="mr-2" />Generate IaC...</MenubarItem>
                    <MenubarItem onSelect={onApplyIaC}>Apply IaC</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onStartDockerEnv}>Start Docker Env</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onDeployK8s}>Deploy K8s</MenubarItem>
                    <MenubarItem onSelect={onManageDeployments}>Manage Deployments</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onConfigureHosting}>Configure Hosting</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={() => toggleWindowVisibility('devops')}><Cloud size={14} className="mr-2" />Open DevOps Panel</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                    {/* TODO: Add toggles for panels (File Explorer, AI Chat, etc.) */}
                    <MenubarItem onSelect={onPluginManagerToggle}><Puzzle size={14} className="mr-2" />Toggle Plugin Manager</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowProfiling}><Cpu size={14} className="mr-2" />Show Profiling Panel</MenubarItem>
                    <MenubarItem onSelect={onShowSecurity}><ShieldCheck size={14} className="mr-2" />Show Security Panel</MenubarItem>
                    <MenubarItem onSelect={onShowTelemetry}><Activity size={14} className="mr-2" />Show Telemetry Dashboard</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onToggleFullScreen}><Fullscreen size={14} className="mr-2" />Toggle Full Screen</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Plugins</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onShowMarketplace}><PackageOpen size={14} className="mr-2" />Marketplace...</MenubarItem>
                    <MenubarItem onSelect={onShowInstallVsix}><FileInput size={14} className="mr-2" />Install from VSIX/QCX...</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowManageWorkflows}><Route size={14} className="mr-2" />Manage Workflows...</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onPluginManagerToggle}><Puzzle size={14} className="mr-2" />Installed Plugins</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Help</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onShowDocs}><BookOpen size={14} className="mr-2" />Documentation</MenubarItem>
                    <MenubarItem onSelect={onShowApiDocs}><CodeXml size={14} className="mr-2" />Plugin API Docs</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowVoiceGestureCommands}><Mic size={14} className="mr-2" />Voice/Gesture Commands</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onCheckForUpdates}>Check for Updates...</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowAbout}><HelpCircle size={14} className="mr-2" />About QuonxCoder</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    );
};

    