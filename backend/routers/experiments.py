"""
Experiments router: full CRUD + import, bookmark, duplicate, mark-revised.
"""
import io
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from middleware.auth import get_current_user
from models.experiment import ExperimentCreate, ExperimentUpdate
from services.supabase_client import supabase

router = APIRouter(prefix="/api/experiments", tags=["experiments"])


def _check_ownership(experiment: dict, user_id: str):
    if not experiment or experiment.get("user_id") != user_id:
        raise HTTPException(status_code=404, detail="Experiment not found.")


def _supabase_error(e: Exception, detail: str = "Database error"):
    raise HTTPException(status_code=500, detail=f"{detail}: {str(e)}")


@router.get("")
async def list_experiments(
    subject_id: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    bookmarked: Optional[bool] = Query(None),
    sort: Optional[str] = Query("created_at"),
    current_user: dict = Depends(get_current_user),
):
    """List experiments with optional filters."""
    try:
        query = (
            supabase.table("experiments")
            .select("*, subjects(name, color)")
            .eq("user_id", current_user["id"])
        )
        if subject_id:
            query = query.eq("subject_id", subject_id)
        if language:
            query = query.eq("language", language)
        if bookmarked is not None:
            query = query.eq("is_bookmarked", bookmarked)
        if search:
            query = query.or_(
                f"name.ilike.%{search}%,description.ilike.%{search}%"
            )

        sort_field = sort if sort in ("created_at", "updated_at", "name") else "created_at"
        query = query.order(sort_field, desc=True)

        result = query.execute()
        return result.data or []
    except Exception as e:
        _supabase_error(e, "Failed to list experiments")


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_experiment(
    payload: ExperimentCreate, current_user: dict = Depends(get_current_user)
):
    try:
        data = payload.model_dump()
        data["user_id"] = current_user["id"]
        result = supabase.table("experiments").insert(data).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Insert returned no data.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        _supabase_error(e, "Failed to create experiment")


@router.get("/{experiment_id}")
async def get_experiment(
    experiment_id: str, current_user: dict = Depends(get_current_user)
):
    try:
        result = (
            supabase.table("experiments")
            .select("*, subjects(name, color, icon)")
            .eq("id", experiment_id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Experiment not found.")
        return result.data
    except HTTPException:
        raise
    except Exception as e:
        _supabase_error(e, "Failed to get experiment")


@router.put("/{experiment_id}")
async def update_experiment(
    experiment_id: str,
    payload: ExperimentUpdate,
    current_user: dict = Depends(get_current_user),
):
    try:
        data = {k: v for k, v in payload.model_dump().items() if v is not None}
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        result = (
            supabase.table("experiments")
            .update(data)
            .eq("id", experiment_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Experiment not found.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        _supabase_error(e, "Failed to update experiment")


@router.delete("/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_experiment(
    experiment_id: str, current_user: dict = Depends(get_current_user)
):
    try:
        supabase.table("experiments").delete().eq("id", experiment_id).eq(
            "user_id", current_user["id"]
        ).execute()
    except Exception as e:
        _supabase_error(e, "Failed to delete experiment")


@router.post("/{experiment_id}/duplicate", status_code=status.HTTP_201_CREATED)
async def duplicate_experiment(
    experiment_id: str, current_user: dict = Depends(get_current_user)
):
    """Duplicate an existing experiment."""
    try:
        result = (
            supabase.table("experiments")
            .select("*")
            .eq("id", experiment_id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Experiment not found.")

        original = result.data
        new_data = {
            k: v
            for k, v in original.items()
            if k not in ("id", "created_at", "updated_at")
        }
        new_data["name"] = f"{original['name']} (Copy)"
        new_data["is_bookmarked"] = False
        new_data["is_revised"] = False
        new_data["revised_at"] = None

        new_result = supabase.table("experiments").insert(new_data).execute()
        return new_result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        _supabase_error(e, "Failed to duplicate experiment")


@router.post("/{experiment_id}/bookmark")
async def toggle_bookmark(
    experiment_id: str, current_user: dict = Depends(get_current_user)
):
    """Toggle the bookmarked status of an experiment."""
    try:
        result = (
            supabase.table("experiments")
            .select("is_bookmarked")
            .eq("id", experiment_id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Experiment not found.")

        current_state = result.data.get("is_bookmarked", False)
        updated = (
            supabase.table("experiments")
            .update({"is_bookmarked": not current_state})
            .eq("id", experiment_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
        return {"is_bookmarked": not current_state, "experiment": updated.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        _supabase_error(e, "Failed to toggle bookmark")


@router.post("/{experiment_id}/mark-revised")
async def mark_revised(
    experiment_id: str, current_user: dict = Depends(get_current_user)
):
    """Mark an experiment as revised (toggles)."""
    try:
        result = (
            supabase.table("experiments")
            .select("is_revised")
            .eq("id", experiment_id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Experiment not found.")

        current_state = result.data.get("is_revised", False)
        new_state = not current_state
        update_data = {
            "is_revised": new_state,
            "revised_at": datetime.now(timezone.utc).isoformat() if new_state else None,
        }
        updated = (
            supabase.table("experiments")
            .update(update_data)
            .eq("id", experiment_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
        return {"is_revised": new_state, "experiment": updated.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        _supabase_error(e, "Failed to mark experiment as revised")


@router.post("/import-file", status_code=status.HTTP_201_CREATED)
async def import_file(
    file: UploadFile = File(...),
    subject_id: str = Form(...),
    name: Optional[str] = Form(None),
    language: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user),
):
    """Upload a code file and create an experiment from it."""
    try:
        content_bytes = await file.read()
        code = content_bytes.decode("utf-8", errors="replace")

        # Auto-detect language from extension
        filename = file.filename or "code.txt"
        ext_map = {
            ".py": "python", ".java": "java", ".c": "c", ".cpp": "cpp",
            ".js": "javascript", ".ts": "typescript", ".ipynb": "python",
            ".go": "go", ".rb": "ruby", ".cs": "csharp",
        }
        ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        detected_language = language or ext_map.get(ext, "text")
        detected_name = name or filename.rsplit(".", 1)[0]

        data = {
            "user_id": current_user["id"],
            "subject_id": subject_id,
            "name": detected_name,
            "code": code,
            "language": detected_language,
            "file_name": filename,
        }
        result = supabase.table("experiments").insert(data).execute()
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        _supabase_error(e, "Failed to import file")


@router.get("/{experiment_id}/related")
async def get_related_experiments(
    experiment_id: str, current_user: dict = Depends(get_current_user)
):
    """Get experiments related by subject or language."""
    try:
        # Fetch the target experiment
        target = (
            supabase.table("experiments")
            .select("subject_id, language")
            .eq("id", experiment_id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )
        if not target.data:
            raise HTTPException(status_code=404, detail="Experiment not found.")

        related = (
            supabase.table("experiments")
            .select("id, name, language, is_revised, subject_id")
            .eq("user_id", current_user["id"])
            .eq("subject_id", target.data["subject_id"])
            .neq("id", experiment_id)
            .limit(10)
            .execute()
        )
        return related.data or []
    except HTTPException:
        raise
    except Exception as e:
        _supabase_error(e, "Failed to get related experiments")
