// services/secrets-service/src/server.ts
// Placeholder implementation for secrets management using AES encryption.
// WARNING: This is a basic example. Production systems require robust security measures,
// key management (HSM, KMS), proper access control, auditing, and potentially dedicated vault solutions.

import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto'; // Use Node.js crypto module
import CryptoJS from 'crypto-js'; // Using crypto-js for simpler AES syntax example
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const port = process.env.PORT || 3002;
const encryptionKey = process.env.SECRET_VAULT_KEY;

if (!encryptionKey) {
  console.error('FATAL ERROR: SECRET_VAULT_KEY environment variable is not set.');
  process.exit(1);
}

// --- Basic In-Memory Store (Replace with Database) ---
// WARNING: Not suitable for production. Data loss on restart.
const secretsStore: { [key: string]: { iv: string; encryptedData: string } } = {};

// --- Encryption/Decryption Functions (Using crypto-js for example simplicity) ---
// Node.js crypto module is generally preferred for performance and standard compliance.

function encryptSecret(text: string): { iv: string; encryptedData: string } {
  // Generate a random Initialization Vector (IV) for each encryption
  const iv = CryptoJS.lib.WordArray.random(16); // 128-bit IV
  const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(encryptionKey!), {
    iv: iv,
    mode: CryptoJS.mode.CBC, // Cipher Block Chaining mode
    padding: CryptoJS.pad.Pkcs7 // PKCS7 padding
  });
  return {
    iv: CryptoJS.enc.Hex.stringify(iv), // Store IV as hex
    encryptedData: encrypted.toString() // Ciphertext is base64 encoded by default
  };
}

function decryptSecret(encryptedData: string, ivHex: string): string | null {
  try {
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(encryptionKey!), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
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
  // TODO: Implement proper authentication (e.g., JWT, API Key)
  // Verify the request comes from an authorized source (e.g., specific service, logged-in user)
  console.warn('Secrets Service: Authentication middleware not implemented!');
  next(); // Allow request for now
};

// --- API Routes ---

// Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Get a secret
app.get('/secrets/:key', authenticate, (req: Request, res: Response) => {
  const key = req.params.key;
  const storedSecret = secretsStore[key];

  if (!storedSecret) {
    return res.status(404).json({ error: 'Secret not found' });
  }

  const decryptedValue = decryptSecret(storedSecret.encryptedData, storedSecret.iv);

  if (decryptedValue === null) {
    // Log error internally, but don't reveal details to the client
    return res.status(500).json({ error: 'Failed to decrypt secret' });
  }

  res.status(200).json({ key: key, value: decryptedValue });
});

// Add/Update a secret
app.put('/secrets/:key', authenticate, (req: Request, res: Response) => {
  const key = req.params.key;
  const { value } = req.body;

  if (typeof value !== 'string' || value.length === 0) {
    return res.status(400).json({ error: 'Invalid secret value provided' });
  }

  const encrypted = encryptSecret(value);
  secretsStore[key] = encrypted; // Replace with DB write

  console.log(`Secret stored/updated for key: ${key}`);
  res.status(200).json({ message: 'Secret stored successfully' }); // Avoid returning the secret
});

// Delete a secret
app.delete('/secrets/:key', authenticate, (req: Request, res: Response) => {
  const key = req.params.key;

  if (!secretsStore[key]) {
    return res.status(404).json({ error: 'Secret not found' });
  }

  delete secretsStore[key]; // Replace with DB delete
  console.log(`Secret deleted for key: ${key}`);
  res.status(200).json({ message: 'Secret deleted successfully' });
});

// List secret keys (use with caution in production - needs proper ACLs)
app.get('/secrets', authenticate, (req: Request, res: Response) => {
  const keys = Object.keys(secretsStore);
  res.status(200).json({ keys });
});


// --- Start Server ---
app.listen(port, () => {
  console.log(`Secrets service listening on http://localhost:${port}`);
});

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  // Close database connections here if applicable
  process.exit(0); // Simple exit for placeholder
});
