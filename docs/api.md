# REST and WebSocket API Specification
## Universal Interface Layer (UIL)

### 1. Workspaces endpoints
#### 1.1 List Workspaces
- **URL**: `/api/workspaces`
- **Method**: `GET`
- **Response**:
  ```json
  [
    {
      "id": "ws_abcdef12",
      "name": "Academic Exam Preparation Workflow",
      "prompt": "Prepare for my MCA exam next week.",
      "status": "completed",
      "created_at": "2026-07-03T11:00:00.000Z",
      "tasks_count": 7,
      "completed_tasks": 7
    }
  ]
  ```

#### 1.2 Create Workspace Plan
- **URL**: `/api/workspaces`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "prompt": "Prepare for my MCA exam next week."
  }
  ```
- **Response**:
  ```json
  {
    "workspace_id": "ws_abcdef12",
    "name": "Academic Exam Preparation Workflow",
    "status": "idle",
    "prompt": "Prepare for my MCA exam next week."
  }
  ```

#### 1.3 Get Workspace Details
- **URL**: `/api/workspaces/{workspace_id}`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "id": "ws_abcdef12",
    "name": "Academic Exam Preparation Workflow",
    "status": "completed",
    "tasks": [
      {
        "id": "ws_abcdef12_task_1",
        "name": "Research Syllabus and Key Topics",
        "plugin": "browser",
        "action": "search_web",
        "inputs": {"query": "MCA exam syllabus 2026"},
        "outputs": {"results": [...]},
        "status": "completed",
        "dependencies": []
      }
    ],
    "files": [
      {
        "name": "Study_Guide.md",
        "path": "MCA_Exam_Preparation/Study_Guide.md",
        "size_bytes": 450
      }
    ]
  }
  ```

#### 1.4 Execute Workspace
- **URL**: `/api/workspaces/execute`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "workspace_id": "ws_abcdef12"
  }
  ```

#### 1.5 Approve Execution Step
- **URL**: `/api/workspaces/approve`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "task_id": "ws_abcdef12_task_email"
  }
  ```

### 2. Plugins endpoints
#### 2.1 List Registered Plugins
- **URL**: `/api/plugins`
- **Method**: `GET`

#### 2.2 Toggle Plugin Status
- **URL**: `/api/plugins/{plugin_id}/toggle`
- **Method**: `POST`

### 3. Knowledge Graph
#### 3.1 Fetch Relationship Graph Nodes & Edges
- **URL**: `/api/graph`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "nodes": [
      { "id": "node_ws_abc", "label": "Workspace abc", "type": "workspace", "properties": {} }
    ],
    "links": [
      { "id": "edge_1", "source": "node_ws_abc", "target": "node_task_1", "relation": "contains", "properties": {} }
    ]
  }
  ```

### 4. WebSocket Telemetry
- **URL**: `/api/ws/logs`
- **Protocol**: `WS`
- **Broadcasting Frame**:
  ```json
  {
    "type": "task_update",
    "task_id": "ws_abc_task_1",
    "status": "completed",
    "message": "Completed step: Research Syllabus successfully."
  }
  ```
