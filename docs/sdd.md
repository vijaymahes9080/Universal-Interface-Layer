# Software Design Document (SDD)
## Universal Interface Layer (UIL)

### 1. System Architecture
UIL uses a monorepo setup:
- **Backend API**: FastAPI service managing database reads, agent pipelines, and dynamic plugin execution.
- **Relational Storage**: SQLite with SQLAlchemy declarative mappings.
- **Memory Store**: Custom TF-IDF cosine-similarity memory index (pure Python) for semantic recall.
- **Frontend Dashboard**: React SPA built on Vite, TailwindCSS, Framer Motion, and React Flow.

### 2. Component Design

#### 2.1 Intent Parsing and Heuristics
When a prompt is posted to `/api/workspaces`, the `IntentEngine` maps matching parameters. If offline or no API key is specified, a rule-matching dictionary loads corresponding workflows (MCA exams study guides, travel guides, startup blueprints). It returns lists of task steps containing plugin targets and parameter objects.

#### 2.2 DAG Planner & Executor
The `PlannerEngine` parses tasks, verifies cyclic paths using Depth-First-Search (DFS), creates a database Workspace record, and saves tasks marked `pending`.
The `ExecutorEngine` loops over pending tasks, checking if parent dependencies are marked `completed` or `skipped`. Ready tasks run concurrently in a thread executor:

```
[Pending Tasks] -> Dependency Checks -> [Runnable Tasks] -> Subprocess/Plugin Sandbox -> [Completed]
                                                                                            |
                                                                                            v
                                                                                    Update Memory & Graph
```

#### 2.3 Traversal Sandboxing & Command Whitelists
- **Filesystem Sandbox**:
  `_get_sandboxed_path()` resolves target folders and throws a `PermissionError` if the absolute path doesn't start with the current Workspace folder prefix.
- **Command Whitelist**:
  The `terminal` plugin splits raw input strings and validates that the root command matches the whitelist (e.g. `git`, `python`, `node`) and does not contain blacklisted keywords (e.g. `rm`, `del`).

### 3. Database Design
We use SQLite tables:
- `workspaces`: key parameters tracking state (`idle`, `executing`, `completed`, `waiting_approval`).
- `tasks`: stores step names, action scopes, input/output JSON payloads, error logs, and list dependencies.
- `graph_nodes` & `graph_edges`: maps relations between concepts, tasks, files, and teams.
- `memories`: registers raw markdown contents and workspaces tags for vector cosine lookups.
