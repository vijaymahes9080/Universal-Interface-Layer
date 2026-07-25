import re
import math
import uuid
import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..database import Memory, SessionLocal

class MemoryEngine:
    def __init__(self):
        pass

    def add_memory(self, content: str, workspace_id: str = None, scope: str = "global") -> Dict[str, Any]:
        """
        Saves a text snippet into the SQLite memory table.
        """
        db = SessionLocal()
        try:
            mem_id = f"mem_{uuid.uuid4().hex[:10]}"
            memory = Memory(
                id=mem_id,
                content=content,
                workspace_id=workspace_id,
                scope=scope,
                created_at=datetime.datetime.utcnow()
            )
            db.add(memory)
            db.commit()
            return {"id": mem_id, "content": content, "scope": scope}
        finally:
            db.close()

    def search_memories(self, query: str, workspace_id: str = None, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Searches memories using TF-IDF cosine similarity.
        """
        db = SessionLocal()
        try:
            # Query all eligible memories
            query_filter = db.query(Memory)
            if workspace_id:
                # If workspace specified, get global memories plus specific workspace memories
                query_filter = query_filter.filter((Memory.workspace_id == workspace_id) | (Memory.scope == "global"))
            else:
                query_filter = query_filter.filter(Memory.scope == "global")
            
            memories = query_filter.all()
            if not memories:
                return []

            # TF-IDF Cosine Similarity calculation in pure Python
            documents = [m.content for m in memories]
            scores = self._cosine_similarity(query, documents)

            # Map scores back to memories
            scored_memories = []
            for i, score in enumerate(scores):
                if score > 0.05: # threshold
                    scored_memories.append({
                        "id": memories[i].id,
                        "content": memories[i].content,
                        "workspace_id": memories[i].workspace_id,
                        "scope": memories[i].scope,
                        "score": score,
                        "created_at": memories[i].created_at.isoformat()
                    })

            # Sort descending by score
            scored_memories.sort(key=lambda x: x["score"], reverse=True)
            return scored_memories[:limit]

        finally:
            db.close()

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\w+', text.lower())

    def _cosine_similarity(self, query: str, docs: List[str]) -> List[float]:
        """
        Calculates cosine similarity scores for docs against a query.
        """
        query_words = self._tokenize(query)
        if not query_words:
            return [0.0] * len(docs)

        # Word frequency counts
        query_freq = {}
        for w in query_words:
            query_freq[w] = query_freq.get(w, 0) + 1

        scores = []
        for doc in docs:
            doc_words = self._tokenize(doc)
            if not doc_words:
                scores.append(0.0)
                continue

            doc_freq = {}
            for w in doc_words:
                doc_freq[w] = doc_freq.get(w, 0) + 1

            # Vector Dot Product
            dot_product = 0.0
            for word, freq in query_freq.items():
                if word in doc_freq:
                    dot_product += freq * doc_freq[word]

            # Vector Magnitudes
            query_magnitude = math.sqrt(sum(f ** 2 for f in query_freq.values()))
            doc_magnitude = math.sqrt(sum(f ** 2 for f in doc_freq.values()))

            if query_magnitude == 0 or doc_magnitude == 0:
                scores.append(0.0)
            else:
                scores.append(dot_product / (query_magnitude * doc_magnitude))

        return scores

memory_engine = MemoryEngine()
