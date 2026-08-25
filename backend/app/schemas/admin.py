"""
Pydantic schemas for admin endpoints.
"""

from pydantic import BaseModel


class AdminOverview(BaseModel):
    total_requests: int
    active_providers: int
    completed_jobs: int
