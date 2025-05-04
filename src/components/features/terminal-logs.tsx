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

interface TerminalAndLogsProps {
    logStream: string[]; // Accept log stream as a prop
}

export const TerminalAndLogs = React.forwardRef<any, TerminalAndLogsProps>(({ logStream }, ref) => { // Forward ref
     const terminalContainerRef = React.useRef<HTMLDivElement>(null);
     const fitAddonRef = React.useRef<any>(null); // Ref for FitAddon instance
     // Removed local logs state, using prop instead

    // --- Effect for Terminal Initialization ---
    React.useEffect(() => {
        // Ensure this runs only once or when dependencies change (like theme)
        let terminalInstance: any = null; // Keep instance locally in effect scope
        let resizeObserver: ResizeObserver | null = null;

        if (terminalContainerRef.current && !terminalInstance) { // Check if already initialized
            console.log("Initializing xterm.js...");
            // Placeholder: Replace with actual xterm initialization when library is added
            const mockTerm = {
                write: (text: string) => {
                     if (terminalContainerRef.current) {
                         // Simple text append for placeholder
                         const line = document.createElement('div');
                         line.textContent = text.replace(/\r\n/g, '\n').replace(/\n/g, ''); // Basic line handling
                         terminalContainerRef.current.appendChild(line);
                         terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight; // Auto-scroll
                     }
                },
                onData: (callback: (data: string) => void) => {
                    // Mock input handling - maybe add an input field below?
                    console.log("Mock Terminal: onData registered.");
                },
                loadAddon: (addon: any) => { console.log("Mock Terminal: Load addon", addon);},
                open: (element: HTMLElement) => { console.log("Mock Terminal: Open"); },
                dispose: () => { console.log("Mock Terminal: Dispose"); terminalInstance = null; }
            };
            const mockFitAddon = {
                 fit: () => { console.log("Mock Terminal: Fit addon called.");}
            };

            fitAddonRef.current = mockFitAddon;
            mockTerm.loadAddon(mockFitAddon);
            mockTerm.open(terminalContainerRef.current);
            mockFitAddon.fit(); // Initial fit

            mockTerm.write('Welcome to QuonxTerm! (Placeholder)\r\n$ ');

            // Example: Handle input (send to backend WebSocket/service)
            mockTerm.onData(data => {
                console.log("Terminal Input (Placeholder):", data);
                // Send data to backend shell process via WebSocket/API
                // For local echo: mockTerm.write(data);
            });

             // Example: Handle output from backend
             // backendSocket.on('terminal-output', (output) => {
             //    mockTerm.write(output);
             // });

            terminalInstance = mockTerm; // Store instance if needed outside effect
            if (ref) { // Assign to forwarded ref if provided
                 if (typeof ref === 'function') {
                     ref(terminalInstance);
                 } else {
                     ref.current = terminalInstance;
                 }
             }

             // Handle resize
             resizeObserver = new ResizeObserver(() => {
                  fitAddonRef.current?.fit();
              });
              // Observe the parent of the container for size changes
              const parentElement = terminalContainerRef.current?.parentElement;
              if (parentElement) {
                  resizeObserver.observe(parentElement);
              } else {
                  console.warn("Terminal container parent not found for resize observer.");
              }

            // Cleanup function
            return () => {
                 console.log("Disposing xterm.js instance...");
                 resizeObserver?.disconnect();
                 terminalInstance?.dispose();
                 if (ref) { // Clear forwarded ref
                      if (typeof ref === 'function') {
                          ref(null);
                      } else {
                          ref.current = null;
                      }
                 }
            };
        }
        // If dependencies like theme are added, include them in the array below
    }, []); // Run once on mount

    // Scroll logs to bottom
    const logScrollAreaRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (logScrollAreaRef.current) {
            // Find the viewport element within the ScrollArea component
             const viewportElement = logScrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewportElement) {
                viewportElement.scrollTop = viewportElement.scrollHeight;
            } else {
                 // Fallback for direct scroll area element if Radix structure changes
                 logScrollAreaRef.current.scrollTop = logScrollAreaRef.current.scrollHeight;
            }
        }
    }, [logStream]); // Trigger scroll when logStream updates


    return (
        <Tabs defaultValue="terminal" className="flex flex-col h-full">
            <TabsList className="retro-tabs-list shrink-0">
                <TabsTrigger value="terminal" className="retro-tab-trigger"><TerminalIcon size={14} className="mr-1" />Terminal</TabsTrigger>
                <TabsTrigger value="logs" className="retro-tab-trigger"><FileCode size={14} className="mr-1" />Logs</TabsTrigger>
                 {/* Keep other tabs as placeholders */}
                 <TabsTrigger value="profiling" className="retro-tab-trigger" disabled><Cpu size={14} className="mr-1" />Profiling</TabsTrigger>
                 <TabsTrigger value="security" className="retro-tab-trigger" disabled><ShieldCheck size={14} className="mr-1" />Security</TabsTrigger>
                 <TabsTrigger value="dashboard" className="retro-tab-trigger" disabled><BarChart3 size={14} className="mr-1" />Dashboard</TabsTrigger>
            </TabsList>

            {/* Terminal Tab */}
            <TabsContent value="terminal" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-0">
                 <div className="flex flex-col h-full bg-black text-[#00FF00] font-mono text-xs border-t-2 border-border-dark">
                     {/* Container for xterm.js */}
                     <div ref={terminalContainerRef} id="terminal-container" className="flex-grow w-full h-full p-1 overflow-y-auto">
                         {/* xterm.js will attach here or placeholder content */}
                     </div>
                     {/* Optional separate input if not handled by xterm */}
                      {/* <Input type="text" placeholder="> Enter command..." aria-label="Terminal Input" className="retro-input !bg-black !text-[#00FF00] font-mono text-xs !rounded-none !border-none !border-t-2 !border-t-[#555555] focus:!ring-0 h-6 shrink-0" onKeyDown={handleTerminalInput} /> */}
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
            <TabsContent value="profiling" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-2 text-sm">
                 <p className="font-semibold flex items-center gap-1"><Cpu size={14} />Profiling Panel (Placeholder)</p>
                 <p className="text-muted-foreground text-xs mb-2">Performance metrics and bundle analysis.</p>
                 <div className="h-32 border border-border-dark my-1 flex items-center justify-center text-muted-foreground bg-white">Chart Area Placeholder</div>
                 <Button className="retro-button mt-2" size="sm" disabled>Run Analysis</Button>
            </TabsContent>

             {/* Security Tab */}
            <TabsContent value="security" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-2 text-sm">
                 <p className="font-semibold flex items-center gap-1"><ShieldCheck size={14} />Security Scanner (Placeholder)</p>
                 <p className="text-muted-foreground text-xs mb-1">SAST and dependency scan results.</p>
                 <ScrollArea className="h-32 retro-scrollbar border border-border-dark p-1 my-1 bg-white">
                     <p>[INFO] Ready to scan.</p>
                 </ScrollArea>
                 <Button className="retro-button mt-1" size="sm" disabled>Scan Now</Button>
            </TabsContent>

             {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="flex-grow overflow-hidden mt-0 rounded-none border-none p-2 text-sm">
                 <p className="font-semibold flex items-center gap-1"><BarChart3 size={14} />Telemetry Dashboard (Placeholder)</p>
                 <p className="text-muted-foreground text-xs mb-2">Errors, Performance, AI Usage.</p>
                 <div className="h-20 border border-border-dark my-1 flex items-center justify-center text-muted-foreground bg-white">Errors Chart Placeholder</div>
                 <div className="h-20 border border-border-dark my-1 flex items-center justify-center text-muted-foreground bg-white">Performance Chart Placeholder</div>
            </TabsContent>
        </Tabs>
    );
});

TerminalAndLogs.displayName = "TerminalAndLogs"; // Add display name for forwardRef
