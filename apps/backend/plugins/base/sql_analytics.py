import sqlite3
import os
from typing import Dict, Any
from ...config import WORKSPACES_DIR

def _get_db_connection(db_name: str = "uil_analytics.db"):
    db_path = os.path.join(WORKSPACES_DIR, db_name)
    conn = sqlite3.connect(db_path)
    return conn, db_path

def handle_query_database(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes a read-only SQL query on a SQLite database file.
    """
    query = inputs.get("query", "SELECT 1;")
    db_name = inputs.get("db_name", "uil_analytics.db")

    # Security check: enforcing read-only SELECT queries
    trimmed_query = query.strip().upper()
    if not trimmed_query.startswith("SELECT") and not trimmed_query.startswith("PRAGMA") and not trimmed_query.startswith("EXPLAIN"):
        raise ValueError("Security Policy Violation: Only read-only SELECT/PRAGMA queries are allowed.")

    try:
        conn, db_path = _get_db_connection(db_name)
        cursor = conn.cursor()
        cursor.execute(query)
        columns = [description[0] for description in cursor.description] if cursor.description else []
        rows = cursor.fetchall()
        conn.close()

        return {
            "query": query,
            "columns": columns,
            "rows": rows[:100],  # cap at 100 rows
            "row_count": len(rows)
        }
    except Exception as e:
        return {
            "query": query,
            "error": str(e),
            "columns": [],
            "rows": [],
            "row_count": 0
        }

def handle_describe_schema(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Reflects and returns database tables and schema structures.
    """
    db_name = inputs.get("db_name", "uil_analytics.db")
    try:
        conn, _ = _get_db_connection(db_name)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        schema = {}
        for table in tables:
            cursor.execute(f"PRAGMA table_info({table});")
            schema[table] = [row[1] for row in cursor.fetchall()]
            
        conn.close()
        return {"database": db_name, "tables": tables, "schema": schema}
    except Exception as e:
        return {"database": db_name, "tables": [], "schema": {}, "error": str(e)}
