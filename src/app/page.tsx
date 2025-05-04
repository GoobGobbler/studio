'use client'; // Required for hooks and event handlers

import * as React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Maximize2, Minus, X, Bot, Code, Terminal as TerminalIcon, Files, Puzzle, Mic, Hand, Activity, ShieldCheck, BarChart3, Users, Share2, Cloud, GitBranch, Save, FolderOpen, Search, Settings, LifeBuoy, Replace, SearchIcon, PackageOpen, HelpCircle, BookOpen, CodeXml, GitCommit, GitPullRequest, Database, FileKey, Globe, Palette, Fullscreen, BrainCircuit, FileCode, FlaskConical, Recycle, Lightbulb, MessageSquare, Brain, Sparkles, FileQuestion, FileInput, DatabaseZap, Cpu, Wrench, Route, TestTubeDiagonal, Play, Square, Trash2, PlusCircle, Server, Bug, BookLock, Pencil, Power, RefreshCw, UploadCloud, CheckCircle, AlertTriangle, PlayCircle, Edit3, Trash } from "lucide-react";
import { RetroMenubar } from '@/components/layout/retro-menubar';
import { RetroWindow } from '@/components/layout/retro-window';
import { PluginManagerContent } from '@/components/features/plugin-manager';
import { CollaborationPanel } from '@/components/features/collaboration-panel';
import { CodeEditor } from '@/components/features/code-editor';
import { TerminalAndLogs } from '@/components/features/terminal-logs';
import { FileExplorer } from '@/components/features/file-explorer';
import { AIChat } from '@/components/features/ai-chat';
import { SimpleDialogContent } from '@/components/layout/simple-dialog-content';

// Import Monaco Editor and related types/bindings
import Editor from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor';
// import { MonacoBinding } from 'y-monaco'; // y-monaco seems unavailable/problematic, disable binding for now

// Import collaboration library more concretely
import { connectCollaboration, setLocalAwarenessState, getAwarenessStates, onAwarenessChange, getSharedText, type CollaborationSession } from '@/lib/collaboration';
import * as Y from 'yjs'; // Import Yjs

// Import secrets library more concretely
import { getSecret, setSecret, deleteSecret, listSecretKeys } from '@/lib/secrets';

// Import AI agent client functions
import { requestAgentExecution } from '@/ai/agents/ollama-agent';
import type { AgentExecutionResponse } from '@/types/agent-types';

// Define window state type
type WindowState = {
    id: string;
    isVisible: boolean;
    isMinimized: boolean;
    zIndex: number;
    // Specific state for windows
    prompt?: string;
    codeContext?: string;
    filePath?: string;
    fileName?: string; // For Save As
    secretKey?: string;
    secretValue?: string; // Added for editing/adding
    envVarName?: string;
    envVarValue?: string; // Added for editing/adding
    findText?: string;
    replaceText?: string;
    workflowId?: string;
    workflowContent?: string; // For editing workflows
    knowledgeSource?: string;
    knowledgeText?: string; // For text area in ingest
    knowledgeCollection?: string; // Target collection for RAG
    selectedPlugin?: any; // For marketplace/install
    selectedWorkflow?: any; // For workflow management
    selectedKnowledgeDoc?: any; // For managing knowledge
    selectedModel?: string; // For fine-tuning config
    selectedLanguage?: string; // For lang env
    debugConfig?: any; // Debugger config
    gitCommitMessage?: string;
    gitBranchName?: string; // For branch creation
    iacConfig?: string; // For IaC generation/display
    hostingProvider?: string; // For hosting config
    scope?: string;
    // Loading/Data states
    secretsList?: { key: string, scope?: string }[]; // Add scope if needed
    secretsLoading?: boolean;
    envVars?: { name: string, value: string }[];
    envVarsLoading?: boolean;
    gitStatus?: string;
    gitLoading?: boolean;
    debuggerState?: any;
    debuggerLoading?: boolean;
    profilingData?: any;
    profilingLoading?: boolean;
    securityData?: any; // Could be string summary or object
    securityLoading?: boolean;
    telemetryData?: any;
    telemetryLoading?: boolean;
    marketplacePlugins?: any[];
    marketplaceLoading?: boolean;
    workflowsList?: any[];
    workflowsLoading?: boolean;
    knowledgeDocs?: any[];
    knowledgeLoading?: boolean;
    fineTuneModels?: any[];
    fineTuneLoading?: boolean;
    languageEnvs?: any[];
    languageLoading?: boolean;
    // Add more as needed
};

// --- API Proxies (Placeholder URLs - Replace with actual service URLs if not using proxy) ---
const API_BASE = ''; // Assume API routes handle proxying or use full URLs
const FILE_SERVICE_URL = `${API_BASE}/api/proxy/files`;
const GIT_SERVICE_URL = `${API_BASE}/api/proxy/git`;
const PLUGIN_REGISTRY_URL = `${API_BASE}/api/proxy/plugins`;
const WORKFLOW_SERVICE_URL = `${API_BASE}/api/proxy/workflows`;
const DEPLOYMENT_SERVICE_URL = `${API_BASE}/api/proxy/deploy`;
const LANG_ENV_SERVICE_URL = `${API_BASE}/api/proxy/lang`;
const OBSERVABILITY_SERVICE_URL = `${API_BASE}/api/proxy/observability`;
// Secrets, AI, Agent Coordinator already have env vars or proxy setup

// --- Main Page Component ---
export default function Home() {
    const { toast } = useToast();

    // --- State Management ---
    const [windowStates, setWindowStates] = React.useState<Record<string, WindowState>>({
        // Initialize window states (mostly hidden by default)
        pluginManager: { id: 'pluginManager', isVisible: false, isMinimized: false, zIndex: 10, marketplacePlugins: [], marketplaceLoading: false },
        openFile: { id: 'openFile', isVisible: false, isMinimized: false, zIndex: 10 },
        openFolder: { id: 'openFolder', isVisible: false, isMinimized: false, zIndex: 10 },
        saveAs: { id: 'saveAs', isVisible: false, isMinimized: false, zIndex: 10 },
        manageSecrets: { id: 'manageSecrets', isVisible: false, isMinimized: false, zIndex: 10, secretsList: [], secretsLoading: false },
        configureVault: { id: 'configureVault', isVisible: false, isMinimized: false, zIndex: 10 },
        projectVars: { id: 'projectVars', isVisible: false, isMinimized: false, zIndex: 10, envVars: [], envVarsLoading: false },
        accountVars: { id: 'accountVars', isVisible: false, isMinimized: false, zIndex: 10, envVars: [], envVarsLoading: false },
        findReplace: { id: 'findReplace', isVisible: false, isMinimized: false, zIndex: 10 },
        commandPalette: { id: 'commandPalette', isVisible: false, isMinimized: false, zIndex: 10 },
        marketplace: { id: 'marketplace', isVisible: false, isMinimized: false, zIndex: 10, marketplacePlugins: [], marketplaceLoading: false },
        installVsix: { id: 'installVsix', isVisible: false, isMinimized: false, zIndex: 10 },
        manageWorkflows: { id: 'manageWorkflows', isVisible: false, isMinimized: false, zIndex: 10, workflowsList: [], workflowsLoading: false },
        generateCode: { id: 'generateCode', isVisible: false, isMinimized: false, zIndex: 10 },
        explainCode: { id: 'explainCode', isVisible: false, isMinimized: false, zIndex: 10 },
        refactorCode: { id: 'refactorCode', isVisible: false, isMinimized: false, zIndex: 10 },
        generateTests: { id: 'generateTests', isVisible: false, isMinimized: false, zIndex: 10 },
        generateDocs: { id: 'generateDocs', isVisible: false, isMinimized: false, zIndex: 10 },
        fixBug: { id: 'fixBug', isVisible: false, isMinimized: false, zIndex: 10 },
        scaffoldAgent: { id: 'scaffoldAgent', isVisible: false, isMinimized: false, zIndex: 10 },
        queryKnowledge: { id: 'queryKnowledge', isVisible: false, isMinimized: false, zIndex: 10 },
        ingestKnowledge: { id: 'ingestKnowledge', isVisible: false, isMinimized: false, zIndex: 10 },
        manageKnowledge: { id: 'manageKnowledge', isVisible: false, isMinimized: false, zIndex: 10, knowledgeDocs: [], knowledgeLoading: false },
        configureOllama: { id: 'configureOllama', isVisible: false, isMinimized: false, zIndex: 10 },
        fineTuneModel: { id: 'fineTuneModel', isVisible: false, isMinimized: false, zIndex: 10, fineTuneModels: [], fineTuneLoading: false },
        configureVoiceGesture: { id: 'configureVoiceGesture', isVisible: false, isMinimized: false, zIndex: 10 },
        profiling: { id: 'profiling', isVisible: false, isMinimized: false, zIndex: 10, profilingData: null, profilingLoading: false },
        security: { id: 'security', isVisible: false, isMinimized: false, zIndex: 10, securityData: null, securityLoading: false },
        telemetry: { id: 'telemetry', isVisible: false, isMinimized: false, zIndex: 10, telemetryData: null, telemetryLoading: false },
        debugger: { id: 'debugger', isVisible: false, isMinimized: false, zIndex: 10, debuggerState: null, debuggerLoading: false },
        git: { id: 'git', isVisible: false, isMinimized: false, zIndex: 10, gitStatus: '', gitLoading: false },
        devops: { id: 'devops', isVisible: false, isMinimized: false, zIndex: 10 },
        languageEnv: { id: 'languageEnv', isVisible: false, isMinimized: false, zIndex: 10, languageEnvs: [], languageLoading: false },
        settings: { id: 'settings', isVisible: false, isMinimized: false, zIndex: 10 },
        welcome: { id: 'welcome', isVisible: false, isMinimized: false, zIndex: 10 },
        about: { id: 'about', isVisible: false, isMinimized: false, zIndex: 10 },
    });

    const nextZIndex = React.useRef(10); // Starting z-index

    // Refs for components that need interaction (Editor, Terminal, File Explorer)
    const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = React.useRef<typeof monacoEditor | null>(null);
    const terminalRef = React.useRef<any>(null); // xterm.js instance ref (update type if xterm is installed)
    const fileExplorerRef = React.useRef<{ loadFolder: (path: string) => void }>(null); // Ref for FileExplorer
    const collaborationSessionRef = React.useRef<CollaborationSession | null>(null);
    // const monacoBindingRef = React.useRef<MonacoBinding | null>(null); // Disabled y-monaco for now
    const [activeEditorFile, setActiveEditorFile] = React.useState<string | null>(null);
    const [codeEditorContent, setCodeEditorContent] = React.useState<string>("// Welcome to QuonxCoder!\n// Open a file or use AI > Scaffold App to start.");
    const [currentLanguage, setCurrentLanguage] = React.useState<string>('plaintext'); // Default language
    const [logStream, setLogStream] = React.useState<string[]>([]); // Logs for the panel

    // --- Effects ---

     // Update editor content when active file changes
     React.useEffect(() => {
         if (activeEditorFile) {
             console.log(`Fetching content for ${activeEditorFile}...`);
             fetch(`${FILE_SERVICE_URL}/read?path=${encodeURIComponent(activeEditorFile)}`)
                 .then(res => {
                     if (!res.ok) throw new Error(`Failed to read file: ${res.statusText}`);
                     return res.json();
                 })
                 .then(data => {
                     if (data.success && data.content !== undefined) {
                          const fetchedContent = data.content;
                          const fileExtension = activeEditorFile.split('.').pop()?.toLowerCase();
                          let lang = 'plaintext';
                          switch (fileExtension) {
                              case 'js': case 'jsx': lang = 'javascript'; break;
                              case 'ts': case 'tsx': lang = 'typescript'; break;
                              case 'py': lang = 'python'; break;
                              case 'json': lang = 'json'; break;
                              case 'css': lang = 'css'; break;
                              case 'html': lang = 'html'; break;
                              case 'md': lang = 'markdown'; break;
                              case 'yaml': case 'yml': lang = 'yaml'; break;
                              case 'sh': lang = 'shell'; break;
                              case 'tf': lang = 'terraform'; break; // Add terraform
                               // Add more mappings
                          }
                          setCurrentLanguage(lang); // Update language for Monaco
                          setCodeEditorContent(fetchedContent); // Update state for controlled component or initial value
                          editorRef.current?.getModel()?.setValue(fetchedContent); // Force update Monaco model
                          // Switch Yjs document binding (Disabled for now)
                          // setupCollaborationBinding(editorRef.current?.getModel(), activeEditorFile);
                          toast({ title: "File Loaded", description: activeEditorFile });
                     } else {
                         throw new Error(data.message || "Failed to load file content.");
                     }
                 })
                 .catch(err => {
                     console.error(`Error loading file ${activeEditorFile}:`, err);
                      toast({ title: "File Load Error", description: `Could not load ${activeEditorFile}: ${err.message}`, variant: "destructive" });
                      // Optionally reset editor state
                      setCurrentLanguage('plaintext');
                      setCodeEditorContent(`// Error loading ${activeEditorFile}`);
                      editorRef.current?.getModel()?.setValue(`// Error loading ${activeEditorFile}`);
                      // monacoBindingRef.current?.destroy();
                      // monacoBindingRef.current = null;
                 });
         } else {
             setCurrentLanguage('plaintext');
             setCodeEditorContent("// No file open");
             editorRef.current?.getModel()?.setValue("// No file open");
              // Unbind or switch to a default doc? (Disabled)
             // monacoBindingRef.current?.destroy();
             // monacoBindingRef.current = null;
         }
     }, [activeEditorFile]); // Dependency: only activeEditorFile

    // Initialize Monaco Editor
    const handleEditorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        console.log("Monaco Editor Mounted");
        editorRef.current = editor;
        monacoRef.current = monaco;
        // Setup initial collaboration binding if session exists and file is active (Disabled)
        // if (collaborationSessionRef.current && activeEditorFile) {
        //    setupCollaborationBinding(editor.getModel(), activeEditorFile);
        // }
        // Add custom actions or commands if needed
        // editor.addAction(...)
    };

    // Initialize Collaboration
    React.useEffect(() => {
        const initialDocId = 'global-doc'; // Use a specific doc ID or derive from workspace/project
        const session = connectCollaboration(initialDocId);
        collaborationSessionRef.current = session;

        if (session) {
            setLocalAwarenessState(session.awareness, { user: { name: `User_${Math.random().toString(36).substring(7)}`, color: `#${Math.floor(Math.random() * 16777215).toString(16)}` } });

            const unsubscribeAwareness = onAwarenessChange(session.awareness, (changes) => {
                console.log('Awareness changed:', changes, getAwarenessStates(session.awareness));
                // Update UI based on changes (collaboration panel handles its own updates)
            });

            return () => {
                unsubscribeAwareness();
                // monacoBindingRef.current?.destroy(); // Clean up binding (Disabled)
                session.destroy();
                collaborationSessionRef.current = null;
            };
        }
    }, []);

    // Function to setup Monaco binding (Disabled for now)
    // const setupCollaborationBinding = (textModel?: monacoEditor.editor.ITextModel | null, docKey?: string) => {
    //     if (monacoBindingRef.current) {
    //         monacoBindingRef.current.destroy();
    //         monacoBindingRef.current = null;
    //         console.log("Destroyed existing Monaco-Yjs binding.");
    //     }
    //     const effectiveDocKey = docKey || activeEditorFile || 'default-content';
    //
    //     if (collaborationSessionRef.current && textModel && editorRef.current && monacoRef.current) {
    //         try {
    //              const yText = getSharedText(collaborationSessionRef.current.doc, effectiveDocKey);
    //              // monacoBindingRef.current = new MonacoBinding( // Re-enable if y-monaco is fixed/added
    //              //     yText,
    //              //     textModel,
    //              //     new Set([editorRef.current]),
    //              //     collaborationSessionRef.current.awareness
    //              // );
    //              console.log(`Monaco-Yjs binding would be created for doc key: ${effectiveDocKey}`);
    //         } catch(error) {
    //             console.error("Error creating Monaco-Yjs binding:", error);
    //              toast({ title: "Collaboration Error", description: "Failed to bind editor for real-time collaboration.", variant: "destructive"});
    //         }
    //     } else {
    //         console.warn("Skipping Monaco-Yjs binding: Missing session, textModel, editor, or docKey.");
    //     }
    // };

    // Initialize Terminal (xterm.js) - Needs xterm installation
    React.useEffect(() => {
        console.log("Attempting to initialize xterm.js in TerminalAndLogs...");
        // Pass ref or init logic to TerminalAndLogs component
        return () => {
            // terminalRef.current?.dispose(); // Cleanup if managed here
        };
    }, []);

    // Connect Logs panel to backend streams
    React.useEffect(() => {
        console.log("Connecting Logs panel to backend log stream...");
        let logSource: WebSocket | null = null; // Use WebSocket for bi-directional possibility
        const logUrl = OBSERVABILITY_SERVICE_URL.replace(/^http/, 'ws') + '/logs/stream'; // Example WS endpoint

        function connectLogStream() {
            try {
                 logSource = new WebSocket(logUrl);

                 logSource.onopen = () => {
                     console.log("Log stream WebSocket connected.");
                      setLogStream(prev => [...prev.slice(-100), "[INFO] Log stream connected."]);
                 };

                 logSource.onmessage = (event) => {
                    console.log("Log Received:", event.data);
                     // Assume logs are sent as JSON strings or plain text lines
                     try {
                         const logEntry = JSON.parse(event.data); // Adjust parsing based on actual format
                         setLogStream(prev => [...prev.slice(-100), `[${logEntry.level || 'INFO'}] ${logEntry.message}`]);
                     } catch {
                         setLogStream(prev => [...prev.slice(-100), event.data]); // Treat as plain text
                     }
                 };

                 logSource.onerror = (event) => {
                     console.error("Log stream WebSocket error:", event);
                      setLogStream(prev => [...prev.slice(-100), "[ERROR] Log stream connection error."]);
                 };

                 logSource.onclose = (event) => {
                     console.log("Log stream WebSocket closed.", event.code, event.reason);
                      setLogStream(prev => [...prev.slice(-100), "[WARN] Log stream disconnected."]);
                      logSource = null;
                      // Optional: Attempt to reconnect after a delay
                      // setTimeout(connectLogStream, 5000);
                 };

             } catch (error) {
                 console.error("Could not establish log stream WebSocket connection:", error);
                 setLogStream(prev => [...prev.slice(-100), "[ERROR] Failed to connect to log stream."]);
             }
         }

         // Initial connection attempt
         // connectLogStream(); // Uncomment when backend service is ready

         // Placeholder logs
         setLogStream([
            "[INFO] QuonxCoder v0.9.5 initializing...",
            "[DEBUG][AI Service] Ollama connection check successful.",
            "[INFO][Collaboration] WebSocket provider connected.",
            "[WARN] Deprecated API usage detected in plugin 'OldLinter'.",
         ]);
         return () => {
             logSource?.close();
         };
    }, []); // Empty dependency array ensures this runs once on mount


    // --- Window Management Functions ---
    const getNextZIndex = () => {
        nextZIndex.current += 1;
        return nextZIndex.current;
    };

    const updateWindowState = (id: string, updates: Partial<WindowState>) => {
        setWindowStates(prev => {
            const current = prev[id] || { id, isVisible: false, isMinimized: false, zIndex: 0 };
            const newState = { ...current, ...updates };
            if (updates.zIndex === undefined && current.zIndex !== undefined) {
                 newState.zIndex = current.zIndex;
             }
             return { ...prev, [id]: newState };
        });
    };

    // Helper to fetch data when a window becomes visible or is restored
    const fetchDataForWindow = async (id: string) => {
         console.log(`Fetching data for window: ${id}`);
         // Update zIndex immediately when interacted with or opened
         updateWindowState(id, { zIndex: getNextZIndex(), isVisible: true, isMinimized: false });

         const setLoadingState = (loading: boolean) => updateWindowState(id, { [`${id}Loading`]: loading });

         try {
             switch (id) {
                 case 'manageSecrets':
                     setLoadingState(true);
                     const keys = await listSecretKeys(windowStates[id]?.scope);
                     updateWindowState(id, { secretsList: keys?.map(key => ({ key, scope: windowStates[id]?.scope })) || [] });
                     break;
                 case 'projectVars':
                 case 'accountVars':
                      setLoadingState(true);
                      console.log(`Fetching ${id} Env Vars... (Placeholder)`);
                      await new Promise(r => setTimeout(r, 500)); // Simulate fetch
                      const vars = id === 'projectVars'
                         ? [{name: 'API_URL', value: '/api/v1'}, {name: 'DEFAULT_LANG', value: 'en'}]
                         : [{name: 'THEME', value: 'retro'}, {name: 'AI_PROVIDER', value: 'ollama'}];
                      updateWindowState(id, { envVars: vars });
                     break;
                 case 'git':
                     setLoadingState(true);
                     console.log("Fetching Git Status...");
                     const gitRes = await fetch(`${GIT_SERVICE_URL}/status`);
                     if (!gitRes.ok) throw new Error(`Git status fetch failed: ${gitRes.statusText}`);
                     const gitData = await gitRes.json();
                     updateWindowState(id, { gitStatus: gitData.status });
                     break;
                 case 'debugger':
                     setLoadingState(true);
                     console.log("Initializing Debugger State... (Placeholder)");
                     // TODO: Connect to Debugger Service WebSocket and get initial state
                     await new Promise(r => setTimeout(r, 600));
                     updateWindowState(id, { debuggerState: { status: 'Idle', breakpoints: [], callStack: [], variables: {} } });
                     break;
                 case 'profiling':
                     setLoadingState(true);
                     console.log("Fetching Profiling Data...");
                     const profRes = await fetch(`${OBSERVABILITY_SERVICE_URL}/metrics/profiling`); // Example endpoint
                     if (!profRes.ok) throw new Error(`Profiling data fetch failed: ${profRes.statusText}`);
                     const profData = await profRes.json();
                      updateWindowState(id, { profilingData: profData }); // Store raw data
                     break;
                 case 'security':
                     setLoadingState(true);
                     console.log("Fetching Security Scan Results...");
                     const secRes = await fetch(`${OBSERVABILITY_SERVICE_URL}/metrics/security`); // Example endpoint
                     if (!secRes.ok) throw new Error(`Security data fetch failed: ${secRes.statusText}`);
                     const secData = await secRes.json();
                      updateWindowState(id, { securityData: secData.summary || "No vulnerabilities found." }); // Store summary or results object
                     break;
                 case 'telemetry':
                     setLoadingState(true);
                     console.log("Fetching Telemetry Data...");
                      const telRes = await fetch(`${OBSERVABILITY_SERVICE_URL}/metrics/telemetry`); // Example endpoint
                      if (!telRes.ok) throw new Error(`Telemetry data fetch failed: ${telRes.statusText}`);
                      const telData = await telRes.json();
                      updateWindowState(id, { telemetryData: telData }); // Store raw data
                     break;
                 case 'marketplace':
                 case 'pluginManager':
                     setLoadingState(true);
                     console.log("Fetching Marketplace/Installed Plugins...");
                     const plugRes = await fetch(`${PLUGIN_REGISTRY_URL}/plugins/marketplace`);
                      if (!plugRes.ok) throw new Error(`Plugin fetch failed: ${plugRes.statusText}`);
                      const plugData = await plugRes.json();
                      updateWindowState(id, { marketplacePlugins: plugData.plugins || [] });
                     break;
                 case 'manageWorkflows':
                     setLoadingState(true);
                     console.log("Fetching Workflows...");
                     const wfRes = await fetch(`${WORKFLOW_SERVICE_URL}/workflows`);
                      if (!wfRes.ok) throw new Error(`Workflow fetch failed: ${wfRes.statusText}`);
                      const wfData = await wfRes.json();
                      updateWindowState(id, { workflowsList: wfData.workflows || [] });
                     break;
                 case 'manageKnowledge':
                      setLoadingState(true);
                      console.log("Fetching Knowledge Docs... (Placeholder - Needs AI Service Endpoint)");
                     // const knRes = await fetch(`${AI_SERVICE_URL}/memory/list?collection=...`);
                      await new Promise(r => setTimeout(r, 900));
                     const exampleDocs = [
                         { id: 'doc-1', source: 'architecture.md', type: 'markdown', collection: 'project-main', ingestedAt: new Date().toISOString() },
                         { id: 'doc-2', source: 'coding-standards.pdf', type: 'pdf', collection: 'project-main', ingestedAt: new Date().toISOString() },
                     ];
                      updateWindowState(id, { knowledgeDocs: exampleDocs });
                     break;
                 case 'fineTuneModel':
                      setLoadingState(true);
                      console.log("Fetching Fine-tuning Models/Status... (Placeholder - Needs AI Service Endpoint)");
                     // const ftRes = await fetch(`${AI_SERVICE_URL}/finetune/jobs`);
                      await new Promise(r => setTimeout(r, 500));
                     const exampleTunes = [
                        { id: 'tune-1', baseModel: 'llama3', dataset: 'project-code.jsonl', status: 'Completed', accuracy: '85%' },
                        { id: 'tune-2', baseModel: 'codellama', dataset: 'security-examples.jsonl', status: 'Running', progress: '60%' },
                     ];
                      updateWindowState(id, { fineTuneModels: exampleTunes });
                     break;
                 case 'languageEnv':
                      setLoadingState(true);
                      console.log("Fetching Language Environments...");
                      const langRes = await fetch(`${LANG_ENV_SERVICE_URL}/envs`);
                       if (!langRes.ok) throw new Error(`Language env fetch failed: ${langRes.statusText}`);
                       const langData = await langRes.json();
                       updateWindowState(id, { languageEnvs: langData.environments || [] });
                     break;
                 default:
                     // No specific data fetching needed, just ensure visibility and z-index
                     // zIndex is handled above
                     break;
             }
        } catch (error: any) {
            console.error(`Error fetching data for window ${id}:`, error);
             toast({ title: `Error Loading ${getWindowName(id)}`, description: error.message, variant: "destructive" });
         } finally {
             // Ensure loading state is always turned off
              updateWindowState(id, { [`${id.replace(/Loading$/, '')}Loading`]: false }); // Generic loading state removal
         }
    };


    const toggleWindowVisibility = (id: string, initialState: Partial<WindowState> = {}) => {
        setWindowStates(prev => {
            const currentState = prev[id];
            let newState: WindowState;

            if (!currentState || !currentState.isVisible) { // Opening or first time
                newState = {
                    id,
                    isVisible: true,
                    isMinimized: false, // Ensure not minimized when opening
                    zIndex: getNextZIndex(), // Get new zIndex immediately
                    ...initialState // Apply initial state if provided
                };
                 // Fetch data when opening
                 setTimeout(() => fetchDataForWindow(id), 10); // Defer slightly
             } else { // Closing
                newState = {
                    ...currentState,
                    isVisible: false,
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
        // No need to set loading state here, fetchDataForWindow handles it
        fetchDataForWindow(id); // This also sets isVisible=true, isMinimized=false, zIndex
    };


    // --- Menu/Action Handlers ---
    const handleGenericAction = async (title: string, idToClose?: string, payload?: any, keepOpen?: boolean) => {
         const description = `Action: ${title}. Payload: ${JSON.stringify(payload) || 'N/A'}.`;
         toast({ title: `Action: ${title}`, description: "Executing..." });
         console.log(`Action triggered: ${title}`, payload || '');

         let success = true;
         let resultMessage = `${title} completed (Placeholder).`;

         try {
             // --- Implement Backend Calls for Generic Actions ---
             switch (title) {
                  case 'Save Vault Config': // Placeholder
                  case 'Check for Updates': // Placeholder
                  case 'Attach Debugger': // Needs DAP integration
                  case 'Add Debug Config': // Needs DAP integration
                  case 'Import from GitHub': // Needs OAuth + Git Service
                  case 'Start Docker Env': // Needs Deployment/Lang Env Service
                  case 'Deploy to K8s/Cloud': // Needs Deployment Service
                  case 'Manage Deployments': // Needs Deployment Service
                  case 'Configure Hosting': // Needs Deployment Service
                  case 'Add New Language Env': // Needs Lang Env Service
                  case 'Activate Env': // Needs Lang Env Service + PTY restart?
                  case 'Modify Env': // Needs Lang Env Service
                  case 'Delete Knowledge': // Needs AI Service Memory endpoint
                  case 'Cancel Tune': // Needs AI Service Finetune endpoint
                  case 'Start Fine-tuning': // Needs AI Service Finetune endpoint + dataset upload
                  case 'Save Ollama Config': // Needs local storage or backend config service
                  case 'Run Profiling Analysis': // Needs call to Observability service/agent
                  case 'Trigger Auto-Fix PR': // Needs SAST result + Git service + Agent Coordinator
                      console.log(`TODO: Implement backend logic for action: ${title}`);
                      await new Promise(r => setTimeout(r, 500)); // Simulate work
                      break;
                  case 'Create New Workflow':
                       // Open editor with a template? Or show a specific creation dialog?
                       toggleWindowVisibility('manageWorkflows'); // Reopen for now, needs specific create UI
                       resultMessage = "Workflow creation UI needed.";
                      break;
                  case 'Run Workflow':
                  case 'Edit Workflow':
                  case 'Delete Workflow':
                      const wfId = payload?.workflowId;
                      if (!wfId) throw new Error("Workflow ID missing.");
                      let wfUrl = `${WORKFLOW_SERVICE_URL}/workflows/${wfId}`;
                      let wfMethod: 'POST' | 'GET' | 'DELETE' = 'GET';
                      let wfBody: any = undefined;
                      if (title.startsWith('Run')) { wfMethod = 'POST'; wfUrl += '/execute'; }
                      if (title.startsWith('Delete')) { wfMethod = 'DELETE'; }
                      if (title.startsWith('Edit')) {
                          // Fetch content first, then open editor or dedicated window
                           const res = await fetch(wfUrl);
                           if (!res.ok) throw new Error(`Failed to fetch workflow ${wfId}`);
                           const data = await res.json();
                           toggleWindowVisibility('manageWorkflows', { workflowId: wfId, workflowContent: data.workflow?.yamlContent }); // Open edit UI
                           resultMessage = `Opened workflow ${wfId} for editing.`;
                          break; // Skip generic fetch below
                      }

                      const wfRes = await fetch(wfUrl, { method: wfMethod, body: wfBody ? JSON.stringify(wfBody) : undefined, headers: {'Content-Type': 'application/json'} });
                      if (!wfRes.ok) throw new Error(`Workflow action failed: ${wfRes.statusText}`);
                      const wfData = await wfRes.json();
                      resultMessage = wfData.message || `${title} successful.`;
                      // Refresh workflow list after delete/create/update
                      if (title.startsWith('Delete') || title.startsWith('Create')) {
                          fetchDataForWindow('manageWorkflows');
                      }
                      break;
                 case 'Install Plugin':
                 case 'Uninstall Plugin':
                 case 'Update Plugin':
                     const pluginId = payload?.pluginId;
                     if (!pluginId) throw new Error("Plugin ID missing.");
                     let pluginAction = title.split(' ')[0].toLowerCase(); // install, uninstall, update
                     const pluginRes = await fetch(`${PLUGIN_REGISTRY_URL}/plugins/${pluginId}/${pluginAction}`, { method: 'POST' });
                      if (!pluginRes.ok) throw new Error(`Plugin action failed: ${pluginRes.statusText}`);
                      const pluginData = await pluginRes.json();
                      resultMessage = pluginData.message || `${title} successful.`;
                      // Refresh plugin list
                      fetchDataForWindow('pluginManager');
                      fetchDataForWindow('marketplace');
                     break;
                 // Add more cases for other generic actions
             }
             toast({ title: title, description: resultMessage });

         } catch (error: any) {
             success = false;
             resultMessage = `Error during ${title}: ${error.message}`;
             toast({ title: `Action Failed: ${title}`, description: error.message, variant: "destructive" });
             console.error(`Error executing generic action "${title}":`, error);
         }


        if (idToClose && !keepOpen && success) {
            // Close the window that triggered the action only on success
            updateWindowState(idToClose, { isVisible: false });
        } else if (idToClose === 'git' && success) {
             // Optionally refresh Git status after action without closing
             fetchDataForWindow('git');
        } else if (idToClose === 'manageSecrets' && success) {
             fetchDataForWindow('manageSecrets'); // Refresh after add/delete
        }
        // Add refreshes for other specific windows if needed
    };

    // Function to get selected code from Monaco
    const getSelectedCode = (): string => {
        try {
            const selection = editorRef.current?.getSelection();
            return selection ? editorRef.current?.getModel()?.getValueInRange(selection) || "" : "";
        } catch (error) {
             console.warn("Error getting selected code:", error);
             return "";
        }
    };
     // Function to get all code from Monaco
     const getAllCode = (): string => {
         try {
             return editorRef.current?.getModel()?.getValue() || "";
         } catch (error) {
             console.warn("Error getting all code:", error);
             return codeEditorContent; // Fallback to local state if Monaco fails
         }
     };


    const handleExplainCode = () => {
        const code = getSelectedCode() || getAllCode();
        if (!code.trim()) {
            toast({ title: "Explain Code", description: "Editor is empty or no code selected.", variant: "destructive" });
            return;
        }
        toggleWindowVisibility('explainCode', { codeContext: code });
    };

    const handleRefactorCode = () => {
        const code = getSelectedCode();
        if (!code.trim()) {
            toast({ title: "Refactor Code", description: "Please select code in the editor first.", variant: "destructive" });
            return;
        }
        toggleWindowVisibility('refactorCode', { codeContext: code });
    };

    const handleGenerateTests = () => {
        const code = getSelectedCode() || getAllCode();
        if (!code.trim()) {
            toast({ title: "Generate Tests", description: "Editor is empty or no code selected.", variant: "destructive" });
            return;
        }
        toggleWindowVisibility('generateTests', { codeContext: code });
    };

    const handleGenerateDocs = () => {
        const code = getSelectedCode() || getAllCode();
        if (!code.trim()) {
            toast({ title: "Generate Docs", description: "Editor is empty or no code selected.", variant: "destructive" });
            return;
        }
        toggleWindowVisibility('generateDocs', { codeContext: code });
    };

    const handleFixBug = () => {
        const code = getSelectedCode() || getAllCode();
        if (!code.trim()) {
            toast({ title: "Fix Bug", description: "Select code containing the bug or use the whole file.", variant: "destructive" });
            return;
        }
        toggleWindowVisibility('fixBug', { codeContext: code });
    };

    // --- Self-Reflective Error Recovery (Conceptual) ---
    let repairAttempts = 0;
    const MAX_REPAIR_ATTEMPTS = 3;

    const runTestsAndGetFeedback = async (code: string): Promise<{ passed: boolean; feedback: string }> => {
         console.log("Running tests on generated/refactored code... (Simulation)");
         // TODO: Integrate with actual testing framework via Lang Env Service or dedicated testing service
         // 1. Write code to a temporary file (or use existing file context)
         // 2. Execute test command (e.g., `npm test`, `pytest`) via Lang Env Service
         // 3. Parse test output to determine pass/fail and extract error messages/feedback
         await new Promise(r => setTimeout(r, 1000)); // Simulate test run
         const testsPassed = Math.random() > 0.4; // Simulate 60% pass rate initially
         const feedback = testsPassed ? "All tests passed!" : "Test failed: `TypeError: Cannot read property 'name' of undefined` in component X.";
         console.log("Test Result:", feedback);
         return { passed: testsPassed, feedback };
     };


    // Centralized Agent Action Handler with Self-Correction Loop
    const handleAgentAction = async (
        title: string,
        idToClose?: string,
        agentName?: string,
        payload: any = {},
        keepOpen = false,
        isRepairAttempt = false // Flag for recursive calls
    ) => {
        if (idToClose && !keepOpen && !isRepairAttempt) { // Don't close window during repair loop
            updateWindowState(idToClose, { isVisible: false });
        }
        if (!agentName) {
            toast({ title: `${title} Failed`, description: `No agent specified for this action.`, variant: "destructive" });
            console.error(`Agent action validation failed for "${title}": Missing agentName.`);
            return;
        }

        if (!isRepairAttempt) {
            repairAttempts = 0; // Reset attempts for new user action
             toast({ title: title, description: `Calling Agent '${agentName}'...` });
         } else {
             toast({ title: title, description: `Attempting repair (Attempt ${repairAttempts + 1}/${MAX_REPAIR_ATTEMPTS})...` });
         }
         console.log(`Calling agent: ${agentName} (Attempt ${repairAttempts + 1}) with payload:`, payload);

         // --- Input validation (as before) ---
         // ... (keep validation logic here) ...
          if ((agentName === 'codeGenAgent' || agentName === 'scaffoldAgent' || agentName === 'iacGenAgent') && (!payload.prompt && !payload.description)) {
              toast({ title: `${title} Failed`, description: `Prompt or description is required for ${agentName}.`, variant: "destructive" });
              console.error(`Validation failed for ${agentName}: Missing prompt/description.`);
              return;
          }
          if ((agentName === 'ragAgent' || agentName === 'queryKnowledge') && !payload.prompt) { // Allow queryKnowledge alias
              toast({ title: `${title} Failed`, description: `Query prompt is required for ${agentName}.`, variant: "destructive" });
              console.error(`Validation failed for ${agentName}: Missing query prompt.`);
              return;
          }
           const codeAgents = ['explainCodeAgent', 'refactorAgent', 'testGenAgent', 'docGenAgent', 'fixBugAgent', 'sastAgent'];
           if (codeAgents.includes(agentName) && (!payload.code && !payload.context?.code)) {
              const editorCode = getAllCode();
              if (!editorCode) {
                   toast({ title: `${title} Failed`, description: `Code context is required for ${agentName}.`, variant: "destructive" });
                   console.error(`Validation failed for ${agentName}: Missing code context.`);
                   return;
              }
              payload.code = editorCode; // Add editor code if missing
              if (!payload.context) payload.context = {};
              payload.context.code = editorCode;
          }
          if (agentName === 'ingestAgent' && !payload.text) {
              toast({ title: `${title} Failed`, description: `Text content is required for ${agentName}.`, variant: "destructive" });
              console.error(`Validation failed for ${agentName}: Missing text content.`);
              return;
          }


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
             console.log(`Agent ${agentName} Result:`, response.result);
             // Handle the successful result appropriately
              let resultString = "";
              let resultCode = "";

              if (typeof response.result === 'string') {
                  // Determine if string looks like code or just text
                  if (response.result.includes('\n') && (response.result.includes(';') || response.result.includes('{') || response.result.includes('def ') || response.result.includes('class '))) {
                      resultCode = response.result;
                  } else {
                      resultString = response.result;
                  }
              } else if (response.result) {
                  // Prioritize specific keys for code-like content
                  resultCode = response.result.code || response.result.tests || response.result.files || response.result.iacConfig || response.result.refactoredCode || response.result.fixedCode || ""; // Added fixedCode
                  // Get other text-based results
                  resultString = response.result.explanation || response.result.summary || response.result.message || response.result.vulnerabilities || response.result.response || "";
                  // Fallback to stringifying if still no specific text found
                  if (!resultString && !resultCode) {
                      resultString = JSON.stringify(response.result, null, 2);
                  }
              }

             // --- Self-Correction Logic ---
              const needsCorrection = (agentName === 'codeGenAgent' || agentName === 'refactorAgent' || agentName === 'fixBugAgent') && resultCode;
              let testsPassed = true; // Assume pass if no correction needed
              let testFeedback = "N/A";

              if (needsCorrection) {
                   const testResult = await runTestsAndGetFeedback(resultCode);
                   testsPassed = testResult.passed;
                   testFeedback = testResult.feedback;

                  if (!testsPassed && repairAttempts < MAX_REPAIR_ATTEMPTS) {
                       repairAttempts++;
                       toast({ title: "Code Needs Repair", description: `Tests failed. Attempting AI fix... (Attempt ${repairAttempts})`, variant: "default" });
                       // Recurse: Call fixBugAgent with the failed code and test feedback
                       const repairPayload = {
                           code: resultCode,
                           description: `The previous attempt resulted in test failures. Please fix the following issue(s):\n${testFeedback}`,
                           context: payload.context // Pass original context if relevant
                       };
                       // Call handleAgentAction recursively for repair
                        await handleAgentAction("Fix Bug (Repair)", undefined, 'fixBugAgent', repairPayload, true, true); // Keep window open during repair
                        return; // Exit current handler after initiating repair
                   } else if (!testsPassed) {
                       toast({ title: "Repair Failed", description: `Maximum repair attempts (${MAX_REPAIR_ATTEMPTS}) reached. Manual review needed.`, variant: "destructive" });
                        // Insert the potentially broken code anyway, but warn the user
                        resultString += `\n\n[WARNING] Automated tests failed after ${MAX_REPAIR_ATTEMPTS} repair attempts. Last feedback: ${testFeedback}`;
                    } else {
                         toast({ title: "Tests Passed!", description: "Generated/Refactored code passed validation." });
                    }
              }
              // --- End Self-Correction Logic ---


             // Insert code into editor or display result (Only if tests passed or max attempts reached)
              if (resultCode && editorRef.current && monacoRef.current && testsPassed) {
                  const editor = editorRef.current;
                  const monaco = monacoRef.current;
                  const model = editor.getModel();
                  if (model) {
                      const selection = editor.getSelection();
                      // If generated code looks like a replacement for the selection, use it
                       // Use includes instead of startsWith for flexibility
                      if (selection && !selection.isEmpty() && (agentName.includes('refactor') || agentName.includes('fixBug') || agentName.includes('Repair'))) {
                          editor.executeEdits("ai-agent", [{ range: selection, text: resultCode }]);
                           toast({ title: "Code Updated", description: `Code from ${response.agentUsed} replaced selection.` , duration: 5000});
                      } else {
                          // Otherwise, insert at cursor (safer default)
                          const position = editor.getPosition();
                          if (position) {
                              const range = new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column);
                              editor.executeEdits("ai-agent", [{ range: range, text: `\n${resultCode}\n` }]);
                              editor.revealPositionInCenter(position); // Scroll to insertion
                              toast({ title: "Code Generated", description: `Code from ${response.agentUsed} inserted into editor.` , duration: 5000});
                          } else {
                              // Fallback: Append if no position? Unlikely with Monaco.
                              setCodeEditorContent(prev => `${prev}\n${resultCode}\n`);
                               toast({ title: "Code Appended", description: `Could not get cursor position, code appended.` , duration: 5000});
                          }
                      }
                      // TODO: Add Token-Based Memory Highlights
                      // Example: analyze `resultCode` for function/class signatures and send to AI service to store tokens
                      // extractAndStoreMemoryTokens(resultCode, activeEditorFile);
                  }
              } else if (resultString) {
                  // Display other results (explanations, RAG answers, vulnerabilities)
                   toast({ title: `${response.agentUsed} Result`, description: resultString.substring(0, 300) + (resultString.length > 300 ? "..." : ""), duration: 10000 });
                   console.log(`${response.agentUsed} Result String:`, resultString);
                    // If it was a security scan result, update the security window state
                   if (agentName === 'sastAgent') {
                        updateWindowState('security', { securityData: resultString, securityLoading: false });
                        if (!windowStates.security.isVisible && !windowStates.security.isMinimized) {
                            toggleWindowVisibility('security'); // Open the window if not already open/minimized
                        }
                   }
              } else if (!resultCode) {
                  toast({ title: `${response.agentUsed} Result`, description: `Agent completed but returned no displayable result. Check console.`, duration: 5000 });
              }
        } else {
            toast({ title: `${title} Failed`, description: `Agent ${response.agentUsed || agentName} error: ${response.error}`, variant: "destructive", duration: 7000 });
        }

         // Refresh relevant data panels after certain actions (only on initial call success, not during repair)
        if (!isRepairAttempt) {
             if (agentName === 'sastAgent' && !keepOpen) {
                 fetchDataForWindow('security');
             }
             // Add refreshes for other panels if needed
        }
    };

    // --- Token-Based Memory Highlight Placeholder ---
    const extractAndStoreMemoryTokens = async (code: string, filePath?: string | null) => {
         console.log("Extracting and storing memory tokens... (Placeholder)");
         // 1. Parse the code (simple regex or AST parser) to find imports, functions, classes
         // 2. Construct payload for AI service (memory endpoint)
         // 3. Call AI service to store tokens associated with filePath and code fragments
         // Example payload: { type: 'store_tokens', filePath: filePath, tokens: [{ type: 'function', name: 'myFunc', signature: '...', fragment: '...' }] }
         // await fetch(`${AI_SERVICE_URL}/memory/tokens`, { method: 'POST', body: JSON.stringify(payload) });
    };


    const handleFileAction = async (actionType: 'openFile' | 'openFolder' | 'saveAs' | 'save', windowId?: string) => {
         const fileInputId = `${actionType}-input`;
         const saveNameInputId = 'save-as-name';
         const fileInput = actionType === 'openFile' || actionType === 'openFolder' ? document.getElementById(fileInputId) as HTMLInputElement : null;
         let description = "Action initiated.";
         let payload: any = {};

         if (actionType === 'openFile') {
              if (!fileInput) return; // Should not happen if called correctly
              fileInput.click(); // Trigger file selection dialog
              fileInput.onchange = (e) => {
                 const file = (e.target as HTMLInputElement)?.files?.[0];
                 if (file) {
                      description = `Opening: ${file.name}`;
                      payload = { file };
                      console.log(`Reading file:`, file.name);
                       // Read locally for immediate feedback, backend might re-read or sync
                      const reader = new FileReader();
                      reader.onload = (readEvent) => {
                          const content = readEvent.target?.result as string;
                          setActiveEditorFile(file.name); // Trigger useEffect to load content & setup binding
                          toast({ title: "File Opened", description: `${file.name} loading...` });
                      };
                      reader.onerror = (readEvent) => {
                          toast({ title: "File Read Error", description: `Could not read file ${file.name}.`, variant: "destructive" });
                          console.error("File read error:", readEvent);
                      };
                      reader.readAsText(file);
                      if (windowId) handleGenericAction(actionType, windowId, payload); // Close 'Open File' window
                  } else {
                       toast({ title: `${actionType} Canceled`, description: "No file selected." });
                  }
                  fileInput.value = ''; // Reset input for next time
              }
         } else if (actionType === 'openFolder') {
              if (!fileInput) return;
              fileInput.click();
               fileInput.onchange = (e) => {
                  const files = (e.target as HTMLInputElement)?.files;
                  if (files && files.length > 0) {
                      // Folder path usually derived from webkitRelativePath
                      const folderPath = files[0].webkitRelativePath.split('/')[0] || 'Selected Folder';
                      description = `Opening Folder: ${folderPath}`;
                      payload = { folderPath }; // Send path to backend
                      console.log(`Requesting file tree for folder:`, folderPath);
                      // Assuming FileExplorer has a method `loadFolder(path)` exposed via ref
                       if (fileExplorerRef.current) {
                           fileExplorerRef.current.loadFolder(folderPath); // Trigger loading in FileExplorer
                       } else {
                            // Fallback: Make direct API call if ref not available
                            fetch(`${FILE_SERVICE_URL}/list?path=${encodeURIComponent(folderPath)}&recursive=true`)
                               .then(res => res.json())
                               .then(data => { /* TODO: Update FileExplorer state externally */ })
                               .catch(err => toast({ title: "Error", description: `Could not list folder ${folderPath}`, variant: "destructive" }));
                       }

                      toast({ title: "Open Folder", description: `Requesting file tree for ${folderPath}...` });
                      if (windowId) handleGenericAction(actionType, windowId, payload);
                  } else {
                      toast({ title: `${actionType} Canceled`, description: "No folder selected." });
                  }
                   fileInput.value = ''; // Reset input
              }
         } else if (actionType === 'saveAs' || actionType === 'save') {
              let filename: string | null = null;
              if (actionType === 'saveAs') {
                  const saveNameInput = windowStates.saveAs?.fileName?.trim() || null; // Use state
                  filename = saveNameInput || null;
                  if (!filename) {
                      toast({ title: "Save Failed", description: "Filename cannot be empty for Save As.", variant: "destructive" });
                      return;
                  }
              } else { // actionType === 'save'
                  filename = activeEditorFile;
                  if (!filename) {
                      // If no active file, trigger Save As instead
                      toggleWindowVisibility('saveAs');
                      return;
                  }
              }

              description = `Saving as: ${filename}`;
              const content = getAllCode(); // Get current editor content
              payload = { path: filename, content };
              console.log(`Saving file:`, filename);
              try {
                   const saveRes = await fetch(`${FILE_SERVICE_URL}/write`, {
                       method: 'POST',
                       body: JSON.stringify(payload),
                       headers: { 'Content-Type': 'application/json' }
                   });
                   if (!saveRes.ok) {
                       const errorData = await saveRes.json().catch(() => ({}));
                       throw new Error(errorData.message || `Save failed: ${saveRes.statusText}`);
                   }
                    toast({ title: "Saved", description: `${filename} saved successfully.` });
                    if (actionType === 'saveAs') {
                        setActiveEditorFile(filename); // Update active file after Save As
                         if (windowId) handleGenericAction(actionType, windowId, payload); // Close 'Save As' window
                    }
                    // Update memory tokens after save
                    extractAndStoreMemoryTokens(content, filename);
              } catch (error: any) {
                   toast({ title: "Save Error", description: error.message, variant: "destructive" });
                   console.error("Save error:", error);
              }
         }
    };


      const handleSecretAction = async (actionType: 'add' | 'delete', windowId: string) => {
          const windowState = windowStates[windowId];
         const key = windowState?.secretKey?.trim();
         const value = windowState?.secretValue; // Might be undefined for delete
         const scope = windowState?.scope;

         if (!key) {
             toast({ title: "Secret Action Failed", description: "Secret key cannot be empty.", variant: "destructive" });
             return;
         }
         if (actionType === 'add' && typeof value !== 'string') {
             toast({ title: "Secret Action Failed", description: "Secret value is required to add/update.", variant: "destructive" });
             return;
         }

         toast({ title: `Secret Action: ${actionType}`, description: `Performing ${actionType} on key: ${key}...`});

         let success = false;
         try {
             if (actionType === 'add') {
                 success = await setSecret(key, value!, scope);
             } else if (actionType === 'delete') {
                 success = await deleteSecret(key, scope);
             }
         } catch (error: any) {
             success = false;
              toast({ title: `Secret Action Failed`, description: `Error: ${error.message}`, variant: "destructive" });
              console.error("Secret action error:", error);
         }


         if (success) {
             toast({
                 title: `Secret ${actionType === 'add' ? 'Set' : 'Deleted'}`,
                 description: `Key: ${key}`,
                 variant: "default"
             });
             updateWindowState(windowId, { secretKey: '', secretValue: '' });
             fetchDataForWindow(windowId); // Refetch data to update list
         }
      };

      // Handler for environment variable actions
      const handleEnvVarAction = (actionType: 'add' | 'delete', scope: 'project' | 'account', windowId: string) => {
          const windowState = windowStates[windowId];
          const name = windowState?.envVarName?.trim();
          const value = windowState?.envVarValue; // Might be undefined

          if (!name) {
              toast({ title: "Env Var Action Failed", description: "Variable name cannot be empty.", variant: "destructive" });
              return;
          }
          if (actionType === 'add' && typeof value !== 'string') {
              toast({ title: "Env Var Action Failed", description: "Variable value is required to add/update.", variant: "destructive" });
              return;
          }

          console.log(`TODO: Implement ${actionType} env var '${name}' for scope '${scope}' via backend service.`);
          toast({ title: `Env Var Action: ${actionType}`, description: `TODO: ${actionType} ${name} (${scope})` });

          // Placeholder: Update local state visually (needs backend call)
           const currentVars = windowState?.envVars || [];
           let updatedVars: {name: string, value: string}[];
           if (actionType === 'add') {
               const existingIndex = currentVars.findIndex(v => v.name === name);
               if (existingIndex > -1) {
                   updatedVars = [...currentVars];
                   updatedVars[existingIndex] = { name, value: value! };
               } else {
                   updatedVars = [...currentVars, { name, value: value! }];
               }
           } else { // delete
               updatedVars = currentVars.filter(v => v.name !== name);
           }

          // Update window state and clear inputs
           updateWindowState(windowId, {
              envVars: updatedVars,
              envVarName: '',
              envVarValue: ''
          });
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
          const findText = windowStates.findReplace?.findText;
          if (!findText || !editorRef.current) {
               toast({ title: "Find Failed", description: "Enter text to find and ensure editor is active.", variant: "destructive" });
              return;
          }
          // Use Monaco's find controller
          editorRef.current.getAction('actions.find').run();
          // TODO: Pre-fill find widget - might require accessing internal controller state which is unstable
          toast({ title: "Find Action", description: `Finding "${findText}". Use editor widget (Ctrl+F).` });
     };

     const handleReplace = (replaceAll = false) => {
          const findText = windowStates.findReplace?.findText;
          const replaceText = windowStates.findReplace?.replaceText ?? "";
          if (!findText || !editorRef.current) {
              toast({ title: "Replace Failed", description: "Enter text to find and ensure editor is active.", variant: "destructive" });
               return;
          }
          // Use Monaco's replace controller/actions
          editorRef.current.getAction('editor.action.startFindReplaceAction').run();
          // TODO: Pre-fill replace widget - similar challenges as find
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

     // Memoized list of visible or minimized windows, sorted by zIndex
     const windowList = React.useMemo(() => Object.values(windowStates)
         .filter(state => state.isVisible || state.isMinimized)
         .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)), [windowStates]);


     // --- Render Logic ---
     return (
         <div className="flex flex-col h-screen overflow-hidden bg-background">
             {/* File inputs hidden, triggered programmatically */}
              <input type="file" id="openFile-input" style={{ display: 'none' }} onChange={(e) => handleFileAction('openFile')} />
              <input type="file" id="openFolder-input" {...{ webkitdirectory: "", directory: "" } as any} style={{ display: 'none' }} onChange={(e) => handleFileAction('openFolder')} />
              <input type="file" id="installVsix-input" accept=".vsix,.qcx" style={{ display: 'none' }} onChange={(e) => { handleGenericAction('Install VSIX/QCX', undefined, { file: (e.target as HTMLInputElement)?.files?.[0] }) }} />
               <input type="file" id="knowledge-file-input" style={{ display: 'none' }} onChange={(e) => { handleGenericAction('Ingest Knowledge File', undefined, { file: (e.target as HTMLInputElement)?.files?.[0] }) }} />
                <input type="file" id="finetune-dataset-input" accept=".jsonl,.csv" style={{ display: 'none' }} onChange={(e) => { handleGenericAction('Upload Fine-tune Dataset', undefined, { file: (e.target as HTMLInputElement)?.files?.[0] }) }} />


             {/* Menu Bar */}
             <RetroMenubar
                 // File
                 onShowOpenFile={() => document.getElementById('openFile-input')?.click()}
                 onShowOpenFolder={() => document.getElementById('openFolder-input')?.click()}
                 onSave={() => handleFileAction('save')}
                 onShowSaveAs={() => toggleWindowVisibility('saveAs', { fileName: activeEditorFile || 'untitled.txt' })} // Pre-fill filename
                 onCommandPalette={() => toggleWindowVisibility('commandPalette')}
                 onShowSettings={() => toggleWindowVisibility('settings')}
                 onToggleFullScreen={toggleFullScreen}
                 onShowWelcome={() => toggleWindowVisibility('welcome')}
                 // Edit
                 onFind={() => toggleWindowVisibility('findReplace')}
                 onReplace={() => toggleWindowVisibility('findReplace')}
                 onShowManageSecrets={() => toggleWindowVisibility('manageSecrets')}
                 onShowConfigureVault={() => toggleWindowVisibility('configureVault')}
                 onShowProjectVars={() => toggleWindowVisibility('projectVars')}
                 onShowAccountVars={() => toggleWindowVisibility('accountVars')}
                 // AI
                 onGenerateCode={() => toggleWindowVisibility('generateCode')}
                 onExplainCode={handleExplainCode}
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
                 // Code
                  onStartDebugging={() => handleGenericAction('Start Debugging', undefined)} // Placeholder - Connects to DAP service
                 onAddDebugConfig={() => handleGenericAction('Add Debug Config', 'debugger')} // Opens debugger window in config mode
                 onShowLanguageEnv={() => toggleWindowVisibility('languageEnv')}
                 // Git
                 onShowGitCommit={() => toggleWindowVisibility('git')}
                 onGitPush={() => handleAgentAction('Git Push', 'git', 'gitAgent', { action: 'push' }, true)} // Uses placeholder agent now
                 onGitPull={() => handleAgentAction('Git Pull', 'git', 'gitAgent', { action: 'pull' }, true)}
                 onShowGitBranches={() => toggleWindowVisibility('git')}
                 onShowImportGithub={() => handleGenericAction('Import from GitHub', 'git')}
                 // DevOps
                 onGenerateIaC={() => handleAgentAction('Generate IaC', 'devops', 'iacGenAgent', { prompt: 'Generate Terraform/Pulumi for standard project deployment' }, true)}
                 onApplyIaC={() => handleGenericAction('Apply IaC', 'devops', { configPath: windowStates.devops?.iacConfig }, true)} // Use IaC content from window state
                 onStartDockerEnv={() => handleGenericAction('Start Docker Env', 'devops', { action: 'docker_up' }, true)}
                 onDeployK8s={() => handleGenericAction('Deploy to K8s', 'devops', { action: 'k8s_deploy' }, true)}
                 onManageDeployments={() => toggleWindowVisibility('devops')}
                 onConfigureHosting={() => toggleWindowVisibility('devops')}
                 // View
                 onPluginManagerToggle={() => toggleWindowVisibility('pluginManager')}
                 onShowProfiling={() => toggleWindowVisibility('profiling')}
                 onShowSecurity={() => toggleWindowVisibility('security')}
                 onShowTelemetry={() => toggleWindowVisibility('telemetry')}
                 // Plugins
                 onShowMarketplace={() => toggleWindowVisibility('marketplace')}
                 onShowInstallVsix={() => document.getElementById('installVsix-input')?.click()}
                 onShowManageWorkflows={() => toggleWindowVisibility('manageWorkflows')}
                 // Help
                 onShowDocs={() => window.open('https://github.com/your-repo/QuonxCoder#readme', '_blank')} // Update URL
                 onShowApiDocs={() => window.open('https://github.com/your-repo/QuonxCoder/docs/plugin-api.md', '_blank')} // Update URL
                 onShowVoiceGestureCommands={() => toggleWindowVisibility('configureVoiceGesture')}
                 onCheckForUpdates={() => handleGenericAction('Check for Updates')}
                 onShowAbout={() => toggleWindowVisibility('about')}
             />

             {/* Main Layout */}
             <ResizablePanelGroup direction="horizontal" className="flex-grow border-t-2 border-border-dark relative">

                 {/* Left Panel: File Explorer */}
                 <ResizablePanel defaultSize={18} minSize={10} maxSize={35}>
                     <div className="h-full border-r-2 border-border-dark bg-card">
                         <FileExplorer ref={fileExplorerRef} onFileSelect={setActiveEditorFile} />
                     </div>
                 </ResizablePanel>
                 <ResizableHandle className="retro-separator-v !w-2 bg-card" />

                 {/* Center Panel: Editor & Terminal */}
                 <ResizablePanel defaultSize={52} minSize={30}>
                     <ResizablePanelGroup direction="vertical" className="h-full">
                         <ResizablePanel defaultSize={70} minSize={30}>
                             <div className="h-full p-1 bg-card">
                                 {/* Monaco Code Editor */}
                                 <CodeEditor
                                     initialValue={codeEditorContent}
                                     language={currentLanguage}
                                     onEditorMount={handleEditorDidMount}
                                     // No onChange needed if Yjs binding manages state (currently disabled)
                                     // onChange={(value) => setCodeEditorContent(value || '')} // Use if not using Yjs
                                 />
                             </div>
                         </ResizablePanel>
                         <ResizableHandle className="retro-separator-h !h-2 bg-card" />
                         <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
                             <div className="h-full bg-card">
                                 {/* TerminalAndLogs component manages Terminal/Logs tabs */}
                                 <TerminalAndLogs ref={terminalRef} logStream={logStream} /> {/* Pass logs */}
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
                                 <AIChat getEditorContent={getAllCode} />
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

                 {/* Floating Windows Area - Render based on windowList */}
                  {windowList.map((state) => {
                          if (!state.isVisible) return null; // Only render visible windows

                          // Extract key for React list rendering
                          const key = state.id;
                          // Separate props to avoid passing key directly
                          const { id, ...restOfState } = state;
                          const windowProps = {
                               id: id, // Pass id prop correctly
                               title: getWindowName(id),
                               onClose: () => toggleWindowVisibility(id),
                               onMinimize: () => minimizeWindow(id),
                               style: { zIndex: state.zIndex || 10 },
                               isMinimized: state.isMinimized // Should always be false here due to filter, but good practice
                           };
                           let content: React.ReactNode = null;
                           let className = "w-80 h-64"; // Default size
                           let initialPosition = { top: `${20 + Math.random() * 20}%`, left: `${30 + Math.random() * 30}%` };

                           // --- Define Window Content Components or Inline JSX ---
                           switch (id) {
                                case 'pluginManager':
                                    className = "w-[600px] h-[450px]"; // Use wider class
                                    content = <PluginManagerContent
                                                  plugins={state.marketplacePlugins || []}
                                                  loading={state.marketplaceLoading || false}
                                                  onInstall={(plugin) => handleGenericAction(`Install Plugin`, undefined, { pluginId: plugin.id })}
                                                  onUninstall={(plugin) => handleGenericAction(`Uninstall Plugin`, undefined, { pluginId: plugin.id })}
                                                  onUpdate={(plugin) => handleGenericAction(`Update Plugin`, undefined, { pluginId: plugin.id })}
                                              />;
                                    break;
                                // openFile/openFolder/installVsix handled by hidden inputs + menubar click
                               case 'saveAs':
                                   className = "w-96 h-auto";
                                   content = (
                                       <div className="p-4 flex flex-col gap-2">
                                           <Label htmlFor="save-as-name" className="text-sm">Save As:</Label>
                                            {/* Controlled input using window state */}
                                           <Input id="save-as-name" type="text" className="retro-input h-7 text-xs" autoFocus
                                                  value={state.fileName || ''}
                                                  onChange={(e) => updateWindowState(id, { fileName: e.target.value })}
                                                  onKeyDown={(e) => e.key === 'Enter' && handleFileAction('saveAs', id)} />
                                           <div className="flex justify-end gap-2 mt-2">
                                               <Button className="retro-button" size="sm" onClick={() => toggleWindowVisibility(id)}>Cancel</Button>
                                               <Button className="retro-button" size="sm" onClick={() => handleFileAction('saveAs', id)}>Save</Button>
                                           </div>
                                       </div>
                                   );
                                   break;
                                case 'manageSecrets':
                                   className = "w-[450px] h-[350px]"; // Wider for scope
                                   content = (
                                        <div className="w-full h-full bg-card p-2 text-sm flex flex-col">
                                            <p className="mb-1 font-semibold flex items-center gap-1"><BookLock size={14} />Secrets Vault</p>
                                            <Label htmlFor="secret-scope" className="text-xs">Scope (e.g., project:id, account:id, leave blank for global):</Label>
                                            <Input id="secret-scope" placeholder="global" className="retro-input h-6 text-xs mb-1" defaultValue={state.scope} onChange={e => updateWindowState(id, { scope: e.target.value })} />
                                            <ScrollArea className="h-32 flex-grow retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                                {state.secretsLoading ? <p>Loading secrets...</p> : (
                                                    <ul>
                                                        {state.secretsList && state.secretsList.length > 0 ? state.secretsList.map((secret) => (
                                                            <li key={secret.key} className={`flex justify-between items-center hover:bg-secondary/50 px-1 ${state.secretKey === secret.key ? 'bg-primary/20' : ''}`}>
                                                                <span>{secret.key}: ******** {secret.scope && `(${secret.scope})`}</span>
                                                                 <div className="flex items-center">
                                                                    <Button variant="ghost" size="icon" className="retro-button !p-0 !w-4 !h-4" onClick={() => updateWindowState(id, { secretKey: secret.key, secretValue: '' })} title={`Edit ${secret.key}`}><Pencil size={10}/></Button>
                                                                    <Button variant="ghost" size="icon" className="retro-button !p-0 !w-4 !h-4 text-destructive ml-1" onClick={() => {updateWindowState(id, { secretKey: secret.key }); handleSecretAction('delete', id)}} title={`Delete ${secret.key}`}><Trash2 size={10}/></Button>
                                                                 </div>
                                                             </li>
                                                        )) : <li>No secrets found for this scope.</li>}
                                                    </ul>
                                                )}
                                            </ScrollArea>
                                            <div className="flex gap-2 mt-2">
                                                <Input id="secret-key-input" placeholder="Secret Key" className="retro-input h-7 text-xs flex-grow" value={state.secretKey || ''} onChange={(e) => updateWindowState(id, { secretKey: e.target.value })} />
                                                <Input id="secret-value-input" type="password" placeholder="Value (required to add/update)" className="retro-input h-7 text-xs flex-grow" value={state.secretValue || ''} onChange={(e) => updateWindowState(id, { secretValue: e.target.value })}/>
                                            </div>
                                            <div className="flex justify-between mt-2">
                                                <Button className="retro-button" size="sm" onClick={() => handleSecretAction('add', id)}>Add/Update</Button>
                                                <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleSecretAction('delete', id)} disabled={!state.secretKey}>Delete Selected</Button>
                                            </div>
                                        </div>
                                    );
                                   break;
                               case 'configureVault':
                                   className = "w-80 h-auto";
                                   content = <SimpleDialogContent title="Configure Secrets Vault" onOk={() => handleGenericAction('Save Vault Config', id)} showCancelButton onCancel={() => toggleWindowVisibility(id)}><p>Vault backend (e.g., DB, HashiCorp) config (TODO).</p></SimpleDialogContent>;
                                   break;
                                case 'projectVars':
                                case 'accountVars':
                                    const scopeType = id === 'projectVars' ? 'project' : 'account';
                                    className = "w-[450px] h-[350px]";
                                    content = (
                                        <div className="w-full h-full bg-card p-2 text-sm flex flex-col">
                                            <p className="mb-1 font-semibold flex items-center gap-1">
                                                {scopeType === 'project' ? <Database size={14}/> : <Globe size={14} />} {scopeType === 'project' ? 'Project' : 'Account'} Environment Variables
                                            </p>
                                            <ScrollArea className="h-40 flex-grow retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                                 {state.envVarsLoading ? <p>Loading variables...</p> : (
                                                     <ul>
                                                         {state.envVars && state.envVars.length > 0 ? state.envVars.map((env) => (
                                                             <li key={env.name} className={`flex justify-between items-center hover:bg-secondary/50 px-1 ${state.envVarName === env.name ? 'bg-primary/20' : ''}`}>
                                                                  <span>{env.name}={env.value}</span>
                                                                  <div>
                                                                       <Button variant="ghost" size="icon" className="retro-button !p-0 !w-4 !h-4" onClick={() => updateWindowState(id, { envVarName: env.name, envVarValue: env.value })} title={`Edit ${env.name}`}><Pencil size={10}/></Button>
                                                                       <Button variant="ghost" size="icon" className="retro-button !p-0 !w-4 !h-4 text-destructive ml-1" onClick={() => {updateWindowState(id, { envVarName: env.name }); handleEnvVarAction('delete', scopeType, id)}} title={`Delete ${env.name}`}><Trash2 size={10}/></Button>
                                                                  </div>
                                                               </li>
                                                         )) : <li>No variables defined for this scope.</li>}
                                                     </ul>
                                                 )}
                                            </ScrollArea>
                                            <div className="flex gap-2 mt-2">
                                                <Input id={`${scopeType}-env-name-input`} placeholder="Variable Name" className="retro-input h-7 text-xs flex-grow" value={state.envVarName || ''} onChange={e => updateWindowState(id, { envVarName: e.target.value })} />
                                                <Input id={`${scopeType}-env-value-input`} placeholder="Value" className="retro-input h-7 text-xs flex-grow" value={state.envVarValue || ''} onChange={e => updateWindowState(id, { envVarValue: e.target.value })}/>
                                            </div>
                                            <div className="flex justify-between mt-2">
                                                <Button className="retro-button" size="sm" onClick={() => handleEnvVarAction('add', scopeType, id)}>Add/Update</Button>
                                                <Button className="retro-button" size="sm" variant="destructive" onClick={() => handleEnvVarAction('delete', scopeType, id)} disabled={!state.envVarName}>Delete Selected</Button>
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
                                               <Input id="find-input" type="text" className="retro-input h-6 text-xs flex-grow" value={state.findText || ''} onChange={(e) => updateWindowState(id, { findText: e.target.value })} autoFocus />
                                           </div>
                                           <div className="flex gap-1 items-center">
                                               <Label htmlFor="replace-input" className="text-xs w-12 shrink-0">Replace:</Label>
                                               <Input id="replace-input" type="text" className="retro-input h-6 text-xs flex-grow" value={state.replaceText || ''} onChange={(e) => updateWindowState(id, { replaceText: e.target.value })} />
                                           </div>
                                           <div className="flex justify-end gap-1 mt-1">
                                               <Button className="retro-button !px-2 !py-0.5" size="sm" onClick={handleFind}>Find Next</Button>
                                               <Button className="retro-button !px-2 !py-0.5" size="sm" onClick={() => handleReplace(false)}>Replace</Button>
                                               <Button className="retro-button !px-2 !py-0.5" size="sm" onClick={() => handleReplace(true)}>Replace All</Button>
                                           </div>
                                       </div>
                                   );
                                   break;
                               case 'commandPalette': // Basic structure, needs command execution logic
                                   className = "w-[500px] h-auto max-h-[400px] flex flex-col";
                                   content = (
                                       <div className="p-1 flex flex-col gap-1 h-full">
                                           <Input placeholder="Enter command..." className="retro-input h-7 w-full mb-1" autoFocus onChange={(e) => console.log("TODO: Filter commands", e.target.value)} />
                                           <ScrollArea className="flex-grow retro-scrollbar border border-border-dark bg-white p-1">
                                               {/* TODO: Populate with actual commands */}
                                               <ul>
                                                    <li className="hover:bg-primary/10 p-1 cursor-default" onClick={() => handleGenericAction('Run: Build', id)}>Run: Build Project</li>
                                                    <li className="hover:bg-primary/10 p-1 cursor-default" onClick={() => handleGenericAction('Run: Test', id)}>Run: Unit Tests</li>
                                                    <li className="hover:bg-primary/10 p-1 cursor-default" onClick={() => { toggleWindowVisibility('git'); toggleWindowVisibility(id); }}>Git: Commit...</li>
                                                    <li className="hover:bg-primary/10 p-1 cursor-default" onClick={() => { toggleWindowVisibility('generateCode'); toggleWindowVisibility(id); }}>AI: Generate Code...</li>
                                                </ul>
                                           </ScrollArea>
                                       </div>
                                   );
                                   break;
                                case 'marketplace': // Display available plugins
                                   className = "w-[600px] h-[450px]";
                                   content = (
                                       <div className="p-2 text-sm flex flex-col h-full">
                                            <p className="mb-1 font-semibold flex items-center gap-1"><PackageOpen size={14} />Plugin Marketplace</p>
                                            <Input type="search" placeholder="Search marketplace..." className="retro-input mb-2 h-7" aria-label="Search Marketplace" />
                                            <ScrollArea className="flex-grow retro-scrollbar border border-border-dark p-1 bg-white">
                                                {state.marketplaceLoading ? <p>Loading plugins...</p> : (
                                                    <ul>
                                                       {(state.marketplacePlugins || []).map(plugin => (
                                                           <li key={plugin.id} className="mb-1 p-1 border border-transparent hover:border-border-dark flex justify-between items-start">
                                                               <div>
                                                                   <span className="font-semibold">{plugin.name} v{plugin.version}</span> <span className="text-xs text-muted-foreground">({plugin.category})</span>
                                                                   {plugin.installed && <span className="text-xs text-green-600 ml-1">(Installed)</span>}
                                                                   {plugin.updateAvailable && <span className="text-xs text-blue-600 ml-1">(Update Available)</span>}
                                                                   <p className="text-xs text-muted-foreground mt-0.5">{plugin.description}</p>
                                                               </div>
                                                                <div className="space-x-1 shrink-0 pl-2">
                                                                   {plugin.installed ? (
                                                                        <>
                                                                           {plugin.updateAvailable && <Button size="sm" className="retro-button !py-0 !px-1" onClick={() => handleGenericAction(`Update Plugin`, undefined, { pluginId: plugin.id })}>Update</Button>}
                                                                           <Button size="sm" variant="destructive" className="retro-button !py-0 !px-1" onClick={() => handleGenericAction(`Uninstall Plugin`, undefined, { pluginId: plugin.id })}>Uninstall</Button>
                                                                       </>
                                                                   ) : (
                                                                       <Button size="sm" className="retro-button !py-0 !px-1" onClick={() => handleGenericAction(`Install Plugin`, undefined, { pluginId: plugin.id })}>Install</Button>
                                                                   )}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </ScrollArea>
                                        </div>
                                   );
                                   break;
                               case 'installVsix': // Handled by hidden input, this window is just a confirmation/progress placeholder
                                   className = "w-96 h-auto";
                                   content = <SimpleDialogContent title="Install from VSIX/QCX"><p>Select a .vsix or .qcx file to install.</p><p>(File selection dialog will open)</p></SimpleDialogContent>;
                                   break;
                                case 'manageWorkflows': // Display and manage YAML workflows
                                   className = "w-[600px] h-[450px]"; // Taller for editor
                                   content = (
                                        <div className="p-2 text-sm flex flex-col h-full">
                                            <p className="mb-1 font-semibold flex items-center gap-1"><Route size={14} />Manage Workflows (.github/workflows or .qc/workflows)</p>
                                            <ScrollArea className="h-32 flex-shrink-0 retro-scrollbar border border-border-dark p-1 bg-white mb-2">
                                                {state.workflowsLoading ? <p>Loading workflows...</p> : (
                                                     <ul>
                                                       {(state.workflowsList || []).map(wf => (
                                                            <li key={wf.id} className={`mb-1 p-1 border border-transparent hover:border-border-dark flex justify-between items-start ${state.workflowId === wf.id ? 'bg-primary/20' : ''}`}>
                                                                <div>
                                                                    <span className="font-semibold">{wf.name}</span> <span className="text-xs text-muted-foreground">({wf.trigger})</span>
                                                                    <p className="text-xs text-muted-foreground mt-0.5">{wf.description}</p>
                                                                </div>
                                                                 <div className="space-x-1 shrink-0 pl-2">
                                                                     <Button size="sm" className="retro-button !py-0 !px-1" title="Run Manually" onClick={() => handleGenericAction(`Run Workflow`, undefined, { workflowId: wf.id })}><PlayCircle size={12}/></Button>
                                                                     <Button size="sm" variant="secondary" className="retro-button !py-0 !px-1" title="Edit" onClick={() => handleGenericAction(`Edit Workflow`, undefined, { workflowId: wf.id })}><Edit3 size={12}/></Button>
                                                                     <Button size="sm" variant="destructive" className="retro-button !py-0 !px-1" title="Delete" onClick={() => handleGenericAction(`Delete Workflow`, undefined, { workflowId: wf.id })}><Trash size={12}/></Button>
                                                                 </div>
                                                             </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </ScrollArea>
                                             {/* Simple Editor for selected workflow */}
                                            <div className="flex-grow flex flex-col mt-1">
                                                <Label htmlFor="workflow-editor" className="text-xs mb-1">Edit Workflow: {state.workflowId || "(Select a workflow)"}</Label>
                                                <Textarea
                                                     id="workflow-editor"
                                                     className="retro-input flex-grow font-mono text-xs"
                                                     placeholder="Select a workflow above to edit its YAML content..."
                                                     value={state.workflowContent || ''}
                                                     onChange={e => updateWindowState(id, { workflowContent: e.target.value })}
                                                     disabled={!state.workflowId}
                                                />
                                            </div>
                                             <div className="mt-2 pt-2 border-t border-border-dark flex justify-between">
                                                 <Button size="sm" className="retro-button" onClick={() => handleGenericAction('Create New Workflow', id)}>Create New</Button>
                                                 <Button size="sm" className="retro-button" onClick={() => handleGenericAction('Save Workflow', id, { workflowId: state.workflowId, yamlContent: state.workflowContent })} disabled={!state.workflowId || !state.workflowContent}>Save Changes</Button>
                                             </div>
                                        </div>
                                    );
                                   break;
                               // ... Add cases for AI Actions, Git, DevOps, etc. using state fields ...

                                case 'generateCode':
                                   className = "w-[450px] h-auto"; // Wider for prompt
                                   content = (
                                       <div className="p-2 flex flex-col gap-2">
                                           <Label htmlFor="gen-code-prompt" className="flex items-center gap-1 text-sm"><Sparkles size={14} />Generate Code Prompt:</Label>
                                           <Textarea id="gen-code-prompt" placeholder="e.g., Create a React component for a retro modal dialog using shadcn/ui, include state for visibility." className="retro-input h-28 text-xs" value={state.prompt || ''} onChange={(e) => updateWindowState(id, { prompt: e.target.value })} autoFocus />
                                           <Button className="retro-button self-end" size="sm" onClick={() => handleAgentAction("Generate Code", id, 'codeGenAgent', { prompt: state.prompt, context: { code: getSelectedCode() || getAllCode(), filePath: activeEditorFile } })}>Generate</Button>
                                       </div>
                                   );
                                   break;
                               case 'explainCode':
                                   className = "w-[450px] h-auto max-h-[500px] flex flex-col";
                                   content = (
                                       <div className="p-2 flex flex-col gap-2 flex-grow">
                                           <p className="text-sm font-semibold flex items-center gap-1"><Lightbulb size={14} />Explain Selected Code</p>
                                           <ScrollArea className="h-32 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                               <pre><code>{state.codeContext || "// Select code in the editor to explain"}</code></pre>
                                           </ScrollArea>
                                           <Button className="retro-button self-end mt-auto" size="sm" onClick={() => handleAgentAction("Explain Code", id, 'explainCodeAgent', { code: state.codeContext }, true)} disabled={!state.codeContext}>Explain</Button>
                                       </div>
                                   );
                                   break;
                               case 'refactorCode':
                                   className = "w-[450px] h-auto";
                                   content = (
                                       <div className="p-2 flex flex-col gap-2">
                                           <p className="text-sm font-semibold flex items-center gap-1"><Recycle size={14} />Refactor Selected Code</p>
                                           <ScrollArea className="h-24 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                               <pre><code>{state.codeContext || "// Select code in the editor to refactor"}</code></pre>
                                           </ScrollArea>
                                           <Label htmlFor="refactor-instructions" className="text-xs mt-1">Instructions (Optional):</Label>
                                           <Textarea id="refactor-instructions" placeholder="e.g., Improve readability, convert to functional component, add error handling..." className="retro-input h-20 text-xs" value={state.prompt || ''} onChange={(e) => updateWindowState(id, { prompt: e.target.value })} />
                                           <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleAgentAction("Refactor Code", id, 'refactorAgent', { code: state.codeContext, instructions: state.prompt })} disabled={!state.codeContext}>Refactor</Button>
                                       </div>
                                   );
                                   break;
                               case 'generateTests':
                                   className = "w-[450px] h-auto"; // Wider for framework
                                   content = (
                                       <div className="p-2 flex flex-col gap-2">
                                           <p className="text-sm font-semibold flex items-center gap-1"><TestTubeDiagonal size={14} />Generate Unit Tests</p>
                                           <ScrollArea className="h-20 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                               <pre><code>{state.codeContext || "// Select code or file to generate tests for"}</code></pre>
                                           </ScrollArea>
                                           <Label htmlFor="test-framework" className="text-xs mt-1">Test Framework (Optional):</Label>
                                           <Input id="test-framework" placeholder="e.g., jest, vitest, pytest" className="retro-input h-7 text-xs" value={state.selectedFramework || ''} onChange={e => updateWindowState(id, { selectedFramework: e.target.value })} />
                                           <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleAgentAction("Generate Tests", id, 'testGenAgent', { code: state.codeContext, framework: state.selectedFramework })} disabled={!state.codeContext}>Generate</Button>
                                       </div>
                                   );
                                   break;
                               case 'generateDocs':
                                   className = "w-[450px] h-auto"; // Wider for format
                                   content = (
                                       <div className="p-2 flex flex-col gap-2">
                                           <p className="text-sm font-semibold flex items-center gap-1"><BookOpen size={14} />Generate Documentation</p>
                                           <ScrollArea className="h-24 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                               <pre><code>{state.codeContext || "// Select code or file to generate docs for"}</code></pre>
                                           </ScrollArea>
                                           <Label htmlFor="doc-format" className="text-xs mt-1">Format (Optional):</Label>
                                            <Input id="doc-format" placeholder="e.g., jsdoc, tsdoc, docstring, markdown" className="retro-input h-7 text-xs" value={state.selectedFormat || ''} onChange={e => updateWindowState(id, { selectedFormat: e.target.value })} />
                                           <Button className="retro-button self-end mt-2" size="sm" onClick={() => handleAgentAction("Generate Docs", id, 'docGenAgent', { code: state.codeContext, format: state.selectedFormat })} disabled={!state.codeContext}>Generate</Button>
                                       </div>
                                   );
                                   break;
                               case 'fixBug':
                                   className = "w-[450px] h-auto";
                                   content = (
                                       <div className="p-2 flex flex-col gap-2">
                                           <p className="text-sm font-semibold flex items-center gap-1"><Bug size={14} />Fix Bug with AI</p>
                                           <ScrollArea className="h-20 retro-scrollbar border border-border-dark p-1 my-1 bg-white text-xs">
                                               <pre><code>{state.codeContext || "// Select code with the bug or use the whole file"}</code></pre>
                                           </ScrollArea>
                                           <Label htmlFor="bug-description" className="text-xs mt-1">Bug Description:</Label>
                                           <Textarea id="bug-description" placeholder="Describe the bug and expected behavior..." className="retro-input h-20 text-xs" value={state.prompt || ''} onChange={(e) => updateWindowState(id, { prompt: e.target.value })} autoFocus />
                                           <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleAgentAction("Fix Bug", id, 'fixBugAgent', { code: state.codeContext || getAllCode(), description: state.prompt })} disabled={!state.prompt}>Attempt Fix</Button>
                                       </div>
                                   );
                                   break;
                               case 'scaffoldAgent':
                                   className = "w-[500px] h-auto";
                                   content = (
                                       <div className="p-2 flex flex-col gap-2">
                                           <p className="text-sm font-semibold flex items-center gap-1"><Server size={14} />Scaffold Application / Feature</p>
                                           <Label htmlFor="scaffold-description" className="text-xs">Description:</Label>
                                           <Textarea id="scaffold-description" placeholder="e.g., A simple Express.js API for managing tasks (CRUD) with in-memory storage. Use TypeScript." className="retro-input h-24 text-xs" value={state.prompt || ''} onChange={(e) => updateWindowState(id, { prompt: e.target.value })} autoFocus />
                                           <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleAgentAction("Scaffold Application", id, 'scaffoldAgent', { description: state.prompt })} disabled={!state.prompt}>Scaffold</Button>
                                       </div>
                                   );
                                   break;
                               case 'queryKnowledge':
                                   className = "w-[450px] h-auto";
                                   content = (
                                       <div className="p-2 flex flex-col gap-2">
                                           <p className="text-sm font-semibold flex items-center gap-1"><FileQuestion size={14} />Query Knowledge Base (RAG)</p>
                                           <Label htmlFor="query-input" className="text-xs">Query:</Label>
                                           <Input id="query-input" placeholder="Ask about ingested documents, architecture, standards..." className="retro-input h-7 text-xs" value={state.prompt || ''} onChange={(e) => updateWindowState(id, { prompt: e.target.value })} autoFocus />
                                           <Label htmlFor="query-collection" className="text-xs mt-1">Collection (Optional):</Label>
                                           <Input id="query-collection" placeholder="Default: project-main" className="retro-input h-7 text-xs" value={state.knowledgeCollection || ''} onChange={(e) => updateWindowState(id, { knowledgeCollection: e.target.value })} />
                                           <Button className="retro-button self-end mt-1" size="sm" onClick={() => handleAgentAction("Query Knowledge", id, 'ragAgent', { prompt: state.prompt, collection: state.knowledgeCollection })} disabled={!state.prompt}>Query</Button>
                                       </div>
                                   );
                                   break;
                               case 'ingestKnowledge':
                                   className = "w-[500px] h-auto";
                                   content = (
                                       <div className="p-2 flex flex-col gap-2">
                                           <p className="text-sm font-semibold flex items-center gap-1"><FileInput size={14} />Ingest Knowledge (RAG)</p>
                                           <Label htmlFor="knowledge-text" className="text-xs">Text Content:</Label>
                                           <Textarea id="knowledge-text" placeholder="Paste text content here or use 'Upload File'..." className="retro-input h-20 text-xs" value={state.knowledgeText || ''} onChange={(e) => updateWindowState(id, { knowledgeText: e.target.value })} />
                                           <Label htmlFor="knowledge-source" className="text-xs mt-1">Source Identifier (Optional):</Label>
                                           <Input id="knowledge-source" type="text" placeholder="URL, File Path, Doc Name..." className="retro-input h-7 text-xs" value={state.knowledgeSource || ''} onChange={(e) => updateWindowState(id, { knowledgeSource: e.target.value })}/>
                                            <Label htmlFor="knowledge-collection" className="text-xs mt-1">Target Collection (Optional):</Label>
                                           <Input id="knowledge-collection" placeholder="Default: project-main" className="retro-input h-7 text-xs" value={state.knowledgeCollection || ''} onChange={(e) => updateWindowState(id, { knowledgeCollection: e.target.value })} />
                                           <div className="flex justify-between mt-1">
                                                <Button className="retro-button" size="sm" onClick={() => document.getElementById('knowledge-file-input')?.click()}>Upload File...</Button>
                                                <Button className="retro-button" size="sm" onClick={() => handleAgentAction("Ingest Knowledge", id, 'ingestAgent', { text: state.knowledgeText, source: state.knowledgeSource, collection: state.knowledgeCollection })} disabled={!state.knowledgeText}>Ingest Text</Button>
                                           </div>
                                       </div>
                                   );
                                   break;
                                case 'manageKnowledge':
                                   className = "w-[600px] h-[400px]";
                                   content = (
                                       <div className="p-2 text-sm flex flex-col h-full">
                                            <p className="mb-1 font-semibold flex items-center gap-1"><DatabaseZap size={14} />Manage Knowledge Base</p>
                                            <Input type="search" placeholder="Search ingested documents by source/ID..." className="retro-input mb-2 h-7" aria-label="Search Knowledge" />
                                            <ScrollArea className="flex-grow retro-scrollbar border border-border-dark p-1 bg-white">
                                                 {state.knowledgeLoading ? <p>Loading documents...</p> : (
                                                     <ul>
                                                       {(state.knowledgeDocs || []).map(doc => (
                                                            <li key={doc.id} className="mb-1 p-1 border border-transparent hover:border-border-dark flex justify-between items-start">
                                                                <div>
                                                                    <span className="font-semibold truncate max-w-[300px]" title={doc.source || doc.id}>{doc.source || doc.id}</span> <span className="text-xs text-muted-foreground">({doc.collection}, {doc.type})</span>
                                                                    <p className="text-xs text-muted-foreground mt-0.5">Ingested: {new Date(doc.ingestedAt).toLocaleString()}</p>
                                                                </div>
                                                                 <div className="space-x-1 shrink-0 pl-2">
                                                                     {/* Add View/Re-ingest actions? */}
                                                                     <Button size="sm" variant="destructive" className="retro-button !py-0 !px-1" onClick={() => handleGenericAction(`Delete Knowledge`, undefined, { docId: doc.id })}>Delete</Button>
                                                                 </div>
                                                             </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </ScrollArea>
                                       </div>
                                   );
                                   break;
                               case 'configureOllama':
                                   className = "w-80 h-auto";
                                   content = (
                                       <div className="p-4 flex flex-col gap-2">
                                           <p className="text-sm font-semibold">Configure Ollama</p>
                                           <Label htmlFor="ollama-host" className="text-xs">Ollama Host URL:</Label>
                                           <Input id="ollama-host" defaultValue={process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || "http://localhost:11434"} className="retro-input h-7 text-xs" />
                                           <Label htmlFor="ollama-model" className="text-xs mt-1">Default Completion/Chat Model:</Label>
                                           <Input id="ollama-model" defaultValue={"llama3"} className="retro-input h-7 text-xs" />
                                           <Label htmlFor="ollama-embed-model" className="text-xs mt-1">Default Embedding Model:</Label>
                                           <Input id="ollama-embed-model" defaultValue={"nomic-embed-text"} className="retro-input h-7 text-xs" />
                                           <div className="flex justify-end gap-2 mt-2">
                                               <Button className="retro-button" size="sm" onClick={() => toggleWindowVisibility(id)}>Cancel</Button>
                                               <Button className="retro-button" size="sm" onClick={() => handleGenericAction("Save Ollama Config", id)}>Save</Button>
                                           </div>
                                       </div>
                                   );
                                   break;
                               case 'fineTuneModel': // More complex UI needed
                                   className = "w-[600px] h-[450px]";
                                   content = (
                                        <div className="p-2 text-sm flex flex-col h-full">
                                            <p className="mb-1 font-semibold flex items-center gap-1"><Brain size={14} />Fine-Tune AI Model</p>
                                            <ScrollArea className="flex-grow retro-scrollbar border border-border-dark p-1 bg-white mb-2">
                                                 {state.fineTuneLoading ? <p>Loading fine-tuning jobs...</p> : (
                                                     <ul>
                                                       {(state.fineTuneModels || []).map(tune => (
                                                            <li key={tune.id} className="mb-1 p-1 border border-transparent hover:border-border-dark flex justify-between items-start">
                                                                <div>
                                                                    <span className="font-semibold">{tune.id}</span> <span className="text-xs text-muted-foreground">(Base: {tune.baseModel})</span>
                                                                    <p className="text-xs text-muted-foreground mt-0.5">Dataset: {tune.dataset}, Status: {tune.status} {tune.progress && `(${tune.progress})`}</p>
                                                                </div>
                                                                 <div className="space-x-1 shrink-0 pl-2">
                                                                     {/* Add View Logs/Cancel actions */}
                                                                     <Button size="sm" variant="destructive" className="retro-button !py-0 !px-1" onClick={() => handleGenericAction(`Cancel Tune`, undefined, { tuneId: tune.id })}>Cancel</Button>
                                                                 </div>
                                                             </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </ScrollArea>
                                            <fieldset className="border border-border-dark p-2">
                                                <legend className="text-xs px-1">Start New Fine-tuning Job</legend>
                                                 <Label htmlFor="base-model" className="text-xs">Base Model:</Label>
                                                <Input id="base-model" placeholder="e.g., llama3" className="retro-input h-6 text-xs mb-1" />
                                                <Label htmlFor="dataset-path" className="text-xs">Dataset (.jsonl):</Label>
                                                 <div className="flex gap-1">
                                                    <Input id="dataset-path" placeholder="Path or Upload..." className="retro-input h-6 text-xs flex-grow" />
                                                    <Button size="sm" className="retro-button !py-0 !px-1" onClick={() => document.getElementById('finetune-dataset-input')?.click()}>Upload</Button>
                                                </div>
                                                 {/* Add more config: epochs, learning rate etc. */}
                                                 <Button size="sm" className="retro-button mt-2" onClick={() => handleGenericAction('Start Fine-tuning', id)}>Start Job</Button>
                                            </fieldset>
                                        </div>
                                    );
                                   break;
                               case 'configureVoiceGesture': // Basic placeholder
                                   className = "w-[400px] h-auto";
                                   content = <SimpleDialogContent title="Configure Voice/Gesture"><p>Mapping UI for voice commands (e.g., "Explain function") and gesture controls (e.g., hand wave for scroll) - Planned/TODO</p></SimpleDialogContent>;
                                   break;
                               case 'profiling':
                                   className = "w-[550px] h-[400px]";
                                   content = <SimpleDialogContent title="Performance Profiling">
                                       <div className="flex-grow overflow-auto">
                                            {state.profilingLoading ? <p>Loading profiling data...</p> :
                                            state.profilingData ? <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(state.profilingData, null, 2)}</pre> :
                                            <p>No profiling data available. Click 'Run Analysis' to collect data.</p>}
                                            {/* TODO: Add charts using shadcn charts + recharts */}
                                       </div>
                                       <Button className="retro-button mt-2 self-start" size="sm" onClick={() => handleGenericAction('Run Profiling Analysis', id, undefined, true)} disabled={state.profilingLoading}>Run Analysis</Button>
                                       </SimpleDialogContent>;
                                   break;
                               case 'security':
                                   className = "w-[600px] h-[400px]"; // Wider for results
                                   content = <SimpleDialogContent title="Security Analysis">
                                        <ScrollArea className="flex-grow retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                            {state.securityLoading ? <p>Running security scan...</p> :
                                            state.securityData ? <pre className="text-xs whitespace-pre-wrap">{state.securityData}</pre> : // Display string summary or object
                                            <p>No security data available. Click 'Scan Now'.</p>}
                                        </ScrollArea>
                                       <div className="mt-auto pt-2 border-t border-border-dark flex gap-2">
                                           <Button className="retro-button" size="sm" onClick={() => handleAgentAction('Run Security Scan', id, 'sastAgent', { code: getAllCode() }, true)} disabled={state.securityLoading}>Scan Now</Button>
                                            <Button className="retro-button" size="sm" variant="secondary" title="Attempt automated fix and create Pull Request (Planned)" onClick={() => handleGenericAction('Trigger Auto-Fix PR', id, { vulnerabilities: state.securityData } )} disabled={state.securityLoading || !state.securityData}>Auto-Fix PR</Button>
                                        </div>
                                       </SimpleDialogContent>;
                                   break;
                               case 'telemetry':
                                   className = "w-[550px] h-[400px]";
                                   content = <SimpleDialogContent title="Telemetry Dashboard">
                                        <div className="flex-grow overflow-auto">
                                            {state.telemetryLoading ? <p>Loading telemetry data...</p> :
                                            state.telemetryData ? <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(state.telemetryData, null, 2)}</pre> :
                                            <p>No telemetry data available.</p>}
                                            {/* TODO: Add Chart components here eventually */}
                                            <p className="text-center text-muted-foreground text-xs mt-4">Charts for Errors, Performance, AI Usage (TODO)</p>
                                        </div>
                                        <Button className="retro-button mt-2 self-start" size="sm" onClick={() => fetchDataForWindow(id)} disabled={state.telemetryLoading}><RefreshCw size={12} className="mr-1"/>Refresh</Button>
                                       </SimpleDialogContent>;
                                   break;
                               case 'debugger': // Basic placeholder
                                   className = "w-[600px] h-[450px]";
                                   content = (
                                       <div className="p-2 text-sm flex flex-col h-full">
                                            <p className="mb-1 font-semibold flex items-center gap-1"><Bug size={14} />Debugger</p>
                                            <div className="flex gap-1 mb-1">
                                                {/* Debugger Controls */}
                                                 <Button size="sm" className="retro-button !py-0 !px-1" title="Continue (F5)" onClick={() => handleGenericAction('Debugger: Continue', id)} disabled={state.debuggerState?.status !== 'Paused'}><Play size={10}/></Button>
                                                 <Button size="sm" className="retro-button !py-0 !px-1" title="Pause" onClick={() => handleGenericAction('Debugger: Pause', id)} disabled={state.debuggerState?.status !== 'Running'}><Square size={10}/></Button> {/* Use Square for Pause */}
                                                 {/* Add Step Over, Step Into, Step Out, Stop */}
                                            </div>
                                            <div className="flex flex-grow gap-2 overflow-hidden">
                                                <div className="w-1/2 flex flex-col">
                                                    <Label className="text-xs">Call Stack:</Label>
                                                    <ScrollArea className="flex-grow retro-scrollbar border border-border-dark p-1 bg-white">
                                                         {state.debuggerLoading ? <p>...</p> : state.debuggerState?.callStack?.map((frame:any, i:number) => <p key={i} className="truncate">{frame.name} ({frame.file}:{frame.line})</p>) || <p>N/A</p>}
                                                    </ScrollArea>
                                                </div>
                                                 <div className="w-1/2 flex flex-col">
                                                    <Label className="text-xs">Variables:</Label>
                                                    <ScrollArea className="flex-grow retro-scrollbar border border-border-dark p-1 bg-white">
                                                          {state.debuggerLoading ? <p>...</p> : state.debuggerState?.variables ? <pre className="text-xs">{JSON.stringify(state.debuggerState.variables, null, 2)}</pre> : <p>N/A</p>}
                                                    </ScrollArea>
                                                </div>
                                            </div>
                                            <div className="mt-1 pt-1 border-t border-border-dark">
                                                <Label className="text-xs">Breakpoints:</Label>
                                                <ScrollArea className="h-12 retro-scrollbar border border-border-dark p-1 bg-white">
                                                      {state.debuggerLoading ? <p>...</p> : state.debuggerState?.breakpoints?.map((bp:any, i:number) => <p key={i}>{bp.file}:{bp.line}</p>) || <p>No breakpoints set.</p>}
                                                </ScrollArea>
                                            </div>
                                             <div className="mt-auto pt-2 border-t border-border-dark flex gap-2">
                                                <Button className="retro-button" size="sm" onClick={() => handleGenericAction('Attach Debugger', id, undefined, true)}>Attach</Button>
                                                <Button className="retro-button" size="sm" onClick={() => handleGenericAction('Add Debug Config', id, undefined, true)}>Add Config</Button>
                                            </div>
                                       </div>
                                   );
                                   break;
                               case 'git': // Enhanced Git Panel
                                   className = "w-[500px] h-[450px]"; // Taller for more info
                                   content = (
                                       <div className="w-full h-full bg-card p-2 text-sm flex flex-col">
                                           <p className="mb-1 font-semibold flex items-center gap-1"><GitBranch size={14} />Git Control</p>
                                           <ScrollArea className="h-40 flex-grow retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                                                {state.gitLoading ? <p>Loading Git status...</p> :
                                                <pre><code>{state.gitStatus || "No Git status available. Initialize a repo or open a folder."}</code></pre>}
                                           </ScrollArea>
                                           <div className="flex flex-col gap-2 mt-2">
                                                <Input id="git-commit-message" placeholder="Commit Message" className="retro-input h-7 text-xs" value={state.gitCommitMessage || ''} onChange={e => updateWindowState(id, { gitCommitMessage: e.target.value })} />
                                               <div className="flex justify-between gap-1">
                                                    {/* TODO: Add Stage All button */}
                                                    <Button className="retro-button flex-1" size="sm" onClick={() => handleAgentAction('Git Commit', id, 'gitAgent', { action: 'commit', message: state.gitCommitMessage }, true)} disabled={!state.gitCommitMessage || state.gitLoading}>Commit</Button>
                                                    <Button className="retro-button flex-1" size="sm" onClick={() => handleAgentAction('Git Push', id, 'gitAgent', { action: 'push' }, true)} disabled={state.gitLoading}>Push</Button>
                                                    <Button className="retro-button flex-1" size="sm" onClick={() => handleAgentAction('Git Pull', id, 'gitAgent', { action: 'pull' }, true)} disabled={state.gitLoading}>Pull</Button>
                                               </div>
                                                {/* Branching */}
                                                <div className="flex gap-1">
                                                    <Input id="git-branch-name" placeholder="New branch name..." className="retro-input h-6 text-xs flex-grow" value={state.gitBranchName || ''} onChange={e => updateWindowState(id, { gitBranchName: e.target.value })} />
                                                     <Button className="retro-button !py-0 !px-1" size="sm" onClick={() => handleAgentAction('Git Create Branch', id, 'gitAgent', { action: 'create_branch', name: state.gitBranchName }, true)} disabled={!state.gitBranchName || state.gitLoading}>Create Branch</Button>
                                                </div>
                                                <Button className="retro-button mt-1" size="sm" onClick={() => handleGenericAction('Import from GitHub', id)}>Import from GitHub...</Button>
                                                {/* Add: Switch Branch dropdown, Merge, Revert buttons */}
                                            </div>
                                        </div>
                                   );
                                   break;
                               case 'devops': // Enhanced DevOps Panel
                                   className = "w-[500px] h-[400px]";
                                   content = (
                                        <div className="w-full h-full bg-card p-2 text-sm flex flex-col gap-2">
                                           <p className="mb-1 font-semibold flex items-center gap-1"><Cloud size={14} />DevOps Panel</p>
                                           <fieldset className="border border-border-dark p-2">
                                               <legend className="text-xs px-1">Infrastructure (IaC - Terraform/Pulumi)</legend>
                                                <Label htmlFor="iac-config" className="text-xs">Current/Generated Config:</Label>
                                               <Textarea id="iac-config" placeholder="IaC will appear here after generation..." className="retro-input h-16 text-xs my-1" value={state.iacConfig || ''} onChange={e => updateWindowState(id, { iacConfig: e.target.value })} readOnly={!state.iacConfig} />
                                               <div className="flex gap-2">
                                                     <Button className="retro-button flex-1" size="sm" onClick={() => handleAgentAction('Generate IaC', id, 'iacGenAgent', { prompt: 'Generate Terraform for standard Firebase web app' }, true)}>Generate</Button>
                                                     <Button className="retro-button flex-1" size="sm" onClick={() => handleGenericAction('Apply IaC', id, { configContent: state.iacConfig }, true)} disabled={!state.iacConfig}>Apply</Button>
                                                     {/* Add Destroy button */}
                                               </div>
                                            </fieldset>
                                           <fieldset className="border border-border-dark p-2">
                                               <legend className="text-xs px-1">Container Environment (Docker)</legend>
                                                <Button className="retro-button w-full" size="sm" onClick={() => handleGenericAction('Start/Restart Docker Env', id, { action: 'docker_up' }, true)}><Power size={12} className="mr-1"/>Start/Restart Dev Env</Button>
                                                {/* Add Stop, View Logs buttons */}
                                            </fieldset>
                                            <fieldset className="border border-border-dark p-2">
                                                <legend className="text-xs px-1">Deployment (Kubernetes/Cloud)</legend>
                                                <div className="flex gap-2">
                                                    <Button className="retro-button flex-1" size="sm" onClick={() => handleGenericAction('Deploy', id, { platform: state.hostingProvider }, true)}><UploadCloud size={12} className="mr-1"/>Deploy</Button>
                                                    <Button className="retro-button flex-1" size="sm" onClick={() => handleGenericAction('Manage Deployments', id, undefined, true)}>Manage</Button>
                                                </div>
                                                <Label htmlFor="hosting-provider" className="text-xs mt-1">Hosting Provider:</Label>
                                                <select id="hosting-provider" className="retro-input h-6 text-xs w-full" value={state.hostingProvider || ''} onChange={e => updateWindowState(id, { hostingProvider: e.target.value })}>
                                                    <option value="">Select...</option>
                                                    <option value="k8s">Kubernetes Cluster</option>
                                                    <option value="firebase">Firebase Hosting</option>
                                                    <option value="gcp-run">GCP Cloud Run</option>
                                                    {/* Add others */}
                                                </select>
                                            </fieldset>
                                       </div>
                                   );
                                   break;
                               case 'languageEnv': // Basic Lang Env Management
                                   className = "w-[450px] h-[350px]";
                                   content = (
                                        <div className="p-2 text-sm flex flex-col h-full">
                                            <p className="mb-1 font-semibold flex items-center gap-1"><FlaskConical size={14} />Language Environment (Nix)</p>
                                            <ScrollArea className="flex-grow retro-scrollbar border border-border-dark p-1 bg-white mb-2">
                                                 {state.languageLoading ? <p>Loading environments...</p> : (
                                                     <ul>
                                                       {(state.languageEnvs || []).map(env => (
                                                            <li key={env.id} className={`mb-1 p-1 border border-transparent hover:border-border-dark ${env.active ? 'bg-primary/10' : ''}`}>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="font-semibold">{env.name} {env.active && <CheckCircle size={12} className="inline text-green-600 ml-1"/>}</span>
                                                                     <div className="space-x-1">
                                                                         {!env.active && <Button size="sm" className="retro-button !py-0 !px-1" onClick={() => handleGenericAction(`Activate Env`, undefined, { envId: env.id })}><PlayCircle size={12}/></Button>}
                                                                         <Button size="sm" variant="secondary" className="retro-button !py-0 !px-1" onClick={() => handleGenericAction(`Modify Env`, undefined, { envId: env.id })}><Edit3 size={12}/></Button>
                                                                         {/* Add Delete */}
                                                                         <Button size="sm" variant="destructive" className="retro-button !py-0 !px-1" onClick={() => handleGenericAction(`Delete Env`, undefined, { envId: env.id })}><Trash size={12}/></Button>
                                                                     </div>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-0.5">Packages: {env.packages?.join(', ') || 'Default'}</p>
                                                             </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </ScrollArea>
                                            <Button size="sm" className="retro-button mt-auto" onClick={() => handleGenericAction('Add New Language Env', id)}>Add Environment</Button>
                                        </div>
                                    );
                                   break;
                               case 'settings': // Basic Settings Placeholder
                                   className = "w-[600px] h-[450px]";
                                   content = <SimpleDialogContent title="Settings"><Tabs defaultValue="editor" className="w-full h-full flex flex-col">
                                       <TabsList className="retro-tabs-list !border-b-0">
                                           <TabsTrigger value="editor" className="retro-tab-trigger">Editor</TabsTrigger>
                                           <TabsTrigger value="theme" className="retro-tab-trigger">Theme</TabsTrigger>
                                           <TabsTrigger value="ai" className="retro-tab-trigger">AI/Ollama</TabsTrigger>
                                           <TabsTrigger value="keybindings" className="retro-tab-trigger">Keybindings</TabsTrigger>
                                            <TabsTrigger value="plugins" className="retro-tab-trigger">Plugins</TabsTrigger>
                                       </TabsList>
                                       <TabsContent value="editor" className="p-2 border border-border-dark flex-grow"><p>Editor settings (Font, Size, Indentation...) - TODO</p></TabsContent>
                                       <TabsContent value="theme" className="p-2 border border-border-dark flex-grow"><p>Theme settings (Light/Dark, Accent Color...) - TODO</p></TabsContent>
                                       <TabsContent value="ai" className="p-2 border border-border-dark flex-grow"><p>AI provider/model settings (See Ollama Config window) - TODO</p></TabsContent>
                                       <TabsContent value="keybindings" className="p-2 border border-border-dark flex-grow"><p>Keybinding customization - TODO</p></TabsContent>
                                        <TabsContent value="plugins" className="p-2 border border-border-dark flex-grow"><p>Plugin-specific settings - TODO</p></TabsContent>
                                   </Tabs></SimpleDialogContent>;
                                   break;
                               case 'welcome':
                                   className = "w-[500px] h-[350px]";
                                   content = <SimpleDialogContent title="Welcome to QuonxCoder!">
                                       <p className="mb-2">Your AI-native IDE with a retro twist!</p>
                                       <ul className="list-disc list-inside text-sm space-y-1">
                                           <li><Button variant="link" className="p-0 h-auto" onClick={() => document.getElementById('openFolder-input')?.click()}>Open Folder...</Button></li>
                                           <li><Button variant="link" className="p-0 h-auto" onClick={() => toggleWindowVisibility('marketplace')}>Explore Plugins...</Button></li>
                                           <li><Button variant="link" className="p-0 h-auto" onClick={() => toggleWindowVisibility('scaffoldAgent')}>Scaffold New App (AI)...</Button></li>
                                           <li><Button variant="link" className="p-0 h-auto" onClick={() => window.open('https://github.com/your-repo/QuonxCoder#readme', '_blank')}>Read Documentation</Button></li>
                                       </ul>
                                       </SimpleDialogContent>;
                                   break;
                               case 'about':
                                   className = "w-[400px] h-auto"; // Smaller
                                   content = <SimpleDialogContent title="About QuonxCoder" showOkButton={false}>
                                       <p>Version: 0.9.5 (Galaxy Hopper)</p>
                                       <p>An AI-native Integrated Development Environment leveraging local LLMs with a nostalgic pixel-art interface.</p>
                                       <p className="mt-2 text-xs">Built with Next.js, React, Tailwind, Shadcn/ui, Monaco, Yjs, Ollama, Node.js, Docker.</p>
                                       <p className="mt-2 text-xs">&copy; 2024 Quonx Labs (Conceptual)</p>
                                       </SimpleDialogContent>;
                                   break;
                                default:
                                   content = <p className="p-2 text-sm text-muted-foreground">Window content for '{id}' not implemented yet.</p>;
                           }


                            return (
                               <RetroWindow
                                   key={key} // Use the extracted key here
                                   {...windowProps} // Pass remaining props
                                   className={cn(className)}
                                   initialPosition={initialPosition}
                               >
                                   {content}
                               </RetroWindow>
                           );
                       })}


             </ResizablePanelGroup>

             {/* Status Bar */}
             <div className="h-7 border-t-2 border-border-dark flex items-center justify-between text-xs bg-card shrink-0">
                 <div className="px-2 flex items-center gap-2 overflow-hidden">
                     <span className="shrink-0">Project: MyProject</span>
                     <span className="flex items-center gap-1 shrink-0"><GitBranch size={12} /> main</span>
                      {activeEditorFile && <span className="text-muted-foreground truncate" title={activeEditorFile}>{activeEditorFile}</span>}
                     <span className="text-green-600 flex items-center gap-1 shrink-0"><BrainCircuit size={12} /> AI Ready</span>
                      {/* TODO: Add line/col, language mode, etc. */}
                 </div>
                 <div className="flex items-center px-1 space-x-1 shrink-0">
                     {Object.values(windowStates)
                         .filter(state => state.isMinimized)
                         .map(state => (
                             <button key={state.id} className="retro-minimized-tab" onClick={() => restoreWindow(state.id)} title={`Restore ${getWindowName(state.id)}`}>
                                 {getWindowName(state.id)}
                             </button>
                         ))}
                     {Object.values(windowStates).some(s => s.isMinimized) && <div className="retro-separator-v !h-4 !mx-0.5"></div>}
                     <Button variant="ghost" size="icon" className="retro-button !border-none !shadow-none !w-5 !h-5" aria-label="Toggle Full Screen" onClick={toggleFullScreen} title="Toggle Full Screen">
                         <Fullscreen size={12} />
                     </Button>
                     <Button variant="ghost" size="icon" className="retro-button !border-none !shadow-none !w-5 !h-5" aria-label="Settings" onClick={() => toggleWindowVisibility('settings')} title="Settings">
                         <Settings size={12} />
                     </Button>
                     <span className="font-bold text-xs">Quonx</span> {/* Shorter name */}
                 </div>
             </div>
         </div>
     );
 };
