// services/plugin-registry/src/server.ts
// Manages plugin listing, installation, updates, etc.

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3009; // Assign a new port
const app = express();

app.use(cors());
app.use(express.json());

// --- Placeholder Data (Replace with actual storage/logic) ---
const installedPlugins = [
     { id: 'publisher.linter-pro', name: 'Linter Pro', version: '2.1.0', description: 'Advanced code linting.', category: 'Linters', installed: true, updateAvailable: true },
     { id: 'community.retro-theme', name: 'Retro Theme Pack', version: '1.0.1', description: 'Classic UI themes.', category: 'Themes', installed: true },
];
const marketplacePlugins = [
    ...installedPlugins,
     { id: 'acme.firebase-deploy', name: 'Firebase Deployer', version: '1.2.0', description: 'Deploy to Firebase.', category: 'Deployment', installed: false },
     { id: 'secureai.sast-scan', name: 'AI Security Scanner', version: '0.9.5', description: 'LLM-powered SAST.', category: 'Security', installed: false },
];


// --- Middleware (Placeholder for Authentication/Authorization) ---
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  console.warn('Plugin Registry: Authentication middleware not implemented!');
  next(); // Allow request for now
};

// --- API Routes ---

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// List available/marketplace plugins (with installed status)
app.get('/plugins/marketplace', authenticate, (req: Request, res: Response) => {
    console.log("Plugin Registry: Request to list marketplace plugins.");
    // TODO: Implement actual fetching from a source (DB, remote registry)
    // Add search/filter parameters (req.query.q, req.query.category)
    res.status(200).json({ plugins: marketplacePlugins });
});

// List installed plugins
app.get('/plugins/installed', authenticate, (req: Request, res: Response) => {
     console.log("Plugin Registry: Request to list installed plugins.");
    // TODO: Implement actual fetching from local storage/config
     res.status(200).json({ plugins: installedPlugins.filter(p => p.installed) });
});

// Install a plugin by ID
app.post('/plugins/:pluginId/install', authenticate, (req: Request, res: Response) => {
    const pluginId = req.params.pluginId;
     console.log(`Plugin Registry: Request to install plugin: ${pluginId}`);
    // TODO: Implement download, validation, and installation logic
    // This could involve fetching from a URL, unzipping, placing in a designated folder.
    const plugin = marketplacePlugins.find(p => p.id === pluginId);
    if (!plugin) {
        return res.status(404).json({ error: 'Plugin not found.' });
    }
    // Simulate installation
    plugin.installed = true;
    if (!installedPlugins.find(p => p.id === pluginId)) {
        installedPlugins.push(plugin);
    }
     res.status(200).json({ message: `Plugin '${pluginId}' installed successfully (placeholder).`, plugin });
});

// Uninstall a plugin by ID
app.post('/plugins/:pluginId/uninstall', authenticate, (req: Request, res: Response) => {
    const pluginId = req.params.pluginId;
    console.log(`Plugin Registry: Request to uninstall plugin: ${pluginId}`);
    // TODO: Implement removal logic (deleting files, updating config)
     const index = installedPlugins.findIndex(p => p.id === pluginId);
     if (index === -1) {
         return res.status(404).json({ error: 'Plugin not installed or not found.' });
     }
     const [uninstalledPlugin] = installedPlugins.splice(index, 1);
     // Update marketplace status if needed
     const marketPlugin = marketplacePlugins.find(p => p.id === pluginId);
     if (marketPlugin) marketPlugin.installed = false;

    res.status(200).json({ message: `Plugin '${pluginId}' uninstalled successfully (placeholder).`, plugin: uninstalledPlugin });
});

// Update a plugin by ID
app.post('/plugins/:pluginId/update', authenticate, (req: Request, res: Response) => {
    const pluginId = req.params.pluginId;
     console.log(`Plugin Registry: Request to update plugin: ${pluginId}`);
    // TODO: Implement update logic (check version, download, replace files)
     const plugin = installedPlugins.find(p => p.id === pluginId);
     if (!plugin) {
         return res.status(404).json({ error: 'Plugin not installed or not found.' });
     }
      if (!plugin.updateAvailable) {
         return res.status(400).json({ error: 'No update available for this plugin.' });
     }
     // Simulate update
     plugin.version = plugin.version + '.1'; // Increment version (bad practice, use actual new version)
     plugin.updateAvailable = false;
     const marketPlugin = marketplacePlugins.find(p => p.id === pluginId);
      if (marketPlugin) {
           marketPlugin.version = plugin.version;
           marketPlugin.updateAvailable = false;
      }

    res.status(200).json({ message: `Plugin '${pluginId}' updated successfully (placeholder).`, plugin });
});


// --- Error Handling ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Plugin Registry Error:", err.stack);
  res.status(500).json({ error: 'Internal Plugin Registry Error', message: err.message });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Plugin Registry service listening on http://localhost:${port}`);
});

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing Plugin Registry service');
  process.exit(0);
});
