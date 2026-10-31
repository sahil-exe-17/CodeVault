from pydantic import BaseModel
from typing import Optional


class RevisionSessionCreate(BaseModel):
    experiment_id: str
    scheduled_date: str  # ISO date string


class ExamScheduleCreate(BaseModel):
    subject_id: str
    exam_date: str  # ISO date string
    exam_name: Optional[str] = None
    notes: Optional[str] = None


class RevisionSessionResponse(BaseModel):
    id: str
    user_id: str
    experiment_id: str
    scheduled_date: str
    completed_at: Optional[str] = None
    is_complete: Optional[bool] = False
    created_at: Optional[str] = None


class ExamScheduleResponse(BaseModel):
    id: str
    user_id: str
    subject_id: str
    exam_date: str
    exam_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None
