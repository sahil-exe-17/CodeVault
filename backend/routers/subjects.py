"""
Subjects router: CRUD for experiment subjects using SQLite.
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth import get_current_user
from models.subject import SubjectCreate, SubjectUpdate
from services.db import get_connection

router = APIRouter(prefix="/api/subjects", tags=["subjects"])


@router.get("")
async def list_subjects(current_user: dict = Depends(get_current_user)):
    """List all subjects for user, including experiment count."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT s.*, COUNT(e.id) as experiment_count
            FROM subjects s
            LEFT JOIN experiments e ON s.id = e.subject_id
            WHERE s.user_id = ?
            GROUP BY s.id
            ORDER BY s.created_at DESC
        """, (current_user["id"],))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_subject(
    payload: SubjectCreate, current_user: dict = Depends(get_current_user)
):
    """Create a new subject."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    sub_id = str(uuid.uuid4())
    try:
        cursor.execute("""
            INSERT INTO subjects (id, user_id, name, description, semester, color, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sub_id,
            current_user["id"],
            payload.name,
            payload.description or "",
            getattr(payload, "semester", "") or "",
            getattr(payload, "color", "#ffffff") or "#ffffff",
            now,
            now
        ))
        conn.commit()

        cursor.execute("SELECT *, 0 as experiment_count FROM subjects WHERE id = ?", (sub_id,))
        return dict(cursor.fetchone())
    finally:
        conn.close()


@router.get("/{subject_id}")
async def get_subject(subject_id: str, current_user: dict = Depends(get_current_user)):
    """Get a single subject."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT s.*, COUNT(e.id) as experiment_count
            FROM subjects s
            LEFT JOIN experiments e ON s.id = e.subject_id
            WHERE s.id = ? AND s.user_id = ?
            GROUP BY s.id
        """, (subject_id, current_user["id"]))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Subject not found")
        return dict(row)
    finally:
        conn.close()


@router.put("/{subject_id}")
async def update_subject(
    subject_id: str,
    payload: SubjectUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update a subject."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    try:
        cursor.execute("SELECT id FROM subjects WHERE id = ? AND user_id = ?", (subject_id, current_user["id"]))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Subject not found")

        updates = payload.model_dump(exclude_unset=True)
        if not updates:
            cursor.execute("SELECT * FROM subjects WHERE id = ?", (subject_id,))
            return dict(cursor.fetchone())

        set_clauses = [f"{k} = ?" for k in updates.keys()]
        set_clauses.append("updated_at = ?")
        values = list(updates.values()) + [now, subject_id]

        cursor.execute(f"UPDATE subjects SET {', '.join(set_clauses)} WHERE id = ?", values)
        conn.commit()

        cursor.execute("SELECT * FROM subjects WHERE id = ?", (subject_id,))
        return dict(cursor.fetchone())
    finally:
        conn.close()


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(subject_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a subject."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM subjects WHERE id = ? AND user_id = ?", (subject_id, current_user["id"]))
        conn.commit()
    finally:
        conn.close()
