# QuonxCoder (Formerly RetroIDE) 🚀

![QuonxCoder Screenshot Placeholder](https://picsum.photos/seed/quonxcoder/600/300?grayscale&blur=2)
*(Placeholder Image - A proper screenshot showcasing the retro UI and AI features will be added)*

**QuonxCoder** is an AI-native Integrated Development Environment with a nostalgic twist! It merges advanced AI capabilities like multi-agent systems, adaptive memory, and automated workflows with a pixel-art user interface reminiscent of Windows 3.1 and Mac System 7.

Built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, Node.js/Express microservices, Docker, and leveraging local LLMs via Ollama, Genkit, and LangChain.

## Core Features ✨

1.  **Project & UI Shell:**
    *   Style: Windows 3.1/Mac System 7 pixel‐art UI (using shadcn/ui theme).
    *   Layout: File Explorer (left), Code Editor (center), Terminal & Logs (bottom), AI Chat (right), Plugin Manager (floating). *(Implemented)*
    *   Menus: File, Edit, View, Plugins, AI, Tools, Help—classic beveled look with full functionality. *(Implemented)*
    *   Floating, Draggable, Minimizable Windows *(Implemented)*

2.  **AI Engine & Adaptive Memory:**
    *   *(Partially Implemented - Ollama integration placeholder)* Multi-model support: Gemini (via Genkit), Claude, GPT-4o, Llama via Ollama; *(Planned)* Fine-tuning on project repo.
    *   *(Planned)* **Adaptive Dual Memory:** Semantic long-term memory (Vector Store - ChromaDB/Qdrant placeholder) and short-term session cache (Redis). *(Placeholders added)*
    *   *(Planned)* **Recursive Summarization:** Hierarchical agents condensing edits/chats into memory nodes. *(Placeholder flow added)*
    *   *(Planned)* **Token-Based Highlights:** Tagging critical code artifacts for fast context recall. *(Conceptual comments added)*
    *   *(Planned)* **Feedback-Driven Adaptation:** Refining memory priorities based on compiler/runtime feedback (FALCON concept). *(Conceptual comments added)*
    *   *(Implemented)* Short-term session context tracking (basic in AI Chat).

3.  **Multi-Agent System & Reasoning:**
    *   *(Planned)* **Self-Reflective Error Recovery:** CodeCoR-style generate-test-evaluate-repair loop. *(Conceptual comments added)*
    *   *(Planned)* **Multi-Agent Orchestration:** Specialized agents (planning, coding, testing, deploy) with centralized coordination. *(Placeholder coordinator added)*
    *   *(Planned)* **Hybrid Tool-Calling:** Combining retrieval-augmented tool agents (Genkit/Langchain) with pure reasoning agents. *(Genkit tool example exists, conceptual comments added)*
    *   *(Planned)* Natural-language “Agent” to scaffold apps, add complex features. *(Placeholder window added)*
    *   *(Planned)* **Document/PDF RAG:** Ingest docs into Vector DB, answer queries, auto-populate knowledge. *(Placeholder components added)*

4.  **Developer Productivity Suite:**
    *   *(Planned)* **Automated Test Designer:** Zero-config unit/integration test generation via AI agent. *(Placeholder window/flow added)*
    *   *(Planned)* **Real-Time Profiling Dashboard:** Live performance metrics display. *(Placeholder tab/window added)*
    *   *(Planned)* **LLM-Driven Linting/Static Analysis:** Enforcing style/security rules via plugins. *(Conceptual comments added)*
    *   *(Planned)* **Natural Language Refactoring:** Via command palette/AI interaction. *(Placeholder window/flow added)*

5.  **Modular Plugin System:**
    *   *(Implemented)* Define plugin API (JSON schema) for custom tools (linters, formatters, generators). *(plugin.schema.json)*
    *   *(Planned)* Integrate an in-IDE Marketplace with search, install, and update flows. *(Placeholder window added)*
    *   *(Planned)* Support user-defined YAML workflows (build/test/deploy) with triggers. *(Placeholder window added)*

6.  **Real-Time Collaboration & DevOps:**
    *   *(Partially Implemented - Placeholders)* **CRDT-based Collaboration:** Shared cursors, live chat, presence indicators (Yjs over WebSockets). *(Backend service and client lib exist)*
    *   *(Planned)* Conflict resolution and offline sync for collaboration.
    *   *(Planned)* **IaC Generation/Application:** Auto-generate/apply Terraform for Firebase (or adapt for K8s). *(Existing Terraform structure, placeholder DevOps window)*
    *   *(Planned)* **One-click Dev Environment:** Docker/K8s setup with live reload. *(Placeholder `docker-compose.yml`, `k8s/`, DevOps window)*

7.  **Observability & Security:**
    *   *(Planned)* **AI Profiling Panel:** Frontend bundle & backend trace analysis. *(Placeholder tab/window added)*
    *   *(Planned)* **SAST & Dependency Scanning:** Built-in scanning with auto-PR fixes. *(Placeholder tab/window, conceptual comments added)*
    *   *(Planned)* **Telemetry Dashboard:** Errors, performance, AI usage metrics. *(Placeholder tab/window added)*
    *   *(Planned)* **Pre-commit Vulnerability Scans:** Against vectorized CVE database. *(Conceptual comments added)*
    *   *(Planned)* **Differential Code Analysis:** Comparing agent outputs to prevent regressions. *(Conceptual comments added)*

8.  **Language Environments & Workspace:**
    *   *(Planned)* Containerized shells for 50+ languages via Nix. *(Placeholder `nix/shell.nix`, Language Env window)*
    *   *(Planned)* Automatic dependency caching and versioning with Nix.
    *   *(Planned)* **Monaco Editor:** With AI-driven inline suggestions. *(Current editor basic, Monaco integration pending)*
    *   *(Implemented)* Integrated terminal panel (placeholder).
    *   *(Planned)* Resource monitoring dashboards (part of Telemetry).

9.  **Hosting & Preview:**
    *   *(Planned)* Live web preview pane.
    *   *(Planned)* One-click HTTPS deployment, custom domains, “Always On” services via K8s/Docker integration. *(Placeholder DevOps window)*

10. **Secrets & Environment:**
    *   *(Partially Implemented - Placeholders)* AES-256 encrypted vault, TLS-secured. *(Backend service and client lib exist)*
    *   *(Implemented)* Per-project and per-account environment variables management via UI. *(Placeholder windows added)*

11. **Version Control:**
    *   *(Partially Implemented - Placeholders)* Git CLI/GUI: clone, commit, branch, merge, revert integration. *(Placeholder Git window)*
    *   *(Planned)* “Import from GitHub” wizard with OAuth integration. *(Placeholder Git window)*

12. **Debugging & Testing:**
    *   *(Planned)* Breakpoint debugger integration across major runtimes. *(Placeholder Debugger window)*
    *   *(Planned)* Zero-config unit/integration test generation (AI assisted). *(Placeholder Generate Tests window)*

13. **Custom Workflows & API:**
    *   *(Planned)* User-configurable run commands, pre/post hooks via YAML workflows.
    *   *(Planned)* CLI tool (“**qcdev**”) and REST/WebSocket APIs for automation. *(Conceptual)*

14. **Ecosystem & Extensions:**
    *   *(Planned)* Starter templates and community marketplace. *(Placeholder Marketplace window)*
    *   *(Implemented)* Plugin architecture for custom tools. *(plugin.schema.json)*
    *   *(Planned)* QDK (QuonxCoder Development Kit) for custom agents, memory, UI plugins. *(Conceptual)*

## System Architecture Diagram (Conceptual)

```mermaid
graph TD
    subgraph "User Interface (Browser)"
        UI[Next.js Frontend - QuonxCoder UI]
        Monaco(Monaco Editor - Planned)
        YjsClient(Yjs Client Lib)
    end

    subgraph "Backend Services (Docker/Kubernetes)"
        APIGateway(API Gateway - Optional)
        CollaborationService(Collaboration Service - Node/Express + Yjs)
        SecretsService(Secrets Service - Node/Express + AES)
        AIService(AI Service - Node/Express)
        AgentCoordinator(Agent Coordinator - Node/Express)
        LanguageEnvService(Language Env Service - Nix Containers)
        GitService(Git Service - Node/Express)
        DeploymentService(Deployment Service - Node/Express)
        ObservabilityService(Observability Service - Node/Express)

        APIGateway ---|REST/WS| CollaborationService
        APIGateway ---|REST| SecretsService
        APIGateway ---|REST| AIService
        APIGateway ---|REST| AgentCoordinator
        APIGateway ---|REST| LanguageEnvService
        APIGateway ---|REST| GitService
        APIGateway ---|REST| DeploymentService
        APIGateway ---|REST| ObservabilityService

        CollaborationService -- Persists/Syncs --> RedisCollab[(Redis - Yjs State)]
        SecretsService -- Stores Encrypted Data --> VaultDB[(Database - Vault)]

        AIService -- Interacts --> LLM_Ollama[Ollama LLMs (Llama3, etc.)]
        AIService -- Interacts --> LLM_Genkit[Genkit (Gemini, etc. - Optional)]
        AIService -- Manages --> ShortTermMemory[(Redis - Session Cache)]
        AIService -- Manages --> LongTermMemory[(Vector Database - Chroma/Qdrant)]

        AgentCoordinator -- Routes Tasks --> PlanningAgent(Planning Agent)
        AgentCoordinator -- Routes Tasks --> CodeGenAgent(Code Gen Agent)
        AgentCoordinator -- Routes Tasks --> TestAgent(Test Agent)
        AgentCoordinator -- Routes Tasks --> DeployAgent(Deploy Agent)
        AgentCoordinator -- Routes Tasks --> SummarizationAgent(Summarization Agent)
        AgentCoordinator -- Routes Tasks --> RAGAgent(RAG Agent)

        PlanningAgent -- Uses --> AIService
        CodeGenAgent -- Uses --> AIService
        TestAgent -- Uses --> AIService
        DeployAgent -- Uses --> DeploymentService & AIService
        SummarizationAgent -- Uses --> AIService
        RAGAgent -- Uses --> AIService

        LanguageEnvService -- Manages --> NixContainers[Nix Containers]
        DeploymentService -- Manages --> K8s[Kubernetes Cluster]
        GitService -- Interacts --> GitRepos[Git Repositories]
        ObservabilityService -- Collects Data --> MonitoringDB[(Monitoring DB - Prometheus/Loki/etc.)]
    end

    subgraph "External Systems"
        GitHub(GitHub - OAuth/Repos)
        DockerHub(Docker Hub - Images)
        DNSProvider(DNS Provider)
        PublicLLMs(Optional Public LLMs - Claude, GPT-4o)
    end

    UI -- REST/WS --> APIGateway
    YjsClient -- WebSocket --> CollaborationService
    APIGateway -- Events/Data --> RedisSession[(Redis - Sessions)]
    DeploymentService -- Interacts --> DockerHub
    DeploymentService -- Interacts --> DNSProvider
    GitService -- Clones/Pushes --> GitHub
    AIService -- Optionally Calls --> PublicLLMs

    style Monaco fill:#f9f,stroke:#333,stroke-width:2px,color:#000
    style NixContainers fill:#add,stroke:#333,stroke-width:2px,color:#000
    style K8s fill:#adf,stroke:#333,stroke-width:2px,color:#000
    style LongTermMemory fill:#ffa,stroke:#333,stroke-width:2px,color:#000
    style LLM_Ollama fill:#faa,stroke:#333,stroke-width:2px,color:#000
    style AgentCoordinator fill:#ccf,stroke:#333,stroke-width:2px,color:#000
```

## Style Guide 🎨

*   **Color Palette:** Muted, desaturated colors common in early 90s UIs.
    *   Primary Accent: Teal (`#008080`).
    *   Background: Light Gray (`hsl(210 0% 92%)`).
    *   Borders: Light (`hsl(0 0% 100%)`) and Dark (`hsl(0 0% 40%)`) for 3D bevel effects.
*   **Fonts:** `Pixelify Sans` (or similar pixelated font) for UI elements. Monospaced font for the code editor.
*   **Icons:** Simple, blocky, pixel-art style icons (using `lucide-react` where appropriate, potentially custom SVGs).
*   **Windows & Dialogs:** Fixed-size (initially), draggable windows with classic title bars and controls. Sharp corners (`radius: 0rem`). Minimizable to status bar.
*   **Animations:** Basic, subtle animations for window interactions (mimicking limitations of older systems).

## Deliverables Checklist & Status 📦

*   [X] Scaffolded Project: Next.js 15+ (App Router), TypeScript, Tailwind CSS, shadcn/ui.
*   [X] Firebase Integration: `.firebaserc`, `firebase.json` configured (Note: May shift focus with microservices/K8s).
*   [X] Infrastructure as Code: Basic Terraform configs, Placeholder `docker-compose.yml`, Placeholder `k8s/` manifests.
*   [X] CI/CD: Placeholder GitHub Actions workflow (`.github/workflows/ci.yml`).
*   [X] Plugin System:
    *   [X] Placeholder `plugins/plugin.schema.json` added.
    *   [X] Floating Plugin Manager window implemented (UI only).
    *   [X] Placeholder Marketplace & Workflow windows added (UI only).
    *   [ ] Plugin API documentation (JSON schema).
    *   [ ] Sample plugins demonstrating API usage.
    *   [ ] Example YAML workflow files.
*   [X] AI Integration:
    *   [X] Genkit setup for multi-model AI interaction (Gemini example).
    *   [X] Placeholder Ollama/Langchain integration (`src/ai/agents/`).
    *   [X] Placeholder windows/UI for Generate Code, Refactor, Tests, Docs, Fix Bug, Scaffold Agent, Query/Ingest/Manage Knowledge, Ollama Config, Fine-tuning.
    *   [ ] **Adaptive Memory Implementation:** *(Vector store setup, Cache logic)*
    *   [ ] **Recursive Summarization Agent:** *(Agent logic)*
    *   [ ] **Token-Based Highlights:** *(Editor integration)*
    *   [ ] **Feedback-Driven Adaptation:** *(Integration with compiler/runtime)*
    *   [ ] **Self-Reflective Error Recovery:** *(Agent loop logic)*
    *   [ ] **Multi-Agent Orchestration:** *(Coordinator service implementation)*
    *   [ ] Prompt templates for codegen, testing, documentation, and security scanning.
*   [X] Documentation: This README.
    *   [X] Setup and usage instructions (basic).
    *   [X] Retro style guide overview.
    *   [X] System Diagram.
    *   [ ] Voice/gesture command mappings.
    *   [ ] Extension marketplace guide.
    *   [ ] QDK Guide.
*   [X] Collaboration Backend Placeholder (`services/collaboration-service`) & Client Lib (`src/lib/collaboration.ts`).
*   [X] Secrets Service Placeholder (`services/secrets-service`) & Client Lib (`src/lib/secrets.ts`).
*   [X] Nix Configuration Placeholder (`nix/shell.nix`).
*   [X] Observability/Security Placeholders: Profiling, Security, Telemetry tabs/windows (UI only).
*   [X] Version Control Placeholder: Git window (UI only).
*   [X] Debugging Placeholder: Debugger window (UI only).

## Getting Started 🛠️

1.  **Prerequisites:** Node.js, npm/yarn/pnpm, Docker, Docker Compose, **Ollama**, Firebase CLI (optional), Terraform (optional), Nix (optional).
2.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd quonxcoder
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install or pnpm install
    ```
4.  **Environment Variables:**
    *   Create a `.env` file based on `.env.example` (if provided).
    *   Add `GOOGLE_GENAI_API_KEY` (Optional, for Genkit AI features).
    *   **Required:** `OLLAMA_BASE_URL` (e.g., `http://localhost:11434`). Ensure Ollama server is running.
    *   Configure Firebase project details if needed.
    *   Configure Redis connection details (`REDIS_URL`).
    *   Configure Secret Key for Vault (`SECRET_VAULT_KEY`).
    *   Configure Vector DB connection (e.g., `VECTOR_DB_URL`).
5.  **Run Development Environment (using Docker Compose):**
    ```bash
    docker-compose up --build -d
    ```
    This will start:
    *   Next.js Frontend (port 9002)
    *   Collaboration Service (port 3001 - placeholder)
    *   Secrets Service (port 3002 - placeholder)
    *   Redis (port 6379)
    *   (Potentially) Vector Database Service
    *   (Potentially) Other backend microservices (AI Service, Agent Coordinator, etc.)
    *   *Note: Assumes Ollama is running separately on the host or configured in docker-compose.yml.*

6.  **(Optional) Run Individual Components:**
    *   Frontend Only: `npm run dev`
    *   Genkit Dev Server: `npm run genkit:dev`
7.  Open [http://localhost:9002](http://localhost:9002) (or your configured port) in your browser.

## Usage Guide 🖱️

*   **Code Editor:** Basic text editing. *(Future: Monaco integration)*
*   **AI Chat:** Interact with the AI assistant (configure model via dropdown - Ollama requires running server). Ask for code generation, explanation, etc.
*   **Terminal/Logs:** Basic views (non-interactive terminal). Profiling/Security/Dashboard tabs are placeholders.
*   **Floating Windows:** Access various features (Plugins, Git, DevOps, AI actions, Settings, etc.) via the Menubar. Windows can be dragged, closed (X button), or minimized (Minus button) to the status bar. Click minimized tabs to restore.
*   **Collaboration:** *(Planned)* Use the collaboration panel to share sessions.
*   **DevOps Tools:** *(Planned)* Access Terraform/Docker/K8s actions via the "Tools" menu -> DevOps window.

## Contributing 🤝

Contributions are welcome! Please follow standard Gitflow practices and open a Pull Request.

*(Add more specific contribution guidelines if needed)*

## License 📄

*(Specify your chosen license, e.g., MIT License)*

---

Enjoy the retro-futuristic coding experience!

---

## Self-Audit Checklist (Post-Enhancements)

*   [ ] **Adaptive Dual Memory:** Placeholders for Vector Store config/service, Redis cache integration in AI service.
*   [ ] **Recursive Summarization:** Placeholder agent/flow structure added.
*   [ ] **Token-Based Highlights:** Conceptual comments added, requires editor integration.
*   [ ] **Feedback-Driven Memory:** Conceptual comments added, requires deeper integration.
*   [ ] **Self-Reflective Error Recovery:** Conceptual comments added, requires agent implementation.
*   [ ] **Multi-Agent Orchestration:** Placeholder Agent Coordinator service/structure added.
*   [ ] **Hybrid Tool-Calling:** Conceptual comments added, requires agent implementation.
*   [ ] **Dev Productivity Suite:** Placeholder windows/UI/flows for Test Designer, Profiling, Refactoring. LLM Linting conceptual.
*   [ ] **Quality/Security/Performance:** Conceptual comments added for CVE scans, diff analysis, benchmarking. SAST/DepScan placeholder UI exists.
*   [ ] **Scalability/Optimizations:** Conceptual comments added (GPU, task decomposition, context windowing).
*   [ ] **Ecosystem/Extensibility:** Conceptual notes on QDK, marketplace, repo import, APIs. Plugin architecture exists.
*   [X] **README Updates:** Features, architecture, setup instructions updated to reflect new goals. CLI renamed to `qcdev`.
*   [X] **File Scaffold:** Placeholder files/folders for new services/agents added where applicable (e.g., `agent-coordinator`, `vector-db-service`).
*   [X] **UI Placeholders:** Windows/tabs/buttons added for new features accessible via the Menubar.
```