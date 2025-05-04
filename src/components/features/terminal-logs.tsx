'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Terminal as TerminalIcon, FileCode, Cpu, ShieldCheck, BarChart3 } from "lucide-react";
// TODO: Import xterm.js related types/modules
// import { Terminal } from 'xterm';
// import { FitAddon } from 'xterm-addon-fit';
// import 'xterm/css/xterm.css';

export const TerminalAndLogs = () => {
     const terminalContainerRef = React.useRef<HTMLDivElement>(null);
     const fitAddonRef = React.useRef<any>(null); // Ref for FitAddon instance
     const [logs, setLogs] = React.useState<string[]>([]); // State to hold logs

    // --- Effect for Terminal Initialization ---
    React.useEffect(() => {
        if (terminalContainerRef.current /* && !terminalInstance */ ) { // Prevent re-initialization
            // TODO: Initialize xterm.js
            // const term = new Terminal({
            //     cursorBlink: true,
            //     fontFamily: 'monospace',
            //     fontSize: 13,
            //     theme: { background: '#000000', foreground: '#00FF00' } // Basic retro theme
            // });
            // const fitAddon = new FitAddon();
            // fitAddonRef.current = fitAddon;
            // term.loadAddon(fitAddon);
            // term.open(terminalContainerRef.current);
            // fitAddon.fit(); // Initial fit

            // term.write('Welcome to QuonxTerm! (xterm.js Initialized)\r\n$ ');

            // // Example: Handle input (send to backend WebSocket/service)
            // term.onData(data => {
            //     // Send data to backend shell process
            //     console.log("Terminal Input:", data);
            //     // For local echo: term.write(data);
            // });

            // // Example: Handle output from backend
            // // backendSocket.on('terminal-output', (output) => {
            // //    term.write(output);
            // // });

            // terminalInstance = term; // Store instance if needed outside effect

             // Handle resize
            const resizeObserver = new ResizeObserver(() => {
                 fitAddonRef.current?.fit();
             });
             if (terminalContainerRef.current.parentElement) {
                resizeObserver.observe(terminalContainerRef.current.parentElement);
             }


            return () => {
                resizeObserver.disconnect();
                // term.dispose();
                // terminalInstance = null;
            };
        }
    }, []); // Run once on mount


     // --- Effect for Log Streaming ---
    React.useEffect(() => {
        // TODO: Connect to backend log stream (SSE or WebSocket)
         console.log("TODO: Connect Logs panel to backend log stream.");
         // Example using SSE (adjust URL and handling)
        // const logSource = new EventSource('/api/proxy/observability/logs'); // Use proxy
        // logSource.onmessage = (event) => {
        //     setLogs(prevLogs => [...prevLogs, event.data]);
        // };
        // logSource.onerror = () => {
        //     console.error("Log stream error or closed.");
        //     setLogs(prev => [...prev, "[ERROR] Log stream disconnected."]);
        //     logSource.close();
        // };

        // Placeholder logs
        setLogs([
             "[INFO] Application components loading...",
             "[DEBUG][AI Service] Vector DB connection established.",
             "[WARN][Agent Coordinator] Rate limit approaching for external API.",
             "[ERROR][Collaboration] WebSocket disconnected unexpectedly.",
             "[COLLAB] User 'RetroCoder' joined the session.",
             "[SECRETS] Vault accessed for 'GITHUB_TOKEN'.",
        ]);

         return () => {
            // logSource?.close();
        };
    }, []);

    // Scroll logs to bottom
    const logScrollAreaRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (logScrollAreaRef.current) {
            const scrollElement = logScrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
    }, [logs]);


    return (
        <Tabs defaultValue="terminal" className="flex flex-col h-full">
            <TabsList className="retro-tabs-list shrink-0">
                <TabsTrigger value="terminal" className="retro-tab-trigger"><TerminalIcon size={14} className="mr-1" />Terminal</TabsTrigger>
                <TabsTrigger value="logs" className="retro-tab-trigger"><FileCode size={14} className="mr-1" />Logs</TabsTrigger>
                 <TabsTrigger value="profiling" className="retro-tab-trigger"><Cpu size={14} className="mr-1" />Profiling</TabsTrigger>
                 <TabsTrigger value="security" className="retro-tab-trigger"><ShieldCheck size={14} className="mr-1" />Security</TabsTrigger>
                 <TabsTrigger value="dashboard" className="retro-tab-trigger"><BarChart3 size={14} className="mr-1" />Dashboard</TabsTrigger>
            </TabsList>

            {/* Terminal Tab */}
            <TabsContent value="terminal" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-0">
                 <div className="flex flex-col h-full bg-black border-t-2 border-border-dark">
                     {/* Container for xterm.js */}
                     <div ref={terminalContainerRef} id="terminal-container" className="flex-grow w-full h-full p-1">
                         {/* xterm.js will attach here */}
                     </div>
                     {/* Input might be handled directly by xterm.js, this can be removed */}
                     {/* <Input type="text" placeholder="> (xterm.js handles input)" aria-label="Terminal Input" className="retro-input !bg-black !text-[#00FF00] font-mono text-xs !rounded-none !border-none !border-t-2 !border-t-[#555555] focus:!ring-0 h-6" disabled /> */}
                 </div>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-0">
                 <div className="flex flex-col h-full bg-card border-t-2 border-border-dark">
                     <ScrollArea ref={logScrollAreaRef} className="flex-grow retro-scrollbar p-1 font-mono text-xs bg-white">
                         {logs.map((log, index) => (
                            <p key={index} className="whitespace-pre-wrap">{log}</p>
                        ))}
                     </ScrollArea>
                 </div>
            </TabsContent>

             {/* Profiling Tab */}
            <TabsContent value="profiling" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-2 text-sm">
                 {/* TODO: Implement AI Profiling Panel - Fetch data from Observability Service */}
                 <p className="font-semibold flex items-center gap-1"><Cpu size={14} />AI Profiling Panel</p>
                 <p className="text-muted-foreground text-xs mb-2">Performance metrics and bundle analysis. (Connects to Observability Service)</p>
                 <div className="h-32 border border-border-dark my-1 flex items-center justify-center text-muted-foreground bg-white">Chart Area Placeholder (Frontend Bundle)</div>
                 <div className="h-32 border border-border-dark my-1 flex items-center justify-center text-muted-foreground bg-white">Chart Area Placeholder (Backend Traces)</div>
                 <Button className="retro-button mt-2" size="sm" onClick={() => console.log("TODO: Trigger profiling analysis")}>Run Analysis</Button>
            </TabsContent>

             {/* Security Tab */}
            <TabsContent value="security" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-2 text-sm">
                 {/* TODO: Implement SAST/Dependency Scanning - Call Agent Coordinator */}
                 <p className="font-semibold flex items-center gap-1"><ShieldCheck size={14} />Security Scanner</p>
                 <p className="text-muted-foreground text-xs mb-1">SAST and dependency scan results. (Connects to Agent Coordinator/Observability)</p>
                 <ScrollArea className="h-32 retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                     {/* Display scan results dynamically */}
                     <ul><li>[INFO] Scan initiated...</li>
                         {/* Example results */}
                         <li>[WARN] Dependency 'lodash' v4.17.20 has known CVE-2021-xxxxx.</li>
                         <li>[LOW] Potential hardcoded secret in `config.js`.</li>
                     </ul>
                 </ScrollArea>
                 <Button className="retro-button mt-1" size="sm" onClick={() => console.log("TODO: Trigger SAST scan via agent coordinator")}>Scan Now</Button>
                 <Button className="retro-button mt-1 ml-1" size="sm" variant="secondary" title="Attempt automated fix and create Pull Request (Planned)" onClick={() => console.log("TODO: Trigger Auto-Fix PR via agent coordinator")}>Auto-Fix PR</Button>
            </TabsContent>

             {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-2 text-sm">
                 {/* TODO: Implement Telemetry Dashboard with Charts - Fetch data from Observability Service */}
                 <p className="font-semibold flex items-center gap-1"><BarChart3 size={14} />Telemetry Dashboard</p>
                 <p className="text-muted-foreground text-xs mb-2">Errors, Performance, AI Usage. (Connects to Observability Service)</p>
                 <div className="h-20 border border-border-dark my-1 flex items-center justify-center text-muted-foreground bg-white">Errors Chart Placeholder</div>
                 <div className="h-20 border border-border-dark my-1 flex items-center justify-center text-muted-foreground bg-white">Performance Chart Placeholder</div>
                 <div className="h-20 border border-border-dark my-1 flex items-center justify-center text-muted-foreground bg-white">AI Usage Chart Placeholder</div>
            </TabsContent>
        </Tabs>
    );
};
