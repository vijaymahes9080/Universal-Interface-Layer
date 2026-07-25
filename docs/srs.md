# Software Requirements Specification (SRS)
## Universal Interface Layer (UIL)

### 1. Introduction
The Universal Interface Layer (UIL) is a startup-grade, production-ready AI operating interface designed to sit above various applications. It converts natural language commands into coordinated steps executed across multiple software platforms.

### 2. Overall Description
#### 2.1 Product Perspective
UIL operates as a centralized coordination middleware containing:
- **Natural Language Parsing**: Translating user requests into steps.
- **DAG Execution Graphs**: Topological scheduling with parallel workflows.
- **Isolate Sandbox Plugins**: Restricting script commands, API parameters, and path directories.
- **Active Knowledge Graphs**: Mapping people, files, logs, and contexts dynamically.

```
User -> Intent Parser -> Task Planner (DAG) -> Exec Engine -> Sandbox Plugins -> Local Storage
                                                     |
                                                     v
                                              WebSocket Telemetry -> React Canvas
```

### 3. Functional Requirements
#### 3.1 Intent and Planning Engines
- **FR-1**: The system must parse commands (e.g. academic prep, travel planners, company launcher) and produce JSON representations of task nodes.
- **FR-2**: The system must build a Directed Acyclic Graph (DAG) for execution, ensuring no cyclic dependencies exist.
- **FR-3**: The planner must detect dependencies and trigger tasks concurrently where possible.

#### 3.2 Execution and Security Sandbox
- **FR-4**: The Executor must update individual task states (`pending`, `executing`, `completed`, `failed`, `waiting_approval`).
- **FR-5**: The system must enforce safety approval prompts for sensitive methods (e.g. sending emails or running destructive commands).
- **FR-6**: The Files plugin must isolate paths to the specific workspace folders, throwing traversal block errors (`PermissionError`) for traversal attempts (e.g. `../../`).
- **FR-7**: The Terminal plugin must validate input commands against an prefix whitelist (`git`, `pip`, `npm`, etc.) and block blacklisted operations (`rm`, `del`).

#### 3.3 State Telemetry and Visualization
- FR-8: The system must open WebSocket channels (`/ws/logs`) broadcasting execution logs to listening frontends.
- FR-9: The React dashboard must display checklist components, allow Monaco note alterations, visualize directories, and show nodes links.

### 4. Non-Functional Requirements
- **Performance**: average planning pipeline compilation time must be under 150ms.
- **Isolate/Security**: sandbox architecture runs local python virtual environments and SQLite logs.
- **Offline Compatibility**: fully functional rule-matching engine fallback to support disconnected workflows out-of-the-box.
