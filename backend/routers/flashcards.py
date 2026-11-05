"""
Flashcards router: CRUD and mastery tracking using SQLite.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth import get_current_user
from models.flashcard import FlashcardCreate, FlashcardUpdate
from services.db import get_connection

router = APIRouter(prefix="/api/flashcards", tags=["flashcards"])


@router.get("")
async def list_flashcards(
    experiment_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    """List flashcards, optionally filtered by experiment_id."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        if experiment_id:
            cursor.execute("""
                SELECT * FROM flashcards
                WHERE user_id = ? AND experiment_id = ?
                ORDER BY created_at DESC
            """, (current_user["id"], experiment_id))
        else:
            cursor.execute("""
                SELECT * FROM flashcards
                WHERE user_id = ?
                ORDER BY created_at DESC
            """, (current_user["id"],))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_flashcard(
    payload: FlashcardCreate, current_user: dict = Depends(get_current_user)
):
    """Create a new flashcard."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    fc_id = str(uuid.uuid4())
    try:
        cursor.execute("""
            INSERT INTO flashcards (id, experiment_id, user_id, question, answer, difficulty, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            fc_id,
            payload.experiment_id,
            current_user["id"],
            payload.question,
            payload.answer,
            payload.difficulty or "medium",
            now
        ))
        conn.commit()

        cursor.execute("SELECT * FROM flashcards WHERE id = ?", (fc_id,))
        return dict(cursor.fetchone())
    finally:
        conn.close()


@router.put("/{flashcard_id}")
async def update_flashcard(
    flashcard_id: str,
    payload: FlashcardUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update mastery or text on a flashcard."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM flashcards WHERE id = ? AND user_id = ?", (flashcard_id, current_user["id"]))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Flashcard not found")

        updates = payload.model_dump(exclude_unset=True)
        if updates:
            set_clauses = [f"{k} = ?" for k in updates.keys()]
            values = list(updates.values()) + [flashcard_id]
            cursor.execute(f"UPDATE flashcards SET {', '.join(set_clauses)} WHERE id = ?", values)
            conn.commit()

        cursor.execute("SELECT * FROM flashcards WHERE id = ?", (flashcard_id,))
        return dict(cursor.fetchone())
    finally:
        conn.close()


@router.delete("/{flashcard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flashcard(
    flashcard_id: str, current_user: dict = Depends(get_current_user)
):
    """Delete a flashcard."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM flashcards WHERE id = ? AND user_id = ?", (flashcard_id, current_user["id"]))
        conn.commit()
    finally:
        conn.close()
