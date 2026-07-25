import os
import pytest
import tempfile
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from apps.backend.database import Base, Workspace, Task, get_db
from apps.backend.engines.intent import IntentEngine
from apps.backend.engines.planner import PlannerEngine
from apps.backend.engines.memory import MemoryEngine
from apps.backend.plugins.base.files import _get_sandboxed_path

# Create database engine for testing
@pytest.fixture(name="db_session")
def fixture_db_session():
    # Use in-memory SQLite for tests
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()

def test_intent_parsing():
    engine = IntentEngine()
    
    # Test exam scenario match
    res = engine.parse_intent("Prepare for my MCA exam")
    assert "Academic" in res["name"]
    assert len(res["tasks"]) > 0
    assert any(t["plugin"] == "calendar" for t in res["tasks"])
    
    # Test travel scenario match
    res_trip = engine.parse_intent("Plan trip to Paris")
    assert "Travel" in res_trip["name"]

def test_planner_dag_validation(db_session):
    planner = PlannerEngine()
    
    # Valid tasks graph structure
    plan_data = {
        "name": "Test Workflow",
        "tasks": [
            {"id": "t1", "name": "Task 1", "dependencies": []},
            {"id": "t2", "name": "Task 2", "dependencies": ["t1"]}
        ]
    }
    
    workspace = planner.create_workspace_plan(db_session, "test prompt", plan_data)
    assert workspace.id is not None
    
    tasks = db_session.query(Task).filter(Task.workspace_id == workspace.id).all()
    assert len(tasks) == 2
    
    # Cycle detection assertion
    cyclic_plan = {
        "name": "Cyclic Test",
        "tasks": [
            {"id": "t1", "name": "Task 1", "dependencies": ["t2"]},
            {"id": "t2", "name": "Task 2", "dependencies": ["t1"]}
        ]
    }
    with pytest.raises(ValueError, match="Circular dependency"):
        planner.create_workspace_plan(db_session, "test prompt", cyclic_plan)

def test_memory_similarity():
    mem = MemoryEngine()
    # Mock documents list search
    docs = [
        "Preparing study notes for DBMS algorithms and operating systems.",
        "Packing clothes and flights bookings for Europe trip details."
    ]
    
    scores = mem._cosine_similarity("DBMS study networks", docs)
    assert scores[0] > scores[1] # DBMS query should score higher on first document

def test_sandbox_path_validation():
    # Test path sandbox blocks
    with tempfile.TemporaryDirectory() as temp_dir:
        # Override workspaces dir temporarily for check
        from apps.backend import config
        original_dir = config.WORKSPACES_DIR
        config.WORKSPACES_DIR = temp_dir
        
        try:
            # Workspace ID: ws_test
            ws_id = "ws_test"
            
            # Safe path
            safe_path = _get_sandboxed_path(ws_id, "notes/syllabus.md")
            assert "ws_test" in str(safe_path)
            
            # Unsafe path should throw PermissionError
            with pytest.raises(PermissionError, match="Security violation"):
                _get_sandboxed_path(ws_id, "../../secrets.txt")
        finally:
            config.WORKSPACES_DIR = original_dir
