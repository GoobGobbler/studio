# RetroIDE 🚀

![RetroIDE Screenshot Placeholder](https://picsum.photos/seed/retroide/600/300?grayscale&blur=2)
*(Placeholder Image - A proper screenshot showcasing the retro UI will be added)*

**RetroIDE** is an AI-powered Integrated Development Environment with a nostalgic twist! It combines the power of modern AI code assistance, collaboration, and DevOps tooling with a pixel-art user interface reminiscent of Windows 3.1 and Mac System 7.

Built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, Node.js/Express microservices, Docker, and integrating advanced AI/Collaboration features.

## Core Features ✨

1.  **Project & UI Shell:**
    *   Style: Windows 3.1/Mac System 7 pixel‐art UI (using shadcn/ui theme).
    *   Layout: File Explorer (left), Code Editor (center), Terminal & Logs (bottom), AI Chat (right), Plugin Manager (floating). *(Partially Implemented - Layout exists, Monaco editor pending)*
    *   Menus: File, Edit, View, Plugins, AI, Tools, Help—classic beveled look. *(Implemented)*

2.  **Modular Plugin System:**
    *   *(Planned)* Define plugin API (JSON schema) for custom tools (linters, formatters, generators). *(Placeholder `plugins/plugin.schema.json` added)*
    *   *(Planned)* Integrate an in-IDE Marketplace with search, install, and update flows.
    *   *(Planned)* Support user-defined YAML workflows (build/test/deploy) with triggers.

3.  **Real-Time Collaboration & DevOps:**
    *   *(Planned)* CRDT-based shared cursors, live chat, presence indicators (Yjs over WebSockets). *(Placeholder backend service `services/collaboration-service` and client lib `src/lib/collaboration.ts` added)*
    *   *(Planned)* Conflict resolution and offline sync for collaboration.
    *   *(Planned)* IaC: Auto-generate and apply Terraform modules for Firebase resources (or adapt for K8s). *(Existing Terraform structure kept)*
    *   *(Planned)* One-click Docker/K8s dev environment with live reload. *(Placeholder `docker-compose.yml` and `k8s/` manifests added)*

4.  **Language Environments & Workspace:**
    *   *(Planned)* Containerized shells for 50+ languages via Nix. *(Placeholder `nix/shell.nix` added)*
    *   *(Planned)* Automatic dependency caching and versioning with Nix.
    *   *(Planned)* Monaco editor with AI-driven inline suggestions. *(Current editor is basic `Textarea`, comment added for Monaco replacement)*
    *   *(Implemented)* Integrated terminal panel (placeholder).
    *   *(Planned)* Resource monitoring dashboards.

5.  **Hosting & Preview:**
    *   *(Planned)* Live web preview pane.
    *   *(Planned)* One-click HTTPS deployment, custom domains, “Always On” services via K8s/Docker integration.

6.  **Secrets & Environment:**
    *   *(Planned)* AES-256 encrypted vault, TLS-secured. *(Placeholder backend service `services/secrets-service` and client lib `src/lib/secrets.ts` added)*
    *   *(Planned)* Per-project and per-account environment variables.

7.  **Version Control:**
    *   *(Planned)* Git CLI/GUI: clone, commit, branch, merge, revert integration.
    *   *(Planned)* “Import from GitHub” wizard with OAuth integration.

8.  **Debugging & Testing:**
    *   *(Planned)* Breakpoint debugger integration across major runtimes.
    *   *(Planned)* Zero-config unit/integration test generation (AI assisted).

9.  **AI-Powered Assistance:**
    *   Multi-model support: Gemini (via Genkit), Claude, GPT-4o, Llama via Ollama *(Ollama/Langchain placeholder added in `src/ai/agents/`)*.
    *   *(Planned)* Natural-language “Agent” to scaffold apps, add complex features.
    *   *(Planned)* Document/PDF RAG: ingest docs, answer queries, auto-populate knowledge *(Requires Vector DB + Langchain pipeline implementation)*.
    *   *(Implemented)* Short-term session context tracking (basic in AI Chat).
    *   *(Planned)* Long-term memory: Vector embeddings (Firestore/Redis/VectorDB).
    *   *(Planned)* Voice & gesture commands mapped to AI actions.

10. **Custom Workflows & API:**
    *   *(Planned)* User-configurable run commands, pre/post hooks.
    *   *(Planned)* CLI tool (“retrodev”) and REST/WebSocket APIs for automation.

11. **Ecosystem & Extensions:**
    *   *(Planned)* Starter templates and community marketplace.
    *   *(Planned)* Plugin architecture for custom language servers and external APIs.

## System Architecture Diagram (Conceptual)

```mermaid
graph TD
    subgraph "User Interface (Browser)"
        UI[Next.js Frontend - RetroIDE]
        Monaco(Monaco Editor - Planned)
        YjsClient(Yjs Client Lib)
    end

    subgraph "Backend Services (Docker/Kubernetes)"
        APIGateway(API Gateway - Optional) ---|REST/WS| CollaborationService(Collaboration Service - Node/Express + Yjs)
        APIGateway ---|REST| SecretsService(Secrets Service - Node/Express)
        APIGateway ---|REST| AIService(AI Service - Node/Express)
        APIGateway ---|REST| LanguageEnvService(Language Env Service - Nix Containers)
        APIGateway ---|REST| GitService(Git Service - Node/Express)
        APIGateway ---|REST| DeploymentService(Deployment Service - Node/Express)

        CollaborationService -- Persists/Syncs --> RedisCollab[(Redis - Yjs State)]
        SecretsService -- Stores Encrypted Data --> VaultDB[(Database - Vault)]
        AIService -- Interacts --> LLM_Ollama[Ollama LLMs]
        AIService -- Interacts --> LLM_Genkit[Genkit (Gemini, etc.)]
        AIService -- RAG --> VectorDB[(Vector Database)]
        LanguageEnvService -- Manages --> NixContainers[Nix Containers]
        DeploymentService -- Manages --> K8s[Kubernetes Cluster]
        GitService -- Interacts --> GitRepos[Git Repositories]
    end

    subgraph "External Systems"
        GitHub(GitHub - OAuth/Repos)
        DockerHub(Docker Hub - Images)
        DNSProvider(DNS Provider)
    end

    UI -- REST/WS --> APIGateway
    YjsClient -- WebSocket --> CollaborationService
    APIGateway -- Events/Data --> RedisSession[(Redis - Sessions)]
    DeploymentService -- Interacts --> DockerHub
    DeploymentService -- Interacts --> DNSProvider
    GitService -- Clones/Pushes --> GitHub

    style Monaco fill:#f9f,stroke:#333,stroke-width:2px,color:#000
    style NixContainers fill:#add,stroke:#333,stroke-width:2px,color:#000
    style K8s fill:#adf,stroke:#333,stroke-width:2px,color:#000
    style VectorDB fill:#ffa,stroke:#333,stroke-width:2px,color:#000
```

## Style Guide 🎨

*   **Color Palette:** Muted, desaturated colors common in early 90s UIs.
    *   Primary Accent: Teal (`#008080`).
    *   Background: Light Gray (`hsl(210 0% 92%)`).
    *   Borders: Light (`hsl(0 0% 100%)`) and Dark (`hsl(0 0% 40%)`) for 3D bevel effects.
*   **Fonts:** `Pixelify Sans` (or similar pixelated font) for UI elements. Monospaced font for the code editor.
*   **Icons:** Simple, blocky, pixel-art style icons (using `lucide-react` where appropriate, potentially custom SVGs).
*   **Windows & Dialogs:** Fixed-size (initially), draggable windows with classic title bars and controls. Sharp corners (`radius: 0rem`).
*   **Animations:** Basic, subtle animations for window interactions (mimicking limitations of older systems).

## Deliverables Checklist & Status 📦

*   [X] Scaffolded Project: Next.js 15+ (App Router), TypeScript, Tailwind CSS, shadcn/ui.
*   [X] Firebase Integration: `.firebaserc`, `firebase.json` configured (Note: May shift focus with microservices).
*   [X] Infrastructure as Code: Basic Terraform configs (Note: May shift to K8s manifests).
    *   [X] Placeholder `docker-compose.yml` added.
    *   [X] Placeholder `k8s/` manifests added.
*   [X] CI/CD: Placeholder GitHub Actions workflow (`.github/workflows/ci.yml`).
*   [ ] Plugin System:
    *   [X] Placeholder `plugins/plugin.schema.json` added.
    *   [ ] Plugin API documentation (JSON schema).
    *   [ ] Sample plugins demonstrating API usage.
    *   [ ] Example YAML workflow files.
*   [X] AI Integration:
    *   [X] Genkit setup for multi-model AI interaction.
    *   [X] Placeholder Ollama/Langchain integration (`src/ai/agents/`).
    *   [ ] Prompt templates for code generation, testing, documentation, and security scanning.
*   [X] Documentation: This README.
    *   [X] Setup and usage instructions (basic).
    *   [X] Retro style guide overview.
    *   [X] System Diagram.
    *   [ ] Voice/gesture command mappings.
    *   [ ] Extension marketplace guide.
*   [X] Collaboration Backend Placeholder (`services/collaboration-service`).
*   [X] Secrets Service Placeholder (`services/secrets-service`).
*   [X] Nix Configuration Placeholder (`nix/shell.nix`).

## Getting Started 🛠️

1.  **Prerequisites:** Node.js, npm/yarn/pnpm, Docker, Docker Compose, Firebase CLI (optional), Terraform (optional), Nix (optional).
2.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd retro-ide
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install or pnpm install
    ```
4.  **Environment Variables:**
    *   Create a `.env` file based on `.env.example` (if provided).
    *   Add `GOOGLE_GENAI_API_KEY` for Genkit AI features.
    *   Add `OLLAMA_BASE_URL` (e.g., `http://localhost:11434`) if using local Ollama.
    *   Configure Firebase project details if needed.
    *   Configure Redis connection details (`REDIS_URL`).
    *   Configure Secret Key for Vault (`SECRET_VAULT_KEY`).
5.  **Run Development Environment (using Docker Compose):**
    ```bash
    docker-compose up --build -d
    ```
    This will start:
    *   Next.js Frontend (port 9002)
    *   Collaboration Service (port 3001 - placeholder)
    *   Secrets Service (port 3002 - placeholder)
    *   Redis (port 6379)
    *   (Optional) Ollama if configured in docker-compose.yml

6.  **(Optional) Run Individual Components:**
    *   Frontend Only: `npm run dev`
    *   Genkit Dev Server: `npm run genkit:dev`
7.  Open [http://localhost:9002](http://localhost:9002) (or your configured port) in your browser.

## Usage Guide 🖱️

*(Placeholder - Add details on how to use the main features)*

*   **Code Editor:** Basic text editing. *(Future: Monaco integration)*
*   **AI Chat:** Interact with the AI assistant (currently Genkit/Gemini). Ask for code generation, explanation, etc.
*   **Terminal:** Basic command-line interface view (non-interactive).
*   **Plugin Manager:** Access via the "Plugins" menu to install/manage extensions. *(Floating window implemented, functionality is placeholder)*
*   **Collaboration:** *(Planned)* Use the collaboration panel to share sessions.
*   **DevOps Tools:** *(Planned)* Access Terraform/Docker/K8s actions via the "Tools" menu.

## Contributing 🤝

Contributions are welcome! Please follow standard Gitflow practices and open a Pull Request.

*(Add more specific contribution guidelines if needed)*

## License 📄

*(Specify your chosen license, e.g., MIT License)*

---

Enjoy the retro-futuristic coding experience!

---

## Self-Audit Checklist (Post-Generation)

- [X] **System Diagram:** High-level diagram included in README.
- [X] **File Scaffold:** Key directories and config files created (`services/`, `k8s/`, `nix/`, `docker-compose.yml`, `plugins/`).
- [X] **Collaboration Code:** Placeholder backend service (`services/collaboration-service/`) and client library (`src/lib/collaboration.ts`) added. *Actual Yjs/WebSocket implementation needed.*
- [X] **Secrets Vault Code:** Placeholder backend service (`services/secrets-service/`) and client library (`src/lib/secrets.ts`) added. *Actual encryption/storage implementation needed.*
- [X] **AI Agent Integration:** Placeholder structure for Ollama/Langchain agents (`src/ai/agents/`) added alongside existing Genkit integration. *Actual agent logic needed.*
- [X] **Deployment Scripts:** Placeholder `docker-compose.yml` and Kubernetes manifests (`k8s/`) added. *Needs refinement for actual deployment.*
- [X] **README Updates:** Features, architecture, and setup instructions updated.
- [X] **Comments:** Major new sections/files commented for clarity.
