"""
Revision router: sessions, planner, and exam schedules.
"""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth import get_current_user
from models.revision import ExamScheduleCreate, RevisionSessionCreate
from services.supabase_client import supabase

router = APIRouter(tags=["revision"])


def _supabase_error(e: Exception, detail: str = "Database error"):
    raise HTTPException(status_code=500, detail=f"{detail}: {str(e)}")


# ---------------------------------------------------------------------------
# Revision Sessions
# ---------------------------------------------------------------------------

@router.get("/api/revision/sessions")
async def list_sessions(current_user: dict = Depends(get_current_user)):
    try:
        result = (
            supabase.table("revision_sessions")
            .select("*, experiments(name, language, subject_id)")
            .eq("user_id", current_user["id"])
            .order("scheduled_date")
            .execute()
        )
        return result.data or []
    except Exception as e:
        _supabase_error(e, "Failed to list revision sessions")


@router.post("/api/revision/sessions", status_code=status.HTTP_201_CREATED)
async def schedule_session(
    payload: RevisionSessionCreate, current_user: dict = Depends(get_current_user)
):
    try:
        data = payload.model_dump()
        data["user_id"] = current_user["id"]
        data["is_complete"] = False
        result = supabase.table("revision_sessions").insert(data).execute()
        return result.data[0]
    except Exception as e:
        _supabase_error(e, "Failed to schedule revision session")


@router.put("/api/revision/sessions/{session_id}/complete")
async def complete_session(
    session_id: str, current_user: dict = Depends(get_current_user)
):
    try:
        result = (
            supabase.table("revision_sessions")
            .update(
                {
                    "is_complete": True,
                    "completed_at": datetime.now(timezone.utc).isoformat(),
                }
            )
            .eq("id", session_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Session not found.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        _supabase_error(e, "Failed to complete session")


@router.get("/api/revision/planner")
async def get_planner(current_user: dict = Depends(get_current_user)):
    """Return this week's plan with overdue sessions."""
    try:
        now = datetime.now(timezone.utc)
        week_start = now.date().isoformat()
        week_end = (now + timedelta(days=7)).date().isoformat()

        # This week
        this_week = (
            supabase.table("revision_sessions")
            .select("*, experiments(name, language, subjects(name))")
            .eq("user_id", current_user["id"])
            .eq("is_complete", False)
            .gte("scheduled_date", week_start)
            .lte("scheduled_date", week_end)
            .order("scheduled_date")
            .execute()
        )

        # Overdue (before today, not complete)
        overdue = (
            supabase.table("revision_sessions")
            .select("*, experiments(name, language, subjects(name))")
            .eq("user_id", current_user["id"])
            .eq("is_complete", False)
            .lt("scheduled_date", week_start)
            .order("scheduled_date")
            .execute()
        )

        return {
            "this_week": this_week.data or [],
            "overdue": overdue.data or [],
            "week_start": week_start,
            "week_end": week_end,
        }
    except Exception as e:
        _supabase_error(e, "Failed to get planner")


# ---------------------------------------------------------------------------
# Exam Schedules
# ---------------------------------------------------------------------------

@router.get("/api/exam-schedules")
async def list_exam_schedules(current_user: dict = Depends(get_current_user)):
    try:
        result = (
            supabase.table("exam_schedules")
            .select("*, subjects(name, color)")
            .eq("user_id", current_user["id"])
            .order("exam_date")
            .execute()
        )
        return result.data or []
    except Exception as e:
        _supabase_error(e, "Failed to list exam schedules")


@router.post("/api/exam-schedules", status_code=status.HTTP_201_CREATED)
async def create_exam_schedule(
    payload: ExamScheduleCreate, current_user: dict = Depends(get_current_user)
):
    try:
        data = payload.model_dump()
        data["user_id"] = current_user["id"]
        result = supabase.table("exam_schedules").insert(data).execute()
        return result.data[0]
    except Exception as e:
        _supabase_error(e, "Failed to create exam schedule")


@router.delete("/api/exam-schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exam_schedule(
    schedule_id: str, current_user: dict = Depends(get_current_user)
):
    try:
        supabase.table("exam_schedules").delete().eq("id", schedule_id).eq(
            "user_id", current_user["id"]
        ).execute()
    except Exception as e:
        _supabase_error(e, "Failed to delete exam schedule")
