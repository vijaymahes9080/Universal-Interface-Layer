import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from ..database import (
    get_db, Workspace, Task, Plugin, Memory, GraphNode, GraphEdge, 
    AutomationRule, AuditLog, SessionLocal
)
from ..engines.intent import IntentEngine
from ..engines.planner import PlannerEngine
from ..engines.executor import ExecutorEngine, event_dispatcher
from ..engines.memory import memory_engine
from ..engines.context import ContextEngine
from ..plugins.manager import plugin_manager

router = APIRouter()
intent_engine = IntentEngine()
planner_engine = PlannerEngine()
executor_engine = ExecutorEngine()
context_engine = ContextEngine()

# Pydantic Schemas
class PromptRequest(BaseModel):
    prompt: str

class ExecuteRequest(BaseModel):
    workspace_id: str

class ApprovalRequest(BaseModel):
    task_id: str

class MemorySearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 5

class MemoryCreateRequest(BaseModel):
    content: str
    scope: Optional[str] = "global"

class RuleCreateRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    trigger_type: str
    trigger_config: dict
    task_graph_template: list

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_json(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# Setup websocket listener inside execution event dispatcher
async def websocket_broadcaster(data: dict):
    await manager.broadcast_json(data)

event_dispatcher.register(websocket_broadcaster)


@router.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial status
        await websocket.send_json({"type": "info", "message": "WebSocket execution stream active."})
        while True:
            # Keep socket alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# WORKSPACES
@router.get("/workspaces")
def list_workspaces(db: Session = Depends(get_db)):
    workspaces = db.query(Workspace).order_by(Workspace.created_at.desc()).all()
    result = []
    for ws in workspaces:
        tasks = db.query(Task).filter(Task.workspace_id == ws.id).all()
        result.append({
            "id": ws.id,
            "name": ws.name,
            "prompt": ws.prompt,
            "status": ws.status,
            "created_at": ws.created_at.isoformat(),
            "tasks_count": len(tasks),
            "completed_tasks": sum(1 for t in tasks if t.status == "completed")
        })
    return result

@router.post("/workspaces")
def create_workspace(req: PromptRequest, db: Session = Depends(get_db)):
    try:
        # 1. Parse prompt intent
        plan_data = intent_engine.parse_intent(req.prompt)
        
        # 2. Compile into Workspace + Tasks DAG
        workspace = planner_engine.create_workspace_plan(db, req.prompt, plan_data)
        
        return {
            "workspace_id": workspace.id,
            "name": workspace.name,
            "status": workspace.status,
            "prompt": req.prompt
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/workspaces/{workspace_id}")
def get_workspace_details(workspace_id: str, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    tasks = db.query(Task).filter(Task.workspace_id == workspace_id).all()
    
    # Format graph response
    tasks_data = []
    for t in tasks:
        tasks_data.append({
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "plugin": t.plugin,
            "action": t.action,
            "inputs": json.loads(t.inputs),
            "outputs": json.loads(t.outputs) if t.outputs else {},
            "status": t.status,
            "error_message": t.error_message,
            "dependencies": json.loads(t.dependencies),
            "retry_count": t.retry_count
        })

    # Retrieve associated files
    context = context_engine.collect_workspace_context(workspace_id)

    return {
        "id": workspace.id,
        "name": workspace.name,
        "prompt": workspace.prompt,
        "status": workspace.status,
        "created_at": workspace.created_at.isoformat(),
        "tasks": tasks_data,
        "files": context["files"]
    }

@router.post("/workspaces/execute")
def execute_workspace(req: ExecuteRequest, background_tasks: BackgroundTasks):
    # Run the DAG execution in background thread
    background_tasks.add_task(executor_engine.execute_workspace, req.workspace_id)
    return {"message": "Workspace execution started."}

@router.post("/workspaces/approve")
def approve_step(req: ApprovalRequest, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == req.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task.status != "waiting_approval":
        raise HTTPException(status_code=400, detail="Task is not waiting for approval")

    task.status = "pending"
    db.commit()
    
    # Relaunch workspace execution
    asyncio.create_task(executor_engine.execute_workspace(task.workspace_id))
    return {"message": "Task approved. Resuming workspace execution."}

@router.delete("/workspaces/{workspace_id}")
def delete_workspace(workspace_id: str, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    db.delete(workspace)
    db.commit()
    return {"message": f"Workspace {workspace_id} successfully deleted."}

class WriteFileRequest(BaseModel):
    workspace_id: str
    path: str
    content: str

@router.get("/workspaces/read-file")
def read_workspace_file(workspace_id: str, path: str):
    from ..plugins.base.files import handle_read_file
    try:
        res = handle_read_file({"workspace_id": workspace_id, "path": path})
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/workspaces/write-file")
def write_workspace_file(req: WriteFileRequest):
    from ..plugins.base.files import handle_write_file
    try:
        res = handle_write_file({
            "workspace_id": req.workspace_id,
            "path": req.path,
            "content": req.content
        })
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



# PLUGINS
@router.get("/plugins")
def get_plugins():
    return plugin_manager.get_registered_plugins()

@router.post("/plugins/{plugin_id}/toggle")
def toggle_plugin(plugin_id: str, db: Session = Depends(get_db)):
    # Simulates loading/unloading
    if plugin_id not in plugin_manager.plugins:
        raise HTTPException(status_code=404, detail="Plugin not found")
        
    # Standard DB configs check
    p_record = db.query(Plugin).filter(Plugin.id == plugin_id).first()
    if not p_record:
        p_record = Plugin(
            id=plugin_id,
            name=plugin_manager.plugins[plugin_id]["name"],
            manifest=json.dumps(plugin_manager.plugins[plugin_id]["manifest"]),
            enabled=True
        )
        db.add(p_record)
    
    p_record.enabled = not p_record.enabled
    db.commit()
    return {"id": plugin_id, "enabled": p_record.enabled}


# MEMORY
@router.post("/memory/search")
def search_memory(req: MemorySearchRequest):
    results = memory_engine.search_memories(req.query, limit=req.limit)
    return results

@router.post("/memory")
def add_memory(req: MemoryCreateRequest):
    res = memory_engine.add_memory(req.content, scope=req.scope)
    return res


# KNOWLEDGE GRAPH
@router.get("/graph")
def get_knowledge_graph(db: Session = Depends(get_db)):
    nodes = db.query(GraphNode).all()
    edges = db.query(GraphEdge).all()
    
    nodes_data = []
    for n in nodes:
        nodes_data.append({
            "id": n.id,
            "label": n.label,
            "type": n.type,
            "properties": json.loads(n.properties)
        })
        
    edges_data = []
    for e in edges:
        edges_data.append({
            "id": e.id,
            "source": e.source_id,
            "target": e.target_id,
            "relation": e.relation,
            "properties": json.loads(e.properties)
        })
        
    return {"nodes": nodes_data, "links": edges_data}


# AUTOMATION RULES
@router.get("/automations")
def list_automations(db: Session = Depends(get_db)):
    return db.query(AutomationRule).all()

@router.post("/automations")
def create_automation(req: RuleCreateRequest, db: Session = Depends(get_db)):
    rule_id = f"rule_{uuid.uuid4().hex[:8]}"
    rule = AutomationRule(
        id=rule_id,
        name=req.name,
        description=req.description,
        trigger_type=req.trigger_type,
        trigger_config=json.dumps(req.trigger_config),
        task_graph_template=json.dumps(req.task_graph_template),
        enabled=True
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.post("/automations/{rule_id}/toggle")
def toggle_automation(rule_id: str, db: Session = Depends(get_db)):
    rule = db.query(AutomationRule).filter(AutomationRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    rule.enabled = not rule.enabled
    db.commit()
    return {"id": rule_id, "enabled": rule.enabled}


# AUDIT LOGS
@router.get("/logs")
def list_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return logs
