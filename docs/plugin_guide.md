# Plugin Developer Manual
## Universal Interface Layer (UIL)

### 1. Plugin Architecture Overview
Every capability in UIL is structured as a plugin. Plugins are isolated, sandboxed Python modules located in the `plugins/` directory or built-in to `apps/backend/plugins/base/`. 

Each plugin contains:
1. **Manifest File**: Defines name, version, capabilities, commands list, and required parameters schemas.
2. **Implementation Module**: Implements handlers for declared commands.

### 2. Developing a Plugin with the Python SDK

Developers can use the `uil-sdk` to quickly define plugins, decorate command routines, and generate manifestations.

#### 2.1 Code Template (`my_plugin.py`)
```python
from uil_sdk import UILPlugin

# 1. Initialize plugin properties
plugin = UILPlugin(
    name="Database Sync Service",
    description="Synchronizes task data with third-party webhooks.",
    version="1.0.0"
)

# 2. Register commands with @plugin.command decorator
@plugin.command("sync_tasks", description="Pushes task execution results to webhook")
def handle_sync_tasks(sync_url: str, priority: str = "medium"):
    # Task execution routine
    import requests
    response = requests.post(sync_url, json={"priority": priority})
    
    return {
        "sync_url": sync_url,
        "status_code": response.status_code,
        "success": response.status_code == 200
    }

if __name__ == "__main__":
    # 3. Compile manifest.json
    plugin.write_manifest_file("manifest.json")
```

#### 2.2 CLI Compiling
Run your plugin code to generate the manifest metadata file:
```bash
python my_plugin.py
```
This saves a standard `manifest.json` schema:
```json
{
  "name": "Database Sync Service",
  "description": "Synchronizes task data with third-party webhooks.",
  "version": "1.0.0",
  "commands": {
    "sync_tasks": {
      "description": "Pushes task execution results to webhook",
      "inputs": ["sync_url", "priority"]
    }
  }
}
```

### 3. Security Guidelines
- **No Path Traversals**: Never load files using unvalidated string interpolations. Always call `_get_sandboxed_path()` to ensure paths stay within the active workspace.
- **Whitelist Operations**: For shell execution, never parse unchecked bash scripts. Enforce Whitelist commands matching.
- **Approvals Triggering**: If a custom command conducts sensitive tasks (e.g. money transfers, databases formatting, sending emails), register it so the Execution Engine halts and requests user confirmation.
