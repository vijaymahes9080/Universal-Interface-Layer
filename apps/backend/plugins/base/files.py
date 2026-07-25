import os
from pathlib import Path
from typing import Dict, Any
from ...config import WORKSPACES_DIR

def _get_sandboxed_path(workspace_id: str, relative_path: str) -> Path:
    """
    Enforces directory sandboxing to prevent directory traversal attacks.
    """
    workspace_dir = Path(WORKSPACES_DIR) / workspace_id
    # Resolve absolute path
    target_path = (workspace_dir / relative_path).resolve()
    
    # Check if target is inside workspace directory
    if not str(target_path).startswith(str(workspace_dir.resolve())):
        raise PermissionError(f"Security violation: path traversal blocked. Attempted: {relative_path}")
        
    return target_path

def handle_write_file(inputs: Dict[str, Any]) -> Dict[str, Any]:
    workspace_id = inputs.get("workspace_id")
    if not workspace_id:
        raise ValueError("workspace_id is required.")
        
    relative_path = inputs.get("path")
    content = inputs.get("content", "")
    
    if not relative_path:
        raise ValueError("File 'path' is required.")

    target_path = _get_sandboxed_path(workspace_id, relative_path)
    
    # Ensure parent directories exist
    target_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    return {
        "path": relative_path,
        "absolute_path": str(target_path),
        "size_bytes": os.path.getsize(target_path),
        "success": True
    }

def handle_read_file(inputs: Dict[str, Any]) -> Dict[str, Any]:
    workspace_id = inputs.get("workspace_id")
    if not workspace_id:
        raise ValueError("workspace_id is required.")

    relative_path = inputs.get("path")
    if not relative_path:
        raise ValueError("File 'path' is required.")

    target_path = _get_sandboxed_path(workspace_id, relative_path)
    
    if not target_path.exists():
        raise FileNotFoundError(f"File not found: {relative_path}")

    with open(target_path, "r", encoding="utf-8") as f:
        content = f.read()

    return {
        "path": relative_path,
        "content": content,
        "size_bytes": len(content)
    }
