import json
import asyncio
import traceback
from typing import Dict, Any, List, Set, Callable
from sqlalchemy.orm import Session
from ..database import Workspace, Task, AuditLog, get_db, SessionLocal
from ..plugins.manager import plugin_manager
from .graph import GraphEngine

class ExecutionEventDispatcher:
    """
    Central repository for WebSocket channels or log callbacks to receive real-time execution updates.
    """
    def __init__(self):
        self.listeners: Set[Callable[[Dict[str, Any]], Any]] = set()

    def register(self, listener: Callable[[Dict[str, Any]], Any]):
        self.listeners.add(listener)

    def unregister(self, listener: Callable[[Dict[str, Any]], Any]):
        self.listeners.discard(listener)

    async def broadcast(self, data: Dict[str, Any]):
        for listener in self.listeners:
            try:
                if asyncio.iscoroutinefunction(listener):
                    await listener(data)
                else:
                    listener(data)
            except Exception as e:
                print(f"Error dispatching execution update: {e}")

event_dispatcher = ExecutionEventDispatcher()

class ExecutorEngine:
    def __init__(self):
        self.graph_engine = GraphEngine()

    async def execute_workspace(self, workspace_id: str):
        """
        Runs the main loop for executing a workspace task DAG.
        This loops continuously, identifies tasks that are ready to run,
        runs them (concurrently if they have no mutual dependencies),
        and handles approval halts.
        """
        db = SessionLocal()
        try:
            workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
            if not workspace:
                return

            workspace.status = "executing"
            db.commit()
            
            await event_dispatcher.broadcast({
                "type": "workspace_update",
                "workspace_id": workspace_id,
                "status": "executing",
                "message": f"Starting execution of workflow: {workspace.name}"
            })

            while True:
                # Reload tasks
                tasks = db.query(Task).filter(Task.workspace_id == workspace_id).all()
                
                # Check status totals
                all_done = True
                has_failed = False
                waiting_approval_id = None
                
                # We need to find runnable tasks
                completed_task_ids = {t.id for t in tasks if t.status == "completed" or t.status == "skipped"}
                runnable_tasks: List[Task] = []

                for t in tasks:
                    if t.status in ["pending", "failed"] and t.retry_count < 3:
                        deps = json.loads(t.dependencies)
                        # A task is runnable if all its dependencies are in completed_task_ids
                        if all(dep in completed_task_ids for dep in deps):
                            runnable_tasks.append(t)
                            all_done = False
                    elif t.status == "waiting_approval":
                        waiting_approval_id = t.id
                        all_done = False
                    elif t.status == "failed" and t.retry_count >= 3:
                        has_failed = True
                    elif t.status in ["executing"]:
                        all_done = False

                if waiting_approval_id:
                    # Halt execution and wait for user approval
                    workspace.status = "waiting_approval"
                    db.commit()
                    await event_dispatcher.broadcast({
                        "type": "workspace_update",
                        "workspace_id": workspace_id,
                        "status": "waiting_approval",
                        "message": f"Execution halted. Task {waiting_approval_id} requires user approval."
                    })
                    break

                if all_done:
                    workspace.status = "failed" if has_failed else "completed"
                    db.commit()
                    await event_dispatcher.broadcast({
                        "type": "workspace_update",
                        "workspace_id": workspace_id,
                        "status": workspace.status,
                        "message": f"Execution finished with status: {workspace.status}"
                    })
                    break

                if not runnable_tasks:
                    # If we aren't done, but there are no runnable tasks and none are executing,
                    # there might be a cycle or a block
                    executing_count = db.query(Task).filter(Task.workspace_id == workspace_id, Task.status == "executing").count()
                    if executing_count == 0:
                        workspace.status = "failed"
                        db.commit()
                        await event_dispatcher.broadcast({
                            "type": "workspace_update",
                            "workspace_id": workspace_id,
                            "status": "failed",
                            "message": "Deadlock or loop block detected. No runnable tasks remaining."
                        })
                        break
                    # Wait briefly for running tasks to complete
                    await asyncio.sleep(0.5)
                    continue

                # Run runnable tasks concurrently
                await asyncio.gather(*(self.run_task(db, t) for t in runnable_tasks))

        except Exception as e:
            db.rollback()
            print(f"Error in workspace executor: {e}")
            traceback.print_exc()
        finally:
            db.close()

    async def run_task(self, db: Session, task: Task):
        """
        Executes a single task, invokes its plugin, updates state, and broadcasts logs.
        """
        task.status = "executing"
        db.commit()
        
        await event_dispatcher.broadcast({
            "type": "task_update",
            "task_id": task.id,
            "status": "executing",
            "message": f"Starting step: {task.name}"
        })

        # Insert audit log
        log_entry = AuditLog(
            component="Executor",
            action="Run Task",
            details=f"Task ID: {task.id}, Plugin: {task.plugin}, Action: {task.action}"
        )
        db.add(log_entry)
        db.commit()

        # Approval Check: certain plugins/actions require safety gate
        # Let's say drafting an email or running terminal commands requires approval
        if (task.plugin == "email" and task.action == "send_email") or \
           (task.plugin == "terminal" and task.action == "run_command" and "rm" in task.inputs.lower()):
            task.status = "waiting_approval"
            db.commit()
            await event_dispatcher.broadcast({
                "type": "task_update",
                "task_id": task.id,
                "status": "waiting_approval",
                "message": f"Safety Warning: Action '{task.action}' requires user approval."
            })
            return

        try:
            # Prepare inputs
            inputs = json.loads(task.inputs)
            
            # Append context to inputs if useful
            inputs["workspace_id"] = task.workspace_id

            # Execute plugin
            # Running synchronous plugins in separate executor thread
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, 
                plugin_manager.execute, 
                task.plugin, 
                task.action, 
                inputs
            )

            # Mark task complete
            task.status = "completed"
            task.outputs = json.dumps(result)
            task.error_message = None
            db.commit()

            # Record in Knowledge Graph
            self.graph_engine.register_task_in_graph(
                task_id=task.id,
                name=task.name,
                plugin=task.plugin,
                action=task.action,
                workspace_id=task.workspace_id,
                outputs=result
            )

            await event_dispatcher.broadcast({
                "type": "task_update",
                "task_id": task.id,
                "status": "completed",
                "outputs": result,
                "message": f"Completed step: {task.name} successfully."
            })

        except Exception as e:
            task.retry_count += 1
            task.status = "failed" if task.retry_count >= 3 else "pending"
            task.error_message = str(e)
            db.commit()

            await event_dispatcher.broadcast({
                "type": "task_update",
                "task_id": task.id,
                "status": task.status,
                "message": f"Failed step: {task.name}. Error: {e} (Retry {task.retry_count}/3)"
            })
            
            log_entry.status = "failed"
            log_entry.details += f"\nError: {e}\n{traceback.format_exc()}"
            db.commit()

    def approve_task(self, db: Session, task_id: str):
        """
        Triggers execution resume for a task blocked at an approval node.
        """
        task = db.query(Task).filter(Task.id == task_id).first()
        if task and task.status == "waiting_approval":
            task.status = "pending" # will be picked up by workspace loop
            # Overwrite inputs/actions if user modified it in approval step, e.g. bypassed checks
            db.commit()
            
            # Restart workspace runner
            asyncio.create_task(self.execute_workspace(task.workspace_id))
