"""
Revision router: revision session planning and exam dates using SQLite.
"""
import uuid
import json
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth import get_current_user
from models.revision import RevisionSessionCreate, ExamScheduleCreate
from services.db import get_connection

router = APIRouter(prefix="", tags=["revision"])


@router.get("/api/revision/sessions")
async def list_revision_sessions(current_user: dict = Depends(get_current_user)):
    """List revision sessions with associated experiment data."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT rs.*, e.title as experiment_title, e.language as experiment_language, s.name as subject_name
            FROM revision_sessions rs
            JOIN experiments e ON rs.experiment_id = e.id
            LEFT JOIN subjects s ON e.subject_id = s.id
            WHERE rs.user_id = ?
            ORDER BY rs.scheduled_date ASC
        """, (current_user["id"],))
        rows = cursor.fetchall()
        
        result = []
        for r in rows:
            d = dict(r)
            d["is_complete"] = bool(d.get("completed_at"))
            d["experiment"] = {
                "id": d["experiment_id"],
                "title": d.get("experiment_title"),
                "language": d.get("experiment_language"),
                "subjects": {"name": d.get("subject_name") or "Computer Science"},
            }
            result.append(d)
        return result
    finally:
        conn.close()


@router.post("/api/revision/sessions", status_code=status.HTTP_201_CREATED)
async def create_revision_session(
    payload: RevisionSessionCreate, current_user: dict = Depends(get_current_user)
):
    """Schedule a revision session."""
    conn = get_connection()
    cursor = conn.cursor()
    sess_id = str(uuid.uuid4())
    try:
        cursor.execute("""
            INSERT INTO revision_sessions (id, user_id, experiment_id, scheduled_date, session_type)
            VALUES (?, ?, ?, ?, ?)
        """, (
            sess_id,
            current_user["id"],
            payload.experiment_id,
            payload.scheduled_date,
            getattr(payload, "session_type", "flashcard") or "flashcard"
        ))
        conn.commit()

        cursor.execute("SELECT * FROM revision_sessions WHERE id = ?", (sess_id,))
        return dict(cursor.fetchone())
    finally:
        conn.close()


@router.put("/api/revision/sessions/{session_id}/complete")
async def complete_revision_session(
    session_id: str, current_user: dict = Depends(get_current_user)
):
    """Mark session as completed and increment experiment revision counter."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    try:
        cursor.execute("SELECT experiment_id FROM revision_sessions WHERE id = ? AND user_id = ?", (session_id, current_user["id"]))
        sess = cursor.fetchone()
        if not sess:
            raise HTTPException(status_code=404, detail="Session not found")

        cursor.execute("UPDATE revision_sessions SET completed_at = ? WHERE id = ?", (now, session_id))
        
        # Mark experiment as revised & bump revision count
        exp_id = sess["experiment_id"]
        cursor.execute("UPDATE experiments SET is_revised = 1, revision_count = revision_count + 1 WHERE id = ?", (exp_id,))
        conn.commit()

        return {"completed_at": now, "is_complete": True}
    finally:
        conn.close()


@router.get("/api/revision/planner")
async def get_planner(current_user: dict = Depends(get_current_user)):
    """Weekly plan and overdue sessions."""
    conn = get_connection()
    cursor = conn.cursor()
    today = datetime.now(timezone.utc).date().isoformat()
    week_end = (datetime.now(timezone.utc) + timedelta(days=7)).date().isoformat()

    try:
        # Overdue
        cursor.execute("""
            SELECT rs.*, e.title as experiment_title
            FROM revision_sessions rs
            JOIN experiments e ON rs.experiment_id = e.id
            WHERE rs.user_id = ? AND rs.scheduled_date < ? AND rs.completed_at IS NULL
        """, (current_user["id"], today))
        overdue = [dict(r) for r in cursor.fetchall()]

        # This week
        cursor.execute("""
            SELECT rs.*, e.title as experiment_title
            FROM revision_sessions rs
            JOIN experiments e ON rs.experiment_id = e.id
            WHERE rs.user_id = ? AND rs.scheduled_date >= ? AND rs.scheduled_date <= ?
            ORDER BY rs.scheduled_date ASC
        """, (current_user["id"], today, week_end))
        this_week = [dict(r) for r in cursor.fetchall()]

        return {"overdue": overdue, "this_week": this_week}
    finally:
        conn.close()


@router.get("/api/exam-schedules")
async def list_exam_schedules(current_user: dict = Depends(get_current_user)):
    """List scheduled university exams with subject details."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT es.*, s.name as subject_name
            FROM exam_schedules es
            LEFT JOIN subjects s ON es.subject_id = s.id
            WHERE es.user_id = ?
            ORDER BY es.exam_date ASC
        """, (current_user["id"],))
        rows = cursor.fetchall()
        
        result = []
        for r in rows:
            d = dict(r)
            d["is_completed"] = bool(d["is_completed"])
            d["subject"] = {"name": d.get("subject_name") or "Practical Exam"}
            result.append(d)
        return result
    finally:
        conn.close()


@router.post("/api/exam-schedules", status_code=status.HTTP_201_CREATED)
async def create_exam_schedule(
    payload: ExamScheduleCreate, current_user: dict = Depends(get_current_user)
):
    """Add a university examination countdown."""
    conn = get_connection()
    cursor = conn.cursor()
    exam_id = str(uuid.uuid4())
    try:
        cursor.execute("""
            INSERT INTO exam_schedules (id, user_id, subject_id, exam_name, exam_date, is_completed)
            VALUES (?, ?, ?, ?, ?, 0)
        """, (
            exam_id,
            current_user["id"],
            payload.subject_id,
            payload.exam_name or "Practical Examination",
            payload.exam_date
        ))
        conn.commit()

        cursor.execute("SELECT * FROM exam_schedules WHERE id = ?", (exam_id,))
        return dict(cursor.fetchone())
    finally:
        conn.close()


@router.delete("/api/exam-schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exam_schedule(
    schedule_id: str, current_user: dict = Depends(get_current_user)
):
    """Delete an exam schedule."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM exam_schedules WHERE id = ? AND user_id = ?", (schedule_id, current_user["id"]))
        conn.commit()
    finally:
        conn.close()
