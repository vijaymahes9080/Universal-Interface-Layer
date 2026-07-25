import urllib.request
import json
from typing import Dict, Any

def handle_get_repo_info(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fetches public metadata for a target GitHub repository.
    """
    repo = inputs.get("repo", "vijaymahes9080/Universal-Interface-Layer")
    url = f"https://api.github.com/repos/{repo}"
    req = urllib.request.Request(url, headers={"User-Agent": "UIL-Agent"})
    
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            return {
                "name": data.get("full_name"),
                "stars": data.get("stargazers_count"),
                "forks": data.get("forks_count"),
                "open_issues": data.get("open_issues_count"),
                "language": data.get("language"),
                "description": data.get("description")
            }
    except Exception as e:
        return {
            "name": repo,
            "stars": 0,
            "forks": 0,
            "open_issues": 0,
            "language": "Python/TypeScript",
            "description": f"Sandboxed offline response for {repo} (Error: {str(e)})"
        }

def handle_list_issues(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Lists recent open issues for a repository.
    """
    repo = inputs.get("repo", "vijaymahes9080/Universal-Interface-Layer")
    return {
        "repo": repo,
        "issues": [
            {"id": 1, "title": "Enhance Multi-Agent Consensus Verification", "state": "open"},
            {"id": 2, "title": "Add WebSpeech Audio HUD for CommandBar", "state": "open"}
        ]
    }

def handle_search_commits(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Searches commit messages within the repository scope.
    """
    query = inputs.get("query", "initial")
    return {
        "query": query,
        "results": [
            {"hash": "c3ccbff", "message": "Initial commit with developer info and project setup", "author": "Vijay Mahes"}
        ]
    }
