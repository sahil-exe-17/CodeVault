from pydantic import BaseModel
from typing import Optional


class SubjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    semester: Optional[str] = None
    color: Optional[str] = "#6366f1"
    icon: Optional[str] = None


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    semester: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class SubjectResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    semester: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    experiment_count: Optional[int] = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
