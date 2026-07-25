import requests
import re
from typing import Dict, Any, List

def handle_search_web(inputs: Dict[str, Any]) -> Dict[str, Any]:
    query = inputs.get("query", "")
    if not query:
        raise ValueError("query parameter is required.")

    # In a full deployment, this could call Meilisearch, Google Custom Search, or SearxNG.
    # We will provide clean, rich mock search results for common prompts,
    # and standard fallback results for others.
    query_lower = query.lower()
    
    if "mca" in query_lower:
        results = [
            {
                "title": "MCA Computer Science Core Curriculum 2026",
                "url": "https://education.universities.org/mca/syllabus-2026",
                "snippet": "Core subjects include Advanced Data Structures, Database Systems, Computer Networks, and Software Engineering. Core practical exams emphasize SQL queries and process scheduling implementations."
            },
            {
                "title": "Top YouTube Playlists for GATE/MCA computer networks",
                "url": "https://youtube.com/playlists/gate-smashers-mca-prep",
                "snippet": "Videos cover the entire computer networks syllabus for MCA exams, including OSI layers, TCP sliding window, IP subnetting, routing algorithms, and security protocols."
            },
            {
                "title": "Operating Systems & Networking Revision Guide",
                "url": "https://geeksforgeeks.org/operating-systems-exam-prep",
                "snippet": "Complete cheat sheet for process control blocks, semaphore synchronization algorithms, scheduling criteria, and virtual memory page replacement techniques."
            }
        ]
    elif "startup" in query_lower:
        results = [
            {
                "title": "How to Start an AI SaaS in 2026",
                "url": "https://saaslaunchpad.io/how-to-start-ai-saas",
                "snippet": "A complete blueprint to ideate, prototype using monorepos, validate product market fit, write investment decks, and pitch to VC syndicates."
            },
            {
                "title": "Top Competitor Matrices and Strategy Checklists",
                "url": "https://hbr.org/strategy/competitor-matrices-for-saas",
                "snippet": "Learn to perform SWOT, Porter's Five Forces, and structure pitch deck outlines that highlight competitive leverage."
            }
        ]
    else:
        results = [
            {
                "title": f"Search Results for '{query}'",
                "url": f"https://duckduckgo.com/?q={query.replace(' ', '+')}",
                "snippet": f"Found references and online guides relating to: {query}. Review specific pages for full details."
            }
        ]

    return {"results": results, "success": True}

def handle_read_page(inputs: Dict[str, Any]) -> Dict[str, Any]:
    url = inputs.get("url", "")
    if not url:
        raise ValueError("url parameter is required.")

    # Real HTTP request fallback with sandboxing
    if not url.startswith("http://") and not url.startswith("https://"):
        raise ValueError("Invalid URL scheme. Must be HTTP or HTTPS.")

    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        res = requests.get(url, headers=headers, timeout=5)
        # Strip HTML tags
        clean_text = re.sub(r'<[^>]+>', ' ', res.text)
        # Condense spacing
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        return {
            "url": url,
            "content": clean_text[:2000] + ("..." if len(clean_text) > 2000 else ""),
            "success": True
        }
    except Exception as e:
        return {
            "url": url,
            "content": f"Failed to retrieve url: {str(e)}",
            "success": False
        }
