# Universal Interface Layer (UIL)

Universal Interface Layer (UIL) is a startup-grade, production-ready AI operating interface designed to unify all your workflows. It converts natural language commands into coordinated, topological execution graphs across multiple applications via sandboxed plugin agents.

```
       [ User Natural Language Prompt ]
                      │
                      ▼
               [ Intent Engine ]
                      │
                      ▼
             [ Planner DAG Engine ]
                      │
                      ▼
             [ Executor Engine ] ── websocket telemetry ──► [ React Flow Dashboard ]
                      │
           ┌──────────┼──────────┐
           ▼          ▼          ▼
       [Files]   [Calendar]  [Terminal] ... (Zero-Trust Sandbox Isolation)
```

## Core Modules

1. **Intent Parsing & Heuristics**: Converts raw tasks into structured command targets. Supports deterministic rule maps for offline efficiency and falls back to LiteLLM/Ollama.
2. **Topological DAG Planner**: Sorts steps by dependency, verifying cycles using DFS algorithms to prevent endless locks.
3. **Safety Execution & WebSocket logs**: Handles concurrency, timeouts, and state updates, halting on high-risk operations (e.g. sending emails, running system commands) for human authorization.
4. **Sandboxed Plugin SDK**: Enforces path isolation, whitelist command policies, and permission control gates.
5. **Dynamic Knowledge Graph**: Registers task executions, created documents, contacts, and concepts, rendering nodes in an interactive SVG canvas.
6. **Vector Cosine Memory**: Recalls past sessions, deadlines, and guidelines using a lightweight TF-IDF matching engine built in pure Python.

---

## Directory Structure

```
uil-monorepo/
├── apps/
│   ├── backend/            # FastAPI, SQLite models, agent planners, executor loop
│   └── frontend/           # React client with custom graph explorer & React Flow builder
├── sdk/
│   └── python/             # UILPlugin class and decorator-based command compilers
├── scripts/
│   ├── setup.ps1           # Automated dependency installer for Windows PowerShell
│   └── setup.sh            # Automated dependency installer for macOS/Linux Bash
├── docs/                   # Software specifications, designs, APIs, developer logs
├── tests/                  # Pytest unit tests for parser, planners, and sandbox blocks
└── README.md
```

---

## Quickstart

### Automated Setup
To configure the workspace virtual environment and frontend node packages, run the automated setup script for your platform:

**Windows PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

**macOS/Linux Bash:**
```bash
chmod +x ./scripts/setup.sh
./scripts/setup.sh
```

### Manual Execution

#### 1. Backend Core Server:
```bash
cd apps/backend
# Activate your virtual environment
python -m apps.backend.main
```
The server will run on `http://127.0.0.1:8000`.

#### 2. Frontend React Client:
```bash
cd apps/frontend
npm run dev
```
The dashboard UI will load on `http://localhost:3000`.

---

## SDK Integration

Writing custom plugins is simple with the UIL Python SDK:

```python
from uil_sdk import UILPlugin

plugin = UILPlugin(name="MyService", description="Custom dashboard integration")

@plugin.command("push_update", description="Triggers sync tasks")
def push_update(url: str, content: str):
    return {"status": "success", "url": url}

if __name__ == "__main__":
    plugin.write_manifest_file("manifest.json")
```

---

## Testing

Run unit tests verifying the DAG scheduler and path sandbox blockages:
```bash
python -m pytest tests/
```

## License
Apache 2.0 License.
