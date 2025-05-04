# QuonxCoder (Formerly RetroIDE) 🚀

![QuonxCoder Screenshot Placeholder](https://picsum.photos/seed/quonxcoder/600/300?grayscale&blur=2)
*(Placeholder Image - A proper screenshot showcasing the retro UI and AI features will be added)*

**QuonxCoder** is an AI-native Integrated Development Environment with a nostalgic twist! It merges advanced AI capabilities like multi-agent systems, adaptive memory, and automated workflows with a pixel-art user interface reminiscent of Windows 3.1 and Mac System 7.

Built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, Node.js/Express microservices, Docker, and leveraging local LLMs via Ollama, LangChain, and potentially Genkit tools.

## Core Features ✨

1.  **Project & UI Shell:**
    *   Style: Windows 3.1/Mac System 7 pixel‐art UI (using shadcn/ui theme). *(Implemented)*
    *   Layout: File Explorer (left), Code Editor (center), Terminal & Logs (bottom), AI Chat (right), Plugin Manager (floating). *(Implemented)*
    *   Menus: File, Edit, View, Plugins, AI, Tools, Help—classic beveled look with full functionality. *(Implemented)*
    *   Floating, Draggable, Minimizable Windows *(Implemented)*

2.  **AI Engine & Adaptive Memory:**
    *   *(Implemented)* Multi-model support via Ollama through backend AI service. *(Genkit/Claude/GPT-4o integration requires external API setup)*; *(Planned)* Fine-tuning on project repo.
    *   *(Partially Implemented)* **Adaptive Dual Memory:** Semantic long-term memory (Vector Store via AI Service - Qdrant/Chroma) and short-term session cache (Redis via AI Service). *(Arbitration logic basic)*
    *   *(Partially Implemented)* **Recursive Summarization:** Summarization agent callable via Agent Coordinator. *(Automatic roll-ups/hierarchical logic pending)*
    *   *(Conceptual)* **Token-Based Highlights:** Tagging critical code artifacts for fast context recall. *(Requires editor integration)*
    *   *(Conceptual)* **Feedback-Driven Adaptation:** Refining memory priorities based on compiler/runtime feedback (FALCON concept). *(Requires deeper integration)*
    *   *(Implemented)* Short-term session context tracking (basic in AI Chat).

3.  **Multi-Agent System & Reasoning:**
    *   *(Conceptual)* **Self-Reflective Error Recovery:** CodeCoR-style generate-test-evaluate-repair loop. *(Requires agent implementation & testing framework)*
    *   *(Implemented)* **Multi-Agent Orchestration:** Agent Coordinator service routes tasks to AI Service/Agents (CodeGen, RAG, Summarize, etc.). *(Planning, Deploy agents conceptual)*
    *   *(Implemented)* **Hybrid Tool-Calling:** Genkit tools defined for backend interaction (Files, Git). *(Requires LLM capable of using tools)* Pure reasoning via AI service.
    *   *(Implemented)* Natural-language “Agent” to scaffold apps, add complex features via AI Chat or dedicated window (`scaffoldAgent`).
    *   *(Implemented)* **Document/PDF RAG:** Ingest docs into Vector DB, answer queries via AI Service (`ragAgent`, `ingestAgent`). *(PDF processing needs library)*

4.  **Developer Productivity Suite:**
    *   *(Implemented)* **Automated Test Designer:** Basic test generation via AI agent (`testGenAgent`). *(Zero-config needs framework integration)*
    *   *(Placeholder)* **Real-Time Profiling Dashboard:** UI exists, data fetching needs implementation via Observability Service.
    *   *(Conceptual)* **LLM-Driven Linting/Static Analysis:** Enforcing style/security rules via plugins. *(Requires plugin implementation)*
    *   *(Implemented)* Natural Language Refactoring: Via command palette/AI interaction (`refactorAgent`).

5.  **Modular Plugin System:**
    *   *(Implemented)* Define plugin API (JSON schema) for custom tools (linters, formatters, generators). *(plugin.schema.json)*
    *   *(Partially Implemented)* In-IDE Marketplace UI with search. *(Install/Update logic needs backend)*
    *   *(Partially Implemented)* Workflow management UI. *(YAML parsing/execution needs backend)*

6.  **Real-Time Collaboration & DevOps:**
    *   *(Partially Implemented)* **CRDT-based Collaboration:** Shared cursors, live chat, presence indicators (Yjs over WebSockets via Collaboration Service). *(Conflict resolution/offline sync advanced features)*
    *   *(Partially Implemented)* **IaC Generation/Application:** Auto-generate Terraform via agent (`iacGenAgent`), apply button placeholder. *(Requires Terraform execution backend)*
    *   *(Partially Implemented)* Docker/K8s dev environment via `docker-compose.yml`. *(One-click start/stop needs UI integration)* Live reload typical with Next.js dev server.

7.  **Observability & Security:**
    *   *(Placeholder)* **AI Profiling Panel:** UI exists, requires data feed from Observability Service.
    *   *(Partially Implemented)* **SAST & Dependency Scanning:** Basic SAST via agent (`sastAgent`). *(Dependency scanning and auto-PR fix need implementation)*
    *   *(Placeholder)* **Telemetry Dashboard:** UI exists, requires data feed from Observability Service.
    *   *(Conceptual)* **Pre-commit Vulnerability Scans:** Against vectorized CVE database. *(Requires Git hook integration & CVE DB)*
    *   *(Conceptual)* **Differential Code Analysis:** Comparing agent outputs to prevent regressions. *(Requires agent output tracking)*

8.  **Language Environments & Workspace:**
    *   *(Conceptual)* Containerized shells for 50+ languages via Nix. *(Requires Language Env Service implementation with Nix integration)*
    *   *(Conceptual)* Automatic dependency caching and versioning with Nix.
    *   *(Partially Implemented)* **Monaco Editor:** Integrated via `react-monaco-editor`. *(AI inline suggestions need plugin/LSP)*
    *   *(Partially Implemented)* Integrated terminal panel (basic xterm.js placeholder). *(Needs backend PTY connection)*
    *   *(Placeholder)* Resource monitoring dashboards (part of Telemetry).

9.  **Hosting & Preview:**
    *   *(Planned)* Live web preview pane.
    *   *(Planned)* One-click HTTPS deployment, custom domains, “Always On” services via K8s/Docker integration. *(Requires Deployment Service)*

10. **Secrets & Environment:**
    *   *(Implemented)* AES-256 encrypted vault via Secrets Service (in-memory placeholder). *(TLS needs ingress/proxy setup)*
    *   *(Implemented)* Per-project and per-account environment variables management via UI (placeholder backend).

11. **Version Control:**
    *   *(Implemented)* Git CLI/GUI: Status, commit, push, pull integration via Git Service (placeholder backend). *(Branch, merge, revert need implementation)*
    *   *(Planned)* “Import from GitHub” wizard with OAuth integration.

12. **Debugging & Testing:**
    *   *(Placeholder)* Breakpoint debugger integration across major runtimes. *(Requires Debug Adapter Protocol backend)*
    *   *(Implemented)* Zero-config unit/integration test generation via AI agent (`testGenAgent`). *(Requires testing framework integration)*

13. **Custom Workflows & API:**
    *   *(Partially Implemented)* User-configurable run commands (via Command Palette placeholder). *(Pre/post hooks via YAML workflows need backend)*
    *   *(Conceptual)* CLI tool (“**qcdev**”) and REST/WebSocket APIs for automation.

14. **Ecosystem & Extensions:**
    *   *(Placeholder)* Starter templates and community marketplace UI. *(Backend needed)*
    *   *(Implemented)* Plugin architecture definition (`plugin.schema.json`).
    *   *(Conceptual)* QDK (QuonxCoder Development Kit) for custom agents, memory, UI plugins.

## System Architecture Diagram (Conceptual)

```mermaid
graph TD
    subgraph "User Interface (Browser)"
        UI[Next.js Frontend - QuonxCoder UI]
        MonacoEditor(Monaco Editor)
        YjsClient(Yjs Client Lib)
    end

    subgraph "Backend Services (Docker/Kubernetes)"
        APIGateway(API Gateway - Optional)
        CollaborationService(Collaboration Service - Node/Express + Yjs)
        SecretsService(Secrets Service - Node/Express + AES)
        AIService(AI Service - Node/Express + LangChain)
        AgentCoordinator(Agent Coordinator - Node/Express)
        LanguageEnvService(Language Env Service - Nix Containers - Planned)
        GitService(Git Service - Node/Express - Placeholder)
        DeploymentService(Deployment Service - Node/Express - Planned)
        ObservabilityService(Observability Service - Node/Express - Placeholder)
        WorkflowService(Workflow Service - Node/Express - Planned)
        PluginRegistry(Plugin Registry - Planned)
        DebuggerService(Debugger Service - DAP - Planned)

        APIGateway ---|REST/WS| CollaborationService
        APIGateway ---|REST| SecretsService
        APIGateway ---|REST| AIService
        APIGateway ---|REST| AgentCoordinator
        APIGateway ---|REST| LanguageEnvService
        APIGateway ---|REST| GitService
        APIGateway ---|REST| DeploymentService
        APIGateway ---|REST| ObservabilityService
        APIGateway ---|REST| WorkflowService
        APIGateway ---|REST| PluginRegistry
        APIGateway ---|WS| DebuggerService


        CollaborationService -- Persists/Syncs --> RedisCollab[(Redis - Yjs State)]
        SecretsService -- Stores Encrypted Data --> SecretsDB[(Database/Vault - In-Memory)]

        AIService -- Interacts --> LLM_Ollama[Ollama LLMs (Llama3, etc.)]
        AIService -- Interacts --> GenkitTools(Genkit Tools - Optional)
        AIService -- Manages --> ShortTermMemory[(Redis - Session Cache)]
        AIService -- Manages --> LongTermMemory[(Vector Database - Qdrant)]

        AgentCoordinator -- Routes Tasks --> AIService
        AgentCoordinator -- Routes Tasks --> GitService
        AgentCoordinator -- Routes Tasks --> DeploymentService
        AgentCoordinator -- Routes Tasks --> WorkflowService
        AgentCoordinator -- Routes Tasks --> LanguageEnvService

        LanguageEnvService -- Manages --> NixContainers[Nix Containers]
        DeploymentService -- Manages --> K8s[Kubernetes Cluster]
        GitService -- Interacts --> GitRepos[Git Repositories]
        ObservabilityService -- Collects Data --> MonitoringDB[(Monitoring DB - Prometheus/Loki/etc.)]
        WorkflowService -- Executes --> Defined Workflows
        PluginRegistry -- Manages --> Plugin Data
        DebuggerService -- Connects --> Application Runtimes
    end

    subgraph "External Systems"
        GitHub(GitHub - OAuth/Repos)
        DockerHub(Docker Hub - Images)
        DNSProvider(DNS Provider)
        PublicLLMs(Optional Public LLMs - Gemini, Claude, GPT-4o)
    end

    UI -- REST/WS --> APIGateway
    YjsClient -- WebSocket --> CollaborationService
    APIGateway -- Events/Data --> RedisSession[(Redis - Sessions)]
    DeploymentService -- Interacts --> DockerHub
    DeploymentService -- Interacts --> DNSProvider
    GitService -- Clones/Pushes --> GitHub
    AIService -- Optionally Calls --> PublicLLMs

    style MonacoEditor fill:#f9f,stroke:#333,stroke-width:2px,color:#000
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
*   **Fonts:** `Pixelify Sans` for UI elements. Monospaced font (`var(--font-mono)`) for the code editor.
*   **Icons:** Simple, blocky, pixel-art style icons (using `lucide-react`).
*   **Windows & Dialogs:** Draggable windows with classic title bars and controls. Sharp corners (`radius: 0rem`). Minimizable to status bar.
*   **Animations:** Basic, subtle animations for window interactions.

## Deliverables Checklist & Status 📦

*   [X] Scaffolded Project: Next.js 15+ (App Router), TypeScript, Tailwind CSS, shadcn/ui.
*   [X] Firebase Integration: `.firebaserc`, `firebase.json` configured (Note: May shift focus with microservices/K8s).
*   [X] Infrastructure as Code: Basic Terraform configs, Placeholder `docker-compose.yml`, Placeholder `k8s/` manifests.
*   [X] CI/CD: Placeholder GitHub Actions workflow (`.github/workflows/ci.yml`).
*   [X] Plugin System:
    *   [X] Plugin API schema (`plugins/plugin.schema.json`).
    *   [X] Floating Plugin Manager window implemented.
    *   [X] Placeholder Marketplace & Workflow windows added.
    *   [ ] Plugin API documentation.
    *   [ ] Sample plugins demonstrating API usage.
    *   [ ] Example YAML workflow files.
*   [X] AI Integration:
    *   [X] Genkit tools defined for backend interaction (Git, Files).
    *   [X] Ollama/Langchain integration via AI Service & Agent Coordinator.
    *   [X] AI interaction windows/UI implemented (Generate Code, Refactor, Tests, Docs, Fix Bug, Scaffold Agent, Query/Ingest Knowledge, Ollama Config).
    *   [X] **Adaptive Memory Implementation:** Vector store (Qdrant) & Redis cache via AI Service.
    *   [X] **Recursive Summarization Agent:** Callable via Coordinator. Hierarchical/automatic logic pending.
    *   [ ] **Token-Based Highlights:** *(Requires editor integration)*
    *   [ ] **Feedback-Driven Memory:** *(Requires deeper integration)*
    *   [ ] **Self-Reflective Error Recovery:** *(Requires testing framework & agent refinement)*
    *   [X] **Multi-Agent Orchestration:** Agent Coordinator service implemented, routes tasks.
    *   [X] Prompt templates implicitly used in agent implementations.
    *   [ ] *(Planned)* Fine-tuning UI/backend.
*   [X] Documentation: This README.
    *   [X] Setup and usage instructions (basic).
    *   [X] Retro style guide overview.
    *   [X] System Diagram.
    *   [ ] Voice/gesture command mappings.
    *   [ ] Extension marketplace guide.
    *   [ ] QDK Guide.
*   [X] Collaboration Backend (`services/collaboration-service`) & Client Lib (`src/lib/collaboration.ts`).
*   [X] Secrets Service (`services/secrets-service` - in-memory) & Client Lib (`src/lib/secrets.ts`).
*   [ ] Nix Configuration Placeholder (`nix/shell.nix`) - *(Needs Language Env Service)*.
*   [X] Observability/Security Placeholders: Profiling, Security, Telemetry tabs/windows (UI only).
*   [X] Version Control Placeholder: Git window (UI with basic actions).
*   [X] Debugging Placeholder: Debugger window (UI only).
*   [X] Monaco Editor Integration (`react-monaco-editor`).

## Getting Started 🛠️

1.  **Prerequisites:** Node.js (v20+), npm/yarn/pnpm, Docker, Docker Compose, **Ollama (Running Separately)**, Qdrant (optional, included in docker-compose).
    *   *Optional:* Firebase CLI, Terraform, Nix.
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
    *   Create a `.env` file in the project root.
    *   **Required:** `OLLAMA_BASE_URL=http://localhost:11434` (Adjust if Ollama runs elsewhere).
    *   **Required:** `SECRET_VAULT_KEY=your-strong-random-secret-key-at-least-16-chars` (Generate a secure key).
    *   *Optional:* `GOOGLE_GENAI_API_KEY` (For Genkit features if used).
    *   *Optional:* Configure Firebase project details (`FIREBASE_PROJECT_ID`, etc.).
    *   *Optional:* Configure Redis connection (`REDIS_URL=redis://localhost:6379`).
    *   *Optional:* Configure Vector DB (`VECTOR_DB_URL=http://localhost:6333`).
    *   *Optional:* `INTERNAL_SERVICE_API_KEY=supersecret` (For inter-service communication, change this).
5.  **Run Development Environment (using Docker Compose):**
    ```bash
    # Ensure Ollama is running separately first!
    docker compose up --build -d
    ```
    This will start:
    *   Next.js Frontend (port 9002)
    *   Collaboration Service (port 3001)
    *   Secrets Service (port 3002)
    *   AI Service (port 3003)
    *   Agent Coordinator (port 3004)
    *   Observability Service (port 3005 - Placeholder)
    *   Redis (port 6379)
    *   Qdrant Vector Database (port 6333)
    *   *(Planned Services: Git, Language Env, Deploy, Workflow, Plugin, Debugger)*
6.  Open [http://localhost:9002](http://localhost:9002) in your browser.

## Usage Guide 🖱️

*   **Code Editor:** Edit files using the integrated Monaco editor. Select files from the File Explorer.
*   **AI Chat:** Interact with the AI assistant (powered by Ollama via backend services). Use keywords like `generate code:`, `explain:`, `refactor:`, `test:`, `docs:`, `fix:`, `query knowledge:` to trigger specific agents.
*   **Terminal/Logs:** Basic terminal view (xterm placeholder) and application log stream. Profiling/Security/Dashboard tabs are placeholders.
*   **Floating Windows:** Access various features (Plugins, Git, DevOps, AI actions, Settings, etc.) via the Menubar. Windows can be dragged, closed (X button), or minimized (Minus button) to the status bar. Click minimized tabs to restore.
*   **Collaboration:** Share the session link (via button) for real-time editing and chat. Online users appear as avatars.
*   **Secrets/Env Vars:** Manage sensitive keys and environment variables via the Edit menu windows.
*   **Git:** View status, commit changes via the Git Control window (Git menu). Push/Pull actions available.

## Contributing 🤝

Contributions are welcome! Please follow standard Gitflow practices and open a Pull Request.

*(Add more specific contribution guidelines if needed)*

## License 📄

*(Specify your chosen license, e.g., MIT License)*

---

Enjoy the retro-futuristic coding experience!

---

## Self-Audit Checklist (Post-Enhancements)

*   [X] **Adaptive Dual Memory:** Vector Store (Qdrant) via AI service, Redis cache via AI service. Arbitration basic (RAG queries vector store).
*   [X] **Recursive Summarization:** Summarization agent callable via Coordinator. Hierarchical/automatic logic pending.
*   [ ] **Token-Based Highlights:** Conceptual comments added, requires editor integration.
*   [ ] **Feedback-Driven Memory:** Conceptual comments added, requires deeper integration.
*   [ ] **Self-Reflective Error Recovery:** Conceptual comments added, requires agent implementation & testing integration.
*   [X] **Multi-Agent Orchestration:** Agent Coordinator service implemented, routes tasks.
*   [X] Prompt templates implicitly used in agent implementations.
*   [ ] *(Planned)* Fine-tuning UI/backend.
*   [X] **Dev Productivity Suite:** Test Designer (`testGenAgent`), Refactoring (`refactorAgent`). Profiling/Linting placeholders.
*   [X] **Quality/Security/Performance:** Basic SAST agent (`sastAgent`). CVE scan, diff analysis, benchmarking conceptual/placeholders.
*   [ ] **Scalability/Optimizations:** Conceptual (GPU, task decomp, context windowing). Needs infra/arch changes.
*   [X] **Ecosystem/Extensibility:** Plugin schema exists. Marketplace UI placeholder. QDK/Import/APIs conceptual.
*   [X] **README Updates:** Features, architecture, setup instructions updated.
*   [X] **File Scaffold:** Services created (AI, Coordinator, Secrets, Collab, Observability). Placeholders for others.
*   [X] **UI Implementation:** Windows/tabs/buttons added for implemented features accessible via the Menubar.
