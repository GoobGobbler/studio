'use client';

import * as React from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Files } from "lucide-react"; // Assuming Files icon for files

// TODO: Define file/folder types
interface FileSystemNode {
    name: string;
    type: 'file' | 'folder';
    path: string; // Full path
    children?: FileSystemNode[]; // For folders
}

export const FileExplorer = () => {
    // TODO: Fetch file structure from backend (e.g., GitService or LanguageEnvService)
    const [fileTree, setFileTree] = React.useState<FileSystemNode | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');

    React.useEffect(() => {
        // Placeholder: Fetch initial file tree
        // fetch('/api/proxy/files?path=/') // Example API call
        //   .then(res => res.json())
        //   .then(data => setFileTree(data.tree))
        //   .catch(err => console.error("Failed to fetch file tree:", err));

        // Static placeholder structure
        setFileTree({
             name: 'root', type: 'folder', path: '/', children: [
                { name: 'index.html', type: 'file', path: '/index.html' },
                { name: 'style.css', type: 'file', path: '/style.css' },
                 { name: 'components', type: 'folder', path: '/components', children: [
                    { name: 'button.jsx', type: 'file', path: '/components/button.jsx'},
                    { name: 'modal.jsx', type: 'file', path: '/components/modal.jsx'},
                 ]},
                { name: 'services', type: 'folder', path: '/services', children: [ /* More files/folders */ ]},
                 { name: 'README.md', type: 'file', path: '/README.md' },
                 { name: 'package.json', type: 'file', path: '/package.json' },
            ]
        });
    }, []);

    // TODO: Implement file filtering based on searchTerm
    const renderNode = (node: FileSystemNode, level = 0): React.ReactNode => {
        const indent = { paddingLeft: `${level * 1}rem` }; // Indentation for hierarchy
        const handleClick = () => {
            if (node.type === 'file') {
                console.log(`TODO: Open file: ${node.path}`);
                 // Trigger action to open file in editor (update editor state/props)
            } else {
                // Optionally toggle folder expansion state
                console.log(`Folder clicked: ${node.path}`);
            }
        };

        return (
            <li key={node.path}>
                <div
                    className="flex items-center gap-1 hover:bg-primary/10 cursor-default text-sm"
                    style={indent}
                    onClick={handleClick}
                    title={node.path}
                >
                    {node.type === 'folder' ? '📁' : <Files size={14} />} {/* Simple icons */}
                    <span className="truncate">{node.name}</span>
                </div>
                {node.type === 'folder' && node.children && (
                    <ul>
                        {node.children.map(child => renderNode(child, level + 1))}
                    </ul>
                )}
            </li>
        );
    };

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
                    {fileTree?.children ? fileTree.children.map(node => renderNode(node)) : <li>Loading...</li>}
                </ul>
            </ScrollArea>
        </div>
    );
};
