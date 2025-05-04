// services/observability-service/src/server.ts
// Main entry point for the Observability Service.
// Collects/exposes metrics, logs, traces, or interfaces with monitoring systems.

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import promClient from 'prom-client'; // Import prom-client

dotenv.config();

const port = process.env.PORT || 3005;
const app = express();

// --- Prometheus Metrics Setup ---
const collectDefaultMetrics = promClient.collectDefaultMetrics;
const Registry = promClient.Registry;
const register = new Registry();
collectDefaultMetrics({ register }); // Collect default Node.js metrics

// Example custom metric: Counter for AI agent calls
const agentCallsCounter = new promClient.Counter({
  name: 'quonxcoder_agent_calls_total',
  help: 'Total number of AI agent calls processed by the coordinator',
  labelNames: ['agent_name', 'status'], // Labels for agent name and success/failure
  registers: [register],
});

// Example custom metric: Histogram for AI agent latency
const agentLatencyHistogram = new promClient.Histogram({
    name: 'quonxcoder_agent_latency_seconds',
    help: 'Latency distribution for AI agent calls',
    labelNames: ['agent_name'],
    buckets: [0.1, 0.5, 1, 2, 5, 10], // Buckets in seconds
    registers: [register],
});


app.use(cors()); // Configure CORS appropriately
app.use(express.json({ limit: '10mb' })); // Limit payload size for logs/traces


// --- Middleware (Placeholder for Authentication/Authorization) ---
const authenticateInternal = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Secure these internal endpoints properly
  const INTERNAL_API_KEY = process.env.INTERNAL_SERVICE_API_KEY || 'supersecret';
  const apiKey = req.headers['x-api-key'];
  if (apiKey === INTERNAL_API_KEY) {
      next();
  } else {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid internal API key.' });
  }
};


// --- API Routes ---

// Health Check (no auth needed)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// === Prometheus Metrics Endpoint ===
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex: any) {
    res.status(500).end(ex.message || 'Error exporting metrics');
  }
});

// === Endpoint to receive logs from other services ===
app.post('/logs', authenticateInternal, (req: Request, res: Response) => {
   // Placeholder: Forward logs to a central logging system (Loki, Elasticsearch, etc.)
   const logs = req.body; // Assuming logs are sent in the request body
   console.log('Received Logs:', JSON.stringify(logs).substring(0, 200) + '...'); // Log truncated preview
   // TODO: Implement actual log forwarding logic here
   // Example: forwardToLoki(logs);
   // Simulate processing time
   setTimeout(() => {
       res.status(202).json({ message: 'Logs received for processing.' });
   }, 50);
});

// === Endpoint to receive traces (e.g., OpenTelemetry OTLP/HTTP) ===
// This requires setting up an OTLP/HTTP receiver library
app.post('/v1/traces', authenticateInternal, (req: Request, res: Response) => {
    // Placeholder: Process or forward traces
    const traceData = req.body;
    console.log('Received Traces:', JSON.stringify(traceData).substring(0, 200) + '...'); // Log truncated preview
    // TODO: Implement trace processing/forwarding (e.g., to Jaeger, Tempo)
    res.status(200).json({ message: 'Traces received.' });
});

// === Endpoint to receive metrics (e.g., OpenTelemetry OTLP/HTTP or custom metrics) ===
app.post('/v1/metrics', authenticateInternal, (req: Request, res: Response) => {
    // Placeholder: Process or forward metrics
    const metricsData = req.body;
     console.log('Received Metrics:', JSON.stringify(metricsData).substring(0, 200) + '...'); // Log truncated preview
     // Example: Update custom Prometheus metrics based on received data
     if (metricsData?.type === 'agent_call') {
         agentCallsCounter.labels(metricsData.agentName || 'unknown', metricsData.status || 'unknown').inc();
     }
      if (metricsData?.type === 'agent_latency' && metricsData.latencySeconds) {
          agentLatencyHistogram.labels(metricsData.agentName || 'unknown').observe(metricsData.latencySeconds);
      }

    // TODO: Implement forwarding to Prometheus Pushgateway, InfluxDB, etc. if needed
    res.status(200).json({ message: 'Metrics received.' });
});

// --- Error Handling ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Observability Service Error:", err.stack);
  res.status(500).json({ error: 'Internal Observability Service Error', message: err.message });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Observability service listening on http://localhost:${port}`);
  console.log(`Prometheus metrics available at http://localhost:${port}/metrics`);
  // Initialize connections or collectors if needed
});

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing Observability service');
  // Close connections gracefully
  register.clear(); // Clear metrics registry
  process.exit(0);
});
