from pydantic import BaseModel
from typing import Optional, List, Any


class CodeSnippetItem(BaseModel):
    id: str
    title: str = "Code 1"
    language: str = "c"
    code: str = ""


class ExperimentCreate(BaseModel):
    subject_id: Optional[str] = None
    title: Optional[str] = None
    name: Optional[str] = None
    experiment_number: Optional[str] = None
    topic: Optional[str] = None
    aim: Optional[str] = None
    theory: Optional[str] = None
    algorithm: Optional[str] = None
    description: Optional[str] = None
    source_code: Optional[str] = None
    code: Optional[str] = None
    language: str = "c"
    code_files: Optional[List[Any]] = None
    sample_input: Optional[str] = None
    expected_output: Optional[str] = None
    actual_output: Optional[str] = None
    observations: Optional[str] = None
    personal_notes: Optional[str] = None
    time_complexity: Optional[str] = "O(n)"
    space_complexity: Optional[str] = "O(1)"
    tags: Optional[List[str]] = []
    github_url: Optional[str] = None
    file_name: Optional[str] = None
    is_bookmarked: Optional[bool] = False
    is_revised: Optional[bool] = False
    notebook_pdf_url: Optional[str] = None
    notebook_pdf_name: Optional[str] = None
    notebook_pdf_size: Optional[int] = None
    notebook_uploaded_at: Optional[str] = None


class ExperimentUpdate(BaseModel):
    subject_id: Optional[str] = None
    title: Optional[str] = None
    name: Optional[str] = None
    experiment_number: Optional[str] = None
    topic: Optional[str] = None
    aim: Optional[str] = None
    theory: Optional[str] = None
    algorithm: Optional[str] = None
    description: Optional[str] = None
    source_code: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = None
    code_files: Optional[List[Any]] = None
    sample_input: Optional[str] = None
    expected_output: Optional[str] = None
    actual_output: Optional[str] = None
    observations: Optional[str] = None
    personal_notes: Optional[str] = None
    time_complexity: Optional[str] = None
    space_complexity: Optional[str] = None
    tags: Optional[List[str]] = None
    github_url: Optional[str] = None
    file_name: Optional[str] = None
    is_bookmarked: Optional[bool] = None
    is_revised: Optional[bool] = None
    notebook_pdf_url: Optional[str] = None
    notebook_pdf_name: Optional[str] = None
    notebook_pdf_size: Optional[int] = None
    notebook_uploaded_at: Optional[str] = None


class ExperimentResponse(BaseModel):
    id: str
    user_id: str
    subject_id: Optional[str] = None
    title: Optional[str] = None
    name: Optional[str] = None
    experiment_number: Optional[str] = None
    topic: Optional[str] = None
    aim: Optional[str] = None
    theory: Optional[str] = None
    algorithm: Optional[str] = None
    description: Optional[str] = None
    source_code: Optional[str] = None
    code: Optional[str] = None
    language: str
    code_files: Optional[List[Any]] = None
    sample_input: Optional[str] = None
    expected_output: Optional[str] = None
    actual_output: Optional[str] = None
    observations: Optional[str] = None
    personal_notes: Optional[str] = None
    time_complexity: Optional[str] = None
    space_complexity: Optional[str] = None
    tags: Optional[List[str]] = []
    github_url: Optional[str] = None
    file_name: Optional[str] = None
    is_bookmarked: Optional[bool] = False
    is_revised: Optional[bool] = False
    revised_at: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    notebook_pdf_url: Optional[str] = None
    notebook_pdf_name: Optional[str] = None
    notebook_pdf_size: Optional[int] = None
    notebook_uploaded_at: Optional[str] = None


class ImportFileRequest(BaseModel):
    subject_id: str
    name: Optional[str] = None
    language: Optional[str] = None
    github_url: Optional[str] = None
    file_path: Optional[str] = None
