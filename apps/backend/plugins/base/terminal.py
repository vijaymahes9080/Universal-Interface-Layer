import subprocess
import shlex
from typing import Dict, Any

ALLOWED_COMMAND_PREFIXES = ["git", "python", "pip", "node", "npm", "echo", "dir", "ls", "whoami"]
BLOCKED_COMMANDS = ["rm", "del", "format", "shutdown", "wget", "curl", "poweroff"]

def handle_run_command(inputs: Dict[str, Any]) -> Dict[str, Any]:
    raw_command = inputs.get("command", "")
    if not raw_command:
        raise ValueError("command parameter is required.")

    # 1. Enforce sandbox whitelist checks
    parts = shlex.split(raw_command.strip())
    if not parts:
        raise ValueError("Invalid command string.")

    base_cmd = parts[0].lower()
    
    # Check block list
    if base_cmd in BLOCKED_COMMANDS or any(blk in raw_command for blk in BLOCKED_COMMANDS):
        raise PermissionError(f"Security Sandbox: Command '{raw_command}' is blocked for security reasons.")

    # Check allowed list
    if base_cmd not in ALLOWED_COMMAND_PREFIXES:
        raise PermissionError(f"Security Sandbox: Command prefix '{base_cmd}' is not in the whitelist ({', '.join(ALLOWED_COMMAND_PREFIXES)}).")

    # 2. Run the command safely under subprocess
    try:
        # Run command with a timeout of 10s to prevent hanging
        res = subprocess.run(
            raw_command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        return {
            "stdout": res.stdout,
            "stderr": res.stderr,
            "code": res.returncode,
            "success": res.returncode == 0
        }
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "Command execution timed out after 10 seconds.",
            "code": -1,
            "success": False
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": f"Subprocess error: {str(e)}",
            "code": -1,
            "success": False
        }
