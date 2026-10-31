from pydantic import BaseModel
from typing import Optional, List


class ExperimentCreate(BaseModel):
    subject_id: str
    name: str
    description: Optional[str] = None
    code: Optional[str] = None
    language: str = "python"
    tags: Optional[List[str]] = []
    github_url: Optional[str] = None
    file_name: Optional[str] = None


class ExperimentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = None
    tags: Optional[List[str]] = None
    github_url: Optional[str] = None
    file_name: Optional[str] = None
    is_bookmarked: Optional[bool] = None
    is_revised: Optional[bool] = None


class ExperimentResponse(BaseModel):
    id: str
    user_id: str
    subject_id: str
    name: str
    description: Optional[str] = None
    code: Optional[str] = None
    language: str
    tags: Optional[List[str]] = []
    github_url: Optional[str] = None
    file_name: Optional[str] = None
    is_bookmarked: Optional[bool] = False
    is_revised: Optional[bool] = False
    revised_at: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ImportFileRequest(BaseModel):
    subject_id: str
    name: Optional[str] = None
    language: Optional[str] = None
    github_url: Optional[str] = None
    file_path: Optional[str] = None
