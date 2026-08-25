"""
Business logic for service-request status transitions.

Valid transitions:
    submitted → matched → quoted → accepted → in_progress → completed
    cancelled ← submitted | matched | quoted | accepted
"""

from fastapi import HTTPException, status

# Forward-only happy path
VALID_TRANSITIONS: dict[str, list[str]] = {
    "submitted": ["matched", "quoted", "cancelled"],
    "matched": ["quoted", "cancelled"],
    "quoted": ["accepted", "cancelled"],
    "accepted": ["in_progress", "cancelled"],
    "in_progress": ["completed"],
    "completed": [],       # terminal
    "cancelled": [],       # terminal
}


def validate_status_transition(current: str, target: str) -> None:
    """Raise 400 if the transition is not allowed."""
    allowed = VALID_TRANSITIONS.get(current, [])
    if target not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from '{current}' to '{target}'. "
                   f"Allowed transitions: {allowed}",
        )
