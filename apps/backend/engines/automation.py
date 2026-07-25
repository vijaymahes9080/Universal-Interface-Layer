import time
import json
import uuid
import datetime
import threading
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..database import SessionLocal, AutomationRule, Workspace, Task, AuditLog
from .planner import PlannerEngine
from .executor import ExecutorEngine

class AutomationEngine:
    def __init__(self):
        self._running = False
        self._thread = None
        self.planner = PlannerEngine()
        # Lazily fetch executor to avoid import loops

    def start(self):
        """
        Starts the background scheduler thread.
        """
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._scheduler_loop, daemon=True)
        self._thread.start()
        print("Automation scheduler started.")

    def stop(self):
        self._running = False
        if self._thread:
            self._thread.join(timeout=2)
            print("Automation scheduler stopped.")

    def trigger_event(self, event_type: str, payload: Dict[str, Any]):
        """
        Handles event-based triggers (e.g. file_change, webhook).
        """
        db = SessionLocal()
        try:
            rules = db.query(AutomationRule).filter(
                AutomationRule.enabled == True, 
                AutomationRule.trigger_type == event_type
            ).all()

            for rule in rules:
                self._instantiate_rule(db, rule, f"Triggered by event '{event_type}'")
        finally:
            db.close()

    def _scheduler_loop(self):
        """
        Main loop checking for periodic schedules (e.g., cron checks or daily logs).
        """
        while self._running:
            db = SessionLocal()
            try:
                # Get scheduled rules
                rules = db.query(AutomationRule).filter(
                    AutomationRule.enabled == True, 
                    AutomationRule.trigger_type == "schedule"
                ).all()

                for rule in rules:
                    # Basic cron/interval match simulation
                    # For demonstration, we track last trigger or check if it matches target schedule
                    config = json.loads(rule.trigger_config)
                    interval = config.get("interval_seconds", 3600)
                    last_run_str = config.get("last_run", "")
                    
                    should_run = False
                    now = datetime.datetime.now()
                    
                    if not last_run_str:
                        should_run = True
                    else:
                        last_run = datetime.datetime.fromisoformat(last_run_str)
                        if (now - last_run).total_seconds() >= interval:
                            should_run = True

                    if should_run:
                        # Update last run timestamp in config
                        config["last_run"] = now.isoformat()
                        rule.trigger_config = json.dumps(config)
                        db.commit()

                        # Run it!
                        self._instantiate_rule(db, rule, "Triggered by scheduler clock")

            except Exception as e:
                print(f"Error in automation scheduler loop: {e}")
            finally:
                db.close()
            time.sleep(10) # check every 10 seconds

    def _instantiate_rule(self, db: Session, rule: AutomationRule, trigger_source: str):
        """
        Converts the rule's task graph template into a live Workspace and tasks.
        """
        try:
            template_tasks = json.loads(rule.task_graph_template)
            plan_data = {
                "name": f"Automation: {rule.name}",
                "summary": rule.description or "Automated execution flow",
                "tasks": template_tasks
            }
            
            # Create workspace from planner
            workspace = self.planner.create_workspace_plan(db, f"Triggered automatically: {trigger_source}", plan_data)
            
            # Log audit trail
            log = AuditLog(
                component="AutomationEngine",
                action="Trigger Rule",
                details=f"Rule ID: {rule.id}, Workspace ID: {workspace.id}",
                status="success"
            )
            db.add(log)
            db.commit()

            # Execute
            from .executor import ExecutorEngine
            executor = ExecutorEngine()
            
            # Run execution task in async loop
            import asyncio
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(executor.execute_workspace(workspace.id))
            except RuntimeError:
                # No running loop, run in new one
                asyncio.run(executor.execute_workspace(workspace.id))

        except Exception as e:
            print(f"Failed to instantiate automation rule {rule.id}: {e}")

automation_engine = AutomationEngine()
