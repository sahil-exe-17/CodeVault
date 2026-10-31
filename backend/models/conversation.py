from pydantic import BaseModel
from typing import Optional, List


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    experiment_id: Optional[str] = None


class MessageCreate(BaseModel):
    content: str
    role: str = "user"


class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: Optional[str] = None
    experiment_id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: Optional[str] = None
