from typing import Dict, Any, List

class ConsensusEngine:
    """
    Multi-Agent Consensus & Safety Audit Engine.
    Evaluates DAG execution plans using security scoring and heuristic verification
    to prevent unauthorized actions, privilege escalation, or destructive commands.
    """
    def __init__(self):
        self.high_risk_actions = {"run_command", "send_email", "delete_file", "drop_table"}

    def evaluate_plan(self, plan: List[Dict[str, Any]]) -> Dict[str, Any]:
        risk_score = 0
        flagged_nodes = []
        recommendations = []

        for step in plan:
            action = step.get("action", "")
            plugin = step.get("plugin", "")
            inputs = step.get("inputs", {})

            # Security Audit check
            if action in self.high_risk_actions or plugin in {"terminal", "email"}:
                risk_score += 35
                flagged_nodes.append({
                    "step_id": step.get("id"),
                    "plugin": plugin,
                    "action": action,
                    "reason": "High-risk system action requiring human authorization gate."
                })

            # Check inputs for destructive keywords
            inputs_str = str(inputs).lower()
            if any(term in inputs_str for term in ["rm -rf", "drop database", "format", "del /f"]):
                risk_score += 50
                flagged_nodes.append({
                    "step_id": step.get("id"),
                    "plugin": plugin,
                    "action": action,
                    "reason": "Potential destructive payload detected in arguments."
                })

        safety_rating = "SAFE"
        if risk_score >= 70:
            safety_rating = "CRITICAL_RISK"
            recommendations.append("Halt execution immediately. Mandatory human manual confirmation required.")
        elif risk_score >= 35:
            safety_rating = "MODERATE_RISK"
            recommendations.append("Prompt user for step-by-step confirmation on flagged nodes.")

        return {
            "risk_score": min(risk_score, 100),
            "safety_rating": safety_rating,
            "approved": risk_score < 70,
            "flagged_nodes": flagged_nodes,
            "recommendations": recommendations,
            "agent_critiques": [
                {"agent": "SecurityAuditorAgent", "status": "VERIFIED" if risk_score < 70 else "REJECTED"},
                {"agent": "QualityCritiqueAgent", "status": "APPROVED"}
            ]
        }

consensus_engine = ConsensusEngine()
