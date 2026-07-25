import json
import re
from typing import Dict, Any, List
from ..database import SessionLocal, GraphNode, GraphEdge

class GraphEngine:
    def __init__(self):
        pass

    def register_task_in_graph(self, task_id: str, name: str, plugin: str, action: str, workspace_id: str, outputs: Any):
        """
        Populates nodes and edges based on task execution details.
        """
        db = SessionLocal()
        try:
            # 1. Ensure Workspace Node exists
            ws_node_id = f"node_ws_{workspace_id}"
            ws_node = db.query(GraphNode).filter(GraphNode.id == ws_node_id).first()
            if not ws_node:
                ws_node = GraphNode(
                    id=ws_node_id,
                    label=f"Workspace: {workspace_id}",
                    type="workspace",
                    properties=json.dumps({"id": workspace_id})
                )
                db.add(ws_node)

            # 2. Create Task Node
            task_node_id = f"node_task_{task_id}"
            task_node = db.query(GraphNode).filter(GraphNode.id == task_node_id).first()
            if not task_node:
                task_node = GraphNode(
                    id=task_node_id,
                    label=name,
                    type="task",
                    properties=json.dumps({
                        "id": task_id,
                        "plugin": plugin,
                        "action": action,
                        "status": "completed"
                    })
                )
                db.add(task_node)

            db.commit()

            # 3. Connect Workspace to Task
            self._ensure_edge(db, ws_node_id, task_node_id, "contains")

            # 4. Extract Entities from inputs/outputs
            # Check for files
            if plugin == "files" and action == "write_file":
                file_path = ""
                if isinstance(outputs, dict):
                    file_path = outputs.get("path", "")
                
                if file_path:
                    file_node_id = f"node_file_{hash(file_path)}"
                    file_node = GraphNode(
                        id=file_node_id,
                        label=file_path.split("/")[-1],
                        type="document",
                        properties=json.dumps({"path": file_path, "type": "markdown"})
                    )
                    db.add(file_node)
                    db.commit()
                    self._ensure_edge(db, task_node_id, file_node_id, "contains")
                    self._ensure_edge(db, ws_node_id, file_node_id, "contains")

            # Check for email contacts
            if plugin == "email":
                if isinstance(outputs, dict) and "to" in outputs:
                    email_to = outputs["to"]
                    email_node_id = f"node_person_{email_to}"
                    email_node = db.query(GraphNode).filter(GraphNode.id == email_node_id).first()
                    if not email_node:
                        email_node = GraphNode(
                            id=email_node_id,
                            label=email_to,
                            type="person",
                            properties=json.dumps({"email": email_to})
                        )
                        db.add(email_node)
                        db.commit()
                    
                    self._ensure_edge(db, task_node_id, email_node_id, "mentions")

            # Check for calendar events
            if plugin == "calendar" and action == "create_event":
                event_node_id = f"node_event_{task_id}"
                event_node = GraphNode(
                    id=event_node_id,
                    label="Calendar Event",
                    type="event",
                    properties=json.dumps(outputs if isinstance(outputs, dict) else {})
                )
                db.add(event_node)
                db.commit()
                self._ensure_edge(db, task_node_id, event_node_id, "triggers")
                self._ensure_edge(db, ws_node_id, event_node_id, "contains")

            # Concept Extraction from task outputs or inputs via Regex
            content_str = str(outputs) + " " + name
            concepts = re.findall(r'\b(MCA|Database|Algorithms|Startup|Marketing|Syllabus|Study)\b', content_str, re.IGNORECASE)
            for concept in set(concepts):
                concept_lower = concept.lower()
                concept_node_id = f"node_concept_{concept_lower}"
                concept_node = db.query(GraphNode).filter(GraphNode.id == concept_node_id).first()
                if not concept_node:
                    concept_node = GraphNode(
                        id=concept_node_id,
                        label=concept.capitalize(),
                        type="concept",
                        properties=json.dumps({"name": concept})
                    )
                    db.add(concept_node)
                    db.commit()
                self._ensure_edge(db, task_node_id, concept_node_id, "related_to")

        except Exception as e:
            db.rollback()
            print(f"Error updating knowledge graph: {e}")
        finally:
            db.close()

    def _ensure_edge(self, db, source: str, target: str, relation: str):
        edge_id = f"edge_{source}_{target}_{relation}"
        edge = db.query(GraphEdge).filter(GraphEdge.id == edge_id).first()
        if not edge:
            edge = GraphEdge(
                id=edge_id,
                source_id=source,
                target_id=target,
                relation=relation,
                properties="{}"
            )
            db.add(edge)
            db.commit()
