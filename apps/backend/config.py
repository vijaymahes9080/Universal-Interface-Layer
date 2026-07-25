import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
WORKSPACE_ROOT = BASE_DIR.parent.parent

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/uil.db")

# Workspace and file storage path
WORKSPACES_DIR = os.getenv("WORKSPACES_DIR", str(WORKSPACE_ROOT / "workspaces"))
PLUGINS_DIR = os.getenv("PLUGINS_DIR", str(BASE_DIR / "plugins"))
EXTERNAL_PLUGINS_DIR = os.getenv("EXTERNAL_PLUGINS_DIR", str(WORKSPACE_ROOT / "plugins"))

# Ensure directories exist
Path(WORKSPACES_DIR).mkdir(parents=True, exist_ok=True)
Path(PLUGINS_DIR).mkdir(parents=True, exist_ok=True)
Path(EXTERNAL_PLUGINS_DIR).mkdir(parents=True, exist_ok=True)

# AI LLM Provider settings
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "mock")  # options: 'mock', 'ollama', 'openai', 'anthropic', 'lite-llm'
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_API_BASE = os.getenv("LLM_API_BASE", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4-turbo")

# Server settings
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
