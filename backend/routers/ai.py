"""
AI router: all Gemini-powered endpoints.
"""
import os
from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth import get_current_user
from models.ai import (
    DebugChallengeRequest,
    EvaluateAnswerRequest,
    ExplainRequest,
    FillBlanksRequest,
    FlashcardsRequest,
    MCQRequest,
    OutputQuizRequest,
    RevisionNotesRequest,
    VivaQuestionsRequest,
)
from services.supabase_client import supabase
import services.gemini_service as gemini_service

router = APIRouter(prefix="/api/ai", tags=["ai"])

GEMINI_NOT_CONFIGURED = {
    "error": "GEMINI_API_KEY not configured",
    "setup_required": True,
}


def _gemini_available() -> bool:
    return bool(os.getenv("GEMINI_API_KEY", ""))


def _require_gemini():
    if not _gemini_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=GEMINI_NOT_CONFIGURED,
        )


def _get_experiment(experiment_id: str, user_id: str) -> dict:
    result = (
        supabase.table("experiments")
        .select("*, subjects(name)")
        .eq("id", experiment_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Experiment not found.")
    return result.data


# ---------------------------------------------------------------------------
# Explain Code
# ---------------------------------------------------------------------------

@router.post("/explain")
async def explain_code(
    payload: ExplainRequest, current_user: dict = Depends(get_current_user)
):
    _require_gemini()
    experiment = _get_experiment(payload.experiment_id, current_user["id"])

    # Return cached explanation unless force_regenerate
    if not payload.force_regenerate:
        cached = (
            supabase.table("ai_explanations")
            .select("*")
            .eq("experiment_id", payload.experiment_id)
            .eq("mode", payload.mode)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if cached.data:
            return {"source": "cache", "explanation": cached.data[0]}

    context = {
        "experiment_name": experiment.get("name"),
        "subject_name": experiment.get("subjects", {}).get("name", "") if experiment.get("subjects") else "",
    }
    result = await gemini_service.explain_code(
        code=experiment.get("code", ""),
        language=experiment.get("language", "python"),
        mode=payload.mode,
        context=context,
    )

    if "error" not in result:
        try:
            supabase.table("ai_explanations").insert(
                {
                    "experiment_id": payload.experiment_id,
                    "user_id": current_user["id"],
                    "mode": payload.mode,
                    "content": result,
                }
            ).execute()
        except Exception:
            pass  # Don't fail if caching fails

    return {"source": "generated", "explanation": result}


@router.get("/explanation/{experiment_id}")
async def get_explanation(
    experiment_id: str,
    mode: str = "detailed",
    current_user: dict = Depends(get_current_user),
):
    result = (
        supabase.table("ai_explanations")
        .select("*")
        .eq("experiment_id", experiment_id)
        .eq("user_id", current_user["id"])
        .eq("mode", mode)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="No saved explanation found.")
    return result.data[0]


# ---------------------------------------------------------------------------
# Viva Questions
# ---------------------------------------------------------------------------

@router.post("/viva-questions")
async def viva_questions(
    payload: VivaQuestionsRequest, current_user: dict = Depends(get_current_user)
):
    _require_gemini()
    experiment = _get_experiment(payload.experiment_id, current_user["id"])
    questions = await gemini_service.generate_viva_questions(
        experiment=experiment,
        difficulty=payload.difficulty,
        count=payload.count,
    )
    return {"questions": questions, "count": len(questions)}


# ---------------------------------------------------------------------------
# MCQs
# ---------------------------------------------------------------------------

@router.post("/mcqs")
async def generate_mcqs(
    payload: MCQRequest, current_user: dict = Depends(get_current_user)
):
    _require_gemini()
    if payload.experiment_id:
        experiment = _get_experiment(payload.experiment_id, current_user["id"])
    elif payload.subject_id:
        # Aggregate experiments from the subject for broader MCQs
        exp_result = (
            supabase.table("experiments")
            .select("*")
            .eq("subject_id", payload.subject_id)
            .eq("user_id", current_user["id"])
            .limit(5)
            .execute()
        )
        exps = exp_result.data or []
        if not exps:
            raise HTTPException(status_code=404, detail="No experiments found for subject.")
        # Use aggregated code
        experiment = {
            "name": "Multiple Experiments",
            "language": exps[0].get("language", "python"),
            "code": "\n\n---\n\n".join(e.get("code", "") for e in exps),
        }
    else:
        raise HTTPException(status_code=400, detail="experiment_id or subject_id required.")

    questions = await gemini_service.generate_mcqs(
        experiment=experiment, count=payload.count
    )
    return {"questions": questions, "count": len(questions)}


# ---------------------------------------------------------------------------
# Flashcards
# ---------------------------------------------------------------------------

@router.post("/flashcards")
async def generate_flashcards(
    payload: FlashcardsRequest, current_user: dict = Depends(get_current_user)
):
    _require_gemini()
    experiment = _get_experiment(payload.experiment_id, current_user["id"])
    cards = await gemini_service.generate_flashcards(
        experiment=experiment, count=payload.count
    )

    if payload.save and cards and "error" not in cards[0]:
        rows = [
            {
                "user_id": current_user["id"],
                "experiment_id": payload.experiment_id,
                "question": c.get("question", ""),
                "answer": c.get("answer", ""),
                "difficulty": c.get("difficulty", "medium"),
            }
            for c in cards
        ]
        try:
            supabase.table("flashcards").insert(rows).execute()
        except Exception:
            pass

    return {"flashcards": cards, "count": len(cards), "saved": payload.save}


# ---------------------------------------------------------------------------
# Revision Notes
# ---------------------------------------------------------------------------

@router.post("/revision-notes")
async def revision_notes(
    payload: RevisionNotesRequest, current_user: dict = Depends(get_current_user)
):
    _require_gemini()
    experiment = _get_experiment(payload.experiment_id, current_user["id"])
    notes = await gemini_service.generate_revision_notes(experiment=experiment)
    return notes


# ---------------------------------------------------------------------------
# Output Quiz
# ---------------------------------------------------------------------------

@router.post("/output-quiz")
async def output_quiz(
    payload: OutputQuizRequest, current_user: dict = Depends(get_current_user)
):
    _require_gemini()
    experiment = _get_experiment(payload.experiment_id, current_user["id"])
    quiz = await gemini_service.generate_output_quiz(
        code=experiment.get("code", ""),
        language=experiment.get("language", "python"),
    )
    return quiz


# ---------------------------------------------------------------------------
# Fill in the Blanks
# ---------------------------------------------------------------------------

@router.post("/fill-blanks")
async def fill_blanks(
    payload: FillBlanksRequest, current_user: dict = Depends(get_current_user)
):
    _require_gemini()
    experiment = _get_experiment(payload.experiment_id, current_user["id"])
    result = await gemini_service.generate_fill_blanks(
        code=experiment.get("code", ""),
        language=experiment.get("language", "python"),
    )
    return result


# ---------------------------------------------------------------------------
# Debug Challenge
# ---------------------------------------------------------------------------

@router.post("/debug-challenge")
async def debug_challenge(
    payload: DebugChallengeRequest, current_user: dict = Depends(get_current_user)
):
    _require_gemini()
    experiment = _get_experiment(payload.experiment_id, current_user["id"])
    result = await gemini_service.generate_debug_challenge(
        code=experiment.get("code", ""),
        language=experiment.get("language", "python"),
    )
    return result


# ---------------------------------------------------------------------------
# Evaluate Viva Answer
# ---------------------------------------------------------------------------

@router.post("/evaluate-answer")
async def evaluate_answer(
    payload: EvaluateAnswerRequest, current_user: dict = Depends(get_current_user)
):
    _require_gemini()
    experiment = _get_experiment(payload.experiment_id, current_user["id"])
    result = await gemini_service.evaluate_viva_answer(
        question=payload.question,
        user_answer=payload.user_answer,
        experiment_context=experiment,
    )
    return result
