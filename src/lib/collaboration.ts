// src/lib/collaboration.ts
// Placeholder client-side library for Yjs real-time collaboration

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
// import { MonacoBinding } from 'y-monaco'; // Example: If using Monaco Editor
import { WebrtcProvider } from 'y-webrtc'; // Optional: P2P fallback/alternative
import type * as monaco from 'monaco-editor'; // Type only import for Monaco

// --- Configuration ---
// Get WebSocket URL from environment variables or default
const WS_URL = process.env.NEXT_PUBLIC_COLLABORATION_WS_URL || 'ws://localhost:3001';
const USE_WEBRTC = process.env.NEXT_PUBLIC_USE_WEBRTC === 'true'; // Example flag

// --- Types ---
export interface CollaborationSession {
  doc: Y.Doc;
  wsProvider: WebsocketProvider;
  rtcProvider?: WebrtcProvider; // Optional
  // monacoBinding?: MonacoBinding; // Optional: Example for Monaco
  awareness: WebsocketProvider['awareness']; // Awareness object
  destroy: () => void; // Function to disconnect and clean up
}

// --- Connection Function ---
/**
 * Connects to a collaboration session for a specific document.
 * @param documentId Unique identifier for the document (e.g., 'project-file/path/to/file.js')
 * @param editorInstance Optional: Monaco editor instance for binding
 * @returns A CollaborationSession object or null if connection fails.
 */
export function connectCollaboration(
  documentId: string,
  // editorInstance?: monaco.editor.IStandaloneCodeEditor, // Pass editor instance if using bindings
  // textModel?: monaco.editor.ITextModel // Pass text model if using bindings
): CollaborationSession | null {
  try {
    const doc = new Y.Doc();

    // --- WebSocket Provider ---
    // The document ID is appended to the WS URL path by y-websocket client
    const wsProvider = new WebsocketProvider(
      WS_URL,
      documentId, // This becomes the room/document name on the server
      doc,
      {
        // Optional: Add parameters like authentication tokens
        // params: { token: 'your-auth-token' }
      }
    );

    wsProvider.on('status', (event: { status: string }) => {
      console.log(`WebSocket Status (${documentId}):`, event.status); // connected, disconnected
    });

    wsProvider.on('sync', (isSynced: boolean) => {
       console.log(`WebSocket Sync Status (${documentId}):`, isSynced);
    });

    const awareness = wsProvider.awareness;

    // --- WebRTC Provider (Optional) ---
    let rtcProvider: WebrtcProvider | undefined = undefined;
    if (USE_WEBRTC) {
      // Requires a WebRTC signaling server (e.g., using y-webrtc's included server or a custom one)
      // See https://github.com/yjs/y-webrtc#signaling
      rtcProvider = new WebrtcProvider(
        documentId, // Room name must match WS provider's document ID
        doc,
        {
          // Specify signaling server URLs
          // signaling: ['wss://your-signaling-server.com']
        }
      );
      rtcProvider.on('status', (event: { status: string }) => {
         console.log(`WebRTC Status (${documentId}):`, event.status);
      });
    }

    // --- Editor Binding (Example: Monaco) ---
    // let monacoBinding: MonacoBinding | undefined = undefined;
    // if (editorInstance && textModel) {
    //   const yText = doc.getText('monaco'); // Shared Yjs text type for the editor content
    //   monacoBinding = new MonacoBinding(
    //     yText,
    //     textModel,
    //     new Set([editorInstance]),
    //     awareness
    //   );
    //   console.log(`Monaco binding created for ${documentId}`);
    // } else {
    //   console.warn(`Monaco instance or model not provided for ${documentId}, binding skipped.`);
    // }

    // --- Cleanup Function ---
    const destroy = () => {
      console.log(`Destroying collaboration session for ${documentId}`);
      // monacoBinding?.destroy();
      wsProvider.disconnect();
      rtcProvider?.disconnect();
      doc.destroy();
    };

    console.log(`Collaboration session initialized for: ${documentId}`);

    // --- Return Session Object ---
    return {
      doc,
      wsProvider,
      rtcProvider, // Optional
      // monacoBinding, // Optional
      awareness,
      destroy,
    };

  } catch (error) {
    console.error("Failed to initialize collaboration session:", error);
    return null;
  }
}

// --- Awareness Helper ---
/**
 * Sets the local user's awareness state (e.g., name, cursor position).
 * @param awareness The awareness object from the session.
 * @param state The state to set (e.g., { user: { name: 'Alice', color: '#ff0000' }, cursor: { x: 10, y: 5 } }).
 */
export function setLocalAwarenessState(awareness: WebsocketProvider['awareness'], state: Record<string, any>) {
  awareness.setLocalState(state);
}

/**
 * Gets the current awareness states of all connected users.
 * @param awareness The awareness object from the session.
 * @returns A map of clientID to awareness state.
 */
export function getAwarenessStates(awareness: WebsocketProvider['awareness']): Map<number, Record<string, any>> {
  return awareness.getStates();
}

/**
 * Listens for changes in awareness states.
 * @param awareness The awareness object from the session.
 * @param callback Function to call when awareness changes. It receives added, updated, and removed client IDs.
 */
export function onAwarenessChange(
    awareness: WebsocketProvider['awareness'],
    callback: (changes: { added: number[], updated: number[], removed: number[] }, origin: any) => void
    ) {
    awareness.on('change', callback);
    // Return an unsubscribe function
    return () => awareness.off('change', callback);
}

// --- Document Content Helpers (Example for Text) ---
/**
 * Gets a Y.Text type for shared text editing.
 * @param doc The Y.Doc instance.
 * @param key The key for the shared type (e.g., 'monaco', 'content').
 * @returns The Y.Text instance.
 */
export function getSharedText(doc: Y.Doc, key: string = 'content'): Y.Text {
    return doc.getText(key);
}

// Add more helpers for other Yjs types (Y.Array, Y.Map) as needed.
