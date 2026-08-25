"""
Support chatbot route — proxies to the AI service's RAG-based FAQ bot.
"""

import uuid

from fastapi import APIRouter, HTTPException, status

from app.schemas.support import ChatRequest, ChatResponse
from app.services import ai_client

router = APIRouter(prefix="/api/v1/support", tags=["Support"])


@router.post("/chat", response_model=ChatResponse)
async def support_chat(payload: ChatRequest):
    """
    Public — chat with the AI-powered support bot.
    Generates a session_id if none is provided.
    """
    session_id = payload.session_id or str(uuid.uuid4())

    result = await ai_client.chat_with_support_bot(
        message=payload.message,
        session_id=session_id,
    )

    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=result["error"],
        )

    return ChatResponse(
        reply=result.get("reply", ""),
        session_id=result.get("session_id", session_id),
    )
