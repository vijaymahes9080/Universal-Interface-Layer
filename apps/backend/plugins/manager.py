import os
import json
import importlib
import traceback
from typing import Dict, Any, List, Optional
from ..config import WORKSPACES_DIR, PLUGINS_DIR

class PluginManager:
    def __init__(self):
        self.plugins: Dict[str, Dict[str, Any]] = {}
        self.register_builtins()

    def register_builtins(self):
        """
        Registers built-in default plugins.
        """
        # Register Browser Plugin metadata
        self.plugins["browser"] = {
            "name": "Web Browser Simulator",
            "description": "Searches the web, extracts page content, and crawls urls.",
            "manifest": {
                "commands": {
                    "search_web": {"inputs": ["query"], "outputs": ["results"]},
                    "read_page": {"inputs": ["url"], "outputs": ["content"]}
                }
            }
        }
        
        # Register Calendar Plugin metadata
        self.plugins["calendar"] = {
            "name": "Calendar Manager",
            "description": "Schedules study sessions, meetings, and dates.",
            "manifest": {
                "commands": {
                    "create_event": {"inputs": ["title", "start_time", "duration_minutes"], "outputs": ["event"]},
                    "list_events": {"inputs": [], "outputs": ["events"]}
                }
            }
        }

        # Register Email Plugin metadata
        self.plugins["email"] = {
            "name": "Email Integrator",
            "description": "Drafts notifications and alerts.",
            "manifest": {
                "commands": {
                    "draft_email": {"inputs": ["to", "subject", "body"], "outputs": ["draft_id", "status"]},
                    "send_email": {"inputs": ["draft_id"], "outputs": ["status"]}
                }
            }
        }

        # Register Files Plugin metadata
        self.plugins["files"] = {
            "name": "Workspace File Operator",
            "description": "Reads and writes files in the sandboxed workspace folder.",
            "manifest": {
                "commands": {
                    "write_file": {"inputs": ["path", "content"], "outputs": ["path", "success"]},
                    "read_file": {"inputs": ["path"], "outputs": ["content"]}
                }
            }
        }

        # Register Tasks Plugin metadata
        self.plugins["tasks"] = {
            "name": "Tasks Tracker",
            "description": "Manages to-do items and completion states.",
            "manifest": {
                "commands": {
                    "create_task": {"inputs": ["title", "priority"], "outputs": ["task"]},
                    "complete_task": {"inputs": ["task_id"], "outputs": ["success"]}
                }
            }
        }

        # Register Terminal Plugin metadata
        self.plugins["terminal"] = {
            "name": "Sandboxed Command Terminal",
            "description": "Executes allowed terminal operations in workspace subfolders.",
            "manifest": {
                "commands": {
                    "run_command": {"inputs": ["command"], "outputs": ["stdout", "stderr", "code"]}
                }
            }
        }

    def execute(self, plugin_name: str, action: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a plugin command by finding the appropriate handler and executing it.
        """
        if plugin_name not in self.plugins:
            raise ValueError(f"Plugin '{plugin_name}' is not registered.")

        # Resolve the plugin execution module
        # For simplicity, clean importing built-in python files from .base subfolder:
        try:
            module = importlib.import_module(f"apps.backend.plugins.base.{plugin_name}")
            handler = getattr(module, f"handle_{action}", None)
            if not handler:
                raise AttributeError(f"Action '{action}' is not supported by plugin '{plugin_name}'.")
            
            return handler(inputs)
        except Exception as e:
            print(f"Plugin execution failed in module: {plugin_name}.{action}. Error: {e}")
            traceback.print_exc()
            raise e

    def get_registered_plugins(self) -> List[Dict[str, Any]]:
        result = []
        for pid, pdata in self.plugins.items():
            result.append({
                "id": pid,
                "name": pdata["name"],
                "description": pdata["description"],
                "commands": list(pdata["manifest"]["commands"].keys()),
                "manifest": pdata["manifest"]
            })
        return result

plugin_manager = PluginManager()
