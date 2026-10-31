from pydantic import BaseModel
from typing import Optional


class ExplainRequest(BaseModel):
    experiment_id: str
    mode: str = "detailed"  # beginner | detailed | exam
    force_regenerate: bool = False


class VivaQuestionsRequest(BaseModel):
    experiment_id: str
    difficulty: str = "medium"  # easy | medium | hard
    count: int = 5


class MCQRequest(BaseModel):
    experiment_id: Optional[str] = None
    subject_id: Optional[str] = None
    count: int = 5


class FlashcardsRequest(BaseModel):
    experiment_id: str
    count: int = 10
    save: bool = True


class RevisionNotesRequest(BaseModel):
    experiment_id: str


class OutputQuizRequest(BaseModel):
    experiment_id: str


class FillBlanksRequest(BaseModel):
    experiment_id: str


class DebugChallengeRequest(BaseModel):
    experiment_id: str


class EvaluateAnswerRequest(BaseModel):
    experiment_id: str
    question: str
    user_answer: str
