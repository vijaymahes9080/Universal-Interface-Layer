import uuid
from typing import Dict, Any, List

# Simulating an in-memory calendar server database for local session
_calendar_events: List[Dict[str, Any]] = [
    {
        "id": "cal_evt_1",
        "title": "Welcome to Universal Interface Layer introduction",
        "start_time": "2026-07-03T11:00:00",
        "duration_minutes": 45,
        "description": "System demo of intent router and graph visualizers."
    }
]

def handle_create_event(inputs: Dict[str, Any]) -> Dict[str, Any]:
    title = inputs.get("title")
    start_time = inputs.get("start_time")
    duration = inputs.get("duration_minutes", 60)
    description = inputs.get("description", "")

    if not title or not start_time:
        raise ValueError("title and start_time are required parameters for calendar events.")

    event = {
        "id": f"cal_evt_{uuid.uuid4().hex[:8]}",
        "title": title,
        "start_time": start_time,
        "duration_minutes": duration,
        "description": description
    }
    
    _calendar_events.append(event)
    return {"event": event, "success": True}

def handle_list_events(inputs: Dict[str, Any]) -> Dict[str, Any]:
    return {"events": _calendar_events}
