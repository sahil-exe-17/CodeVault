from pydantic import BaseModel
from typing import Optional


class FlashcardCreate(BaseModel):
    experiment_id: str
    question: str
    answer: str
    difficulty: Optional[str] = "medium"  # easy | medium | hard


class FlashcardUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    difficulty: Optional[str] = None
    times_shown: Optional[int] = None
    times_correct: Optional[int] = None


class FlashcardResponse(BaseModel):
    id: str
    user_id: str
    experiment_id: str
    question: str
    answer: str
    difficulty: Optional[str] = "medium"
    times_shown: Optional[int] = 0
    times_correct: Optional[int] = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
