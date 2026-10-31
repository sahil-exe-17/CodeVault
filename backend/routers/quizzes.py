"""
Quizzes router: generate, take, and track quiz attempts.
"""
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth import get_current_user
from models.quiz import QuizAttemptRequest, QuizGenerateRequest
from services.supabase_client import supabase
import services.gemini_service as gemini_service
import os

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])


def _supabase_error(e: Exception, detail: str = "Database error"):
    raise HTTPException(status_code=500, detail=f"{detail}: {str(e)}")


def _require_gemini():
    if not os.getenv("GEMINI_API_KEY", ""):
        raise HTTPException(
            status_code=503,
            detail={"error": "GEMINI_API_KEY not configured", "setup_required": True},
        )


def _get_experiment(experiment_id: str, user_id: str) -> dict:
    result = (
        supabase.table("experiments")
        .select("*")
        .eq("id", experiment_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Experiment not found.")
    return result.data


@router.post("/generate", status_code=status.HTTP_201_CREATED)
async def generate_quiz(
    payload: QuizGenerateRequest, current_user: dict = Depends(get_current_user)
):
    _require_gemini()
    if payload.experiment_id:
        experiment = _get_experiment(payload.experiment_id, current_user["id"])
    elif payload.subject_id:
        exp_result = (
            supabase.table("experiments")
            .select("*")
            .eq("subject_id", payload.subject_id)
            .eq("user_id", current_user["id"])
            .limit(3)
            .execute()
        )
        exps = exp_result.data or []
        if not exps:
            raise HTTPException(status_code=404, detail="No experiments found.")
        experiment = {
            "name": "Subject Quiz",
            "language": exps[0].get("language", "python"),
            "code": "\n\n---\n\n".join(e.get("code", "") for e in exps),
        }
    else:
        raise HTTPException(status_code=400, detail="experiment_id or subject_id required.")

    # Generate questions based on type
    if payload.quiz_type == "mcq":
        questions = await gemini_service.generate_mcqs(experiment=experiment, count=payload.count)
    elif payload.quiz_type == "viva":
        questions = await gemini_service.generate_viva_questions(
            experiment=experiment, difficulty=payload.difficulty or "medium", count=payload.count
        )
    elif payload.quiz_type == "output":
        q = await gemini_service.generate_output_quiz(
            code=experiment.get("code", ""), language=experiment.get("language", "python")
        )
        questions = [q]
    elif payload.quiz_type == "fill_blanks":
        q = await gemini_service.generate_fill_blanks(
            code=experiment.get("code", ""), language=experiment.get("language", "python")
        )
        questions = [q]
    elif payload.quiz_type == "debug":
        q = await gemini_service.generate_debug_challenge(
            code=experiment.get("code", ""), language=experiment.get("language", "python")
        )
        questions = [q]
    else:
        raise HTTPException(status_code=400, detail=f"Unknown quiz_type: {payload.quiz_type}")

    # Save quiz
    quiz_data = {
        "user_id": current_user["id"],
        "experiment_id": payload.experiment_id,
        "subject_id": payload.subject_id,
        "quiz_type": payload.quiz_type,
        "title": f"{experiment.get('name', 'Quiz')} - {payload.quiz_type.upper()}",
        "questions": questions,
        "difficulty": payload.difficulty,
    }
    try:
        result = supabase.table("quizzes").insert(quiz_data).execute()
        return result.data[0]
    except Exception as e:
        _supabase_error(e, "Failed to save quiz")


@router.get("")
async def list_quizzes(current_user: dict = Depends(get_current_user)):
    try:
        result = (
            supabase.table("quizzes")
            .select("id, title, quiz_type, experiment_id, subject_id, created_at, difficulty")
            .eq("user_id", current_user["id"])
            .order("created_at", desc=True)
            .execute()
        )
        return result.data or []
    except Exception as e:
        _supabase_error(e, "Failed to list quizzes")


@router.get("/{quiz_id}")
async def get_quiz(quiz_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = (
            supabase.table("quizzes")
            .select("*")
            .eq("id", quiz_id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Quiz not found.")
        return result.data
    except HTTPException:
        raise
    except Exception as e:
        _supabase_error(e, "Failed to get quiz")


@router.post("/{quiz_id}/attempt", status_code=status.HTTP_201_CREATED)
async def submit_attempt(
    quiz_id: str,
    payload: QuizAttemptRequest,
    current_user: dict = Depends(get_current_user),
):
    """Submit a quiz attempt, calculate the score, and save."""
    try:
        quiz = (
            supabase.table("quizzes")
            .select("*")
            .eq("id", quiz_id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )
        if not quiz.data:
            raise HTTPException(status_code=404, detail="Quiz not found.")

        questions: List[Any] = quiz.data.get("questions", [])
        total = len(questions)
        correct = 0

        # Evaluate MCQ attempts
        user_answers = payload.answers or []
        evaluated_answers = []
        for idx, answer in enumerate(user_answers):
            q = questions[idx] if idx < total else {}
            is_correct = False
            if quiz.data.get("quiz_type") == "mcq":
                is_correct = (
                    str(answer.get("selected_option", "")).lower()
                    == str(q.get("correct_option", "")).lower()
                )
                if is_correct:
                    correct += 1
            evaluated_answers.append({**answer, "is_correct": is_correct})

        score = (correct / total * 100) if total > 0 else 0

        attempt_data = {
            "quiz_id": quiz_id,
            "user_id": current_user["id"],
            "score": round(score, 2),
            "total_questions": total,
            "correct_answers": correct,
            "answers": evaluated_answers,
            "time_taken_seconds": payload.time_taken_seconds,
        }
        result = supabase.table("quiz_attempts").insert(attempt_data).execute()
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        _supabase_error(e, "Failed to submit attempt")


@router.get("/{quiz_id}/attempts")
async def get_attempts(quiz_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = (
            supabase.table("quiz_attempts")
            .select("*")
            .eq("quiz_id", quiz_id)
            .eq("user_id", current_user["id"])
            .order("created_at", desc=True)
            .execute()
        )
        return result.data or []
    except Exception as e:
        _supabase_error(e, "Failed to get attempts")
