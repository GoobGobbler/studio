'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { PackageOpen, Puzzle } from "lucide-react"; // Import Puzzle icon

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
}

export const PluginManagerContent: React.FC<PluginManagerContentProps> = ({ plugins = [], loading = false }) => {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = React.useState('');

    const handleInstall = (plugin: Plugin) => {
         toast({ title: `Installing Plugin: ${plugin.name}`, description: "TODO: Implement installation logic via Marketplace/Backend." });
         // Placeholder: update UI state (needs proper state management if props aren't refetched)
    }
    const handleUninstall = (plugin: Plugin) => {
        toast({ title: `Uninstalling Plugin: ${plugin.name}`, description: "TODO: Implement uninstallation logic.", variant: "destructive" });
         // Placeholder: update UI state
    }
     const handleUpdate = (plugin: Plugin) => {
         toast({ title: `Updating Plugin: ${plugin.name}`, description: "TODO: Implement update logic." });
          // Placeholder: update UI state
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
                                         {plugin.installed && <span className="text-xs text-green-600 ml-1">(Installed)</span>}
                                         {plugin.updateAvailable && <span className="text-xs text-blue-600 ml-1">(Update Available)</span>}
                                         <p className="text-xs text-muted-foreground mt-0.5">{plugin.description}</p>
                                     </div>
                                      <div className="space-x-1 shrink-0 pl-2">
                                          {plugin.installed ? (
                                              <>
                                                 {plugin.updateAvailable && <Button size="sm" className="retro-button !py-0 !px-1" onClick={() => handleUpdate(plugin)}>Update</Button>}
                                                 <Button size="sm" variant="destructive" className="retro-button !py-0 !px-1" onClick={() => handleUninstall(plugin)}>Uninstall</Button>
                                             </>
                                         ) : (
                                             <Button size="sm" className="retro-button !py-0 !px-1" onClick={() => handleInstall(plugin)}>Install</Button>
                                         )}
                                      </div>
                                  </li>
                             ))}
                         </ul>
                     ) : <p className="text-muted-foreground p-2">No plugins found{searchTerm ? ' matching search.' : '.'}</p>
                 )}
            </ScrollArea>
             {/* Footer actions might not be needed if install/uninstall is per-plugin */}
             {/* <div className="mt-2 pt-2 border-t border-border-dark flex justify-end">
                 <Button size="sm" className="retro-button">Check for Updates</Button>
             </div> */}
        </div>
    );
};
