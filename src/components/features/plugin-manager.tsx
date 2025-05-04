'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { PackageOpen, Puzzle, CheckCircle, AlertTriangle, DownloadCloud, Trash2, RefreshCw } from "lucide-react"; // Added more icons

interface Plugin {
    id: string;
    name: string;
    version: string;
    description: string;
    category: string;
    installed?: boolean;
    updateAvailable?: boolean;
    // Add other fields like publisher, icon path, etc.
}

interface PluginManagerContentProps {
    plugins: Plugin[]; // Expect plugins data as prop
    loading: boolean;
    onInstall: (plugin: Plugin) => void; // Add callback props
    onUninstall: (plugin: Plugin) => void;
    onUpdate: (plugin: Plugin) => void;
}

export const PluginManagerContent: React.FC<PluginManagerContentProps> = ({
    plugins = [],
    loading = false,
    onInstall,
    onUninstall,
    onUpdate
}) => {
    const { toast } = useToast(); // Keep toast for local feedback if needed
    const [searchTerm, setSearchTerm] = React.useState('');

    // Use the passed handlers directly
    const handleInstall = (plugin: Plugin) => {
        onInstall(plugin);
    }
    const handleUninstall = (plugin: Plugin) => {
        onUninstall(plugin);
    }
    const handleUpdate = (plugin: Plugin) => {
        onUpdate(plugin);
    }

    const filteredPlugins = plugins.filter(plugin =>
        plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-2 text-sm flex flex-col h-full">
             <p className="mb-1 font-semibold flex items-center gap-1"><Puzzle size={14} />Plugin Manager</p>
            <Input
                type="search"
                placeholder="Search installed & available plugins..."
                className="retro-input mb-2 h-7"
                aria-label="Search Plugins"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
            <ScrollArea className="flex-grow retro-scrollbar border border-border-dark p-1 bg-white">
                 {loading ? <p>Loading plugins...</p> : (
                     filteredPlugins.length > 0 ? (
                         <ul>
                            {filteredPlugins.map(plugin => (
                                 <li key={plugin.id} className="mb-1 p-1 border border-transparent hover:border-border-dark flex justify-between items-start">
                                     <div>
                                         <span className="font-semibold">{plugin.name} v{plugin.version}</span> <span className="text-xs text-muted-foreground">({plugin.category})</span>
                                         {plugin.installed && <CheckCircle size={12} className="inline text-green-600 ml-1" title="Installed"/>}
                                         {plugin.updateAvailable && <AlertTriangle size={12} className="inline text-blue-600 ml-1" title="Update Available"/>}
                                         <p className="text-xs text-muted-foreground mt-0.5">{plugin.description}</p>
                                     </div>
                                      <div className="space-x-1 shrink-0 pl-2 flex items-center">
                                          {plugin.installed ? (
                                              <>
                                                 {plugin.updateAvailable && <Button size="sm" className="retro-button !py-0 !px-1" title="Update" onClick={() => handleUpdate(plugin)}><RefreshCw size={10}/></Button>}
                                                 <Button size="sm" variant="destructive" className="retro-button !py-0 !px-1" title="Uninstall" onClick={() => handleUninstall(plugin)}><Trash2 size={10}/></Button>
                                             </>
                                         ) : (
                                             <Button size="sm" className="retro-button !py-0 !px-1" title="Install" onClick={() => handleInstall(plugin)}><DownloadCloud size={10}/></Button>
                                         )}
                                      </div>
                                  </li>
                             ))}
                         </ul>
                     ) : <p className="text-muted-foreground p-2">No plugins found{searchTerm ? ' matching search.' : '.'}</p>
                 )}
            </ScrollArea>
        </div>
    );
};
