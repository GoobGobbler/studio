'use client'; // Required for hooks and event handlers

import * as React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
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
    // Remove direct Ollama functions if not needed, rely on requestAgentExecution
    // ollamaChatCompletion,
    // ollamaCodeGeneration,
    // ollamaExplainCode,
    // ollamaRefactorCode,
    // ollamaGenerateTests,
    // ollamaGenerateDocs,
    // ollamaFixBug,
    // ollamaScaffoldApp,
    // ollamaRAGQuery,
    // ollamaIngestKnowledge,
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
    // Specific states for managing secrets list
    secretsList?: { key: string }[];
    secretsLoading?: boolean;
    // Specific state for Env Vars
    envVars?: { name: string, value: string }[];
    envVarsLoading?: boolean;
    // Specific state for Git status
    gitStatus?: string; // Placeholder for fetched status
    gitLoading?: boolean;
    // Debugger state
    debuggerState?: any; // Replace with actual type
    debuggerLoading?: boolean;
    // Profiling data
    profilingData?: any;
    profilingLoading?: boolean;
    // Security data
    securityData?: any;
    securityLoading?: boolean;
    // Telemetry data
    telemetryData?: any;
    telemetryLoading?: boolean;
    // ... other specific states
};


// --- Main Page Component ---
export default function Home() {
    const { toast } = useToast();

    // --- State Management ---
    const [windowStates, setWindowStates] = React.useState<Record<string, WindowState>>({
        // Initialize window states (mostly hidden by default)
        pluginManager: { id: 'pluginManager', isVisible: false, isMinimized: false, zIndex: 10 },
        openFile: { id: 'openFile', isVisible: false, isMinimized: false, zIndex: 10 },
        openFolder: { id: 'openFolder', isVisible: false, isMinimized: false, zIndex: 10 },
        saveAs: { id: 'saveAs', isVisible: false, isMinimized: false, zIndex: 10 },
        manageSecrets: { id: 'manageSecrets', isVisible: false, isMinimized: false, zIndex: 10, secretsList: [], secretsLoading: false },
        configureVault: { id: 'configureVault', isVisible: false, isMinimized: false, zIndex: 10 },
        projectVars: { id: 'projectVars', isVisible: false, isMinimized: false, zIndex: 10, envVars: [], envVarsLoading: false },
        accountVars: { id: 'accountVars', isVisible: false, isMinimized: false, zIndex: 10, envVars: [], envVarsLoading: false },
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
        profiling: { id: 'profiling', isVisible: false, isMinimized: false, zIndex: 10, profilingData: null, profilingLoading: false },
        security: { id: 'security', isVisible: false, isMinimized: false, zIndex: 10, securityData: null, securityLoading: false },
        telemetry: { id: 'telemetry', isVisible: false, isMinimized: false, zIndex: 10, telemetryData: null, telemetryLoading: false },
        debugger: { id: 'debugger', isVisible: false, isMinimized: false, zIndex: 10, debuggerState: null, debuggerLoading: false },
        git: { id: 'git', isVisible: false, isMinimized: false, zIndex: 10, gitStatus: '', gitLoading: false },
        devops: { id: 'devops', isVisible: false, isMinimized: false, zIndex: 10 },
        languageEnv: { id: 'languageEnv', isVisible: false, isMinimized: false, zIndex: 10 },
        settings: { id: 'settings', isVisible: false, isMinimized: false, zIndex: 10 },
        welcome: { id: 'welcome', isVisible: false, isMinimized: false, zIndex: 10 },
        about: { id: 'about', isVisible: false, isMinimized: false, zIndex: 10 },
    });

    const nextZIndex = React.useRef(10); // Starting z-index

    // Refs for components that need interaction (Editor, Terminal)
    const editorRef = React.useRef<any>(null); // Monaco editor instance ref
    const terminalRef = React.useRef<any>(null); // xterm.js instance ref
    const collaborationSessionRef = React.useRef<CollaborationSession | null>(null);
    const monacoBindingRef = React.useRef<any>(null); // Ref for y-monaco binding
    const [activeEditorFile, setActiveEditorFile] = React.useState<string | null>(null); // Track open file path
    const [codeEditorContent, setCodeEditorContent] = React.useState<string>(""); // Track current code

    // --- Effects ---

    // Update editor content when active file changes
    React.useEffect(() => {
        if (activeEditorFile) {
            // Fetch content from backend/local state based on activeEditorFile
            console.log(`TODO: Fetch content for ${activeEditorFile}`);
            const fetchedContent = `// Content for ${activeEditorFile}\nconsole.log('Loaded!');`;
            setCodeEditorContent(fetchedContent);
            // TODO: Potentially switch Yjs document binding if necessary
            // setupCollaborationBinding(editorRef.current?.getModel(), activeEditorFile);
        } else {
            setCodeEditorContent("// No file open");
        }
    }, [activeEditorFile]);

    // Initialize Monaco Editor
    const handleEditorDidMount = (editor: any, monaco: any) => {
        console.log("Monaco Editor Mounted");
        editorRef.current = editor;
        // Trigger initial collaboration binding setup if a session exists
        // setupCollaborationBinding(editor.getModel());
    };

    // Initialize Collaboration
    React.useEffect(() => {
        // Connect to a default document or based on workspace state
        const initialDocId = 'global-doc'; // Or load from workspace state
        const session = connectCollaboration(initialDocId);
        collaborationSessionRef.current = session;

        if (session) {
            // Set local user info (should be dynamic)
            setLocalAwarenessState(session.awareness, { user: { name: `User_${Math.random().toString(36).substring(7)}`, color: `#${Math.floor(Math.random() * 16777215).toString(16)}` } });

            // Example listener for awareness changes
            const unsubscribeAwareness = onAwarenessChange(session.awareness, (changes) => {
                console.log('Awareness changed:', changes, getAwarenessStates(session.awareness));
                // TODO: Update UI based on changes (e.g., render user avatars/cursors)
            });

            // Example listener for document changes (if not using Monaco binding)
            const yText = getSharedText(session.doc, 'content'); // Use a consistent key
            const docObserver = () => {
                // If not using Monaco, update local editor state from Yjs
                if (!monacoBindingRef.current) {
                    // Be careful with cursor position and potential loops here
                    // setCodeEditorContent(yText.toString());
                }
            };
            yText.observe(docObserver);

            // TODO: Setup editor binding if editor is ready and a file is active
            // if (editorRef.current?.getModel() && activeEditorFile) {
            //    setupCollaborationBinding(editorRef.current.getModel(), activeEditorFile);
            // }

            return () => {
                unsubscribeAwareness();
                yText.unobserve(docObserver);
                session.destroy();
                collaborationSessionRef.current = null;
            };
        }
    }, []); // Run once on mount

    // Function to setup Monaco binding (needs Yjs doc key based on file)
    // const setupCollaborationBinding = (textModel: monaco.editor.ITextModel, docKey: string = 'content') => {
    //     if (monacoBindingRef.current) {
    //         monacoBindingRef.current.destroy(); // Destroy existing binding
    //         monacoBindingRef.current = null;
    //     }
    //     if (collaborationSessionRef.current && textModel && editorRef.current) {
    //         const yText = getSharedText(collaborationSessionRef.current.doc, docKey); // Key based on file/context
    //         monacoBindingRef.current = new MonacoBinding(
    //             yText,
    //             textModel,
    //             new Set([editorRef.current]),
    //             collaborationSessionRef.current.awareness
    //         );
    //         console.log(`Monaco-Yjs binding created for doc key: ${docKey}`);
    //     }
    // };


    // Initialize Terminal (xterm.js) - Placeholder
    React.useEffect(() => {
        console.log("TODO: Initialize xterm.js in TerminalAndLogs and connect to backend shell.");
        // Example: terminalRef.current = new Terminal(...)
        return () => {
            // terminalRef.current?.dispose();
        };
    }, []);

    // Connect Logs panel to backend streams - Placeholder
    React.useEffect(() => {
        console.log("TODO: Connect Logs panel to backend log stream (SSE or WebSocket).");
        let logSource: EventSource | WebSocket | null = null;
        // try {
        //      logSource = new EventSource('/api/proxy/observability/logs');
        //      logSource.onmessage = (event) => {
        //         // Append event.data to logs view state in TerminalAndLogs
        //         console.log("Log Received:", event.data);
        //      };
        //      logSource.onerror = (event) => {
        //         console.warn("Log stream connection closed or encountered an error.", event);
        //         logSource?.close();
        //     };
        // } catch (error) {
        //     console.warn("Could not establish log stream connection:", error);
        // }
        return () => {
            // logSource?.close();
        };
    }, []);


    // --- Window Management Functions ---
    const getNextZIndex = () => {
        nextZIndex.current += 1;
        return nextZIndex.current;
    };

    const updateWindowState = (id: string, updates: Partial<WindowState>) => {
        setWindowStates(prev => {
            const newState = { ...(prev[id] || { id, isVisible: false, isMinimized: false, zIndex: 0 }), ...updates };
            return { ...prev, [id]: newState };
        });
    };

    // Helper to fetch data when a window becomes visible
    const fetchDataForWindow = async (id: string) => {
        switch (id) {
            case 'manageSecrets':
                updateWindowState(id, { secretsLoading: true });
                const keys = await listSecretKeys();
                updateWindowState(id, {
                    secretsList: keys?.map(key => ({ key })) || [],
                    secretsLoading: false,
                    // Ensure zIndex is preserved or updated
                    zIndex: windowStates[id]?.zIndex || getNextZIndex(),
                    isVisible: true // Keep it visible after fetch
                });
                break;
            case 'projectVars':
                // TODO: Fetch project-specific env vars
                console.log("TODO: Fetch Project Env Vars");
                 updateWindowState(id, { envVarsLoading: true, zIndex: getNextZIndex(), isVisible: true });
                 await new Promise(r => setTimeout(r, 500)); // Simulate fetch
                 updateWindowState(id, { envVars: [{name: 'API_URL', value: '...'}], envVarsLoading: false });
                break;
             case 'accountVars':
                // TODO: Fetch account-wide env vars
                console.log("TODO: Fetch Account Env Vars");
                 updateWindowState(id, { envVarsLoading: true, zIndex: getNextZIndex(), isVisible: true });
                 await new Promise(r => setTimeout(r, 500)); // Simulate fetch
                 updateWindowState(id, { envVars: [{name: 'THEME', value: 'retro'}], envVarsLoading: false });
                 break;
            case 'git':
                // TODO: Fetch Git status
                console.log("TODO: Fetch Git Status");
                updateWindowState(id, { gitLoading: true, zIndex: getNextZIndex(), isVisible: true });
                await new Promise(r => setTimeout(r, 700)); // Simulate fetch
                 updateWindowState(id, { gitStatus: "On branch main\nChanges not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)\n\n\tmodified:   src/app/page.tsx\n", gitLoading: false });
                 break;
             case 'debugger':
                console.log("TODO: Fetch/Initialize Debugger State");
                updateWindowState(id, { debuggerLoading: true, zIndex: getNextZIndex(), isVisible: true });
                await new Promise(r => setTimeout(r, 600));
                 updateWindowState(id, { debuggerState: { status: 'Idle', breakpoints: [] }, debuggerLoading: false });
                 break;
             case 'profiling':
                 console.log("TODO: Fetch Profiling Data");
                 updateWindowState(id, { profilingLoading: true, zIndex: getNextZIndex(), isVisible: true });
                 await new Promise(r => setTimeout(r, 800));
                 updateWindowState(id, { profilingData: { frontend: { bundleSize: '1.2MB' }, backend: { avgLatency: '150ms' } }, profilingLoading: false });
                 break;
             case 'security':
                 console.log("TODO: Fetch Security Scan Results");
                 updateWindowState(id, { securityLoading: true, zIndex: getNextZIndex(), isVisible: true });
                 await new Promise(r => setTimeout(r, 1000));
                 updateWindowState(id, { securityData: { sast: { critical: 0, high: 1 }, dependencies: { vulnerable: 2 } }, securityLoading: false });
                 break;
            case 'telemetry':
                console.log("TODO: Fetch Telemetry Data");
                 updateWindowState(id, { telemetryLoading: true, zIndex: getNextZIndex(), isVisible: true });
                 await new Promise(r => setTimeout(r, 750));
                 updateWindowState(id, { telemetryData: { errorsLastHour: 5, avgApiResponseTime: '200ms' }, telemetryLoading: false });
                 break;
             // Add cases for other data-dependent windows (Marketplace, Workflows, Knowledge, etc.)
             default:
                // Just bring to front if no data fetching is needed
                updateWindowState(id, { zIndex: getNextZIndex(), isVisible: true });
                break;
        }
    };


    const toggleWindowVisibility = (id: string, initialState: Partial<WindowState> = {}) => {
        setWindowStates(prev => {
            const currentState = prev[id];
            let newState: WindowState;

            if (!currentState || !currentState.isVisible) { // Opening or first time
                newState = {
                    id,
                    isVisible: true, // Set to visible first
                    isMinimized: false,
                    zIndex: getNextZIndex(),
                    ...initialState // Apply initial state if provided
                };
                 // Defer data fetching until after the state update to make it visible
                 setTimeout(() => fetchDataForWindow(id), 0);
             } else { // Closing
                newState = {
                    ...currentState,
                    isVisible: false,
                    // isMinimized: false, // Don't change minimized state on close toggle
                };
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
            const newState = {
                ...currentState,
                isVisible: true,
                isMinimized: false,
                zIndex: getNextZIndex()
            };
            // Fetch data again if needed when restoring
             setTimeout(() => fetchDataForWindow(id), 0);
             return { ...prev, [id]: newState };
        });
    };


    // --- Menu/Action Handlers ---
    const handleGenericAction = (title: string, idToToggle?: string, payload?: any) => {
        const description = `Action: ${title}. Payload: ${JSON.stringify(payload) || 'N/A'}. Needs implementation.`;
        toast({ title: `Action: ${title}`, description });
        console.log(`Action triggered: ${title}`, payload || '');
        if (idToToggle) {
            // Optionally close the window that triggered the action, unless it needs to stay open (e.g., Git panel after pull)
            if (idToToggle !== 'git') { // Keep Git panel open after actions
                 updateWindowState(idToToggle, { isVisible: false });
            } else {
                // Refresh Git status after action
                fetchDataForWindow('git');
            }
        }
    };

    // Function to get selected code from Monaco (placeholder)
    const getSelectedCode = (): string => {
        try {
            return editorRef.current?.getModel()?.getValueInRange(editorRef.current?.getSelection()) || "";
        } catch (error) {
             console.warn("Error getting selected code:", error);
             return "";
        }
    };
     // Function to get all code from Monaco (placeholder)
     const getAllCode = (): string => {
         try {
             return editorRef.current?.getModel()?.getValue() || "";
         } catch (error) {
             console.warn("Error getting all code:", error);
             return codeEditorContent; // Fallback to local state
         }
     };


    const handleExplainCode = () => {
        const code = getSelectedCode() || getAllCode(); // Use selection or all code
        if (!code) {
            toast({ title: "Explain Code", description: "Editor is empty or no code selected.", variant: "destructive" });
            return;
        }
        toggleWindowVisibility('explainCode', { codeContext: code }); // Pass code to window state
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
        const code = getSelectedCode() || getAllCode();
        if (!code) {
            toast({ title: "Generate Tests", description: "Editor is empty or no code selected.", variant: "destructive" });
            return;
        }
        toggleWindowVisibility('generateTests', { codeContext: code });
    };

    const handleGenerateDocs = () => {
        const code = getSelectedCode() || getAllCode();
        if (!code) {
            toast({ title: "Generate Docs", description: "Editor is empty or no code selected.", variant: "destructive" });
            return;
        }
        toggleWindowVisibility('generateDocs', { codeContext: code });
    };

    const handleFixBug = () => {
        const code = getSelectedCode() || getAllCode();
        if (!code) {
            toast({ title: "Fix Bug", description: "Select code containing the bug or use the whole file.", variant: "destructive" });
            return;
        }
        toggleWindowVisibility('fixBug', { codeContext: code });
    };


    // Centralized Agent Action Handler
    const handleAgentAction = async (title: string, idToClose: string, agentName: string, payload: any = {}) => {
        updateWindowState(idToClose, { isVisible: false }); // Close window first
        toast({ title: title, description: `Calling Agent '${agentName}'... (Payload: ${JSON.stringify(payload).substring(0,50)}...)` });
        console.log("Calling agent:", agentName, "with payload:", payload);

        // --- Input validation moved inside this function ---
        if ( (agentName === 'codeGenAgent' || agentName === 'scaffoldAgent' || agentName === 'ragAgent' || agentName === 'iacGenAgent') && !payload.prompt && !payload.description && !payload.queryText) {
            toast({ title: `${title} Failed`, description: `Prompt or description is required for ${agentName}.`, variant: "destructive" });
            console.error(`Validation failed for ${agentName}: Missing prompt/description.`);
            return;
        }
        if ( (agentName === 'explainCodeAgent' || agentName === 'refactorAgent' || agentName === 'testGenAgent' || agentName === 'docGenAgent' || agentName === 'fixBugAgent') && !payload.code) {
             toast({ title: `${title} Failed`, description: `Code context is required for ${agentName}.`, variant: "destructive" });
             console.error(`Validation failed for ${agentName}: Missing code context.`);
             return;
        }
        if ( agentName === 'ingestAgent' && !payload.text) {
             toast({ title: `${title} Failed`, description: `Text content is required for ${agentName}.`, variant: "destructive" });
             console.error(`Validation failed for ${agentName}: Missing text content.`);
             return;
        }
         // Add more specific validations as needed

        // Execute the agent request
        let response: AgentExecutionResponse;
        try {
             response = await requestAgentExecution(agentName, payload);
         } catch (error: any) {
             console.error(`Agent ${agentName} execution failed:`, error);
             toast({ title: `${title} Failed`, description: `Agent ${agentName} error: ${error.message}`, variant: "destructive", duration: 7000 });
             return;
         }


        // Handle the response
        if (response.success) {
            toast({ title: `${title} Succeeded`, description: `Agent ${agentName} completed.` });
            console.log(`Agent ${agentName} Result:`, response.result);
            // Handle the successful result appropriately
             let resultString = ""; // For displaying non-code results
             let resultCode = "";   // For code results

             // Determine result type
             if (typeof response.result === 'string') {
                 resultString = response.result;
             } else if (response.result) {
                 resultCode = response.result.code || response.result.files || response.result.tests || "";
                 resultString = response.result.explanation || response.result.summary || response.result.message || JSON.stringify(response.result, null, 2);
             }

             // Insert code into editor or display result
            if (resultCode && (agentName === 'codeGenAgent' || agentName === 'refactorAgent' || agentName === 'fixBugAgent' || agentName === 'scaffoldAgent' || agentName === 'testGenAgent' || agentName === 'iacGenAgent')) {
                if (editorRef.current) {
                     // Option 1: Replace selection
                    // const selection = editorRef.current.getSelection();
                    // if (selection && !selection.isEmpty()) {
                    //     editorRef.current.executeEdits("ai-agent", [{ range: selection, text: resultCode }]);
                    // } else {
                    //     // Option 2: Replace entire content (use with caution)
                    //     editorRef.current.getModel()?.setValue(resultCode);
                    // }
                    // Option 3: Insert at cursor (safer default)
                     const position = editorRef.current.getPosition();
                     if (position) {
                         editorRef.current.executeEdits("ai-agent", [{ range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column), text: `\n${resultCode}\n` }]);
                     } else {
                         // Fallback: Append to current content if editor available but no position
                         setCodeEditorContent(prev => `${prev}\n${resultCode}\n`);
                     }
                    toast({ title: "Code Updated", description: `Code from ${agentName} inserted into editor.` , duration: 5000});
                } else {
                    // Fallback: If editor not available, show in toast/log
                    toast({ title: "Code Generated", description: `Result:\n${resultCode.substring(0, 100)}... (Check console for full code)`, duration: 7000 });
                     console.log("Generated Code:", resultCode);
                }
            } else if (resultString) {
                // Display other results in a toast or log
                 toast({ title: `${agentName} Result`, description: resultString.substring(0, 300) + (resultString.length > 300 ? "..." : ""), duration: 10000 });
                 console.log(`${agentName} Result:`, resultString);
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

        if (actionType === 'openFile') {
             if (fileInput?.files && fileInput.files.length > 0) {
                 const file = fileInput.files[0];
                 description = `Opening: ${file.name}`;
                 payload = { file };
                 console.log(`TODO: Implement file opening logic for`, file.name);
                 // Read file content and set editor state
                 const reader = new FileReader();
                 reader.onload = (e) => {
                     const content = e.target?.result as string;
                     setActiveEditorFile(file.name); // Set active file name
                     setCodeEditorContent(content); // Update editor state directly
                     // If using Monaco, update the model value
                     // editorRef.current?.getModel()?.setValue(content);
                     // TODO: Setup Yjs binding for the new file
                     // setupCollaborationBinding(editorRef.current?.getModel(), file.name);
                     toast({ title: "File Opened", description: `${file.name} loaded into editor.` });
                 };
                 reader.onerror = (e) => {
                     toast({ title: "File Read Error", description: `Could not read file ${file.name}.`, variant: "destructive" });
                     console.error("File read error:", e);
                 };
                 reader.readAsText(file);
                 handleGenericAction(actionType, windowId, payload); // Close window after selection
             } else {
                 toast({ title: `${actionType} Canceled`, description: "No file selected.", variant: "destructive" });
                 return;
             }
        } else if (actionType === 'openFolder') {
             // Folder opening requires backend interaction to list files
             if (fileInput?.files && fileInput.files.length > 0) {
                 const folderPath = fileInput.files[0].webkitRelativePath.split('/')[0] || 'Selected Folder';
                 description = `Opening Folder: ${folderPath}`;
                 payload = { folder: folderPath }; // Or pass necessary info to backend
                 console.log(`TODO: Implement folder opening logic with backend for`, folderPath);
                 // Example: Fetch file tree for the folder
                 // fetch(`/api/proxy/files?path=${encodeURIComponent(folderPath)}`) ...
                 toast({ title: "Open Folder", description: `Requesting file tree for ${folderPath}...` });
                 handleGenericAction(actionType, windowId, payload);
             } else {
                 toast({ title: `${actionType} Canceled`, description: "No folder selected.", variant: "destructive" });
                 return;
             }
        } else if (actionType === 'saveAs') {
             const saveNameInput = document.getElementById(saveNameInputId) as HTMLInputElement;
             const filename = saveNameInput?.value.trim() || 'untitled.txt';
             if (!filename) {
                 toast({ title: "Save Failed", description: "Filename cannot be empty.", variant: "destructive" });
                 return;
             }
             description = `Saving as: ${filename}`;
             payload = { filename };
             const content = getAllCode(); // Get current editor content
             payload.content = content;
             console.log(`TODO: Implement save logic with backend for`, payload);
             // Example: Send content to backend to save
             // fetch(`/api/proxy/files/save`, { method: 'POST', body: JSON.stringify(payload) }) ...
             toast({ title: "Save As", description: `Requesting save for ${filename}...` });
             handleGenericAction(actionType, windowId, payload);
        }
    };

     const handleSecretAction = async (actionType: 'add' | 'delete', windowId: string) => {
        const keyInputId = 'secret-key-input';
        const valueInputId = 'secret-value-input';
        const keyInput = document.getElementById(keyInputId) as HTMLInputElement;
        const valueInput = actionType === 'add' ? document.getElementById(valueInputId) as HTMLInputElement : null;
        const key = keyInput?.value.trim();
        const value = valueInput?.value;

        if (!key) {
            toast({ title: "Secret Action Failed", description: "Secret key cannot be empty.", variant: "destructive" });
            return;
        }
        if (actionType === 'add' && typeof value === 'undefined') {
            toast({ title: "Secret Action Failed", description: "Secret value is required to add/update.", variant: "destructive" });
            return;
        }

        toast({ title: `Secret Action: ${actionType}`, description: `Performing ${actionType} on key: ${key}...`});

        let success = false;
        if (actionType === 'add') {
            success = await setSecret(key, value!);
        } else if (actionType === 'delete') {
            success = await deleteSecret(key);
        }

        toast({
            title: success ? `Secret ${actionType === 'add' ? 'Set' : 'Deleted'}` : `Secret Action Failed`,
            description: `Key: ${key}`,
            variant: success ? "default" : "destructive"
        });

        // Refresh the secrets list in the window if it's still technically open (might be hidden)
        if (success) {
            const updatedKeys = await listSecretKeys();
            // Use a functional update to ensure we don't overwrite other state changes
            setWindowStates(prev => ({
                 ...prev,
                 [windowId]: {
                     ...prev[windowId],
                     secretsList: updatedKeys?.map(k => ({ key: k })) || [],
                     secretsLoading: false,
                     // Keep it visible only if the action was successful and it was visible before
                     // isVisible: prev[windowId]?.isVisible ?? false
                 }
            }));
            // Optionally close the window after successful action
            // updateWindowState(windowId, { isVisible: false });
        }
     };

     // Handler for environment variable actions
     const handleEnvVarAction = (actionType: 'add' | 'delete', scope: 'project' | 'account', windowId: string) => {
         const nameInputId = `${scope}-env-name-input`;
         const valueInputId = `${scope}-env-value-input`;
         const nameInput = document.getElementById(nameInputId) as HTMLInputElement;
         const valueInput = actionType === 'add' ? document.getElementById(valueInputId) as HTMLInputElement : null;
         const name = nameInput?.value.trim();
         const value = valueInput?.value;

         if (!name) {
             toast({ title: "Env Var Action Failed", description: "Variable name cannot be empty.", variant: "destructive" });
             return;
         }
         if (actionType === 'add' && typeof value === 'undefined') {
             toast({ title: "Env Var Action Failed", description: "Variable value is required to add/update.", variant: "destructive" });
             return;
         }

         console.log(`TODO: Implement ${actionType} env var '${name}' for scope '${scope}'`);
         toast({ title: `Env Var Action: ${actionType}`, description: `TODO: ${actionType} ${name} (${scope})` });

         // Placeholder: Update local state and close window
         handleGenericAction(`${actionType} Env Var`, windowId, { scope, name, value });
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
        if (!findText || !editorRef.current) {
             toast({ title: "Find Failed", description: "Enter text to find and ensure editor is active.", variant: "destructive" });
            return;
        }
        // Use Monaco's find controller
        editorRef.current.getAction('actions.find').run();
        // Optionally pre-fill the find widget (might need more direct API access or focus hack)
        // editorRef.current.trigger('keyboard', 'find', { query: findText }); // This might not work reliably
        toast({ title: "Find Action", description: `Finding "${findText}". Use editor widget (Ctrl+F).` });
    };

    const handleReplace = (replaceAll = false) => {
        const findInput = document.getElementById('find-input') as HTMLInputElement;
        const replaceInput = document.getElementById('replace-input') as HTMLInputElement;
        const findText = findInput?.value;
        const replaceText = replaceInput?.value ?? ""; // Replace can be empty string
        if (!findText || !editorRef.current) {
            toast({ title: "Replace Failed", description: "Enter text to find and ensure editor is active.", variant: "destructive" });
             return;
        }
        // Use Monaco's replace controller/actions
        const replaceActionId = replaceAll ? 'editor.action.replaceAll' : 'editor.action.replaceOne';
        // Pre-filling might be tricky, usually user interacts with the widget (Ctrl+H)
        editorRef.current.getAction('editor.action.startFindReplaceAction').run();
        toast({ title: "Replace Action", description: `Replacing "${findText}" with "${replaceText}". Use editor widget (Ctrl+H).` });
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
        return names[id] || id.charAt(0).toUpperCase() + id.slice(1); // Fallback capitalization
    };

    const windowList = React.useMemo(() => Object.values(windowStates)
        .filter(state => state.isVisible || state.isMinimized)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)), [windowStates]);


    // --- Render Logic ---
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
                onGenerateTests={() => toggleWindowVisibility('generateTests')}
                onGenerateDocs={() => toggleWindowVisibility('generateDocs')}
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
                onGitPush={() => handleGenericAction('Git Push', 'git', { action: 'push' })} // Pass context
                onGitPull={() => handleGenericAction('Git Pull', 'git', { action: 'pull' })} // Pass context
                onShowGitBranches={() => toggleWindowVisibility('git')} // Open git window
                onShowImportGithub={() => toggleWindowVisibility('git')} // Open git window
                onApplyIaC={() => handleGenericAction('Apply IaC', 'devops', { action: 'apply' })} // Pass context
                onGenerateIaC={() => handleAgentAction('Generate IaC', '', 'iacGenAgent', { prompt: 'Generate Terraform for standard Firebase setup' })}
                onStartDockerEnv={() => handleGenericAction('Start Docker Env', 'devops', { action: 'docker_up' })}
                onDeployK8s={() => handleGenericAction('Deploy to K8s', 'devops', { action: 'k8s_deploy' })}
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
                        <FileExplorer onFileSelect={setActiveEditorFile} /> {/* Pass handler to update active file */}
                    </div>
                </ResizablePanel>
                <ResizableHandle className="retro-separator-v !w-2 bg-card" />

                {/* Center Panel: Editor & Terminal */}
                <ResizablePanel defaultSize={52} minSize={30}>
                    <ResizablePanelGroup direction="vertical" className="h-full">
                        <ResizablePanel defaultSize={70} minSize={30}>
                            <div className="h-full p-1 bg-card">
                                {/* CodeEditor component manages Monaco integration */}
                                <CodeEditor
                                    initialValue={codeEditorContent}
                                    onEditorMount={handleEditorDidMount}
                                    language="javascript" // TODO: Make dynamic based on file type
                                    // Pass content and onChange handler if NOT using Yjs binding directly
                                    // value={codeEditorContent}
                                    // onChange={(newValue) => setCodeEditorContent(newValue || '')}
                                />
                            </div>
                        </ResizablePanel>
                        <ResizableHandle className="retro-separator-h !h-2 bg-card" />
                        <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
                            <div className="h-full bg-card">
                                {/* TerminalAndLogs component manages Terminal/Logs tabs */}
                                <TerminalAndLogs ref={terminalRef} /> {/* Pass ref */}
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
                                <AIChat getEditorContent={getAllCode} /> {/* Pass function to get editor content */}
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
                {windowList.map((state) => {
                         // Common props for all windows
                         const windowProps = {
                             key: state.id, // Key must be direct prop
                             id: state.id,
                             title: getWindowName(state.id),
                             onClose: () => toggleWindowVisibility(state.id),
                             onMinimize: () => minimizeWindow(state.id),
                             style: { zIndex: state.zIndex || 10 }, // Ensure zIndex is in style
                             isMinimized: state.isMinimized
                         };
                        // Define window content based on ID
                        let content: React.ReactNode = null;
                        let className = "w-80 h-64"; // Default size
                        let initialPosition = { top: `${20 + Math.random() * 30}%`, left: `${30 + Math.random() * 40}%` }; // Randomize slightly

                        // --- Define Window Content Components or Inline JSX ---
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
                                            <Button className="retro-button" size="sm" onClick={() => toggleWindowVisibility(state.id)}>Cancel</Button>
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
                                        <Input id="openFolder-input" type="file" {...{ webkitdirectory: "", directory: "" } as any} className="retro-input h-7 text-xs" />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button className="retro-button" size="sm" onClick={() => toggleWindowVisibility(state.id)}>Cancel</Button>
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
                                        <Input id="save-as-name" type="text" defaultValue={activeEditorFile || 'untitled.txt'} className="retro-input h-7 text-xs" />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button className="retro-button" size="sm" onClick={() => toggleWindowVisibility(state.id)}>Cancel</Button>
                                            <Button className="retro-button" size="sm" onClick={() => handleFileAction('saveAs', state.id)}>Save</Button>
                                        </div>
                                    </div>
                                );
                                break;
                             case 'manageSecrets':
                                className = "w-[400px] h-[300px]";
                                content = (
                                     <div className="w-full h-full bg-card p-2 text-sm flex flex-col">
                                         <p className="mb-1 font-semibold flex items-center gap-1"><FileKey size={14} />Project Secrets</p>
                                         <ScrollArea className="h-32 flex-grow retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                             {state.secretsLoading ? <p>Loading secrets...</p> : (
                                                 <ul>
                                                     {state.secretsList && state.secretsList.length > 0 ? state.secretsList.map((secret) => (
                                                         <li key={secret.key}>{secret.key}: ********</li>
                                                     )) : <li>No secrets found.</li>}
                                                 </ul>
                                             )}
                                         </ScrollArea>
                                         <div className="flex gap-2 mt-2">
                                             <Input id="secret-key-input" placeholder="Secret Key" className="retro-input h-7 text-xs flex-grow" />
                                             <Input id="secret-value-input" type="password" placeholder="Value (required to add)" className="retro-input h-7 text-xs flex-grow" />
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
                                content = <SimpleDialogContent title="Configure Secrets Vault" onOk={() => handleGenericAction('Save Vault Config', state.id)} showCancelButton onCancel={() => toggleWindowVisibility(state.id)}><p>Vault configuration options (TODO).</p></SimpleDialogContent>;
                                break;
                             case 'projectVars':
                             case 'accountVars':
                                 const scope = state.id === 'projectVars' ? 'project' : 'account';
                                 className = "w-[450px] h-[350px]";
                                 content = (
                                     <div className="w-full h-full bg-card p-2 text-sm flex flex-col">
                                         <p className="mb-1 font-semibold flex items-center gap-1">
                                             {scope === 'project' ? <Database size={14}/> : <Globe size={14} />} {scope === 'project' ? 'Project' : 'Account'} Environment Variables
                                         </p>
                                         <ScrollArea className="h-40 flex-grow retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                              {state.envVarsLoading ? <p>Loading variables...</p> : (
                                                  <ul>
                                                      {state.envVars && state.envVars.length > 0 ? state.envVars.map((env) => (
                                                          <li key={env.name}>{env.name}={env.value}</li>
                                                      )) : <li>No variables defined.</li>}
                                                  </ul>
                                              )}
                                         </ScrollArea>
                                         <div className="flex gap-2 mt-2">
                                             <Input id={`${scope}-env-name-input`} placeholder="Variable Name" className="retro-input h-7 text-xs flex-grow" />
                                             <Input id={`${scope}-env-value-input`} placeholder="Value" className="retro-input h-7 text-xs flex-grow" />
                                         </div>
                                         <div className="flex justify-between mt-2">
                                             <Button className="retro-button" size="sm" onClick={() => handleEnvVarAction('add', scope, state.id)}>Add/Update</Button>
                                             <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleEnvVarAction('delete', scope, state.id)}>Delete</Button>
                                         </div>
                                     </div>
                                 );
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
                                content = <SimpleDialogContent title="Install from VSIX/QCX" onOk={() => handleGenericAction('Install Plugin File', state.id)} showCancelButton onCancel={() => toggleWindowVisibility(state.id)}><Input type="file" accept=".vsix,.qcx" className="retro-input text-xs h-8 mt-1" /><p>Install button (TODO)</p></SimpleDialogContent>;
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
                                        <Button className="retro-button self-end" size="sm" onClick={() => handleAgentAction("Generate Code", state.id, 'codeGenAgent', { prompt: state.prompt, context: { filePath: activeEditorFile } })}>Generate</Button>
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
                                // Fetch current values or use defaults from backend/env
                                content = (
                                    <div className="p-4 flex flex-col gap-2">
                                        <p className="text-sm font-semibold">Configure Ollama</p>
                                        <Label htmlFor="ollama-host" className="text-xs">Ollama Host URL:</Label>
                                        <Input id="ollama-host" defaultValue={process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || "http://localhost:11434"} className="retro-input h-7 text-xs" />
                                        <Label htmlFor="ollama-model" className="text-xs mt-1">Default Model:</Label>
                                        <Input id="ollama-model" defaultValue={"llama3"} className="retro-input h-7 text-xs" />
                                        <Label htmlFor="ollama-embed-model" className="text-xs mt-1">Embedding Model:</Label>
                                        <Input id="ollama-embed-model" defaultValue={"nomic-embed-text"} className="retro-input h-7 text-xs" />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button className="retro-button" size="sm" onClick={() => toggleWindowVisibility(state.id)}>Cancel</Button>
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
                                content = <SimpleDialogContent title="Performance Profiling">
                                    {state.profilingLoading ? <p>Loading profiling data...</p> :
                                    state.profilingData ? <pre>{JSON.stringify(state.profilingData, null, 2)}</pre> :
                                    <p>No profiling data available. Run analysis.</p>}
                                    <Button className="retro-button mt-2" size="sm" onClick={() => console.log("TODO: Trigger profiling analysis")}>Run Analysis</Button>
                                    </SimpleDialogContent>;
                                break;
                            case 'security':
                                className = "w-[550px] h-[400px]";
                                content = <SimpleDialogContent title="Security Analysis">
                                     {state.securityLoading ? <p>Loading security data...</p> :
                                     state.securityData ? <pre>{JSON.stringify(state.securityData, null, 2)}</pre> :
                                     <p>No security data available. Run scan.</p>}
                                    <Button className="retro-button mt-2" size="sm" onClick={() => console.log("TODO: Trigger SAST scan via agent coordinator")}>Scan Now</Button>
                                    </SimpleDialogContent>;
                                break;
                            case 'telemetry':
                                className = "w-[550px] h-[400px]";
                                content = <SimpleDialogContent title="Telemetry Dashboard">
                                     {state.telemetryLoading ? <p>Loading telemetry data...</p> :
                                     state.telemetryData ? <pre>{JSON.stringify(state.telemetryData, null, 2)}</pre> :
                                     <p>No telemetry data available.</p>}
                                    {/* Add Chart components here eventually */}
                                    </SimpleDialogContent>;
                                break;
                            case 'debugger':
                                className = "w-[600px] h-[450px]";
                                content = <SimpleDialogContent title="Debugger">
                                     {state.debuggerLoading ? <p>Initializing debugger...</p> :
                                     state.debuggerState ? <pre>{JSON.stringify(state.debuggerState, null, 2)}</pre> :
                                     <p>Debugger not attached.</p>}
                                     {/* Add debugger controls */}
                                     <Button className="retro-button mt-2" size="sm" onClick={() => console.log("TODO: Attach Debugger")}>Attach</Button>
                                    </SimpleDialogContent>;
                                break;
                            case 'git':
                                className = "w-[500px] h-[400px]";
                                content = (
                                    <div className="w-full h-full bg-card p-2 text-sm flex flex-col">
                                        <p className="mb-1 font-semibold flex items-center gap-1"><GitBranch size={14} />Git Control</p>
                                        <ScrollArea className="h-40 flex-grow retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                             {state.gitLoading ? <p>Loading Git status...</p> :
                                             <pre><code>{state.gitStatus || "No Git status available."}</code></pre>}
                                        </ScrollArea>
                                        <div className="flex flex-col gap-2 mt-2">
                                            <Input id="git-commit-message" placeholder="Commit Message" className="retro-input h-7 text-xs" />
                                            <div className="flex justify-between">
                                                <Button className="retro-button" size="sm" onClick={() => handleGenericAction('Git Commit', state.id)}>Commit</Button>
                                                 <Button className="retro-button" size="sm" onClick={() => handleGenericAction('Git Push', state.id)}>Push</Button>
                                                 <Button className="retro-button" size="sm" onClick={() => handleGenericAction('Git Pull', state.id)}>Pull</Button>
                                            </div>
                                            <Button className="retro-button mt-1" size="sm" onClick={() => handleGenericAction('Import from GitHub', state.id)}>Import from GitHub...</Button>
                                             {/* Add Branching, Merging controls */}
                                         </div>
                                     </div>
                                );
                                break;
                            case 'devops':
                                className = "w-[500px] h-[400px]";
                                content = (
                                     <div className="w-full h-full bg-card p-2 text-sm flex flex-col gap-2">
                                        <p className="mb-1 font-semibold flex items-center gap-1"><Cloud size={14} />DevOps Panel</p>
                                        {/* IaC Section */}
                                        <fieldset className="border border-border-dark p-2">
                                            <legend className="text-xs px-1">Infrastructure (IaC)</legend>
                                            <div className="flex gap-2">
                                                 <Button className="retro-button flex-1" size="sm" onClick={() => handleAgentAction('Generate IaC', '', 'iacGenAgent', { prompt: 'Generate Terraform for standard Firebase setup' })}>Generate</Button>
                                                 <Button className="retro-button flex-1" size="sm" onClick={() => handleGenericAction('Apply IaC', state.id)}>Apply</Button>
                                            </div>
                                         </fieldset>
                                        {/* Docker Section */}
                                        <fieldset className="border border-border-dark p-2">
                                            <legend className="text-xs px-1">Docker Environment</legend>
                                            <Button className="retro-button w-full" size="sm" onClick={() => handleGenericAction('Start Docker Env', state.id)}>Start/Restart Dev Env</Button>
                                         </fieldset>
                                         {/* K8s Section */}
                                        <fieldset className="border border-border-dark p-2">
                                             <legend className="text-xs px-1">Kubernetes</legend>
                                             <div className="flex gap-2">
                                                 <Button className="retro-button flex-1" size="sm" onClick={() => handleGenericAction('Deploy to K8s', state.id)}>Deploy</Button>
                                                 <Button className="retro-button flex-1" size="sm" onClick={() => handleGenericAction('Manage K8s Deployments', state.id)}>Manage</Button>
                                            </div>
                                         </fieldset>
                                         {/* Hosting Section */}
                                        <fieldset className="border border-border-dark p-2">
                                             <legend className="text-xs px-1">Hosting</legend>
                                             <Button className="retro-button w-full" size="sm" onClick={() => handleGenericAction('Configure Hosting', state.id)}>Configure</Button>
                                         </fieldset>
                                    </div>
                                );
                                break;
                            case 'languageEnv':
                                className = "w-[450px] h-[350px]";
                                content = <SimpleDialogContent title="Language Environment (Nix)"><p>Manage Nix dependencies (TODO)</p></SimpleDialogContent>; // Placeholder
                                break;
                            case 'settings':
                                className = "w-[600px] h-[450px]";
                                content = <SimpleDialogContent title="Settings"><p>Settings panels (Editor, Theme, AI, etc.) - TODO</p></SimpleDialogContent>; // Placeholder
                                break;
                            case 'welcome':
                                className = "w-[500px] h-[350px]";
                                content = <SimpleDialogContent title="Welcome to QuonxCoder!"><p>Quick links:<br/>- Open Folder<br/>- Manage Plugins<br/>- Read Docs (TODO)</p></SimpleDialogContent>;
                                break;
                            case 'about':
                                className = "w-[400px] h-[300px]";
                                content = <SimpleDialogContent title="About QuonxCoder"><p>Version: 0.9.0 (Development Phase)<br/>An AI-native IDE with a retro twist.<br/>More details soon!</p></SimpleDialogContent>;
                                break;
                             default:
                                content = <p className="p-2 text-sm text-muted-foreground">Window content for '{state.id}' not implemented yet.</p>;
                        }


                         return (
                            <RetroWindow
                                {...windowProps} // Key must be direct prop
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
                    {/* Display active file */}
                     {activeEditorFile && <span className="text-muted-foreground truncate max-w-[150px]" title={activeEditorFile}>{activeEditorFile}</span>}
                     {/* TODO: Add more dynamic status indicators (line/col, language, AI status) */}
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
