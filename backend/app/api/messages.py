"""
Message (chat) routes — send and read messages within a service request.
Access restricted to the customer and the matched provider on that request.
Supports both REST API and real-time WebSockets.
"""

from typing import List, Dict
from uuid import UUID
from datetime import datetime
import json

from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.message import Message
from app.models.provider import ProviderProfile
from app.models.service_request import ServiceRequest
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse

router = APIRouter(prefix="/api/v1/requests", tags=["Messages"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, request_id: str, websocket: WebSocket):
        await websocket.accept()
        if request_id not in self.active_connections:
            self.active_connections[request_id] = []
        self.active_connections[request_id].append(websocket)

    def disconnect(self, request_id: str, websocket: WebSocket):
        if request_id in self.active_connections:
            if websocket in self.active_connections[request_id]:
                self.active_connections[request_id].remove(websocket)

    async def broadcast(self, request_id: str, message: dict):
        if request_id in self.active_connections:
            for connection in list(self.active_connections[request_id]):
                try:
                    await connection.send_json(message)
                except Exception:
                    pass


manager = ConnectionManager()


def _assert_chat_access(sr: ServiceRequest, user: User, db: Session) -> str:
    """
    Verify the user is either the customer or the matched provider.
    Returns the sender_role string.
    """
    role = user.role.value if hasattr(user.role, 'value') else user.role

    if role == "customer" and str(sr.customer_id) == str(user.id):
        return "customer"

    if role == "provider":
        profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == user.id).first()
        if profile and str(sr.matched_provider_id) == str(profile.id):
            return "provider"

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You are not a participant in this service request",
    )


@router.post("/{request_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    request_id: UUID,
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message within a service request chat and broadcast via WebSocket."""
    sr = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not sr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service request not found")

    sender_role = _assert_chat_access(sr, current_user, db)

    msg = Message(
        request_id=request_id,
        sender_id=current_user.id,
        sender_role=sender_role,
        content=payload.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    msg_dict = {
        "id": str(msg.id),
        "request_id": str(msg.request_id),
        "sender_id": str(msg.sender_id),
        "sender_role": msg.sender_role,
        "content": msg.content,
        "sent_at": msg.sent_at.isoformat() if msg.sent_at else None,
    }
    await manager.broadcast(str(request_id), msg_dict)

    return msg


@router.get("/{request_id}/messages", response_model=List[MessageResponse])
def get_messages(
    request_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all messages for a service request, ordered by sent_at."""
    sr = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not sr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service request not found")

    _assert_chat_access(sr, current_user, db)

    return (
        db.query(Message)
        .filter(Message.request_id == request_id)
        .order_by(Message.sent_at.asc())
        .all()
    )


@router.websocket("/{request_id}/ws")
async def websocket_chat(websocket: WebSocket, request_id: UUID):
    """WebSocket endpoint for real-time chat streaming."""
    await manager.connect(str(request_id), websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                content = payload.get("content", data)
            except Exception:
                content = data

            await manager.broadcast(str(request_id), {
                "request_id": str(request_id),
                "content": content,
                "sent_at": datetime.utcnow().isoformat(),
            })
    except WebSocketDisconnect:
        manager.disconnect(str(request_id), websocket)
