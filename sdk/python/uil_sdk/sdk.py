import json
import inspect
from typing import Dict, Any, Callable, List

class UILPlugin:
    def __init__(self, name: str, description: str, version: str = "1.0.0"):
        self.name = name
        self.description = description
        self.version = version
        self.commands: Dict[str, Dict[str, Any]] = {}
        self.handlers: Dict[str, Callable] = {}

    def command(self, name: str, description: str = ""):
        """
        Decorator to register a function as a plugin command.
        """
        def decorator(func: Callable):
            cmd_name = name or func.__name__
            sig = inspect.signature(func)
            
            inputs = []
            for param_name, param in sig.parameters.items():
                if param_name == "self":
                    continue
                inputs.append(param_name)

            self.commands[cmd_name] = {
                "description": description or func.__doc__ or "",
                "inputs": inputs
            }
            self.handlers[cmd_name] = func
            return func
        return decorator

    def generate_manifest(self) -> Dict[str, Any]:
        """
        Produces the UIL Plugin manifest format.
        """
        return {
            "name": self.name,
            "description": self.description,
            "version": self.version,
            "commands": self.commands
        }

    def execute(self, command_name: str, inputs: Dict[str, Any]) -> Any:
        """
        Invokes the target command handler.
        """
        if command_name not in self.handlers:
            raise KeyError(f"Command '{command_name}' is not registered on this plugin.")
        
        handler = self.handlers[command_name]
        sig = inspect.signature(handler)
        
        # Prepare execution args matching function signature
        kwargs = {}
        for param in sig.parameters:
            if param in inputs:
                kwargs[param] = inputs[param]
            elif sig.parameters[param].default is not inspect.Parameter.empty:
                kwargs[param] = sig.parameters[param].default
            else:
                raise ValueError(f"Missing required parameter '{param}' for command '{command_name}'.")

        return handler(**kwargs)

    def write_manifest_file(self, output_path: str):
        """
        Saves the manifest.json file to the specified location.
        """
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(self.generate_manifest(), f, indent=2)
        print(f"Generated UIL plugin manifest at {output_path}")
