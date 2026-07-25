import uuid
from typing import Dict, Any, List

_tasks_database: List[Dict[str, Any]] = [
    {
        "id": "tsk_1",
        "title": "Welcome to Universal Interface Layer config review",
        "priority": "high",
        "completed": False
    }
]

def handle_create_task(inputs: Dict[str, Any]) -> Dict[str, Any]:
    title = inputs.get("title")
    priority = inputs.get("priority", "medium")

    if not title:
        raise ValueError("title parameter is required for creating a task.")

    task = {
        "id": f"tsk_{uuid.uuid4().hex[:8]}",
        "title": title,
        "priority": priority,
        "completed": False
    }

    _tasks_database.append(task)
    return {"task": task, "success": True}

def handle_complete_task(inputs: Dict[str, Any]) -> Dict[str, Any]:
    task_id = inputs.get("task_id")
    if not task_id:
        raise ValueError("task_id parameter is required to mark task complete.")

    for task in _tasks_database:
        if task["id"] == task_id:
            task["completed"] = True
            return {"task": task, "success": True}

    raise KeyError(f"Task with ID '{task_id}' not found.")
