'use client';

import * as React from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Files, Folder, FolderOpen } from "lucide-react"; // Add Folder icons

// Define file/folder types
interface FileSystemNode {
    name: string;
    type: 'file' | 'folder';
    path: string; // Full path
    children?: FileSystemNode[]; // For folders
    isOpen?: boolean; // State for folder expansion
}

interface FileExplorerProps {
    onFileSelect: (filePath: string) => void; // Callback when a file is selected
}


export const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect }) => {
    // Fetch file structure from backend (e.g., GitService or LanguageEnvService)
    const [fileTree, setFileTree] = React.useState<FileSystemNode | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [loading, setLoading] = React.useState(true);

    // Function to toggle folder open state
     const toggleFolder = (path: string) => {
        setFileTree(prevTree => {
            if (!prevTree) return null;

            const updateNode = (node: FileSystemNode): FileSystemNode => {
                if (node.path === path && node.type === 'folder') {
                    return { ...node, isOpen: !node.isOpen };
                }
                if (node.children) {
                    return { ...node, children: node.children.map(updateNode) };
                }
                return node;
            };

             // Ensure the root node is also processed if it matches
             if (prevTree.path === path && prevTree.type === 'folder') {
                 return { ...prevTree, isOpen: !prevTree.isOpen };
             }
             if (prevTree.children) {
                 return { ...prevTree, children: prevTree.children.map(updateNode) };
             }
             return prevTree;

        });
    };


    React.useEffect(() => {
        // Placeholder: Fetch initial file tree
        // fetch('/api/proxy/files?path=/') // Example API call
        //   .then(res => res.json())
        //   .then(data => setFileTree(data.tree))
        //   .catch(err => console.error("Failed to fetch file tree:", err));
        setLoading(true);
        // Simulate fetch delay
        setTimeout(() => {
            // Static placeholder structure
             setFileTree({
                 name: 'QuonxCoder Project', type: 'folder', path: '/', isOpen: true, children: [
                    { name: 'README.md', type: 'file', path: '/README.md' },
                    { name: 'package.json', type: 'file', path: '/package.json' },
                    { name: 'docker-compose.yml', type: 'file', path: '/docker-compose.yml' },
                    {
                        name: 'src', type: 'folder', path: '/src', isOpen: true, children: [
                            {
                                name: 'app', type: 'folder', path: '/src/app', isOpen: true, children: [
                                    { name: 'page.tsx', type: 'file', path: '/src/app/page.tsx' },
                                    { name: 'layout.tsx', type: 'file', path: '/src/app/layout.tsx' },
                                    { name: 'globals.css', type: 'file', path: '/src/app/globals.css' },
                                ]
                            },
                            {
                                name: 'components', type: 'folder', path: '/src/components', children: [
                                    { name: 'features', type: 'folder', path: '/src/components/features', children: [
                                          { name: 'ai-chat.tsx', type: 'file', path: '/src/components/features/ai-chat.tsx'},
                                          { name: 'code-editor.tsx', type: 'file', path: '/src/components/features/code-editor.tsx'},
                                     ] },
                                     { name: 'layout', type: 'folder', path: '/src/components/layout', children: [
                                          { name: 'retro-menubar.tsx', type: 'file', path: '/src/components/layout/retro-menubar.tsx'},
                                          { name: 'retro-window.tsx', type: 'file', path: '/src/components/layout/retro-window.tsx'},
                                     ] },
                                     { name: 'ui', type: 'folder', path: '/src/components/ui', children: [
                                          { name: 'button.tsx', type: 'file', path: '/src/components/ui/button.tsx'},
                                     ] },
                                ]
                            },
                            {
                                name: 'lib', type: 'folder', path: '/src/lib', children: [
                                    { name: 'utils.ts', type: 'file', path: '/src/lib/utils.ts' },
                                    { name: 'collaboration.ts', type: 'file', path: '/src/lib/collaboration.ts' },
                                    { name: 'secrets.ts', type: 'file', path: '/src/lib/secrets.ts' },
                                ]
                             },
                             {
                                name: 'ai', type: 'folder', path: '/src/ai', children: [
                                     { name: 'agents', type: 'folder', path: '/src/ai/agents', children: [
                                         { name: 'ollama-agent.ts', type: 'file', path: '/src/ai/agents/ollama-agent.ts'}
                                     ] },
                                     { name: 'flows', type: 'folder', path: '/src/ai/flows' },
                                     { name: 'ai-instance.ts', type: 'file', path: '/src/ai/ai-instance.ts' },
                                ]
                             },
                        ]
                    },
                    {
                        name: 'services', type: 'folder', path: '/services', children: [
                            { name: 'ai-service', type: 'folder', path: '/services/ai-service'},
                            { name: 'collaboration-service', type: 'folder', path: '/services/collaboration-service'},
                            { name: 'secrets-service', type: 'folder', path: '/services/secrets-service'},
                        ]
                    },
                ]
            });
             setLoading(false);
        }, 800); // Simulate 800ms load time

    }, []);

    // Filter logic (basic contains check)
    const filterTree = (node: FileSystemNode): FileSystemNode | null => {
        if (!searchTerm) return node; // Return original node if no search term

        const nodeNameLower = node.name.toLowerCase();
        const searchTermLower = searchTerm.toLowerCase();

        if (node.type === 'file') {
            return nodeNameLower.includes(searchTermLower) ? node : null;
        }

        // For folders, check if the folder name matches OR if any children match
        const folderNameMatches = nodeNameLower.includes(searchTermLower);
        let filteredChildren: FileSystemNode[] = [];
        if (node.children) {
            filteredChildren = node.children
                .map(child => filterTree(child))
                .filter((child): child is FileSystemNode => child !== null);
        }

        // Return the folder if its name matches or it has matching children
        if (folderNameMatches || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren, isOpen: true }; // Force open if filtering
        }

        return null;
    };


    // TODO: Implement file filtering based on searchTerm
    const renderNode = (node: FileSystemNode, level = 0): React.ReactNode => {
        const indent = { paddingLeft: `${level * 1}rem` }; // Indentation for hierarchy
        const handleClick = (e: React.MouseEvent) => {
             e.stopPropagation(); // Prevent click bubbling to parent folders
            if (node.type === 'file') {
                console.log(`Opening file: ${node.path}`);
                onFileSelect(node.path); // Call the callback prop
            } else {
                // Toggle folder expansion state
                 console.log(`Toggling folder: ${node.path}`);
                 toggleFolder(node.path);
            }
        };

         const icon = node.type === 'folder'
             ? node.isOpen ? <FolderOpen size={14} className="text-primary" /> : <Folder size={14} className="text-primary" />
             : <Files size={14} className="text-muted-foreground" />;


        return (
             <li key={node.path}>
                 <div
                     className="flex items-center gap-1 hover:bg-primary/10 cursor-default text-sm py-0.5 px-1"
                     style={indent}
                     onClick={handleClick}
                     title={node.path}
                 >
                     {icon}
                     <span className="truncate">{node.name}</span>
                 </div>
                 {/* Recursively render children only if the folder is open */}
                 {node.type === 'folder' && node.isOpen && node.children && (
                     <ul>
                         {node.children.map(child => renderNode(child, level + 1))}
                     </ul>
                 )}
             </li>
        );
    };

     const filteredRootNode = fileTree ? filterTree(fileTree) : null;


    return (
        <div className="flex flex-col h-full">
            <div className="p-1 border-b-2 border-border-dark">
                <Input
                    type="search"
                    placeholder="Search files..."
                    className="retro-input h-7 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <ScrollArea className="flex-grow retro-scrollbar">
                <ul className="p-1">
                    {loading ? <li>Loading file tree...</li> :
                    filteredRootNode?.children && filteredRootNode.children.length > 0 ? filteredRootNode.children.map(node => renderNode(node)) :
                    <li>{searchTerm ? 'No matching files found.' : 'No files in project.'}</li>}
                </ul>
            </ScrollArea>
        </div>
    );
};
```
    