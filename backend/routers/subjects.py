"""
Subjects router: CRUD for experiment subjects/categories.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth import get_current_user
from models.subject import SubjectCreate, SubjectUpdate
from services.supabase_client import supabase

router = APIRouter(prefix="/api/subjects", tags=["subjects"])


def _handle_supabase_error(e: Exception, detail: str = "Database error"):
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{detail}: {str(e)}")


@router.get("")
async def list_subjects(current_user: dict = Depends(get_current_user)):
    """List all subjects for the authenticated user, with experiment counts."""
    try:
        result = (
            supabase.table("subjects")
            .select("*, experiments(count)")
            .eq("user_id", current_user["id"])
            .order("created_at", desc=True)
            .execute()
        )
        subjects = result.data or []
        # Flatten experiment count
        for s in subjects:
            count_data = s.pop("experiments", [])
            if isinstance(count_data, list) and count_data:
                s["experiment_count"] = count_data[0].get("count", 0)
            else:
                s["experiment_count"] = 0
        return subjects
    except Exception as e:
        _handle_supabase_error(e, "Failed to list subjects")


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_subject(
    payload: SubjectCreate, current_user: dict = Depends(get_current_user)
):
    """Create a new subject."""
    try:
        data = payload.model_dump()
        data["user_id"] = current_user["id"]
        result = supabase.table("subjects").insert(data).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Insert returned no data.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        _handle_supabase_error(e, "Failed to create subject")


@router.get("/{subject_id}")
async def get_subject(subject_id: str, current_user: dict = Depends(get_current_user)):
    """Get a single subject with experiment count."""
    try:
        result = (
            supabase.table("subjects")
            .select("*, experiments(count)")
            .eq("id", subject_id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Subject not found.")
        s = result.data
        count_data = s.pop("experiments", [])
        if isinstance(count_data, list) and count_data:
            s["experiment_count"] = count_data[0].get("count", 0)
        else:
            s["experiment_count"] = 0
        return s
    except HTTPException:
        raise
    except Exception as e:
        _handle_supabase_error(e, "Failed to get subject")


@router.put("/{subject_id}")
async def update_subject(
    subject_id: str,
    payload: SubjectUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update a subject."""
    try:
        data = {k: v for k, v in payload.model_dump().items() if v is not None}
        result = (
            supabase.table("subjects")
            .update(data)
            .eq("id", subject_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Subject not found.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        _handle_supabase_error(e, "Failed to update subject")


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(
    subject_id: str, current_user: dict = Depends(get_current_user)
):
    """Delete a subject and cascade-delete all its experiments."""
    try:
        # Cascade delete experiments first (if not handled by DB)
        supabase.table("experiments").delete().eq("subject_id", subject_id).eq(
            "user_id", current_user["id"]
        ).execute()
        supabase.table("subjects").delete().eq("id", subject_id).eq(
            "user_id", current_user["id"]
        ).execute()
    except Exception as e:
        _handle_supabase_error(e, "Failed to delete subject")
