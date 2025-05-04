import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from "@/components/ui/menubar";
import { Maximize2, Minus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// Placeholder components for IDE areas
const RetroWindow = ({ title, children, className, defaultPosition }: { title: string, children: React.ReactNode, className?: string, defaultPosition?: string }) => (
  <div className={cn("retro-window absolute", className, defaultPosition)}>
    <div className="retro-window-titlebar">
      <span>{title}</span>
      <div className="flex space-x-1">
        {/* Placeholder controls */}
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

const FileExplorer = () => (
  <ScrollArea className="h-full retro-scrollbar">
    <ul className="p-1 text-sm">
      <li>📄 index.html</li>
      <li>📄 style.css</li>
      <li>📄 script.js</li>
      <li>📁 components</li>
      <ul className="pl-4">
         <li>📄 button.jsx</li>
         <li>📄 modal.jsx</li>
      </ul>
       <li>📁 assets</li>
       <ul className="pl-4">
         <li>🖼️ logo.png</li>
       </ul>
       <li>📄 README.md</li>
       <li>📄 package.json</li>
    </ul>
  </ScrollArea>
);

const CodeEditor = () => (
    <Textarea
        placeholder="// Start coding..."
        className="retro-input flex-grow w-full h-full resize-none font-mono text-sm whitespace-pre"
    />
);


const Terminal = () => (
    <div className="flex flex-col h-full">
       <ScrollArea className="flex-grow retro-scrollbar bg-black text-green-400 p-1 font-mono text-xs">
            <p>RetroTerm v0.1</p>
            <p>user@retroide:~$ ls</p>
            <p>index.html style.css script.js components assets README.md package.json</p>
            <p>user@retroide:~$</p>
            <div className="h-4"></div> {/* Spacer */}
        </ScrollArea>
         <Input type="text" placeholder="Enter command..." className="retro-input font-mono text-xs !rounded-none !border-none !border-t-2 !border-t-border-dark focus:!ring-0 h-6" />
    </div>
);


const AIChat = () => (
     <div className="flex flex-col h-full p-1">
        <ScrollArea className="flex-grow mb-1 retro-scrollbar border border-border-dark p-1 text-sm">
            <p><span className="font-bold text-primary">RetroAI:</span> How can I help you code today?</p>
            {/* More chat messages */}
        </ScrollArea>
        <div className="flex">
        <Input type="text" placeholder="Ask AI..." className="retro-input flex-grow mr-1 h-8" />
        <Button className="retro-button h-8">Send</Button>
        </div>
    </div>
);


const PluginManager = () => (
    <div className="p-2 text-sm">
        <Input type="search" placeholder="Search plugins..." className="retro-input mb-2 h-7"/>
        <ScrollArea className="h-48 retro-scrollbar border border-border-dark p-1">
            <ul>
                <li>Plugin A v1.0 <Button size="sm" className="retro-button !py-0 !px-1 float-right">Install</Button></li>
                <li>Plugin B v2.1 <span className="text-muted-foreground float-right">Installed</span></li>
                 <li>Plugin C v0.5 <Button size="sm" className="retro-button !py-0 !px-1 float-right">Install</Button></li>
            </ul>
        </ScrollArea>
    </div>
);


// Main Page Component
export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Menu Bar */}
       <RetroMenubar />

      {/* Main Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-grow border-t-2 border-border-dark">
        {/* Left Panel: File Explorer */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
            <div className="h-full p-1 border-r-2 border-border-dark">
                 <FileExplorer />
            </div>
        </ResizablePanel>
        <ResizableHandle className="retro-separator-v !w-2" />

        {/* Center Panel: Editor & Terminal */}
        <ResizablePanel defaultSize={55} minSize={30}>
          <ResizablePanelGroup direction="vertical" className="h-full">
            {/* Code Editor */}
            <ResizablePanel defaultSize={70} minSize={30}>
                 <div className="h-full p-1">
                     <CodeEditor />
                 </div>
            </ResizablePanel>
            <ResizableHandle className="retro-separator-h !h-2" />
            {/* Terminal/Logs */}
            <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
              <div className="h-full p-1">
                {/* Tabs could go here (Terminal, Logs) */}
                <Terminal />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle className="retro-separator-v !w-2" />

        {/* Right Panel: AI Chat */}
        <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
           <div className="h-full p-1 border-l-2 border-border-dark">
              <AIChat />
           </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Floating Plugin Manager (Example Positioning) */}
       {/* In a real app, this would likely be triggered by a menu/button */}
      <RetroWindow title="Plugin Manager" className="w-64 h-80" defaultPosition="top-1/4 left-1/4">
        <PluginManager />
      </RetroWindow>

       {/* Status Bar */}
      <div className="h-6 border-t-2 border-border-light bg-card flex items-center px-2 text-xs text-foreground">
        <span>Ln 1, Col 1</span>
        <span className="mx-2 retro-separator-v !h-4 !my-auto"></span>
        <span>UTF-8</span>
        <span className="flex-grow"></span> {/* Spacer */}
        <span>Ready</span>
        <span className="mx-2 retro-separator-v !h-4 !my-auto"></span>
        <span>Branch: main</span>
      </div>
    </div>
  );
}


// Retro Menubar Component
const RetroMenubar = () => (
    <Menubar className="rounded-none border-b-2 border-t-0 border-x-0 border-border-dark bg-card h-7 min-h-7">
        <RetroMenuItem title="File" />
        <RetroMenuItem title="Edit" />
        <RetroMenuItem title="View" />
        <RetroMenuItem title="Plugins" />
        <RetroMenuItem title="AI" />
        <RetroMenuItem title="Tools" />
        <RetroMenuItem title="Help" />
    </Menubar>
);

// Simple Menu Item Wrapper for Retro Look
const RetroMenuItem = ({ title }: { title: string }) => (
     <MenubarMenu>
        <MenubarTrigger className="px-2 py-0.5 text-sm h-6 focus:bg-primary focus:text-primary-foreground data-[state=open]:bg-primary data-[state=open]:text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground">
            {title}
        </MenubarTrigger>
        {/* Placeholder Content - Add actual menu items here */}
        <MenubarContent className="retro-window !absolute !mt-0.5 !rounded-none !border-2 !p-0">
            <MenubarItem className="retro-menu-item">New File <MenubarShortcut>Ctrl+N</MenubarShortcut></MenubarItem>
            <MenubarItem className="retro-menu-item">Open... <MenubarShortcut>Ctrl+O</MenubarShortcut></MenubarItem>
            <MenubarSeparator className="retro-separator-h !my-0" />
            <MenubarItem className="retro-menu-item">Save <MenubarShortcut>Ctrl+S</MenubarShortcut></MenubarItem>
            <MenubarItem className="retro-menu-item" disabled>Save As...</MenubarItem>
            <MenubarSeparator className="retro-separator-h !my-0"/>
             <MenubarItem className="retro-menu-item">Exit</MenubarItem>
        </MenubarContent>
    </MenubarMenu>
);

// Helper utility for class names (assuming it exists in lib/utils)
import { cn } from "@/lib/utils";
