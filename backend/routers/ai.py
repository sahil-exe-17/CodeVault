"""
AI router: all Gemini-powered endpoints using SQLite persistence and Gemini 2.5 Flash.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth import get_current_user
from models.ai import (
    ExplainRequest,
    VivaQuestionsRequest,
    MCQRequest,
    FlashcardsRequest,
    RevisionNotesRequest,
    OutputQuizRequest,
    FillBlanksRequest,
    DebugChallengeRequest,
    EvaluateAnswerRequest,
)
from services.db import get_connection
import services.gemini_service as gemini_service

router = APIRouter(prefix="/api/ai", tags=["ai"])


def _get_experiment(experiment_id: str, user_id: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM experiments WHERE id = ? AND user_id = ?", (experiment_id, user_id))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Experiment not found.")
        return dict(row)
    finally:
        conn.close()


@router.post("/explain")
async def explain_code_endpoint(
    payload: ExplainRequest, current_user: dict = Depends(get_current_user)
):
    """Explain code using Gemini and save to SQLite ai_explanations."""
    code = getattr(payload, "code", None)
    language = getattr(payload, "language", None)
    mode = payload.mode or "exam"
    experiment_id = payload.experiment_id

    experiment = None
    if experiment_id:
        experiment = _get_experiment(experiment_id, current_user["id"])
        code = code or experiment.get("source_code", "")
        language = language or experiment.get("language", "c")

    if not code:
        raise HTTPException(status_code=400, detail="No source code provided.")

    context = {
        "title": experiment.get("title") if experiment else "Custom Code",
        "aim": experiment.get("aim") if experiment else "",
        "theory": experiment.get("theory") if experiment else "",
    }

    explanation = await gemini_service.explain_code(
        code=code, language=language or "c", mode=mode, context=context
    )

    # Persist explanation if experiment_id provided
    if experiment_id:
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()
        expl_id = str(uuid.uuid4())
        try:
            cursor.execute("""
                INSERT OR REPLACE INTO ai_explanations (
                    id, experiment_id, user_id, mode, program_overview, simple_explanation,
                    line_by_line, logic_breakdown, execution_flow, variables_and_functions,
                    algorithm_explanation, io_explanation, time_complexity, space_complexity,
                    common_mistakes, exam_points, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                expl_id,
                experiment_id,
                current_user["id"],
                mode,
                explanation.get("program_overview", ""),
                explanation.get("simple_explanation", ""),
                explanation.get("line_by_line", ""),
                explanation.get("logic_breakdown", ""),
                explanation.get("execution_flow", ""),
                explanation.get("variables_and_functions", ""),
                explanation.get("algorithm_explanation", ""),
                explanation.get("io_explanation", ""),
                explanation.get("time_complexity", "O(n)"),
                explanation.get("space_complexity", "O(1)"),
                explanation.get("common_mistakes", ""),
                explanation.get("exam_points", ""),
                now,
                now
            ))
            conn.commit()
        finally:
            conn.close()

    return explanation


@router.get("/explanation/{experiment_id}")
async def get_saved_explanation(
    experiment_id: str, current_user: dict = Depends(get_current_user)
):
    """Retrieve saved explanation from SQLite."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT * FROM ai_explanations
            WHERE experiment_id = ? AND user_id = ?
            ORDER BY updated_at DESC LIMIT 1
        """, (experiment_id, current_user["id"]))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="No explanation found.")
        return dict(row)
    finally:
        conn.close()


@router.post("/viva-questions")
async def generate_viva_endpoint(
    payload: VivaQuestionsRequest, current_user: dict = Depends(get_current_user)
):
    """Generate viva oral examination questions."""
    experiment = _get_experiment(payload.experiment_id, current_user["id"])
    return await gemini_service.generate_viva_questions(
        experiment=experiment,
        difficulty=payload.difficulty or "medium",
        count=payload.count or 5,
    )


@router.post("/mcqs")
async def generate_mcqs_endpoint(
    payload: MCQRequest, current_user: dict = Depends(get_current_user)
):
    """Generate MCQs from an experiment."""
    if not payload.experiment_id:
        raise HTTPException(status_code=400, detail="experiment_id is required.")
    experiment = _get_experiment(payload.experiment_id, current_user["id"])
    return await gemini_service.generate_mcqs(experiment=experiment, count=payload.count or 5)


@router.post("/flashcards")
async def generate_flashcards_endpoint(
    payload: FlashcardsRequest, current_user: dict = Depends(get_current_user)
):
    """Generate flashcards and optionally save to SQLite."""
    experiment = _get_experiment(payload.experiment_id, current_user["id"])
    cards = await gemini_service.generate_flashcards(experiment=experiment, count=payload.count or 5)

    if payload.save:
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()
        try:
            for c in cards:
                cursor.execute("""
                    INSERT INTO flashcards (id, experiment_id, user_id, question, answer, difficulty, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    str(uuid.uuid4()),
                    payload.experiment_id,
                    current_user["id"],
                    c.get("question", ""),
                    c.get("answer", ""),
                    c.get("difficulty", "medium"),
                    now
                ))
            conn.commit()
        finally:
            conn.close()

    return cards


@router.post("/revision-notes")
async def generate_revision_notes_endpoint(
    payload: RevisionNotesRequest, current_user: dict = Depends(get_current_user)
):
    """Generate high-yield revision notes."""
    experiment = _get_experiment(payload.experiment_id, current_user["id"])
    return await gemini_service.generate_revision_notes(experiment=experiment)


@router.post("/output-quiz")
async def generate_output_quiz_endpoint(
    payload: OutputQuizRequest, current_user: dict = Depends(get_current_user)
):
    """Generate output prediction challenge."""
    code = payload.code
    language = payload.language
    if payload.experiment_id and not code:
        exp = _get_experiment(payload.experiment_id, current_user["id"])
        code = exp.get("source_code", "")
        language = exp.get("language", "c")
    return await gemini_service.generate_output_quiz(code=code or "", language=language or "c")


@router.post("/fill-blanks")
async def generate_fill_blanks_endpoint(
    payload: FillBlanksRequest, current_user: dict = Depends(get_current_user)
):
    """Generate fill in the blanks challenge."""
    code = payload.code
    language = payload.language
    if payload.experiment_id and not code:
        exp = _get_experiment(payload.experiment_id, current_user["id"])
        code = exp.get("source_code", "")
        language = exp.get("language", "c")
    return await gemini_service.generate_fill_blanks(code=code or "", language=language or "c")


@router.post("/debug-challenge")
async def generate_debug_challenge_endpoint(
    payload: DebugChallengeRequest, current_user: dict = Depends(get_current_user)
):
    """Generate debug challenge."""
    code = payload.code
    language = payload.language
    if payload.experiment_id and not code:
        exp = _get_experiment(payload.experiment_id, current_user["id"])
        code = exp.get("source_code", "")
        language = exp.get("language", "c")
    return await gemini_service.generate_debug_challenge(code=code or "", language=language or "c")


@router.post("/evaluate-answer")
async def evaluate_answer_endpoint(
    payload: EvaluateAnswerRequest, current_user: dict = Depends(get_current_user)
):
    """Evaluate viva response."""
    context = None
    if payload.experiment_id:
        context = _get_experiment(payload.experiment_id, current_user["id"])
    return await gemini_service.evaluate_viva_answer(
        question=payload.question,
        user_answer=payload.user_answer,
        experiment_context=context,
    )
