from pydantic import BaseModel
from typing import Optional, List, Any


class QuizGenerateRequest(BaseModel):
    experiment_id: Optional[str] = None
    subject_id: Optional[str] = None
    quiz_type: str = "mcq"  # mcq | viva | output | fill_blanks | debug
    count: int = 5
    difficulty: Optional[str] = "medium"


class QuizAttemptRequest(BaseModel):
    answers: List[Any]  # List of {question_id, selected_option} or {question_id, answer}
    time_taken_seconds: Optional[int] = None


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
    correct_answers: int
    answers: Optional[List[Any]] = []
    time_taken_seconds: Optional[int] = None
    created_at: Optional[str] = None
