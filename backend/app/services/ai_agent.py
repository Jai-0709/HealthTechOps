"""
AI Agent for incident investigation using Ollama (llama3.2).
Includes prompt injection protection and action allowlist validation.
"""
import httpx
import hashlib
import json
import re
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

SAFE_ACTIONS_ALLOWLIST = [
    "restart_service",
    "clear_cache",
    "scale_up_replicas",
    "rotate_logs",
    "flush_connection_pool",
    "enable_circuit_breaker",
    "increase_timeout",
    "rollback_deployment",
]


def sanitize_input(text: str) -> str:
    """Remove prompt injection attempts and cap length."""
    dangerous = [
        r"ignore previous instructions",
        r"ignore all previous",
        r"you are now",
        r"new instructions",
        r"system prompt",
        r"<\|.*?\|>",
        r"\[INST\]",
        r"<<SYS>>",
        r"disregard",
        r"forget everything",
    ]
    for pattern in dangerous:
        text = re.sub(pattern, "[REDACTED]", text, flags=re.IGNORECASE)
    return text[:2000]


def hash_prompt(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


def build_prompt(incident: dict) -> str:
    title = sanitize_input(str(incident.get("title", "")))
    description = sanitize_input(str(incident.get("description", "")))
    service = sanitize_input(str(incident.get("service_name", "unknown")))
    severity = str(incident.get("severity", "MEDIUM"))
    evidence = incident.get("evidence", {})

    return f"""You are an SRE AI assistant for HealthTechOps, analyzing a SYNTHETIC infrastructure incident.
All data is simulated for demonstration purposes.

INCIDENT:
- Title: {title}
- Service: {service}
- Severity: {severity}
- Description: {description}
- Evidence: {json.dumps(evidence)}

Respond ONLY with valid JSON (no markdown, no extra text):
{{
  "root_cause_summary": "Brief root cause (1-2 sentences)",
  "confidence_score": 0.85,
  "evidence_items": ["evidence 1", "evidence 2", "evidence 3"],
  "recommended_actions": ["action_name"],
  "safe_to_automate": false
}}

For recommended_actions use ONLY: {SAFE_ACTIONS_ALLOWLIST}
confidence_score: 0.0 to 1.0"""


def call_ollama(prompt: str) -> dict:
    try:
        resp = httpx.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.1, "num_predict": 512},
            },
            timeout=120.0,
        )
        resp.raise_for_status()
        raw = resp.json().get("response", "")
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            return json.loads(match.group())
        return {"error": "No JSON in response", "raw": raw[:300]}
    except httpx.TimeoutException:
        return {"error": "Ollama timed out"}
    except httpx.ConnectError:
        return {"error": "Cannot connect to Ollama. Is it running on port 11434?"}
    except json.JSONDecodeError as e:
        return {"error": f"JSON parse error: {e}"}
    except Exception as e:
        return {"error": str(e)}


def investigate_incident(incident_data: dict) -> dict:
    prompt = build_prompt(incident_data)
    prompt_hash = hash_prompt(prompt)
    result = call_ollama(prompt)

    if "error" in result:
        return {
            "status": "FAILED",
            "error": result["error"],
            "prompt_hash": prompt_hash,
            "root_cause_summary": None,
            "evidence_items": [],
            "recommended_actions": [],
            "confidence_score": 0.0,
            "raw_response": str(result),
        }

    safe_actions = [a for a in result.get("recommended_actions", []) if a in SAFE_ACTIONS_ALLOWLIST]

    return {
        "status": "COMPLETED",
        "prompt_hash": prompt_hash,
        "root_cause_summary": result.get("root_cause_summary", "Analysis unavailable"),
        "evidence_items": result.get("evidence_items", [])[:5],
        "recommended_actions": safe_actions,
        "confidence_score": min(1.0, max(0.0, float(result.get("confidence_score", 0.5)))),
        "raw_response": json.dumps(result),
        "safe_to_automate": result.get("safe_to_automate", False) and bool(safe_actions),
    }
