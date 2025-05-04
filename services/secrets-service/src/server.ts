// services/secrets-service/src/server.ts
// Placeholder implementation for secrets management using AES encryption.
// WARNING: This is a basic example. Production systems require robust security measures,
// key management (HSM, KMS), proper access control, auditing, and potentially dedicated vault solutions.

import express, { Request, Response, NextFunction } from 'express';
// import crypto from 'crypto'; // Use Node.js crypto module (preferred for production)
import CryptoJS from 'crypto-js'; // Using crypto-js for simpler AES syntax example
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const port = process.env.PORT || 3002;
const encryptionKey = process.env.SECRET_VAULT_KEY;

if (!encryptionKey || encryptionKey.length < 16) { // Basic key length check
  console.error('FATAL ERROR: SECRET_VAULT_KEY environment variable is not set or is too short (minimum 16 characters recommended).');
  process.exit(1);
}

// --- Basic In-Memory Store (Replace with Database - e.g., PostgreSQL, MongoDB) ---
// WARNING: Not suitable for production. Data loss on restart.
interface StoredSecret {
    iv: string;
    encryptedData: string;
    // Add metadata like createdAt, createdBy, scope (project/account) if needed
}
const secretsStore: { [scope: string]: { [key: string]: StoredSecret } } = {
    // Example structure:
    // 'project:project-id': { 'API_KEY': { iv: '...', encryptedData: '...' } },
    // 'account:user-id': { 'GLOBAL_TOKEN': { iv: '...', encryptedData: '...' } },
    '_global': {} // Default scope for simple keys
};

// Helper to get scope and key
const parseScopedKey = (scopedKey: string): { scope: string, key: string } => {
    const parts = scopedKey.split(':');
    if (parts.length > 1) {
        return { scope: parts[0], key: parts.slice(1).join(':') };
    }
    return { scope: '_global', key: scopedKey }; // Default to global scope if no ':'
}

// --- Encryption/Decryption Functions (Using crypto-js for example simplicity) ---
// Node.js crypto module is generally preferred for performance and standard compliance.

function encryptSecret(text: string): StoredSecret | null {
  try {
    // Generate a random Initialization Vector (IV) for each encryption
    const iv = CryptoJS.lib.WordArray.random(16); // 128-bit IV for AES-CBC
    const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(encryptionKey!), {
      iv: iv,
      mode: CryptoJS.mode.CBC, // Cipher Block Chaining mode
      padding: CryptoJS.pad.Pkcs7 // PKCS7 padding
    });
    if (!encrypted) {
        throw new Error("Encryption resulted in null or undefined.");
    }
    return {
      iv: CryptoJS.enc.Hex.stringify(iv), // Store IV as hex
      encryptedData: encrypted.toString() // Ciphertext is base64 encoded by default
    };
  } catch(error) {
     console.error("Encryption failed:", error);
     return null;
  }
}

function decryptSecret(encryptedData: string, ivHex: string): string | null {
  try {
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(encryptionKey!), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
     if (!decryptedText && encryptedData) { // Check if decryption resulted in empty string but original was not empty
         console.warn("Decryption resulted in empty string, potentially due to padding or key mismatch.");
         // Depending on policy, you might return null or empty string here
     }
    return decryptedText;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null; // Handle decryption errors appropriately
  }
}

// --- Express App Setup ---
const app = express();
app.use(cors()); // Configure CORS appropriately for production
app.use(express.json());

// --- Middleware (Placeholder for Authentication/Authorization) ---
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement proper authentication (e.g., JWT, API Key from internal services)
  // Verify the request comes from an authorized source (e.g., specific service, logged-in user)
  // Check X-API-Key header, Authorization Bearer token, etc.
  const apiKey = req.headers['x-api-key'];
  const authToken = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

  // Example: Allow internal key or valid JWT (implement actual verification)
  const INTERNAL_API_KEY = process.env.INTERNAL_SERVICE_API_KEY || 'supersecret'; // Example internal key
  const isValidInternal = apiKey === INTERNAL_API_KEY;
  const isValidUser = !!authToken; // Placeholder: Add JWT verification logic

  if (isValidInternal || isValidUser) {
     console.log("Secrets Service: Request authenticated.");
     // TODO: Add authorization check - does this user/service have permission for this scope/key?
     next(); // Allow request
  } else {
     console.warn('Secrets Service: Authentication failed!');
     res.status(401).json({ error: 'Unauthorized' });
  }

};

// --- API Routes ---

// Health Check (no auth needed)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Get a secret (scoped or global)
// Use query param for scope, path for key: /secrets/my-api-key?scope=project:xyz
app.get('/secrets/:key', authenticate, (req: Request, res: Response) => {
  const key = req.params.key;
  const scope = (req.query.scope as string) || '_global'; // Get scope from query or default

  if (!secretsStore[scope] || !secretsStore[scope][key]) {
     console.log(`Secret not found for key: ${key} in scope: ${scope}`);
    return res.status(404).json({ error: 'Secret not found' });
  }
  const storedSecret = secretsStore[scope][key];

  const decryptedValue = decryptSecret(storedSecret.encryptedData, storedSecret.iv);

  if (decryptedValue === null) {
    // Log error internally, but don't reveal details to the client
    console.error(`Failed to decrypt secret key: ${key} in scope: ${scope}`);
    return res.status(500).json({ error: 'Failed to decrypt secret' });
  }

  res.status(200).json({ key: key, value: decryptedValue, scope: scope === '_global' ? undefined : scope });
});

// Add/Update a secret (scoped or global)
app.put('/secrets/:key', authenticate, (req: Request, res: Response) => {
  const key = req.params.key;
  const scope = (req.query.scope as string) || '_global';
  const { value } = req.body;

  if (typeof value !== 'string' || value.length === 0) {
    return res.status(400).json({ error: 'Invalid secret value provided' });
  }

  const encrypted = encryptSecret(value);
   if (!encrypted) {
       return res.status(500).json({ error: 'Encryption failed' });
   }

  // Ensure scope exists in the store
  if (!secretsStore[scope]) {
      secretsStore[scope] = {};
  }

  secretsStore[scope][key] = encrypted; // Replace with DB write

  console.log(`Secret stored/updated for key: ${key} in scope: ${scope}`);
  res.status(200).json({ message: 'Secret stored successfully' }); // Avoid returning the secret
});

// Delete a secret (scoped or global)
app.delete('/secrets/:key', authenticate, (req: Request, res: Response) => {
  const key = req.params.key;
  const scope = (req.query.scope as string) || '_global';

  if (!secretsStore[scope] || !secretsStore[scope][key]) {
     console.log(`Secret not found for deletion: key=${key}, scope=${scope}`);
    return res.status(404).json({ error: 'Secret not found' }); // Return 404 if not found
  }

  delete secretsStore[scope][key]; // Replace with DB delete
   // Optional: Clean up empty scope objects
   if (scope !== '_global' && Object.keys(secretsStore[scope]).length === 0) {
       delete secretsStore[scope];
   }

  console.log(`Secret deleted for key: ${key} in scope: ${scope}`);
  res.status(200).json({ message: 'Secret deleted successfully' });
});

// List secret keys (scoped or global) - Use with caution
app.get('/secrets', authenticate, (req: Request, res: Response) => {
   const scope = (req.query.scope as string) || '_global';
   const keys = secretsStore[scope] ? Object.keys(secretsStore[scope]) : [];
   // In a real DB, query keys WHERE scope = ?
   res.status(200).json({ keys });
});


// --- Start Server ---
app.listen(port, () => {
  console.log(`Secrets service listening on http://localhost:${port}`);
  // Initialize database connection here if using one
});

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing Secrets service');
  // Close database connections here if applicable
  // e.g., dbClient.close();
  process.exit(0); // Simple exit for placeholder
});

// --- Basic Error Handling ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Secrets Service Error:", err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});
