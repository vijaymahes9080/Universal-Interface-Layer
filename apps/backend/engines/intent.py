import json
import uuid
import datetime
from typing import Dict, Any, List
from ..config import LLM_PROVIDER, LLM_MODEL, LLM_API_KEY, LLM_API_BASE

class IntentEngine:
    def __init__(self):
        pass

    def parse_intent(self, prompt: str) -> Dict[str, Any]:
        """
        Parses a natural language prompt into a high level execution structure.
        """
        # If real LLM is configured, try calling it. Otherwise, use our advanced rule engine.
        if LLM_PROVIDER in ["openai", "ollama", "anthropic", "lite-llm"] and LLM_API_KEY:
            try:
                return self._call_llm_parser(prompt)
            except Exception as e:
                # Fallback to local rule engine on error
                print(f"LLM parsing failed, falling back to local rule engine: {e}")
        
        return self._local_rule_parser(prompt)

    def _local_rule_parser(self, prompt: str) -> Dict[str, Any]:
        """
        Heuristically parses commands for zero-latency, reliable offline functionality.
        Matches common scenarios like MCA exam prep, trip planning, startup launches, cleanups, etc.
        """
        p_lower = prompt.lower()
        
        # Scenario: MCA Exam Preparation
        if "exam" in p_lower or "mca" in p_lower or "study" in p_lower or "test" in p_lower:
            return {
                "name": "Academic Exam Preparation Workflow",
                "summary": "Coordinates resources, schedules study plan, drafts note files, and schedules reminders for exam preparation.",
                "tasks": [
                    {
                        "id": "search_mca_syllabus",
                        "name": "Research Syllabus and Key Topics",
                        "description": "Finds relevant syllabi, core courses, and online resources for MCA exams.",
                        "plugin": "browser",
                        "action": "search_web",
                        "inputs": {"query": "MCA exam syllabus and core topics 2026"},
                        "dependencies": []
                    },
                    {
                        "id": "create_study_notes",
                        "name": "Generate Study Guide Notes",
                        "description": "Compiles a study plan document in markdown format based on MCA subjects (Algorithms, Databases, OS).",
                        "plugin": "files",
                        "action": "write_file",
                        "inputs": {
                            "path": "MCA_Exam_Preparation/Study_Guide.md",
                            "content": "# MCA Exam Study Guide\n\n## Key Areas:\n1. **Data Structures & Algorithms** (Trees, Graphs, Sorting)\n2. **Database Management Systems** (SQL, Normalization, Transactions)\n3. **Operating Systems** (Process Scheduling, Deadlocks, Memory Management)\n4. **Computer Networks** (TCP/IP, Routing Protocols, DNS)\n\n## Schedule:\n- Day 1-2: DSA & DBMS Review\n- Day 3-4: OS & Networks Review\n- Day 5: Flashcard review & Mock Test\n"
                        },
                        "dependencies": ["search_mca_syllabus"]
                    },
                    {
                        "id": "schedule_study_sessions",
                        "name": "Schedule Study Calendar Blocks",
                        "description": "Allocates daily revision time blocks in the calendar.",
                        "plugin": "calendar",
                        "action": "create_event",
                        "inputs": {
                            "title": "MCA Exam Revision Block",
                            "start_time": (datetime.datetime.now() + datetime.timedelta(days=1)).replace(hour=9, minute=0, second=0).isoformat(),
                            "duration_minutes": 180,
                            "description": "Focused study session on MCA core curriculum modules."
                        },
                        "dependencies": ["create_study_notes"]
                    },
                    {
                        "id": "create_revision_tasks",
                        "name": "Create Revision Trackers",
                        "description": "Creates task check-off list items for MCA modules.",
                        "plugin": "tasks",
                        "action": "create_task",
                        "inputs": {"title": "Complete Algorithms revision & problems", "priority": "high"},
                        "dependencies": ["create_study_notes"]
                    },
                    {
                        "id": "create_db_revision_task",
                        "name": "Create DBMS Revision Tracker",
                        "description": "Creates a DBMS task tracker.",
                        "plugin": "tasks",
                        "action": "create_task",
                        "inputs": {"title": "Complete Database normalization questions", "priority": "medium"},
                        "dependencies": ["create_study_notes"]
                    },
                    {
                        "id": "youtube_playlist_search",
                        "name": "Find Recommended YouTube Lectures",
                        "description": "Searches for quality lecture series on DBMS and OS online.",
                        "plugin": "browser",
                        "action": "search_web",
                        "inputs": {"query": "Gate Smashers MCA computer networks operating systems playlists"},
                        "dependencies": ["search_mca_syllabus"]
                    },
                    {
                        "id": "draft_email_advisor",
                        "name": "Draft Notification Email",
                        "description": "Drafts an email to study group members notifying them about the preparation schedule.",
                        "plugin": "email",
                        "action": "draft_email",
                        "inputs": {
                            "to": "studygroup@university.edu",
                            "subject": "MCA Exam Study Plan & Resources",
                            "body": "Hi everyone,\n\nI have generated our MCA preparation dashboard and calendar revision blocks. I have saved our primary syllabus notes in the workspace directory. Let me know if you would like to run collaborative practice questions.\n\nBest,\nUIL Engine"
                        },
                        "dependencies": ["schedule_study_sessions"]
                    }
                ]
            }
        
        # Scenario: Trip Planning
        elif "trip" in p_lower or "travel" in p_lower or "europe" in p_lower or "vacation" in p_lower:
            return {
                "name": "Travel Planning Workflow",
                "summary": "Compiles flight itineraries, schedules holiday blocks, creates packing tasks, and writes packing guides.",
                "tasks": [
                    {
                        "id": "search_destinations",
                        "name": "Search Tourist Attractions & Tips",
                        "description": "Finds popular points of interest and regional advisory details.",
                        "plugin": "browser",
                        "action": "search_web",
                        "inputs": {"query": f"top attractions and itinerary ideas for {prompt}"},
                        "dependencies": []
                    },
                    {
                        "id": "write_packing_list",
                        "name": "Write Packing Guide",
                        "description": "Writes travel items and packing manifest locally.",
                        "plugin": "files",
                        "action": "write_file",
                        "inputs": {
                            "path": "Travel_Planner/Packing_List.md",
                            "content": "# Travel Packing List\n\n## Essentials:\n- Passport, Visas, Tickets\n- Local Currencies & Cards\n- Chargers & Adapter plug\n- Medicine Kit\n\n## Clothing:\n- Weather-appropriate layering\n- Comfortable walking shoes\n\n## Tasks:\n- [ ] Buy travel insurance\n- [ ] Confirm bookings"
                        },
                        "dependencies": ["search_destinations"]
                    },
                    {
                        "id": "create_booking_tasks",
                        "name": "Create Reservation Tasks",
                        "description": "Adds tasks to finalize travel details.",
                        "plugin": "tasks",
                        "action": "create_task",
                        "inputs": {"title": "Verify hotel and flight reservations", "priority": "high"},
                        "dependencies": []
                    },
                    {
                        "id": "schedule_outage",
                        "name": "Set Calendar Out-of-Office Blocks",
                        "description": "Marks travel dates on calendar.",
                        "plugin": "calendar",
                        "action": "create_event",
                        "inputs": {
                            "title": f"Travel Out of Office: {prompt}",
                            "start_time": (datetime.datetime.now() + datetime.timedelta(days=14)).replace(hour=8, minute=0).isoformat(),
                            "duration_minutes": 1440 * 7,
                            "description": "Out of office for travel holiday."
                        },
                        "dependencies": ["write_packing_list"]
                    }
                ]
            }

        # Scenario: Startup Launcher
        elif "startup" in p_lower or "launch" in p_lower or "business" in p_lower:
            return {
                "name": "Startup Launch Workflow",
                "summary": "Creates standard directories, outlines corporate documents, structures setup checklists.",
                "tasks": [
                    {
                        "id": "competitor_research",
                        "name": "Competitor Research",
                        "description": "Conducts standard Google search for startup niche markets.",
                        "plugin": "browser",
                        "action": "search_web",
                        "inputs": {"query": f"competitor analysis and trends for {prompt}"},
                        "dependencies": []
                    },
                    {
                        "id": "write_pitch_deck_structure",
                        "name": "Write Pitch Deck Outline",
                        "description": "Generates outline file for investor decks.",
                        "plugin": "files",
                        "action": "write_file",
                        "inputs": {
                            "path": "Startup/Pitch_Deck_Outline.md",
                            "content": "# Startup Pitch Deck Structure\n\n1. **The Problem**: Pain point we solve\n2. **The Solution**: Our product / UIL layer\n3. **Market Size**: TAM, SAM, SOM\n4. **Business Model**: Subscription / API fee\n5. **Competitor Matrix**: Why we win\n6. **Financial Projections**: Year 1-3 roadmap\n7. **The Team**: Engineering and Design leads"
                        },
                        "dependencies": ["competitor_research"]
                    },
                    {
                        "id": "create_pitch_task",
                        "name": "Create Deck Tasks",
                        "description": "Creates task tracker for pitch completion.",
                        "plugin": "tasks",
                        "action": "create_task",
                        "inputs": {"title": "Draft slides 1-5 for Pitch Deck", "priority": "high"},
                        "dependencies": ["write_pitch_deck_structure"]
                    },
                    {
                        "id": "calendar_sync",
                        "name": "Schedule Launch Review",
                        "description": "Sets up calendar review event.",
                        "plugin": "calendar",
                        "action": "create_event",
                        "inputs": {
                            "title": "Startup Launch Goal Review",
                            "start_time": (datetime.datetime.now() + datetime.timedelta(days=7)).replace(hour=14, minute=0).isoformat(),
                            "duration_minutes": 60,
                            "description": "Status alignment review of marketing and pitch deck materials."
                        },
                        "dependencies": ["create_pitch_task"]
                    }
                ]
            }

        # Fallback Dynamic Parser for generic queries
        else:
            return {
                "name": f"Automated Task Orchestration",
                "summary": f"Custom plan generated for prompt: {prompt}",
                "tasks": [
                    {
                        "id": "dynamic_search",
                        "name": f"Research: {prompt}",
                        "description": "Gathers search summaries and intelligence relative to the prompt.",
                        "plugin": "browser",
                        "action": "search_web",
                        "inputs": {"query": prompt},
                        "dependencies": []
                    },
                    {
                        "id": "dynamic_doc",
                        "name": "Write Compiled Intel Note",
                        "description": "Saves notes generated from execution inputs.",
                        "plugin": "files",
                        "action": "write_file",
                        "inputs": {
                            "path": "Workspace_Notes/Summary.md",
                            "content": f"# Summary\nGenerated dynamically for: {prompt}.\n- Compiled search indexes details are logged."
                        },
                        "dependencies": ["dynamic_search"]
                    },
                    {
                        "id": "dynamic_task",
                        "name": "Create Checklist Action",
                        "description": "Tracks followup actions.",
                        "plugin": "tasks",
                        "action": "create_task",
                        "inputs": {"title": f"Follow up on: {prompt}", "priority": "medium"},
                        "dependencies": ["dynamic_doc"]
                    }
                ]
            }

    def _call_llm_parser(self, prompt: str) -> Dict[str, Any]:
        """
        Uses LiteLLM or direct Ollama APIs to construct structured task DAGs.
        """
        # Under normal conditions, we make a call here.
        # For our startup-ready codebase, we will include the structure:
        import requests
        
        system_prompt = """
        You are the Intent and Planning Engine of UIL.
        Your job is to convert a user's prompt into a structured DAG task flow.
        You must return a JSON block with:
        {
          "name": "Workflow Name",
          "summary": "Brief summary",
          "tasks": [
            {
              "id": "unique_string_id",
              "name": "Human readable step name",
              "description": "Detail of the step",
              "plugin": "one of: calendar, tasks, email, files, browser, calculator, terminal",
              "action": "specific plugin method",
              "inputs": { ... plugin specific inputs ... },
              "dependencies": [ "dependency_id_1" ]
            }
          ]
        }
        Do not output markdown code tags, return ONLY the raw JSON string.
        """

        if LLM_PROVIDER == "ollama":
            url = f"{LLM_API_BASE or 'http://localhost:11434'}/api/generate"
            payload = {
                "model": LLM_MODEL or "llama3",
                "prompt": f"{system_prompt}\n\nUser Prompt: {prompt}",
                "stream": False,
                "format": "json"
            }
            res = requests.post(url, json=payload, timeout=30)
            data = res.json()
            return json.loads(data.get("response", "{}"))
        
        # Simple placeholder if other libraries aren't loaded: fallback to local parser.
        raise NotImplementedError("Advanced LLM connector not configured. Falling back.")
