from pydantic import BaseModel
from typing import Optional, List, Any, Dict


class QuizGenerateRequest(BaseModel):
    experiment_id: Optional[str] = None
    subject_id: Optional[str] = None
    quiz_type: Optional[str] = "mcq"  # mcq | viva | output | fill_blanks | debug
    title: Optional[str] = None
    count: Optional[int] = 5
    difficulty: Optional[str] = "medium"


class QuizAttemptRequest(BaseModel):
    answers: Optional[Any] = {}
    time_taken_seconds: Optional[int] = 0


QuizAttemptSubmit = QuizAttemptRequest


class QuizResponse(BaseModel):
    id: str
    user_id: str
    experiment_id: Optional[str] = None
    subject_id: Optional[str] = None
    quiz_type: str
    title: Optional[str] = None
    questions: Optional[List[Any]] = []
    created_at: Optional[str] = None


class QuizAttemptResponse(BaseModel):
    id: str
    quiz_id: str
    user_id: str
    score: float
    total_questions: int
    correct_answers: Optional[int] = 0
    answers: Optional[Any] = None
    time_taken_seconds: Optional[int] = None
    created_at: Optional[str] = None
