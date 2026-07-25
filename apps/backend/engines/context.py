import os
import json
from typing import Dict, Any, List
from ..database import SessionLocal, Task, Workspace
from ..config import WORKSPACES_DIR

class ContextEngine:
    def __init__(self):
        pass

    def collect_workspace_context(self, workspace_id: str) -> Dict[str, Any]:
        """
        Gathers contextual files, tasks, and system notes associated with the workspace.
        """
        db = SessionLocal()
        context = {
            "workspace_id": workspace_id,
            "tasks": [],
            "files": [],
            "system_state": {
                "platform": "Windows/Venv",
                "time": datetime.datetime.now().isoformat()
            }
        }
        try:
            # 1. Grab recent tasks
            tasks = db.query(Task).filter(Task.workspace_id == workspace_id).all()
            for t in tasks:
                context["tasks"].append({
                    "id": t.id,
                    "name": t.name,
                    "status": t.status,
                    "outputs": json.loads(t.outputs) if t.outputs else {}
                })

            # 2. Gather filesystem items in Workspace folder
            ws_path = os.path.join(WORKSPACES_DIR, workspace_id)
            if os.path.exists(ws_path):
                for root, _, files in os.walk(ws_path):
                    for file in files:
                        rel_path = os.path.relpath(os.path.join(root, file), WORKSPACES_DIR)
                        context["files"].append({
                            "name": file,
                            "path": rel_path,
                            "size_bytes": os.path.getsize(os.path.join(root, file))
                        })

        except Exception as e:
            print(f"Error gathering workspace context: {e}")
        finally:
            db.close()

        return context

import datetime
