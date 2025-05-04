'use client';

import * as React from 'react';
import { Textarea } from "@/components/ui/textarea"; // Keep Textarea as fallback
import Editor, { Monaco, loader } from '@monaco-editor/react'; // Import Monaco Editor
import type * as monacoEditor from 'monaco-editor'; // Import Monaco Editor types

// --- Monaco Loader Configuration (Optional) ---
// loader.config({ paths: { vs: '/path/to/monaco-editor/min/vs' } }); // Use if self-hosting Monaco

interface CodeEditorProps {
    initialValue?: string; // For initial uncontrolled value
    value?: string; // Controlled value prop
    language?: string;
    onEditorMount?: (editor: monacoEditor.editor.IStandaloneCodeEditor, monacoInstance: typeof monacoEditor) => void; // Callback when Monaco mounts
    onChange?: (value: string | undefined, event: monacoEditor.editor.IModelContentChangedEvent) => void; // Callback on content change
    theme?: string; // Optional theme prop (e.g., 'vs-dark')
    options?: monacoEditor.editor.IStandaloneEditorConstructionOptions; // Pass Monaco options
}

export const CodeEditor = ({
    initialValue,
    value, // Controlled value takes precedence
    language = 'plaintext', // Default to plaintext
    onEditorMount,
    onChange,
    theme = 'vs-light', // Default theme
    options = {}
}: CodeEditorProps) => {
    const [isMonacoLoading, setIsMonacoLoading] = React.useState(true);
    const [monacoError, setMonacoError] = React.useState<Error | null>(null);

    // Merge default options with passed options
    const editorOptions: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: 'var(--font-mono), monospace', // Use CSS variable or fallback
        wordWrap: 'on',
        automaticLayout: true, // Adjust layout on container resize
        scrollBeyondLastLine: false,
        // Add accessibility options?
        // Consider adding theme definition here if custom
        ...options, // Allow overriding defaults
    };

    // --- Monaco Editor Implementation ---
    return (
        <div className="h-full w-full border border-input bg-white relative"> {/* Container needs explicit size */}
             <Editor
                height="100%" // Fill container height
                language={language}
                theme={theme} // Pass theme
                value={value} // Use controlled value (Monaco handles it well)
                defaultValue={initialValue} // Fallback for initial uncontrolled state
                onMount={(editor, monaco) => {
                    setIsMonacoLoading(false);
                    onEditorMount?.(editor, monaco); // Call parent callback
                }}
                onChange={onChange} // Pass the change handler directly
                options={editorOptions} // Pass merged options
                loading={ // Custom loading indicator
                    <div className="absolute inset-0 flex items-center justify-center bg-card text-muted-foreground text-sm">
                        Loading Editor...
                    </div>
                }
                // TODO: Error handling - Monaco's default error handling might suffice,
                // or we can use onError prop if available/needed, or try-catch onMount.
            />
            {/* Fallback Textarea if Monaco fails? Currently not implemented with react-monaco-editor easily */}
            {/* {monacoError && (
                 <div className="absolute inset-0 z-10 bg-destructive/80 p-4 text-destructive-foreground">
                     <p>Error loading code editor:</p>
                     <pre className="text-xs whitespace-pre-wrap">{monacoError.message}</pre>
                     <Textarea
                         value={value ?? initialValue ?? ""}
                         readOnly // Make fallback read-only or basic editable
                         className="retro-input flex-grow w-full h-full resize-none font-mono text-sm whitespace-pre !bg-white !text-black border-none focus-visible:!ring-0 !rounded-none p-1 mt-2"
                         aria-label="Code Editor Fallback"
                     />
                 </div>
             )} */}
        </div>
    );
};
