import pytest
from apps.backend.plugins.manager import plugin_manager
from apps.backend.engines.consensus import consensus_engine

def test_registered_new_plugins():
    plugins = plugin_manager.get_registered_plugins()
    plugin_ids = [p["id"] for p in plugins]
    
    assert "github" in plugin_ids
    assert "sql_analytics" in plugin_ids
    assert "web_intelligence" in plugin_ids
    assert "sys_monitor" in plugin_ids

def test_github_plugin_execution():
    res = plugin_manager.execute("github", "get_repo_info", {"repo": "vijaymahes9080/Universal-Interface-Layer"})
    assert "name" in res
    assert "stars" in res

def test_sql_analytics_plugin_execution():
    res = plugin_manager.execute("sql_analytics", "query_database", {"query": "SELECT 1;"})
    assert "rows" in res
    assert res["row_count"] >= 0

def test_web_intelligence_plugin_execution():
    res = plugin_manager.execute("web_intelligence", "extract_text", {"html": "<h1>Test Title</h1><p>Test Content</p>"})
    assert "Test Title Test Content" in res["text"]

def test_sys_monitor_plugin_execution():
    res = plugin_manager.execute("sys_monitor", "get_system_stats", {})
    assert "cpu_percent" in res
    assert "memory_percent" in res

def test_consensus_engine_evaluation():
    safe_plan = [{"id": "1", "plugin": "github", "action": "get_repo_info", "inputs": {}}]
    safe_result = consensus_engine.evaluate_plan(safe_plan)
    assert safe_result["safety_rating"] == "SAFE"
    assert safe_result["approved"] is True

    risk_plan = [{"id": "2", "plugin": "terminal", "action": "run_command", "inputs": {"command": "rm -rf /"}}]
    risk_result = consensus_engine.evaluate_plan(risk_plan)
    assert risk_result["safety_rating"] == "CRITICAL_RISK"
    assert risk_result["approved"] is False
