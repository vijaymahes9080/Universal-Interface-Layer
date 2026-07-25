# Universal Interface Layer (UIL) 🌌

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2%2B-blue)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-emerald)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18%2B-cyan)](https://react.dev/)

**Universal Interface Layer (UIL)** is a production-ready AI operating interface designed to unify complex developer and workplace workflows. It converts natural language commands (or voice prompts) into topological, sandboxed execution graphs (DAGs) across local and cloud applications via isolated plugin agents.

---

## 🏛 Architecture Overview

```text
               ┌──────────────────────────────────────────────┐
               │    User Natural Language / Voice Prompt      │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
                           ┌─────────────────────┐
                           │    Intent Engine    │
                           └──────────┬──────────┘
                                      │
                                      ▼
                           ┌─────────────────────┐
                           │ Planner DAG Engine  │
                           └──────────┬──────────┘
                                      │
                                      ▼
                       ┌─────────────────────────────┐
                       │ Multi-Agent Consensus Engine│
                       │   (Security & Risk Gate)    │
                       └──────────────┬──────────────┘
                                      │
                                      ▼
    ┌─────────────────────────────────┴─────────────────────────────────┐
    │                         Executor Engine                           │
    │         (WebSocket Telemetry Stream ──► React Flow Dashboard)      │
    └──────┬────────────┬─────────────┬─────────────┬─────────────┬─────┘
           │            │             │             │             │
           ▼            ▼             ▼             ▼             ▼
      [GitHub]    [SQL Analytics]   [Web Intel]   [System Mon]   [Sandbox]
```

---

## 🔥 Key Features & Innovations

- 🧠 **Intent Parsing & Dynamic DAG Planner**: Generates cycle-free Directed Acyclic Graphs (DAGs) using DFS algorithms.
- 🛡 **Multi-Agent Consensus & Security Audit Engine**: Evaluates execution safety, preventing privilege escalations, unauthorized destructive scripts, and unsafe parameters.
- 🧩 **Extensible 10+ Core Plugin Suite**:
  - 🐱 **GitHub DevOps**: Search commits, track open issues, inspect repo health.
  - 📊 **SQL Analytics**: Execute read-only SQL queries and reflect SQLite schemas.
  - 🌐 **Web Intelligence**: Scrape web pages and extract clean Markdown summaries.
  - 💻 **System Telemetry**: Real-time CPU, RAM, Disk, and process monitoring.
  - 📁 **Files & Terminal**: Zero-trust path isolation and command whitelist enforcement.
  - 📅 **Calendar, Email & Tasks**: Automated scheduling, draft notifications, and task management.
- ⚡ **Multi-Language SDK Support**: Build sandboxed plugins using **Python** (`uil_sdk`) or **TypeScript** (`@uil/sdk`).
- 🎨 **Visual Workflow Studio & Speech HUD**: Interactive drag-and-drop workflow canvas and Web Speech API integration in the React Dashboard.
- 🚀 **Automated CI/CD**: Complete Pytest test suite and GitHub Actions workflow.

---

## 📁 Repository Structure

```text
Universal-Interface-Layer/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD pipelines
├── apps/
│   ├── backend/            # FastAPI core server, engines (DAG, Consensus), plugins
│   └── frontend/           # React 18 client, Visual Workflow Studio, Command Bar HUD
├── sdk/
│   ├── python/             # Python UILPlugin SDK
│   └── typescript/         # TypeScript / Node.js @uil/sdk
├── scripts/
│   ├── setup.ps1           # Automated installer for Windows PowerShell
│   └── setup.sh            # Automated installer for macOS/Linux Bash
├── docs/                   # System Design, SRS, API docs & plugin guides
├── tests/                  # Pytest test suite (engines, plugins, sandboxes)
├── composer.json           # Composer manifest with developer metadata
├── LICENSE                 # Apache 2.0 License
└── README.md
```

---

## ⚡ Quickstart

### Automated Environment Setup

**Windows PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

**macOS/Linux Bash:**
```bash
chmod +x ./scripts/setup.sh
./scripts/setup.sh
```

---

### Manual Server Execution

#### 1. Backend Core Server
```bash
cd apps/backend
python -m apps.backend.main
```
> Server will be running at `http://127.0.0.1:8000`.

#### 2. Frontend React Client
```bash
cd apps/frontend
npm run dev
```
> Client UI will load on `http://localhost:3000`.

---

## 🛠 SDK Integrations

### Python SDK (`uil_sdk`)
```python
from uil_sdk import UILPlugin

plugin = UILPlugin(name="MyService", description="Custom dashboard integration")

@plugin.command("push_update", description="Triggers sync tasks")
def push_update(url: str, content: str):
    return {"status": "success", "url": url}

if __name__ == "__main__":
    plugin.write_manifest_file("manifest.json")
```

### TypeScript SDK (`@uil/sdk`)
```typescript
import { UILPlugin } from '@uil/sdk';

const plugin = new UILPlugin('NodeService', 'Custom Node plugin');

plugin.registerCommand(
  'fetch_status',
  'Fetches service uptime',
  ['url'],
  ['status'],
  async (inputs) => ({ status: 'healthy' })
);

plugin.writeManifestFile('manifest.json');
```

---

## 🧪 Testing

Run unit tests verifying DAG planners, multi-agent consensus, and sandboxed plugins:
```bash
python -m pytest tests/
```

---

## 👤 Developer & Maintainer

**Vijay Mahes**
- **Email**: [Vijaypradhap2004@gmail.com](mailto:Vijaypradhap2004@gmail.com)
- **GitHub**: [@vijaymahes9080](https://github.com/vijaymahes9080)

---

## 📄 License

Licensed under the **Apache 2.0 License**. See [LICENSE](LICENSE) for details.
