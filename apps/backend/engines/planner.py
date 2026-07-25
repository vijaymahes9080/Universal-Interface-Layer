import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..database import Workspace, Task, get_db

class PlannerEngine:
    def __init__(self):
        pass

    def create_workspace_plan(self, db: Session, prompt: str, plan_data: Dict[str, Any]) -> Workspace:
        """
        Takes parsed plan data, creates a Workspace and all dependent Task records in SQLite.
        """
        workspace_id = f"ws_{uuid.uuid4().hex[:10]}"
        
        # Create Workspace record
        workspace = Workspace(
            id=workspace_id,
            name=plan_data.get("name", "New Automated Workspace"),
            prompt=prompt,
            status="idle"
        )
        db.add(workspace)

        tasks_list = plan_data.get("tasks", [])
        
        # Validate task dependencies to prevent cyclic loops
        self._validate_dependencies(tasks_list)

        # Save all Tasks to DB
        for t in tasks_list:
            task = Task(
                id=f"{workspace_id}_{t['id']}",
                workspace_id=workspace_id,
                name=t["name"],
                description=t.get("description", ""),
                plugin=t.get("plugin"),
                action=t.get("action"),
                inputs=json.dumps(t.get("inputs", {})),
                dependencies=json.dumps([f"{workspace_id}_{dep}" for dep in t.get("dependencies", [])]),
                status="pending"
            )
            db.add(task)

        db.commit()
        db.refresh(workspace)
        return workspace

    def _validate_dependencies(self, tasks: List[Dict[str, Any]]):
        """
        Validates the DAG structure to check if there are circular references.
        """
        adj = {}
        for t in tasks:
            adj[t["id"]] = t.get("dependencies", [])

        visited = {} # id -> state (0=unvisited, 1=visiting, 2=visited)
        
        def has_cycle(u):
            visited[u] = 1
            for v in adj.get(u, []):
                # If dependency doesn't exist, we skip or alert
                if v not in adj:
                    continue
                if visited.get(v, 0) == 1:
                    return True
                if visited.get(v, 0) == 0:
                    if has_cycle(v):
                        return True
            visited[u] = 2
            return False

        for node in adj:
            if visited.get(node, 0) == 0:
                if has_cycle(node):
                    raise ValueError(f"Circular dependency detected in tasks graph at node '{node}'")

import json
