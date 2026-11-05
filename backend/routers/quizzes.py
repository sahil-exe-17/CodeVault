"""
Quizzes router: MCQ and practical quizzes generation, attempts, and scoring using SQLite.
"""
import uuid
import json
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth import get_current_user
from models.quiz import QuizGenerateRequest, QuizAttemptSubmit
from services.db import get_connection
import services.gemini_service as gemini_service

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])


@router.post("/generate", status_code=status.HTTP_201_CREATED)
async def generate_quiz(
    payload: QuizGenerateRequest, current_user: dict = Depends(get_current_user)
):
    """Generate a quiz using Gemini and persist to SQLite."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    quiz_id = str(uuid.uuid4())

    try:
        # Fetch experiment context if specified
        experiment = None
        if payload.experiment_id:
            cursor.execute("SELECT * FROM experiments WHERE id = ?", (payload.experiment_id,))
            row = cursor.fetchone()
            if row:
                experiment = dict(row)

        # Generate questions via Gemini
        questions = await gemini_service.generate_mcqs(
            experiment=experiment or {"title": payload.title or "General Programming"},
            count=payload.count or 5,
        )

        title = payload.title or (f"Quiz: {experiment['title']}" if experiment else "Practical Quiz")

        cursor.execute("""
            INSERT INTO quizzes (id, experiment_id, subject_id, user_id, quiz_type, title, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            quiz_id,
            payload.experiment_id,
            payload.subject_id,
            current_user["id"],
            payload.quiz_type or "mcq",
            title,
            now
        ))

        # Insert questions
        for idx, q in enumerate(questions):
            q_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO quiz_questions (
                    id, quiz_id, question_text, option_a, option_b, option_c, option_d,
                    correct_option, explanation, code_snippet, order_index
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                q_id,
                quiz_id,
                q.get("question", ""),
                q.get("option_a", ""),
                q.get("option_b", ""),
                q.get("option_c", ""),
                q.get("option_d", ""),
                q.get("correct_option", "a"),
                q.get("explanation", ""),
                q.get("code_snippet", ""),
                idx
            ))

        conn.commit()

        # Return full quiz
        cursor.execute("SELECT * FROM quizzes WHERE id = ?", (quiz_id,))
        quiz_data = dict(cursor.fetchone())

        cursor.execute("SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC", (quiz_id,))
        quiz_data["questions"] = [dict(r) for r in cursor.fetchall()]

        return quiz_data
    finally:
        conn.close()


@router.get("")
async def list_quizzes(
    experiment_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    """List all quizzes."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = "SELECT * FROM quizzes WHERE user_id = ?"
        params = [current_user["id"]]

        if experiment_id:
            query += " AND experiment_id = ?"
            params.append(experiment_id)
        if subject_id:
            query += " AND subject_id = ?"
            params.append(subject_id)

        query += " ORDER BY created_at DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@router.get("/{quiz_id}")
async def get_quiz(quiz_id: str, current_user: dict = Depends(get_current_user)):
    """Get quiz with all questions."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM quizzes WHERE id = ? AND user_id = ?", (quiz_id, current_user["id"]))
        quiz_row = cursor.fetchone()
        if not quiz_row:
            raise HTTPException(status_code=404, detail="Quiz not found")

        quiz = dict(quiz_row)
        cursor.execute("SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC", (quiz_id,))
        quiz["questions"] = [dict(r) for r in cursor.fetchall()]
        return quiz
    finally:
        conn.close()


@router.post("/{quiz_id}/attempt")
async def submit_attempt(
    quiz_id: str,
    payload: QuizAttemptSubmit,
    current_user: dict = Depends(get_current_user),
):
    """Score answers and record attempt."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    attempt_id = str(uuid.uuid4())

    try:
        cursor.execute("SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC", (quiz_id,))
        questions = cursor.fetchall()
        if not questions:
            raise HTTPException(status_code=404, detail="No questions found for this quiz")

        total_q = len(questions)
        correct_count = 0
        answers_dict = payload.answers or {}

        for q in questions:
            user_opt = answers_dict.get(q["id"]) or answers_dict.get(str(q["order_index"]))
            if user_opt and str(user_opt).strip().lower() == str(q["correct_option"]).strip().lower():
                correct_count += 1

        cursor.execute("""
            INSERT INTO quiz_attempts (id, quiz_id, user_id, score, total_questions, time_taken_seconds, answers, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            attempt_id,
            quiz_id,
            current_user["id"],
            float(correct_count),
            total_q,
            payload.time_taken_seconds or 0,
            json.dumps(answers_dict),
            now
        ))
        conn.commit()

        cursor.execute("SELECT * FROM quiz_attempts WHERE id = ?", (attempt_id,))
        attempt = dict(cursor.fetchone())
        attempt["percentage"] = round((correct_count / total_q) * 100, 1) if total_q > 0 else 0
        return attempt
    finally:
        conn.close()


@router.get("/{quiz_id}/attempts")
async def get_quiz_attempts(
    quiz_id: str, current_user: dict = Depends(get_current_user)
):
    """List historical attempts for a quiz."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT * FROM quiz_attempts
            WHERE quiz_id = ? AND user_id = ?
            ORDER BY completed_at DESC
        """, (quiz_id, current_user["id"]))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
