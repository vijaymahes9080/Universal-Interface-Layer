import uuid
from typing import Dict, Any, List

_email_drafts: Dict[str, Dict[str, Any]] = {}
_sent_emails: List[Dict[str, Any]] = []

def handle_draft_email(inputs: Dict[str, Any]) -> Dict[str, Any]:
    to = inputs.get("to")
    subject = inputs.get("subject", "(No Subject)")
    body = inputs.get("body", "")

    if not to:
        raise ValueError("to (recipient address) is required to draft an email.")

    draft_id = f"email_drft_{uuid.uuid4().hex[:8]}"
    draft = {
        "id": draft_id,
        "to": to,
        "subject": subject,
        "body": body,
        "status": "draft"
    }

    _email_drafts[draft_id] = draft
    return {"draft_id": draft_id, "status": "draft", "message": "Email draft created successfully."}

def handle_send_email(inputs: Dict[str, Any]) -> Dict[str, Any]:
    draft_id = inputs.get("draft_id")
    if not draft_id:
        raise ValueError("draft_id is required to send email.")

    if draft_id not in _email_drafts:
        # If user passed in parameters directly, send it on the fly
        to = inputs.get("to")
        subject = inputs.get("subject", "")
        body = inputs.get("body", "")
        if not to:
            raise KeyError(f"Draft '{draft_id}' not found, and no recipient details provided.")
        
        email_record = {
            "id": f"email_sent_{uuid.uuid4().hex[:8]}",
            "to": to,
            "subject": subject,
            "body": body,
            "status": "sent"
        }
        _sent_emails.append(email_record)
        return {"status": "sent", "email": email_record, "message": "Email sent on the fly successfully."}

    draft = _email_drafts.pop(draft_id)
    draft["status"] = "sent"
    _sent_emails.append(draft)
    return {"status": "sent", "email": draft, "message": "Email draft sent successfully."}
