import urllib.request
import re
from typing import Dict, Any

def handle_fetch_url(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fetches raw HTML/text content from a specified URL.
    """
    url = inputs.get("url", "")
    if not url:
        raise ValueError("URL parameter is required.")

    req = urllib.request.Request(url, headers={"User-Agent": "UIL-Web-Intelligence/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            content_type = response.headers.get("Content-Type", "")
            raw_data = response.read().decode("utf-8", errors="ignore")
            return {
                "url": url,
                "status_code": response.status,
                "content_type": content_type,
                "length": len(raw_data),
                "snippet": raw_data[:500]
            }
    except Exception as e:
        return {
            "url": url,
            "status_code": 500,
            "error": str(e),
            "snippet": f"Fallback content preview for target URL: {url}"
        }

def handle_extract_text(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Strips HTML tags and converts web content into clean structured Markdown text.
    """
    html_content = inputs.get("html", "<p>Universal Interface Layer Intelligence Node</p>")
    # Strip scripts and styles
    clean = re.sub(r"<(script|style).*?>.*?</\1>", "", html_content, flags=re.DOTALL)
    # Strip HTML tags
    clean = re.sub(r"<[^>]+>", " ", clean)
    # Normalize whitespace
    clean = " ".join(clean.split())

    return {
        "text": clean,
        "word_count": len(clean.split())
    }
