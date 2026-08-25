"""
HTTP client for the external AI microservice.

All calls are wrapped in try/except — if the AI service is unreachable or
returns unexpected data, we log the issue and return a graceful fallback
rather than crashing the caller.

FIELD MAPPING (our backend ↔ AI service):
  /ai/match         → sends 'customer_request', receives 'matched_category_id', 'matched_category_name', 'confidence_score'
  /ai/generate-bio  → sends 'provider_name', 'skills', 'years_experience', 'tone'
  /ai/chat          → sends 'user_message', receives 'response'
  /ai/summarize-reviews → sends 'reviews' (list[str]), receives 'summary' (nested dict)
"""

import logging
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

AI_TIMEOUT = 30.0  # seconds


async def _post(endpoint: str, payload: dict) -> Optional[Dict[str, Any]]:
    """
    Internal helper — sends a POST to the AI service and returns the JSON
    response dict.  Returns None on any transport or decoding error.
    """
    url = f"{settings.AI_SERVICE_URL}{endpoint}"
    try:
        async with httpx.AsyncClient(timeout=AI_TIMEOUT) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            logger.info("AI service %s responded: %s", endpoint, str(data)[:300])
            return data
    except httpx.TimeoutException:
        logger.error("AI service timeout on %s", url)
        return None
    except httpx.HTTPStatusError as exc:
        logger.error(
            "AI service returned %s on %s — body: %s",
            exc.response.status_code, url, exc.response.text[:500],
        )
        return None
    except httpx.RequestError as exc:
        logger.error("AI service unreachable at %s — %s", url, exc)
        return None
    except Exception as exc:
        logger.exception("Unexpected error calling AI service at %s", url)
        return None


# ──────────────────────────────────────────────────────────────
# 1. Category Matching
# ──────────────────────────────────────────────────────────────

async def match_request(raw_text: str) -> Dict[str, Any]:
    """
    Call POST {AI_SERVICE_URL}/ai/match

    AI service expects:  { "customer_request": "..." }
    AI service returns:  {
        "status": "success" | "fallback",
        "matched_category_id": "cat_01",
        "matched_category_name": "Plumbing",
        "confidence_score": 0.85
    }

    We normalize the response into a consistent dict for our callers.
    """
    result = await _post("/ai/match", {"customer_request": raw_text})
    if result is None:
        logger.warning("match_request failed — returning fallback (no match)")
        return {"category": None, "confidence": 0.0, "category_id": None, "status": "error"}

    # Normalize field names for our backend consumers
    return {
        "status": result.get("status", "error"),
        "category": result.get("matched_category_name"),
        "category_id": result.get("matched_category_id"),
        "confidence": result.get("confidence_score", 0.0),
    }


# ──────────────────────────────────────────────────────────────
# 2. Bio Generation
# ──────────────────────────────────────────────────────────────

async def generate_bio(
    name: str,
    category: str,
    experience_years: int,
    location: str,
    rating: float,
    raw_description: str,
) -> Dict[str, Any]:
    """
    Call POST {AI_SERVICE_URL}/ai/generate-bio

    AI service expects:  {
        "provider_name": "...",
        "skills": ["skill1", "skill2"],
        "years_experience": 5,
        "tone": "professional"
    }
    AI service returns:  { "status": "success", "bio": "..." }
    """
    # Build skills list from category and raw_description
    skills = [category]
    if raw_description:
        skills.append(raw_description)

    payload = {
        "provider_name": name,
        "skills": skills,
        "years_experience": experience_years,
        "tone": "professional",
    }
    result = await _post("/ai/generate-bio", payload)
    if result is None:
        return {"error": "AI service unavailable"}

    if result.get("status") == "error":
        logger.warning("generate_bio returned error: %s", result.get("message"))
        return {"error": result.get("message", "AI service error")}

    if "bio" not in result:
        logger.warning("generate_bio response missing 'bio' field: %s", result)

    return result


# ──────────────────────────────────────────────────────────────
# 3. Review Summarization
# ──────────────────────────────────────────────────────────────

async def summarize_reviews(
    provider_id: str,
    reviews: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Call POST {AI_SERVICE_URL}/ai/summarize-reviews

    AI service expects:  { "reviews": ["review text 1", "review text 2", ...] }
    AI service returns:  {
        "status": "success",
        "summary": {
            "strengths": [...],
            "weaknesses": [...],
            "average_rating": 4.2,
            "overall_sentiment": "Positive"
        }
    }

    We flatten the nested summary into top-level fields for our callers.
    """
    # Convert our review dicts into plain text strings
    review_texts = []
    for r in reviews:
        comment = r.get("comment", "")
        rating = r.get("rating", "")
        if comment:
            review_texts.append(f"Rating: {rating}/5 — {comment}")
        else:
            review_texts.append(f"Rating: {rating}/5")

    result = await _post("/ai/summarize-reviews", {"reviews": review_texts})
    if result is None:
        return {"error": "AI service unavailable"}

    if result.get("status") == "error":
        logger.warning("summarize_reviews returned error: %s", result.get("message"))
        return {"error": result.get("message", "AI service error")}

    # Flatten the nested 'summary' object
    summary = result.get("summary", {})
    strengths = summary.get("strengths", [])
    weaknesses = summary.get("weaknesses", [])

    return {
        "strengths": ", ".join(strengths) if isinstance(strengths, list) else str(strengths),
        "weaknesses": ", ".join(weaknesses) if isinstance(weaknesses, list) else str(weaknesses),
        "average_rating": summary.get("average_rating"),
        "overall_sentiment": summary.get("overall_sentiment"),
    }


# ──────────────────────────────────────────────────────────────
# 4. Support Chatbot
# ──────────────────────────────────────────────────────────────

async def chat_with_support_bot(message: str, session_id: str) -> Dict[str, Any]:
    """
    Call POST {AI_SERVICE_URL}/ai/chat

    AI service expects:  { "user_message": "..." }
    AI service returns:  { "status": "success", "reply": "..." }

    We normalize the response field to 'reply' for our callers.
    """
    result = await _post("/ai/chat", {"user_message": message})
    if result is None:
        return {"error": "AI service unavailable"}

    if result.get("status") == "error":
        logger.warning("chat_with_support_bot returned error: %s", result.get("message"))
        return {"error": result.get("message", "AI service error")}

    reply_text = result.get("reply") or result.get("response") or ""
    return {
        "reply": reply_text,
        "session_id": session_id,
    }

