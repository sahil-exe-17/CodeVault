"""
Conversations router: contextual AI chat powered by Gemini and stored in SQLite.
"""
import uuid
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth import get_current_user
from models.conversation import ConversationCreate, MessageSend
from services.db import get_connection
import services.gemini_service as gemini_service

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("")
async def list_conversations(current_user: dict = Depends(get_current_user)):
    """List conversations for user."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT c.*, e.title as experiment_title
            FROM conversations c
            LEFT JOIN experiments e ON c.experiment_id = e.id
            WHERE c.user_id = ?
            ORDER BY c.updated_at DESC
        """, (current_user["id"],))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_conversation(
    payload: ConversationCreate, current_user: dict = Depends(get_current_user)
):
    """Start a new conversation."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    conv_id = str(uuid.uuid4())
    try:
        cursor.execute("""
            INSERT INTO conversations (id, user_id, experiment_id, title, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            conv_id,
            current_user["id"],
            payload.experiment_id,
            payload.title or "New Discussion",
            now,
            now
        ))
        conn.commit()

        cursor.execute("SELECT * FROM conversations WHERE id = ?", (conv_id,))
        return dict(cursor.fetchone())
    finally:
        conn.close()


@router.get("/{conversation_id}/messages")
async def get_messages(
    conversation_id: str, current_user: dict = Depends(get_current_user)
):
    """Get all messages in a conversation."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT m.*
            FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE m.conversation_id = ? AND c.user_id = ?
            ORDER BY m.created_at ASC
        """, (conversation_id, current_user["id"]))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    payload: MessageSend,
    current_user: dict = Depends(get_current_user),
):
    """Save user message, call Gemini with experiment context, and save AI response."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()

    try:
        cursor.execute("SELECT * FROM conversations WHERE id = ? AND user_id = ?", (conversation_id, current_user["id"]))
        conv = cursor.fetchone()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # 1. Save user message
        user_msg_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO messages (id, conversation_id, role, content, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (user_msg_id, conversation_id, "user", payload.content, now))
        conn.commit()

        # 2. Fetch past conversation history
        cursor.execute("""
            SELECT role, content FROM messages
            WHERE conversation_id = ?
            ORDER BY created_at ASC
            LIMIT 10
        """, (conversation_id,))
        history = [dict(r) for r in cursor.fetchall()]

        # 3. Fetch experiment context if attached
        exp_context = None
        exp_id = payload.experiment_id or conv["experiment_id"]
        if exp_id:
            cursor.execute("SELECT title, language, source_code, aim FROM experiments WHERE id = ?", (exp_id,))
            exp_row = cursor.fetchone()
            if exp_row:
                exp_context = dict(exp_row)

        # 4. Generate AI response
        ai_reply = await gemini_service.chat_with_context(
            messages=history,
            experiment_context=exp_context,
            user_message=payload.content,
        )

        # 5. Save assistant message
        ai_msg_id = str(uuid.uuid4())
        now_reply = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
            INSERT INTO messages (id, conversation_id, role, content, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (ai_msg_id, conversation_id, "assistant", ai_reply, now_reply))

        # Update conversation updated_at
        cursor.execute("UPDATE conversations SET updated_at = ? WHERE id = ?", (now_reply, conversation_id))
        conn.commit()

        return {
            "id": ai_msg_id,
            "role": "assistant",
            "content": ai_reply,
            "created_at": now_reply,
        }
    finally:
        conn.close()


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str, current_user: dict = Depends(get_current_user)
):
    """Delete conversation and messages."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM conversations WHERE id = ? AND user_id = ?", (conversation_id, current_user["id"]))
        conn.commit()
    finally:
        conn.close()
