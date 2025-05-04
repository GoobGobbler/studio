{'use client'; // Required for hooks and event handlers

import * as React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Menubar } from "@/components/ui/menubar"; // Adjusted import if needed
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Will be replaced by Monaco
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Maximize2, Minus, X, Bot, Code, Terminal as TerminalIcon, Files, Puzzle, Mic, Hand, Activity, ShieldCheck, BarChart3, Users, Share2, Cloud, GitBranch, Save, FolderOpen, Search, Settings, LifeBuoy, Replace, SearchIcon, PackageOpen, HelpCircle, BookOpen, CodeXml, GitCommit, GitPullRequest, Database, FileKey, Globe, Palette, Fullscreen, BrainCircuit, FileCode, FlaskConical, Recycle, Lightbulb, MessageSquare, Brain, Sparkles, FileQuestion, FileInput, DatabaseZap, Cpu, Wrench, Route, TestTubeDiagonal } from "lucide-react";
import { RetroMenubar } from '@/components/layout/retro-menubar'; // Moved Menubar logic to separate component
import { RetroWindow } from '@/components/layout/retro-window'; // Moved Window logic to separate component
import { PluginManagerContent } from '@/components/features/plugin-manager'; // Placeholder content component
import { CollaborationPanel } from '@/components/features/collaboration-panel'; // Placeholder content component
import { CodeEditor } from '@/components/features/code-editor'; // Placeholder Code Editor (to be replaced by Monaco)
import { TerminalAndLogs } from '@/components/features/terminal-logs'; // Terminal and Logs component
import { FileExplorer } from '@/components/features/file-explorer'; // File Explorer component
import { AIChat } from '@/components/features/ai-chat'; // AI Chat component
import { SimpleDialogContent } from '@/components/layout/simple-dialog-content'; // Simple content for basic dialogs

// TODO: Import Monaco Editor and related types/bindings
// import Editor from '@monaco-editor/react';
// import type * as monaco from 'monaco-editor';
// import { MonacoBinding } from 'y-monaco';

// Import collaboration library more concretely
import { connectCollaboration, setLocalAwarenessState, getAwarenessStates, onAwarenessChange, getSharedText, type CollaborationSession } from '@/lib/collaboration';
import * as Y from 'yjs'; // Import Yjs

// Import secrets library more concretely
import { getSecret, setSecret, deleteSecret, listSecretKeys } from '@/lib/secrets';

// Import AI agent client functions
import {
    requestAgentExecution,
    ollamaChatCompletion,
    ollamaCodeGeneration,
    ollamaExplainCode,
    ollamaRefactorCode,
    ollamaGenerateTests,
    ollamaGenerateDocs,
    ollamaFixBug,
    ollamaScaffoldApp,
    ollamaRAGQuery,
    ollamaIngestKnowledge,
    // Import other agent functions as needed
} from '@/ai/agents/ollama-agent';
import type { AgentExecutionResponse } from '@/types/agent-types'; // Shared type

// Define window state type
type WindowState = {
    id: string;
    isVisible: boolean;
    isMinimized: boolean;
    zIndex: number;
    // Add specific state for windows if needed (e.g., form inputs)
    prompt?: string; // For AI prompt windows
    codeContext?: string; // For AI code-related windows
    filePath?: string; // For file/folder windows
    secretKey?: string; // For secrets window
    envVarName?: string; // For env var window
    findText?: string; // For find/replace
    replaceText?: string;
    workflowId?: string; // For workflow management
    knowledgeSource?: string; // For RAG ingest
    // ... other specific states
};


// --- Main Page Component ---
export default function Home() {
    'use client'; // Explicitly mark as client component again for clarity

    const { toast } = useToast();

    // --- State Management ---
    const [windowStates, setWindowStates] = React.useState<Record<string, WindowState>>({
        // Initialize window states (mostly hidden by default)
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
        explainCode: { id: 'explainCode', isVisible: false, isMinimized: false, zIndex: 10 },
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
        git: { id: 'git', isVisible: false, isMinimized: false, zIndex: 10 },
        devops: { id: 'devops', isVisible: false, isMinimized: false, zIndex: 10 },
        languageEnv: { id: 'languageEnv', isVisible: false, isMinimized: false, zIndex: 10 },
        settings: { id: 'settings', isVisible: false, isMinimized: false, zIndex: 10 },
        welcome: { id: 'welcome', isVisible: false, isMinimized: false, zIndex: 10 }, // Show initially?
        about: { id: 'about', isVisible: false, isMinimized: false, zIndex: 10 },
    });

    const nextZIndex = React.useRef(10); // Starting z-index

    // Refs for components that need interaction (Editor, Terminal)
    const editorRef = React.useRef<any>(null); // Monaco editor instance ref
    const terminalRef = React.useRef<any>(null); // xterm.js instance ref
    const collaborationSessionRef = React.useRef<CollaborationSession | null>(null);
    const monacoBindingRef = React.useRef<any>(null); // Ref for y-monaco binding

    // --- Effects ---

    // Initialize Monaco Editor
    const handleEditorDidMount = (editor: any, monaco: any) => {
        console.log("Monaco Editor Mounted (Placeholder)");
        editorRef.current = editor;
        // Setup Yjs collaboration binding here
        // setupCollaborationBinding(editor.getModel());
    };

    // Initialize Collaboration
    React.useEffect(() => {
        // Example: Connect to a default document on load
        const docId = 'default-project-doc'; // Should be dynamic based on open project/file
        const session = connectCollaboration(docId);
        collaborationSessionRef.current = session;

        if (session) {
             setLocalAwarenessState(session.awareness, { user: { name: `User_${Math.random().toString(36).substring(7)}`, color: `#${Math.floor(Math.random()*16777215).toString(16)}` } }); // Example awareness

             // Example listener for awareness changes
            const unsubscribe = onAwarenessChange(session.awareness, (changes) => {
                 console.log('Awareness changed:', changes, getAwarenessStates(session.awareness));
                 // Update UI based on changes (e.g., render user avatars/cursors)
             });

            // TODO: Setup editor binding if editor is ready
            // if (editorRef.current?.getModel()) {
            //    setupCollaborationBinding(editorRef.current.getModel());
            // }

             return () => {
                unsubscribe();
                session.destroy();
                collaborationSessionRef.current = null;
             };
        }
    }, []); // Run once on mount

    // Function to setup Monaco binding (call when editor and session are ready)
    // const setupCollaborationBinding = (textModel: monaco.editor.ITextModel) => {
    //     if (collaborationSessionRef.current && textModel && !monacoBindingRef.current) {
    //         const yText = getSharedText(collaborationSessionRef.current.doc, 'monaco');
    //         monacoBindingRef.current = new MonacoBinding(
    //             yText,
    //             textModel,
    //             new Set([editorRef.current]),
    //             collaborationSessionRef.current.awareness
    //         );
    //         console.log("Monaco-Yjs binding created.");
    //     }
    // };


    // Initialize Terminal (xterm.js) and connect to backend
    React.useEffect(() => {
        // Placeholder: Initialize xterm.js in the Terminal component
        // const term = new Terminal();
        // term.open(document.getElementById('terminal-container')); // Assuming container exists in Terminal component
        // terminalRef.current = term;
        // term.write('Welcome to QuonxTerm (xterm.js)! \r\n$ ');
        // Connect to backend WebSocket/service for actual shell interaction
        console.log("TODO: Initialize xterm.js and connect to backend shell.");
        return () => {
            // terminalRef.current?.dispose();
        };
    }, []);

    // Connect Logs panel to backend streams
    React.useEffect(() => {
        // Placeholder: Setup WebSocket or SSE connection to Observability Service
        console.log("TODO: Connect Logs panel to backend log stream.");
        let logSource: EventSource | null = null;
        try {
             logSource = new EventSource('/api/proxy/observability/logs'); // Example SSE endpoint

             logSource.onmessage = (event) => {
                // Append event.data to the logs view
                console.log("Log Received:", event.data);
                // Example: Update state in TerminalAndLogs component if needed
             };

             logSource.onerror = (event) => {
                // Log as warning instead of error, as connection closure is expected
                console.warn("Log stream connection closed or encountered an error.", event);
                logSource?.close(); // Ensure closure
            };
        } catch (error) {
            console.warn("Could not establish log stream connection:", error);
        }

        return () => {
            logSource?.close(); // Cleanup on component unmount
        };
    }, []);


    // --- Window Management Functions ---
    const getNextZIndex = () => {
        nextZIndex.current += 1;
        return nextZIndex.current;
    };

    const updateWindowState = (id: string, updates: Partial<WindowState>) => {
        setWindowStates(prev => ({
            ...prev,
            [id]: { ...(prev[id] || { id, isVisible: false, isMinimized: false, zIndex: 0 }), ...updates }
        }));
    };

    const toggleWindowVisibility = (id: string, initialState: Partial<WindowState> = {}) => {
        setWindowStates(prev => {
            const currentState = prev[id];
            let newState: WindowState;

            if (!currentState) { // First time opening
                 newState = { id, isVisible: true, isMinimized: false, zIndex: getNextZIndex(), ...initialState };
            } else {
                 newState = {
                    ...currentState,
                    isVisible: !currentState.isVisible,
                    isMinimized: !currentState.isVisible ? false : currentState.isMinimized, // Unminimize if opening
                    zIndex: !currentState.isVisible ? getNextZIndex() : currentState.zIndex, // Bring to front if opening
                 };
                 // Merge initial state if reopening and initial state is provided
                 if(newState.isVisible && Object.keys(initialState).length > 0) {
                     Object.assign(newState, initialState);
                 }
            }
            return { ...prev, [id]: newState };
        });
    };


    const minimizeWindow = (id: string) => {
        setWindowStates(prev => {
            const currentState = prev[id];
            if (!currentState || !currentState.isVisible) return prev;
            return { ...prev, [id]: { ...currentState, isVisible: false, isMinimized: true } };
        });
    };

    const restoreWindow = (id: string) => {
        setWindowStates(prev => {
            const currentState = prev[id];
            if (!currentState || !currentState.isMinimized) return prev;
            return { ...prev, [id]: { ...currentState, isVisible: true, isMinimized: false, zIndex: getNextZIndex() } };
        });
    };

    // --- Menu/Action Handlers ---
    const handleGenericAction = (title: string, idToToggle?: string, payload?: any) => {
        toast({ title: `Action: ${title}`, description: "TODO: Implement this feature." });
        console.log(`Action triggered: ${title}`, payload || '');
        if (idToToggle) {
            // Potentially close the window that triggered the action
            updateWindowState(idToToggle, { isVisible: false });
        }
    };

    // Function to get selected code from Monaco (placeholder)
    const getSelectedCode = (): string => {
        // TODO: Implement actual Monaco selection retrieval
        // return editorRef.current?.getModel()?.getValueInRange(editorRef.current?.getSelection()) || "";
        console.warn("getSelectedCode: Monaco editor integration needed.");
        return "// Placeholder: Selected code from editor";
    };

    const handleExplainCode = () => {
        const code = getSelectedCode();
        if (!code) {
            toast({ title: "Explain Code", description: "Please select code in the editor first.", variant: "destructive" });
            return;
        }
        toggleWindowVisibility('explainCode', { codeContext: code }); // Pass code to window state
        toast({ title: "Explain Code", description: "Opening AI explanation window..." });
    };

    const handleRefactorCode = () => {
        const code = getSelectedCode();
         if (!code) {
            toast({ title: "Refactor Code", description: "Please select code in the editor first.", variant: "destructive" });
            return;
        }
        toggleWindowVisibility('refactorCode', { codeContext: code });
    };

     const handleGenerateTests = () => {
        const code = getSelectedCode(); // Or get current file content
         if (!code) {
            toast({ title: "Generate Tests", description: "Please select code or have a file open.", variant: "destructive" });
            return;
        }
        toggleWindowVisibility('generateTests', { codeContext: code });
    };

    const handleGenerateDocs = () => {
        const code = getSelectedCode(); // Or get current file content
         if (!code) {
            toast({ title: "Generate Docs", description: "Please select code or have a file open.", variant: "destructive" });
            return;
        }
        toggleWindowVisibility('generateDocs', { codeContext: code });
    };

     const handleFixBug = () => {
        const code = getSelectedCode();
         if (!code) {
            toast({ title: "Fix Bug", description: "Please select code in the editor first.", variant: "destructive" });
            return;
        }
        toggleWindowVisibility('fixBug', { codeContext: code });
    };


    // Centralized Agent Action Handler
    const handleAgentAction = async (title: string, idToClose: string, agentName: string, payload: any = {}) => {
        // Close the originating window first
        updateWindowState(idToClose, { isVisible: false });
        toast({ title: title, description: `Calling Agent '${agentName}'...` });

        // Basic input validation (can be expanded)
        if ( (agentName === 'codeGenAgent' || agentName === 'scaffoldAgent' || agentName === 'ragAgent') && !payload.prompt && !payload.description && !payload.queryText) {
            toast({ title: `${title} Failed`, description: `Prompt or description is required for ${agentName}.`, variant: "destructive" });
            return;
        }
         if ( (agentName === 'explainCodeAgent' || agentName === 'refactorAgent' || agentName === 'testGenAgent' || agentName === 'docGenAgent' || agentName === 'fixBugAgent') && !payload.code) {
             toast({ title: `${title} Failed`, description: `Code context is required for ${agentName}.`, variant: "destructive" });
             return;
         }
         if ( agentName === 'ingestAgent' && !payload.text) {
             toast({ title: `${title} Failed`, description: `Text content is required for ${agentName}.`, variant: "destructive" });
             return;
         }


        const response = await requestAgentExecution(agentName, payload);

        if (response.success) {
            toast({ title: `${title} Succeeded`, description: `Agent ${agentName} completed.` });
            console.log(`Agent ${agentName} Result:`, response.result);
            // Handle the successful result appropriately
            if (agentName === 'codeGenAgent' || agentName === 'refactorAgent' || agentName === 'fixBugAgent' || agentName === 'scaffoldAgent') {
                 // TODO: Insert response.result.code into Monaco editor or new file
                 console.log("TODO: Insert/Display code:", response.result?.code || response.result?.files);
                 toast({ title: "Code Updated", description: `Code from ${agentName} ready (TODO: Insert/Display).` , duration: 5000});
            } else if (agentName === 'explainCodeAgent' || agentName === 'ragAgent' || agentName === 'docGenAgent') {
                 // Display result in a simple dialog or toast for now
                 // TODO: Create a dedicated result display window/panel
                 const resultString = JSON.stringify(response.result, null, 2);
                 toast({ title: `${agentName} Result`, description: resultString.substring(0, 300) + (resultString.length > 300 ? "..." : ""), duration: 10000 });
            } else if (agentName === 'testGenAgent') {
                 // TODO: Open test code in a new editor tab or display
                  console.log("TODO: Display generated tests:", response.result?.tests);
                 toast({ title: "Tests Generated", description: "Tests ready (TODO: Display/Save tests)." });
            } else if (agentName === 'ingestAgent') {
                 toast({ title: "Ingestion Complete", description: response.result?.message || "Knowledge ingested successfully." });
            }
        } else {
            toast({ title: `${title} Failed`, description: `Agent ${agentName} error: ${response.error}`, variant: "destructive", duration: 7000 });
        }
    };

    const handleFileAction = (actionType: 'openFile' | 'openFolder' | 'saveAs', windowId: string) => {
        const fileInputId = `${actionType}-input`;
        const saveNameInputId = 'save-as-name';
        const fileInput = document.getElementById(fileInputId) as HTMLInputElement;
        let description = "No file/folder selected.";
        let payload: any = {};

        if (actionType === 'openFile' || actionType === 'openFolder') {
            if (fileInput?.files && fileInput.files.length > 0) {
                description = `Selected: ${fileInput.files[0].name}`;
                payload = { file: fileInput.files[0] }; // TODO: Handle folder selection appropriately
                 console.log(`TODO: Implement ${actionType} logic with backend for`, payload);
            } else {
                toast({ title: `${actionType} Canceled`, description: "No file or folder selected.", variant: "destructive" });
                return; // Don't close window if nothing selected
            }
        } else if (actionType === 'saveAs') {
             const saveNameInput = document.getElementById(saveNameInputId) as HTMLInputElement;
             const filename = saveNameInput?.value || 'untitled';
             description = `Saving as: ${filename}`;
             payload = { filename };
             // TODO: Get content from active editor
             const content = "// Placeholder: Content from active editor";
             payload.content = content;
             console.log(`TODO: Implement save logic with backend for`, payload);
        }
        handleGenericAction(actionType, windowId, payload); // Pass description/payload
    };

     const handleSecretAction = (actionType: 'add' | 'delete', windowId: string) => {
        const keyInputId = 'secret-key-input';
        const valueInputId = 'secret-value-input';
        const keyInput = document.getElementById(keyInputId) as HTMLInputElement;
        const valueInput = actionType === 'add' ? document.getElementById(valueInputId) as HTMLInputElement : null;
        const key = keyInput?.value.trim();
        const value = valueInput?.value; // Don't trim value, might be intentional whitespace

        if (!key) {
            toast({ title: "Secret Action Failed", description: "Secret key cannot be empty.", variant: "destructive" });
            return;
        }
        if (actionType === 'add' && typeof value === 'undefined') { // Check if value input exists and has a value
            toast({ title: "Secret Action Failed", description: "Secret value is required to add/update.", variant: "destructive" });
            return;
        }

        // Close the manage secrets window first
        updateWindowState(windowId, { isVisible: false });

         toast({ title: `Secret Action: ${actionType}`, description: `Performing ${actionType} on key: ${key}`});

        if (actionType === 'add') {
             setSecret(key, value!).then(success => {
                 toast({ title: success ? "Secret Set" : "Set Secret Failed", description: `Key: ${key}`, variant: success ? "default" : "destructive" });
                 // TODO: Optionally re-fetch secrets list in the manageSecrets window state
             });
        } else if (actionType === 'delete') {
            deleteSecret(key).then(success => {
                 toast({ title: success ? "Secret Deleted" : "Delete Secret Failed", description: `Key: ${key}`, variant: success ? "default" : "destructive" });
                 // TODO: Optionally re-fetch secrets list
             });
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
    const handleFind = () => {
        const findInput = document.getElementById('find-input') as HTMLInputElement;
        const findText = findInput?.value;
        if (!findText) return;
        // TODO: Integrate with Monaco Editor's find widget
        // editorRef.current?.getAction('actions.find').run();
        // editorRef.current?.trigger('keyboard', 'find', { query: findText });
        console.log("TODO: Implement editor find for:", findText);
        toast({ title: "Find Action", description: "TODO: Integrate with editor find." });
    };
    const handleReplace = (replaceAll = false) => {
        const findInput = document.getElementById('find-input') as HTMLInputElement;
        const replaceInput = document.getElementById('replace-input') as HTMLInputElement;
        const findText = findInput?.value;
        const replaceText = replaceInput?.value; // Replace can be empty string
        if (!findText) return;
        // TODO: Integrate with Monaco Editor's replace functionality
        console.log(`TODO: Implement editor replace ${replaceAll ? 'all' : 'next'} for "${findText}" with "${replaceText}"`);
        toast({ title: "Replace Action", description: "TODO: Integrate with editor replace." });
    };

    // --- Get Window Name ---
     const getWindowName = (id: string): string => {
        // Simple mapping, expand as needed
        const names: Record<string, string> = {
             pluginManager: 'Plugins', findReplace: 'Find/Replace', manageSecrets: 'Secrets',
            projectVars: 'Env Vars (Project)', accountVars: 'Env Vars (Account)', git: 'Git Control',
             devops: 'DevOps Panel', languageEnv: 'Language Env', openFile: 'Open File',
            openFolder: 'Open Folder', saveAs: 'Save As', configureVault: 'Vault Config',
             commandPalette: 'Command Palette', marketplace: 'Marketplace', installVsix: 'Install VSIX/QCX',
             manageWorkflows: 'Workflows', generateCode: 'AI: Generate Code', explainCode: 'AI: Explain Code',
             refactorCode: 'AI: Refactor Code', generateTests: 'AI: Generate Tests', generateDocs: 'AI: Generate Docs',
             fixBug: 'AI: Fix Bug', scaffoldAgent: 'AI: Scaffold App', queryKnowledge: 'AI: Query Knowledge',
             ingestKnowledge: 'AI: Ingest Knowledge', manageKnowledge: 'AI: Manage Knowledge',
             configureOllama: 'Ollama Config', fineTuneModel: 'AI: Fine-tune Model',
             configureVoiceGesture: 'Voice/Gesture', profiling: 'Profiling', security: 'Security',
             telemetry: 'Telemetry', debugger: 'Debugger', settings: 'Settings', welcome: 'Welcome',
            about: 'About QuonxCoder',
        };
        return names[id] || id.charAt(0).toUpperCase() + id.slice(1);
    };


    // --- Render Logic ---
    return (
         <div className="flex flex-col h-screen overflow-hidden bg-background">
             {/* Menu Bar */}
             <RetroMenubar
                 // Pass handlers to the Menubar component
                 onPluginManagerToggle={() => toggleWindowVisibility('pluginManager')}
                 onShowOpenFile={() => toggleWindowVisibility('openFile')}
                 onShowOpenFolder={() => toggleWindowVisibility('openFolder')}
                 onShowSaveAs={() => toggleWindowVisibility('saveAs')}
                 onShowManageSecrets={() => toggleWindowVisibility('manageSecrets')}
                 onShowConfigureVault={() => toggleWindowVisibility('configureVault')}
                 onShowProjectVars={() => toggleWindowVisibility('projectVars')}
                 onShowAccountVars={() => toggleWindowVisibility('accountVars')}
                 onFind={() => toggleWindowVisibility('findReplace')}
                 onReplace={() => toggleWindowVisibility('findReplace')} // Open same window
                 onCommandPalette={() => toggleWindowVisibility('commandPalette')}
                 onToggleFullScreen={toggleFullScreen}
                 onShowMarketplace={() => toggleWindowVisibility('marketplace')}
                 onShowInstallVsix={() => toggleWindowVisibility('installVsix')}
                 onShowManageWorkflows={() => toggleWindowVisibility('manageWorkflows')}
                 onExplainCode={handleExplainCode}
                 onGenerateCode={() => toggleWindowVisibility('generateCode')}
                 onRefactorCode={handleRefactorCode}
                 onGenerateTests={handleGenerateTests}
                 onGenerateDocs={handleGenerateDocs}
                 onFixBug={handleFixBug}
                 onScaffoldAgent={() => toggleWindowVisibility('scaffoldAgent')}
                 onQueryKnowledge={() => toggleWindowVisibility('queryKnowledge')}
                 onIngestKnowledge={() => toggleWindowVisibility('ingestKnowledge')}
                 onManageKnowledge={() => toggleWindowVisibility('manageKnowledge')}
                 onConfigureOllama={() => toggleWindowVisibility('configureOllama')}
                 onFineTuneModel={() => toggleWindowVisibility('fineTuneModel')}
                 onConfigureVoiceGesture={() => toggleWindowVisibility('configureVoiceGesture')}
                 onShowProfiling={() => toggleWindowVisibility('profiling')}
                 onShowSecurity={() => toggleWindowVisibility('security')}
                 onShowTelemetry={() => toggleWindowVisibility('telemetry')}
                 onStartDebugging={() => toggleWindowVisibility('debugger')}
                 onAddDebugConfig={() => toggleWindowVisibility('debugger')} // Open debugger window
                 onShowGitCommit={() => toggleWindowVisibility('git')}
                 onGitPush={() => handleGenericAction('Git Push')}
                 onGitPull={() => handleGenericAction('Git Pull')}
                 onShowGitBranches={() => toggleWindowVisibility('git')} // Open git window
                 onShowImportGithub={() => toggleWindowVisibility('git')} // Open git window
                 onApplyIaC={() => handleGenericAction('Apply IaC')}
                 onGenerateIaC={() => handleAgentAction('Generate IaC', '', 'iacGenAgent', {prompt: 'Generate Terraform for standard Firebase setup'})} // Call Agent with default prompt
                 onStartDockerEnv={() => handleGenericAction('Start Docker Env')}
                 onDeployK8s={() => handleGenericAction('Deploy to K8s')}
                 onManageDeployments={() => toggleWindowVisibility('devops')} // Open devops window
                 onConfigureHosting={() => toggleWindowVisibility('devops')} // Open devops window
                 onShowLanguageEnv={() => toggleWindowVisibility('languageEnv')}
                 onShowSettings={() => toggleWindowVisibility('settings')}
                 onShowWelcome={() => toggleWindowVisibility('welcome')}
                 onShowDocs={() => window.open('https://github.com/your-repo/QuonxCoder#readme', '_blank')} // Link to README for now
                 onShowApiDocs={() => window.open('https://github.com/your-repo/QuonxCoder/docs/plugin-api.md', '_blank')} // Link to placeholder docs
                 onShowVoiceGestureCommands={() => toggleWindowVisibility('configureVoiceGesture')}
                 onCheckForUpdates={() => handleGenericAction('Check for Updates')}
                 onShowAbout={() => toggleWindowVisibility('about')}
             />

             {/* Main Layout */}
             <ResizablePanelGroup direction="horizontal" className="flex-grow border-t-2 border-border-dark relative"> {/* Added relative positioning */}

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
                                 {/* CodeEditor component manages Monaco integration */}
                                 <CodeEditor onEditorMount={handleEditorDidMount} />
                             </div>
                         </ResizablePanel>
                         <ResizableHandle className="retro-separator-h !h-2 bg-card" />
                         <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
                             <div className="h-full bg-card">
                                 {/* TerminalAndLogs component manages Terminal/Logs tabs */}
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
                                 {/* CollaborationPanel manages collaboration UI */}
                                 <CollaborationPanel session={collaborationSessionRef.current} />
                             </div>
                         </ResizablePanel>
                     </ResizablePanelGroup>
                 </ResizablePanel>

                {/* Floating Windows Area */}
                 {Object.values(windowStates)
                     .filter(state => state.isVisible || state.isMinimized) // Render minimized for status bar logic
                     .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)) // Sort by zIndex for correct focus rendering
                     .map((state) => {
                         // Extract props needed for RetroWindow but exclude from spread
                         const { id, title, children, className: stateClassName, initialPosition: stateInitialPos, style: stateStyle, onClose: stateOnClose, onMinimize: stateOnMinimize, isMinimized: stateIsMinimized, ...restState } = state;

                          const windowProps = {
                            // Pass key directly, NOT via spread
                             id: state.id,
                             title: getWindowName(state.id),
                             onClose: () => toggleWindowVisibility(state.id),
                             onMinimize: () => minimizeWindow(state.id),
                             style: { zIndex: state.zIndex || 10 }, // Ensure zIndex is in style
                             isMinimized: state.isMinimized,
                         };

                         // --- Define Window Content Components or Inline JSX ---
                         let content: React.ReactNode = <p className="p-2 text-sm text-muted-foreground">Window content for '{state.id}' not implemented yet.</p>;
                         let className = "w-80 h-64"; // Default size
                         let initialPosition = { top: `${20 + Math.random() * 30}%`, left: `${30 + Math.random() * 40}%` }; // Randomize slightly

                         // Specific content and className overrides based on window id
                         switch (state.id) {
                            case 'pluginManager':
                                content = <PluginManagerContent />;
                                className = "w-96 h-[400px]";
                                break;
                             case 'openFile':
                                className = "w-96 h-auto";
                                content = (
                                     <div className="p-4 flex flex-col gap-2">
                                        <p className="text-sm">Select a file to open:</p>
                                        <Input id="openFile-input" type="file" className="retro-input text-xs h-8" />
                                        <div className="flex justify-end gap-2 mt-2">
                                             <Button className="retro-button" size="sm" onClick={windowProps.onClose}>Cancel</Button>
                                             <Button className="retro-button" size="sm" onClick={() => handleFileAction('openFile', state.id)}>Open</Button>
                                         </div>
                                     </div>
                                 );
                                break;
                             case 'openFolder':
                                className = "w-96 h-auto";
                                content = (
                                     <div className="p-4 flex flex-col gap-2">
                                         <p className="text-sm">Select a folder to open:</p>
                                         {/* Input type=file with webkitdirectory is non-standard */}
                                         <Input id="openFolder-input" type="file" {...{ webkitdirectory: "", directory: "" } as any} className="retro-input h-7 text-xs" />
                                         <div className="flex justify-end gap-2 mt-2">
                                             <Button className="retro-button" size="sm" onClick={windowProps.onClose}>Cancel</Button>
                                             <Button className="retro-button" size="sm" onClick={() => handleFileAction('openFolder', state.id)}>Open Folder</Button>
                                         </div>
                                     </div>
                                 );
                                break;
                             case 'saveAs':
                                className = "w-96 h-auto";
                                content = (
                                     <div className="p-4 flex flex-col gap-2">
                                         <Label htmlFor="save-as-name" className="text-sm">Save As:</Label>
                                         <Input id="save-as-name" type="text" defaultValue="untitled.js" className="retro-input h-7 text-xs" />
                                         <div className="flex justify-end gap-2 mt-2">
                                             <Button className="retro-button" size="sm" onClick={windowProps.onClose}>Cancel</Button>
                                             <Button className="retro-button" size="sm" onClick={() => handleFileAction('saveAs', state.id)}>Save</Button>
                                         </div>
                                     </div>
                                 );
                                break;
                            case 'manageSecrets':
                                className = "w-[400px] h-[300px]";
                                // TODO: Implement actual secrets fetching and display
                                content = (
                                    <div className="w-full h-full bg-card p-2 text-sm">
                                        <p className="mb-1 font-semibold flex items-center gap-1"><FileKey size={14} />Project Secrets</p>
                                        <ScrollArea className="h-32 retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                            {/* TODO: Fetch and list keys */}
                                            <ul><li>API_KEY: ******** (Placeholder)</li></ul>
                                        </ScrollArea>
                                        <div className="flex gap-2 mt-2">
                                            <Input id="secret-key-input" placeholder="Secret Key" className="retro-input h-7 text-xs flex-grow" />
                                            <Input id="secret-value-input" type="password" placeholder="Secret Value (required to add)" className="retro-input h-7 text-xs flex-grow" />
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <Button className="retro-button" size="sm" onClick={() => handleSecretAction('add', state.id)}>Add/Update</Button>
                                            <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleSecretAction('delete', state.id)}>Delete</Button>
                                        </div>
                                    </div>
                                );
                                break;
                             case 'configureVault':
                                className = "w-80 h-auto";
                                content = <SimpleDialogContent title="Configure Secrets Vault" onOk={() => handleGenericAction('Save Vault Config', state.id)} showCancelButton onCancel={windowProps.onClose}><p>Vault configuration options (TODO).</p></SimpleDialogContent>;
                                break;
                             case 'projectVars':
                                className = "w-[450px] h-[350px]";
                                content = <SimpleDialogContent title="Project Environment Variables" onOk={() => handleGenericAction('Save Project Vars', state.id)} showCancelButton onCancel={windowProps.onClose}><p>List and manage project vars (TODO).</p></SimpleDialogContent>;
                                break;
                             case 'accountVars':
                                className = "w-[450px] h-[350px]";
                                content = <SimpleDialogContent title="Account Environment Variables" onOk={() => handleGenericAction('Save Account Vars', state.id)} showCancelButton onCancel={windowProps.onClose}><p>List and manage account vars (TODO).</p></SimpleDialogContent>;
                                break;
                             case 'findReplace':
                                className = "w-80 h-auto";
                                content = (
                                    <div className="p-2 flex flex-col gap-1">
                                         <div className="flex gap-1 items-center">
                                             <Label htmlFor="find-input" className="text-xs w-12 shrink-0">Find:</Label>
                                             <Input id="find-input" type="text" className="retro-input h-6 text-xs flex-grow" defaultValue={state.findText} onChange={(e) => updateWindowState(state.id, { findText: e.target.value })} />
                                         </div>
                                         <div className="flex gap-1 items-center">
                                             <Label htmlFor="replace-input" className="text-xs w-12 shrink-0">Replace:</Label>
                                             <Input id="replace-input" type="text" className="retro-input h-6 text-xs flex-grow" defaultValue={state.replaceText} onChange={(e) => updateWindowState(state.id, { replaceText: e.target.value })} />
                                         </div>
                                         <div className="flex justify-end gap-1 mt-1">
                                             <Button className="retro-button !px-2 !py-0.5" size="sm" onClick={handleFind}>Next</Button>
                                             <Button className="retro-button !px-2 !py-0.5" size="sm" onClick={() => handleReplace(false)}>Replace</Button>
                                             <Button className="retro-button !px-2 !py-0.5" size="sm" onClick={() => handleReplace(true)}>All</Button>
                                         </div>
                                     </div>
                                );
                                break;
                            case 'commandPalette':
                                className = "w-[500px] h-auto";
                                content = <SimpleDialogContent title="Command Palette"><Input placeholder="Enter command..." className="retro-input h-7 w-full mb-1" autoFocus /><p>Command list (TODO)</p></SimpleDialogContent>;
                                break;
                             case 'marketplace':
                                className = "w-[600px] h-[450px]";
                                content = <SimpleDialogContent title="Plugin Marketplace"><p>Marketplace UI (TODO)</p></SimpleDialogContent>;
                                break;
                             case 'installVsix':
                                className = "w-96 h-auto";
                                content = <SimpleDialogContent title="Install from VSIX/QCX" onOk={() => handleGenericAction('Install Plugin File', state.id)} showCancelButton onCancel={windowProps.onClose}><Input type="file" accept=".vsix,.qcx" className="retro-input text-xs h-8 mt-1" /><p>Install button (TODO)</p></SimpleDialogContent>;
                                break;
                             case 'manageWorkflows':
                                className = "w-[500px] h-[400px]";
                                content = <SimpleDialogContent title="Manage Workflows"><p>Workflow list and management (TODO)</p></SimpleDialogContent>;
                                break;
                            case 'generateCode':
                                className = "w-[400px] h-auto";
                                content = (
                                    <div className="p-2 flex flex-col gap-2">
                                        <Label htmlFor="gen-code-prompt" className="flex items-center gap-1 text-sm"><Sparkles size={14} />Generate Code Prompt:</Label>
                                        <Textarea id="gen-code-prompt" placeholder="e.g., Create a React component for a retro modal dialog using shadcn/ui" className="retro-input h-24 text-xs" defaultValue={state.prompt} onChange={(e) => updateWindowState(state.id, { prompt: e.target.value })} />
                                        <Button className="retro-button self-end" size="sm" onClick={() => handleAgentAction("Generate Code", state.id, 'codeGenAgent', { prompt: state.prompt })}>Generate</Button>
                                    </div>
                                );
                                break;
                            case 'explainCode':
                                className = "w-[450px] h-auto";
                                content = (
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><Lightbulb size={14} />Explain Selected Code</p>
                                        <ScrollArea className="h-32 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                            <pre><code>{state.codeContext || "// No code selected"}</code></pre>
                                        </ScrollArea>
                                        <Button className="retro-button self-end" size="sm" onClick={() => handleAgentAction("Explain Code", state.id, 'explainCodeAgent', { code: state.codeContext })}>Explain</Button>
                                    </div>
                                );
                                break;
                            case 'refactorCode':
                                className = "w-[450px] h-auto";
                                content = (
                                     <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><Recycle size={14} />Refactor Selected Code</p>
                                         <ScrollArea className="h-24 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                             <pre><code>{state.codeContext || "// No code selected"}</code></pre>
                                         </ScrollArea>
                                         <Label htmlFor="refactor-instructions" className="text-xs mt-1">Instructions (Optional):</Label>
                                         <Textarea id="refactor-instructions" placeholder="e.g., Improve readability, convert to functional component..." className="retro-input h-20 text-xs" defaultValue={state.prompt} onChange={(e) => updateWindowState(state.id, { prompt: e.target.value })} />
                                         <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleAgentAction("Refactor Code", state.id, 'refactorAgent', { code: state.codeContext, instructions: state.prompt })}>Refactor</Button>
                                     </div>
                                 );
                                break;
                             case 'generateTests':
                                className = "w-[400px] h-auto";
                                content = (
                                     <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><TestTubeDiagonal size={14} />Generate Unit Tests</p>
                                         <ScrollArea className="h-20 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                             <pre><code>{state.codeContext || "// Select code or file to generate tests for"}</code></pre>
                                         </ScrollArea>
                                         <Label htmlFor="test-framework" className="text-xs mt-1">Test Framework (Optional):</Label>
                                         <select id="test-framework" className="retro-input h-7 text-xs">
                                            <option value="">Auto-detect</option>
                                             <option value="jest">Jest</option><option value="vitest">Vitest</option><option value="pytest">Pytest</option>
                                         </select>
                                         <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleAgentAction("Generate Tests", state.id, 'testGenAgent', { code: state.codeContext, framework: (document.getElementById('test-framework') as HTMLSelectElement)?.value })}>Generate</Button>
                                     </div>
                                 );
                                break;
                            case 'generateDocs':
                                className = "w-[400px] h-auto";
                                content = (
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><BookOpen size={14} />Generate Documentation</p>
                                         <ScrollArea className="h-24 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                             <pre><code>{state.codeContext || "// Select code or file to generate docs for"}</code></pre>
                                         </ScrollArea>
                                         <Label htmlFor="doc-format" className="text-xs mt-1">Format (Optional):</Label>
                                         <select id="doc-format" className="retro-input h-7 text-xs">
                                            <option value="">Auto-detect</option>
                                             <option value="jsdoc">JSDoc</option><option value="tsdoc">TSDoc</option>
                                             <option value="docstring">Python Docstring</option>
                                             {/* Add others */}
                                         </select>
                                         <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleAgentAction("Generate Docs", state.id, 'docGenAgent', { code: state.codeContext, format: (document.getElementById('doc-format') as HTMLSelectElement)?.value })}>Generate</Button>
                                     </div>
                                );
                                break;
                            case 'fixBug':
                                className = "w-[450px] h-auto";
                                content = (
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><Wrench size={14} />Fix Bug with AI</p>
                                         <ScrollArea className="h-20 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                             <pre><code>{state.codeContext || "// Select code with the bug"}</code></pre>
                                         </ScrollArea>
                                         <Label htmlFor="bug-description" className="text-xs mt-1">Bug Description:</Label>
                                         <Textarea id="bug-description" placeholder="Describe the bug and expected behavior..." className="retro-input h-20 text-xs" defaultValue={state.prompt} onChange={(e) => updateWindowState(state.id, { prompt: e.target.value })}/>
                                         <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleAgentAction("Fix Bug", state.id, 'fixBugAgent', { code: state.codeContext, description: state.prompt })}>Attempt Fix</Button>
                                     </div>
                                );
                                break;
                            case 'scaffoldAgent':
                                className = "w-[500px] h-auto";
                                content = (
                                    <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><BrainCircuit size={14} />Scaffold Application / AI Agent</p>
                                        <Label htmlFor="scaffold-description" className="text-xs">Description:</Label>
                                        <Textarea id="scaffold-description" placeholder="e.g., A simple Express.js API for managing tasks, with routes for GET, POST, DELETE. Use TypeScript." className="retro-input h-24 text-xs" defaultValue={state.prompt} onChange={(e) => updateWindowState(state.id, { prompt: e.target.value })}/>
                                        <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleAgentAction("Scaffold Application", state.id, 'scaffoldAgent', { description: state.prompt })}>Scaffold</Button>
                                    </div>
                                );
                                break;
                             case 'queryKnowledge':
                                className = "w-[450px] h-auto";
                                content = (
                                     <div className="p-2 flex flex-col gap-2">
                                        <p className="text-sm font-semibold flex items-center gap-1"><FileQuestion size={14} />Query Knowledge Base (RAG)</p>
                                         <Label htmlFor="query-input" className="text-xs">Query:</Label>
                                         <Input id="query-input" placeholder="Ask about ingested knowledge..." className="retro-input h-7 text-xs" defaultValue={state.prompt} onChange={(e) => updateWindowState(state.id, { prompt: e.target.value })} />
                                         {/* TODO: Add options for collection selection? */}
                                         <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleAgentAction("Query Knowledge", state.id, 'ragAgent', { prompt: state.prompt })}>Query</Button>
                                     </div>
                                 );
                                break;
                             case 'ingestKnowledge':
                                className = "w-[500px] h-auto";
                                content = (
                                    <div className="p-2 flex flex-col gap-2">
                                         <p className="text-sm font-semibold flex items-center gap-1"><FileInput size={14} />Ingest Knowledge (RAG)</p>
                                         <Label htmlFor="knowledge-text" className="text-xs">Text Content:</Label>
                                         <Textarea id="knowledge-text" placeholder="Paste text content here..." className="retro-input h-20 text-xs" defaultValue={state.codeContext} onChange={(e) => updateWindowState(state.id, { codeContext: e.target.value })} />
                                         <Label htmlFor="knowledge-source" className="text-xs mt-1">Source (Optional URL/File):</Label>
                                         <Input id="knowledge-source" type="text" placeholder="URL or File Path Identifier..." className="retro-input h-7 text-xs" defaultValue={state.knowledgeSource} onChange={(e) => updateWindowState(state.id, { knowledgeSource: e.target.value })}/>
                                         {/* TODO: Add file input button to load text area */}
                                         <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleAgentAction("Ingest Knowledge", state.id, 'ingestAgent', { text: state.codeContext, source: state.knowledgeSource })}>Ingest</Button>
                                     </div>
                                 );
                                break;
                             case 'manageKnowledge':
                                className = "w-[550px] h-[400px]";
                                content = <SimpleDialogContent title="Manage Knowledge Base"><p>List/delete indexed documents (TODO)</p></SimpleDialogContent>; // Placeholder
                                break;
                            case 'configureOllama':
                                className = "w-80 h-auto";
                                // TODO: Fetch current values or use defaults from backend/env
                                content = (
                                     <div className="p-4 flex flex-col gap-2">
                                        <p className="text-sm font-semibold">Configure Ollama</p>
                                         <Label htmlFor="ollama-host" className="text-xs">Ollama Host URL:</Label>
                                         <Input id="ollama-host" defaultValue={"http://localhost:11434"} className="retro-input h-7 text-xs" />
                                         <Label htmlFor="ollama-model" className="text-xs mt-1">Default Model:</Label>
                                         <Input id="ollama-model" defaultValue={"llama3"} className="retro-input h-7 text-xs" />
                                         <Label htmlFor="ollama-embed-model" className="text-xs mt-1">Embedding Model:</Label>
                                         <Input id="ollama-embed-model" defaultValue={"nomic-embed-text"} className="retro-input h-7 text-xs" />
                                        <div className="flex justify-end gap-2 mt-2">
                                             <Button className="retro-button" size="sm" onClick={windowProps.onClose}>Cancel</Button>
                                             <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Save Ollama Config", state.id)}>Save</Button>
                                         </div>
                                     </div>
                                 );
                                break;
                            case 'fineTuneModel':
                                className = "w-[500px] h-auto";
                                content = <SimpleDialogContent title="Fine-Tune AI Model"><p>Fine-tuning options (Planned/TODO)</p></SimpleDialogContent>; // Placeholder
                                break;
                             case 'configureVoiceGesture':
                                className = "w-[400px] h-auto";
                                content = <SimpleDialogContent title="Configure Voice/Gesture"><p>Mapping UI (Planned/TODO)</p></SimpleDialogContent>; // Placeholder
                                break;
                             case 'profiling':
                                className = "w-[550px] h-[400px]";
                                content = <SimpleDialogContent title="Performance Profiling"><p>Display profiling data (Connects to Observability Service - TODO)</p></SimpleDialogContent>; // Placeholder
                                break;
                             case 'security':
                                className = "w-[550px] h-[400px]";
                                content = <SimpleDialogContent title="Security Analysis"><p>Display SAST results (Connects to Agent Coordinator - TODO)</p></SimpleDialogContent>; // Placeholder
                                break;
                             case 'telemetry':
                                className = "w-[550px] h-[400px]";
                                content = <SimpleDialogContent title="Telemetry Dashboard"><p>Display telemetry charts (Connects to Observability Service - TODO)</p></SimpleDialogContent>; // Placeholder
                                break;
                             case 'debugger':
                                className = "w-[600px] h-[450px]";
                                content = <SimpleDialogContent title="Debugger"><p>Debugger UI integration (Planned/TODO)</p></SimpleDialogContent>; // Placeholder
                                break;
                            case 'git':
                                className = "w-[500px] h-[400px]";
                                // TODO: Implement actual Git interaction via backend service
                                content = <SimpleDialogContent title="Git Control"><p>Git controls (Commit, Branch, Remotes, Import) - TODO</p></SimpleDialogContent>; // Placeholder
                                break;
                             case 'devops':
                                className = "w-[500px] h-[400px]";
                                // TODO: Implement DevOps actions via backend services
                                content = <SimpleDialogContent title="DevOps Panel"><p>DevOps controls (IaC, Docker, K8s, Hosting) - TODO</p></SimpleDialogContent>; // Placeholder
                                break;
                             case 'languageEnv':
                                className = "w-[450px] h-[350px]";
                                // TODO: Interact with Nix backend service
                                content = <SimpleDialogContent title="Language Environment (Nix)"><p>Manage Nix dependencies (TODO)</p></SimpleDialogContent>; // Placeholder
                                break;
                             case 'settings':
                                className = "w-[600px] h-[450px]";
                                // TODO: Implement settings UI and persistence
                                content = <SimpleDialogContent title="Settings"><p>Settings panels (Editor, Theme, AI, etc.) - TODO</p></SimpleDialogContent>; // Placeholder
                                break;
                             case 'welcome':
                                className = "w-[500px] h-[350px]";
                                content = <SimpleDialogContent title="Welcome to QuonxCoder!"><p>Quick links:<br/>- Open Folder<br/>- Manage Plugins<br/>- Read Docs (TODO)</p></SimpleDialogContent>;
                                break;
                             case 'about':
                                className = "w-[400px] h-[300px]";
                                content = <SimpleDialogContent title="About QuonxCoder"><p>Version: 0.9.0 (Planning Phase)<br/>An AI-native IDE with a retro twist.<br/>More details soon!</p></SimpleDialogContent>;
                                break;
                         }

                         return (
                            // Pass key directly to RetroWindow
                            <RetroWindow
                                 key={state.id}
                                 id={state.id}
                                 title={getWindowName(state.id)}
                                 onClose={() => toggleWindowVisibility(state.id)}
                                 onMinimize={() => minimizeWindow(state.id)}
                                 style={{ zIndex: state.zIndex || 10 }} // Ensure zIndex is in style
                                 isMinimized={state.isMinimized}
                                 className={cn(className)} // Apply specific classNames
                                 initialPosition={initialPosition} // Apply initial position
                             >
                                 {content}
                             </RetroWindow>
                         );
                     })}


             </ResizablePanelGroup>

             {/* Status Bar */}
             <div className="h-7 border-t-2 border-border-dark flex items-center justify-between text-xs bg-card shrink-0"> {/* Ensure status bar doesn't shrink */}
                 <div className="px-2 flex items-center gap-2">
                     <span>Project: MyProject</span>
                     <span className="flex items-center gap-1"><GitBranch size={12} /> main</span>
                     {/* TODO: Add more dynamic status indicators */}
                     <span className="text-green-600 flex items-center gap-1"><BrainCircuit size={12} /> AI Ready</span>
                 </div>
                 <div className="flex items-center px-2 space-x-1">
                     {Object.values(windowStates)
                         .filter(state => state.isMinimized)
                         .map(state => (
                             <button key={state.id} className="retro-minimized-tab" onClick={() => restoreWindow(state.id)} title={`Restore ${getWindowName(state.id)}`}>
                                 {getWindowName(state.id)}
                             </button>
                         ))}
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
