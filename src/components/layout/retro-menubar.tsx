'use client';

import * as React from 'react';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger, MenubarSub, MenubarSubContent, MenubarSubTrigger } from "@/components/ui/menubar";
import { Maximize2, Minus, X, Bot, Code, Terminal as TerminalIcon, Files, Puzzle, Mic, Hand, Activity, ShieldCheck, BarChart3, Users, Share2, Cloud, GitBranch, Save, FolderOpen, Search, Settings, LifeBuoy, Replace, SearchIcon, PackageOpen, HelpCircle, BookOpen, CodeXml, GitCommit, GitPullRequest, Database, FileKey, Globe, Palette, Fullscreen, BrainCircuit, FileCode, FlaskConical, Recycle, Lightbulb, MessageSquare, Brain, Sparkles, FileQuestion, FileInput, DatabaseZap, Cpu, Wrench, Route, TestTubeDiagonal } from "lucide-react"; // Ensure all needed icons are imported

// Define the props interface matching the handlers passed from page.tsx
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

export const RetroMenubar = (props: RetroMenubarProps) => {
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

    // TODO: Implement disabled state based on context (e.g., no file open disables Save)
    // TODO: Add keyboard shortcuts visually (⌘S, etc.) using MenubarShortcut

    return (
        <Menubar className="border-b-2 border-border-dark rounded-none bg-card"> {/* Ensure background matches theme */}
            {/* --- File Menu --- */}
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onShowOpenFile}><FolderOpen size={14} className="mr-2" />Open File...</MenubarItem>
                    <MenubarItem onSelect={onShowOpenFolder}><FolderOpen size={14} className="mr-2" />Open Folder...</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem><Save size={14} className="mr-2" />Save <MenubarShortcut>⌘S</MenubarShortcut></MenubarItem>
                    <MenubarItem onSelect={onShowSaveAs}><Save size={14} className="mr-2" />Save As...<MenubarShortcut>⇧⌘S</MenubarShortcut></MenubarItem>
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

            {/* --- Edit Menu --- */}
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
                    <MenubarItem disabled>Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem disabled>Cut <MenubarShortcut>⌘X</MenubarShortcut></MenubarItem>
                    <MenubarItem disabled>Copy <MenubarShortcut>⌘C</MenubarShortcut></MenubarItem>
                    <MenubarItem disabled>Paste <MenubarShortcut>⌘V</MenubarShortcut></MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onFind}><Search size={14} className="mr-2" />Find...<MenubarShortcut>⌘F</MenubarShortcut></MenubarItem>
                    <MenubarItem onSelect={onReplace}><Replace size={14} className="mr-2" />Replace...<MenubarShortcut>⇧⌘F</MenubarShortcut></MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowManageSecrets}><FileKey size={14} className="mr-2" />Manage Secrets...</MenubarItem>
                    <MenubarItem onSelect={onShowConfigureVault}><DatabaseZap size={14} className="mr-2" />Configure Vault...</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowProjectVars}><Database size={14} className="mr-2" />Project Env Vars...</MenubarItem>
                    <MenubarItem onSelect={onShowAccountVars}><Globe size={14} className="mr-2" />Account Env Vars...</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            {/* --- AI Menu --- */}
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
                    <MenubarSub>
                         <MenubarSubTrigger><DatabaseZap size={14} className="mr-2" />Knowledge Base (RAG)</MenubarSubTrigger>
                         <MenubarSubContent>
                             <MenubarItem onSelect={onQueryKnowledge}><FileQuestion size={14} className="mr-2" />Query Knowledge...</MenubarItem>
                             <MenubarItem onSelect={onIngestKnowledge}><FileInput size={14} className="mr-2" />Ingest Knowledge...</MenubarItem>
                             <MenubarItem onSelect={onManageKnowledge}><Database size={14} className="mr-2" />Manage Knowledge...</MenubarItem>
                         </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarSub>
                        <MenubarSubTrigger><Brain size={14} className="mr-2" />Model Settings</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem onSelect={onConfigureOllama}>Configure Ollama...</MenubarItem>
                            <MenubarItem onSelect={onFineTuneModel}>Fine-tune Model... (Planned)</MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onConfigureVoiceGesture}><Mic size={14} className="mr-2" />Configure Voice/Gesture...</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            {/* --- Code Menu --- */}
            <MenubarMenu>
                <MenubarTrigger>Code</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onSelect={onStartDebugging}>Start Debugging (Planned)</MenubarItem>
                    <MenubarItem onSelect={onAddDebugConfig}>Add Debug Config (Planned)</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onShowLanguageEnv}><FlaskConical size={14} className="mr-2" />Language Environment...</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            {/* --- Git Menu --- */}
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
                    <MenubarItem onSelect={() => onShowGitCommit()}><GitBranch size={14} className="mr-2" />Open Git Control Panel</MenubarItem> {/* Opens the Git window */}
                </MenubarContent>
            </MenubarMenu>

            {/* --- DevOps Menu --- */}
             <MenubarMenu>
                <MenubarTrigger>DevOps</MenubarTrigger>
                <MenubarContent>
                    <MenubarSub>
                         <MenubarSubTrigger><FileCode size={14} className="mr-2" />Infrastructure (IaC)</MenubarSubTrigger>
                         <MenubarSubContent>
                              <MenubarItem onSelect={onGenerateIaC}>Generate IaC...</MenubarItem>
                              <MenubarItem onSelect={onApplyIaC}>Apply IaC</MenubarItem>
                              {/* Add Destroy IaC later */}
                         </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSub>
                         <MenubarSubTrigger><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21.71 8.64a1 1 0 0 0-1.16-1.28l-8.37.85-1.9-1.9a1 1 0 0 0-1.4 0l-2.54 2.54a1 1 0 0 0 0 1.4l1.9 1.9-.85 8.37a1 1 0 0 0 1.28 1.16l8.64-2.16a1 1 0 0 0 .72-.72l2.16-8.64z"/><path d="m15 7 3 3"/><path d="M6.64 11.36 9.46 8.54"/><path d="m11.36 17.36 2.82-2.82"/><path d="m8.54 14.54 2.82-2.82"/><path d="M14.54 11.46 17.36 8.64"/></svg>Docker</MenubarSubTrigger> {/* Docker Icon */}
                         <MenubarSubContent>
                              <MenubarItem onSelect={onStartDockerEnv}>Start Environment</MenubarItem>
                              {/* Add Stop/Rebuild later */}
                         </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSub>
                        <MenubarSubTrigger><Cloud size={14} className="mr-2" />Kubernetes</MenubarSubTrigger>
                         <MenubarSubContent>
                              <MenubarItem onSelect={onDeployK8s}>Deploy / Apply Config</MenubarItem>
                              <MenubarItem onSelect={onManageDeployments}>Manage Deployments</MenubarItem>
                         </MenubarSubContent>
                    </MenubarSub>
                     <MenubarSub>
                        <MenubarSubTrigger><Share2 size={14} className="mr-2" />Hosting</MenubarSubTrigger>
                         <MenubarSubContent>
                              <MenubarItem onSelect={onConfigureHosting}>Configure Provider</MenubarItem>
                         </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem onSelect={() => onManageDeployments()}><Cloud size={14} className="mr-2" />Open DevOps Panel</MenubarItem> {/* Opens DevOps window */}
                </MenubarContent>
            </MenubarMenu>

            {/* --- View Menu --- */}
            <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                     {/* TODO: Add toggles for File Explorer, AI Chat, Terminal/Logs, Collaboration panels */}
                    <MenubarItem onSelect={onPluginManagerToggle}><Puzzle size={14} className="mr-2" />Toggle Plugin Manager</MenubarItem>
                    <MenubarSeparator />
                     <MenubarItem onSelect={onShowProfiling}><Cpu size={14} className="mr-2" />Show Profiling Panel</MenubarItem>
                     <MenubarItem onSelect={onShowSecurity}><ShieldCheck size={14} className="mr-2" />Show Security Panel</MenubarItem>
                     <MenubarItem onSelect={onShowTelemetry}><Activity size={14} className="mr-2" />Show Telemetry Dashboard</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onSelect={onToggleFullScreen}><Fullscreen size={14} className="mr-2" />Toggle Full Screen</MenubarItem>
                     {/* Add Theme selection later */}
                </MenubarContent>
            </MenubarMenu>

            {/* --- Plugins Menu --- */}
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

            {/* --- Help Menu --- */}
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
