'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Terminal as TerminalIcon, FileCode, Cpu, ShieldCheck, BarChart3, RefreshCw } from "lucide-react";
// Import xterm.js related types/modules
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalAndLogsProps {
    logStream: string[]; // Accept log stream as a prop
    // Add props for profiling, security, telemetry data and loading states
    profilingData?: any;
    profilingLoading?: boolean;
    onRunProfiling?: () => void;
    securityData?: any;
    securityLoading?: boolean;
    onRunSecurityScan?: () => void;
    telemetryData?: any;
    telemetryLoading?: boolean;
    onRefreshTelemetry?: () => void;
}

// --- PTY WebSocket Configuration ---
const PTY_WS_URL = process.env.NEXT_PUBLIC_LANG_ENV_SERVICE_URL?.replace(/^http/, 'ws') + '/pty' || 'ws://localhost:3006/pty'; // Example

export const TerminalAndLogs = React.forwardRef<any, TerminalAndLogsProps>((
    {
        logStream,
        profilingData,
        profilingLoading,
        onRunProfiling,
        securityData,
        securityLoading,
        onRunSecurityScan,
        telemetryData,
        telemetryLoading,
        onRefreshTelemetry
    }, ref) => {
    const terminalContainerRef = React.useRef<HTMLDivElement>(null);
    const terminalInstanceRef = React.useRef<Terminal | null>(null); // Store Terminal instance
    const fitAddonRef = React.useRef<FitAddon | null>(null); // Ref for FitAddon instance
    const ptySocketRef = React.useRef<WebSocket | null>(null);

    // --- Effect for Terminal Initialization and PTY Connection ---
    React.useEffect(() => {
        let term: Terminal | null = null;
        let fitAddon: FitAddon | null = null;
        let socket: WebSocket | null = null;
        let resizeObserver: ResizeObserver | null = null;
        let connectInterval: NodeJS.Timeout | null = null;

        function connectPtyWebSocket() {
             if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
                 console.log("PTY WebSocket already open or connecting.");
                 return;
             }
             console.log("Attempting to connect to PTY WebSocket:", PTY_WS_URL);
             socket = new WebSocket(PTY_WS_URL);
             ptySocketRef.current = socket; // Store socket ref

            socket.onopen = () => {
                 console.log("PTY WebSocket connected.");
                 term?.write("\r\n*** QuonxTerm Connected ***\r\n$ ");
                 // Ensure terminal fits container on connect
                 setTimeout(() => fitAddon?.fit(), 100); // Slight delay ensure DOM ready
                 if (connectInterval) {
                      clearInterval(connectInterval);
                      connectInterval = null;
                 }
             };

            socket.onmessage = (event) => {
                 // Received data from PTY backend
                 term?.write(event.data);
             };

            socket.onerror = (error) => {
                 console.error("PTY WebSocket Error:", error);
                 term?.write("\r\n*** WebSocket Error ***\r\n");
             };

            socket.onclose = (event) => {
                 console.log("PTY WebSocket disconnected.", event.code, event.reason);
                 term?.write(`\r\n*** Connection Closed (Code: ${event.code}) ***\r\n`);
                 ptySocketRef.current = null;
                 // Attempt to reconnect?
                 if (!connectInterval && event.code !== 1000) { // Don't retry on normal close
                      console.log("Attempting to reconnect PTY WebSocket in 5 seconds...");
                      connectInterval = setInterval(connectPtyWebSocket, 5000);
                 }
             };
        }


        if (terminalContainerRef.current && !terminalInstanceRef.current) {
            console.log("Initializing xterm.js...");
            term = new Terminal({
                cursorBlink: true,
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 13,
                theme: { // Basic retro theme
                    background: '#000000',
                    foreground: '#00FF00', // Green text
                    cursor: '#00FF00',
                    selectionBackground: '#008080', // Teal selection
                    black: '#000000',
                    red: '#FF0000',
                    green: '#00FF00',
                    yellow: '#FFFF00',
                    blue: '#0000FF',
                    magenta: '#FF00FF',
                    cyan: '#00FFFF',
                    white: '#FFFFFF',
                    brightBlack: '#808080',
                    brightRed: '#FF0000',
                    brightGreen: '#00FF00',
                    brightYellow: '#FFFF00',
                    brightBlue: '#0000FF',
                    brightMagenta: '#FF00FF',
                    brightCyan: '#00FFFF',
                    brightWhite: '#FFFFFF'
                }
            });
            fitAddon = new FitAddon();
            fitAddonRef.current = fitAddon;
            term.loadAddon(fitAddon);

            // Mount terminal
            term.open(terminalContainerRef.current);
            fitAddon.fit(); // Initial fit

            term.write('Welcome to QuonxTerm!\r\nConnecting to backend...\r\n');

            // Connect to WebSocket
            connectPtyWebSocket();

            // Handle user input -> send to WebSocket
            term.onData(data => {
                 // console.log("Terminal Input:", data); // Debug
                if (ptySocketRef.current && ptySocketRef.current.readyState === WebSocket.OPEN) {
                    ptySocketRef.current.send(data);
                } else {
                    console.warn("PTY WebSocket not connected, cannot send input.");
                    term?.write("\r\n*** Not Connected ***\r\n");
                }
            });

            terminalInstanceRef.current = term; // Store instance

            if (ref) { // Assign to forwarded ref if provided
                 if (typeof ref === 'function') {
                     ref(term);
                 } else {
                     ref.current = term;
                 }
             }

             // Handle resize
             resizeObserver = new ResizeObserver(() => {
                  try {
                      fitAddon?.fit();
                       // Inform backend PTY process about resize
                       const dims = term?.proposeDimensions();
                       if (dims && ptySocketRef.current && ptySocketRef.current.readyState === WebSocket.OPEN) {
                           ptySocketRef.current.send(JSON.stringify({ type: 'resize', cols: dims.cols, rows: dims.rows }));
                       }
                  } catch (e) {
                      console.error("Error fitting terminal:", e);
                  }
              });
              const parentElement = terminalContainerRef.current?.parentElement;
              if (parentElement) {
                  resizeObserver.observe(parentElement);
              } else {
                  console.warn("Terminal container parent not found for resize observer.");
              }
        }

        // Cleanup function
        return () => {
             console.log("Cleaning up TerminalAndLogs component...");
             resizeObserver?.disconnect();
             if (connectInterval) clearInterval(connectInterval);
             socket?.close(); // Close WebSocket
             term?.dispose(); // Dispose terminal instance
             terminalInstanceRef.current = null;
             fitAddonRef.current = null;
             ptySocketRef.current = null;
             if (ref) { // Clear forwarded ref
                  if (typeof ref === 'function') {
                      ref(null);
                  } else {
                      ref.current = null;
                  }
             }
        };
    }, [ref]); // Rerun effect only if ref changes (shouldn't happen often)

    // Scroll logs to bottom
    const logScrollAreaRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (logScrollAreaRef.current) {
            const viewportElement = logScrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewportElement) {
                viewportElement.scrollTop = viewportElement.scrollHeight;
            } else {
                 logScrollAreaRef.current.scrollTop = logScrollAreaRef.current.scrollHeight;
            }
        }
    }, [logStream]); // Trigger scroll when logStream updates


    return (
        <Tabs defaultValue="terminal" className="flex flex-col h-full">
            <TabsList className="retro-tabs-list shrink-0">
                <TabsTrigger value="terminal" className="retro-tab-trigger"><TerminalIcon size={14} className="mr-1" />Terminal</TabsTrigger>
                <TabsTrigger value="logs" className="retro-tab-trigger"><FileCode size={14} className="mr-1" />Logs</TabsTrigger>
                 <TabsTrigger value="profiling" className="retro-tab-trigger"><Cpu size={14} className="mr-1" />Profiling</TabsTrigger>
                 <TabsTrigger value="security" className="retro-tab-trigger"><ShieldCheck size={14} className="mr-1" />Security</TabsTrigger>
                 <TabsTrigger value="dashboard" className="retro-tab-trigger"><BarChart3 size={14} className="mr-1" />Telemetry</TabsTrigger>
            </TabsList>

            {/* Terminal Tab */}
            <TabsContent value="terminal" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-0">
                 {/* Container for xterm.js */}
                 <div ref={terminalContainerRef} id="terminal-container" className="w-full h-full bg-black">
                     {/* xterm.js will attach here */}
                 </div>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-0">
                 <div className="flex flex-col h-full bg-card border-t-2 border-border-dark">
                     <ScrollArea ref={logScrollAreaRef} className="flex-grow retro-scrollbar p-1 font-mono text-xs bg-white">
                         {logStream.map((log, index) => (
                            <p key={index} className="whitespace-pre-wrap">{log}</p>
                        ))}
                     </ScrollArea>
                 </div>
            </TabsContent>

             {/* Profiling Tab */}
            <TabsContent value="profiling" className="flex-grow overflow-y-auto mt-0 rounded-none border-none p-2 text-sm bg-card border-t-2 border-border-dark">
                 <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold flex items-center gap-1"><Cpu size={14} />Profiling Panel</p>
                    <Button className="retro-button !py-0 !px-1" size="sm" onClick={onRunProfiling} disabled={profilingLoading}>
                         <RefreshCw size={12} className={`mr-1 ${profilingLoading ? 'animate-spin' : ''}`}/> Run Analysis
                    </Button>
                 </div>
                 <p className="text-muted-foreground text-xs mb-2">Performance metrics and bundle analysis.</p>
                 <ScrollArea className="h-48 retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                    {profilingLoading ? <p>Loading profiling data...</p> :
                    profilingData ? <pre className="text-xs">{JSON.stringify(profilingData, null, 2)}</pre> :
                    <p>No profiling data available. Click 'Run Analysis'.</p>}
                    {/* TODO: Add Charts (e.g., flame graph, bundle size breakdown) */}
                 </ScrollArea>
            </TabsContent>

             {/* Security Tab */}
            <TabsContent value="security" className="flex-grow overflow-y-auto mt-0 rounded-none border-none p-2 text-sm bg-card border-t-2 border-border-dark">
                 <div className="flex justify-between items-center mb-1">
                     <p className="font-semibold flex items-center gap-1"><ShieldCheck size={14} />Security Scanner</p>
                     <Button className="retro-button !py-0 !px-1" size="sm" onClick={onRunSecurityScan} disabled={securityLoading}>
                         <RefreshCw size={12} className={`mr-1 ${securityLoading ? 'animate-spin' : ''}`}/> Scan Now
                     </Button>
                 </div>
                 <p className="text-muted-foreground text-xs mb-1">SAST and dependency scan results.</p>
                 <ScrollArea className="h-48 retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                     {securityLoading ? <p>Running security scan...</p> :
                     securityData ? <pre className="text-xs whitespace-pre-wrap">{typeof securityData === 'string' ? securityData : JSON.stringify(securityData, null, 2)}</pre> :
                     <p>No security data available. Click 'Scan Now'.</p>}
                 </ScrollArea>
            </TabsContent>

             {/* Telemetry Tab */}
            <TabsContent value="dashboard" className="flex-grow overflow-y-auto mt-0 rounded-none border-none p-2 text-sm bg-card border-t-2 border-border-dark">
                 <div className="flex justify-between items-center mb-1">
                     <p className="font-semibold flex items-center gap-1"><BarChart3 size={14} />Telemetry Dashboard</p>
                      <Button className="retro-button !py-0 !px-1" size="sm" onClick={onRefreshTelemetry} disabled={telemetryLoading}>
                          <RefreshCw size={12} className={`mr-1 ${telemetryLoading ? 'animate-spin' : ''}`}/> Refresh
                      </Button>
                 </div>
                 <p className="text-muted-foreground text-xs mb-2">Errors, Performance, AI Usage.</p>
                 <div className="border border-border-dark p-1 my-1 bg-white min-h-[100px]">
                      {telemetryLoading ? <p>Loading telemetry data...</p> :
                      telemetryData ? <pre className="text-xs">{JSON.stringify(telemetryData, null, 2)}</pre> :
                      <p>No telemetry data available.</p>}
                      {/* TODO: Add actual charts */}
                      <p className="text-center text-muted-foreground text-xs mt-4">Charts Placeholder</p>
                 </div>
            </TabsContent>
        </Tabs>
    );
});

TerminalAndLogs.displayName = "TerminalAndLogs";
