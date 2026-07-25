import json
import datetime
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from .config import DATABASE_URL

Base = declarative_base()

# Helper link for workspace to other elements if needed
class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    prompt = Column(Text, nullable=True)
    status = Column(String(20), default="idle")  # idle, planning, executing, completed, failed, waiting_approval
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    tasks = relationship("Task", back_populates="workspace", cascade="all, delete-orphan")
    memories = relationship("Memory", back_populates="workspace", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(50), primary_key=True)
    workspace_id = Column(String(50), ForeignKey("workspaces.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    plugin = Column(String(50), nullable=True)
    action = Column(String(50), nullable=True)
    inputs = Column(Text, default="{}")        # JSON string of inputs
    outputs = Column(Text, default="{}")       # JSON string of outputs
    status = Column(String(25), default="pending")  # pending, executing, completed, failed, skipped, waiting_approval
    error_message = Column(Text, nullable=True)
    dependencies = Column(Text, default="[]")   # JSON list of task IDs
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    workspace = relationship("Workspace", back_populates="tasks")

class Plugin(Base):
    __tablename__ = "plugins"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    version = Column(String(20), default="1.0.0")
    manifest = Column(Text, default="{}")      # Full JSON manifest metadata
    enabled = Column(Boolean, default=True)
    config = Column(Text, default="{}")        # Config values, token/keys
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Memory(Base):
    __tablename__ = "memories"

    id = Column(String(50), primary_key=True)
    content = Column(Text, nullable=False)
    embedding_index = Column(Integer, nullable=True)  # References vector position if needed
    workspace_id = Column(String(50), ForeignKey("workspaces.id"), nullable=True)
    scope = Column(String(20), default="global")     # global, workspace
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    workspace = relationship("Workspace", back_populates="memories")

class GraphNode(Base):
    __tablename__ = "graph_nodes"

    id = Column(String(100), primary_key=True)
    label = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)        # workspace, task, person, document, concept, email, event
    properties = Column(Text, default="{}")          # JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class GraphEdge(Base):
    __tablename__ = "graph_edges"

    id = Column(String(100), primary_key=True)
    source_id = Column(String(100), nullable=False)
    target_id = Column(String(100), nullable=False)
    relation = Column(String(50), nullable=False)     # contains, triggers, author, mentions, related_to
    properties = Column(Text, default="{}")          # JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    trigger_type = Column(String(50), nullable=False) # schedule, file_change, webhook, email_received
    trigger_config = Column(Text, default="{}")       # JSON string (cron or match criteria)
    task_graph_template = Column(Text, default="[]")  # JSON string of tasks structure to instantiate
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    level = Column(String(20), default="INFO")       # INFO, WARNING, ERROR, AUDIT
    component = Column(String(50), nullable=False)   # Planner, Executor, PluginRunner, API
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    status = Column(String(20), default="success")

# DB Initializer
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Load default plugin mocks if missing
        pass
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
