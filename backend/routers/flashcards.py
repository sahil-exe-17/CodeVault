"""
Flashcards router: CRUD and progress tracking.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from middleware.auth import get_current_user
from models.flashcard import FlashcardCreate, FlashcardUpdate
from services.supabase_client import supabase

router = APIRouter(prefix="/api/flashcards", tags=["flashcards"])


def _supabase_error(e: Exception, detail: str = "Database error"):
    raise HTTPException(status_code=500, detail=f"{detail}: {str(e)}")


@router.get("")
async def list_flashcards(
    experiment_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    try:
        query = (
            supabase.table("flashcards")
            .select("*")
            .eq("user_id", current_user["id"])
            .order("created_at", desc=True)
        )
        if experiment_id:
            query = query.eq("experiment_id", experiment_id)
        result = query.execute()
        return result.data or []
    except Exception as e:
        _supabase_error(e, "Failed to list flashcards")


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_flashcard(
    payload: FlashcardCreate, current_user: dict = Depends(get_current_user)
):
    try:
        data = payload.model_dump()
        data["user_id"] = current_user["id"]
        result = supabase.table("flashcards").insert(data).execute()
        return result.data[0]
    except Exception as e:
        _supabase_error(e, "Failed to create flashcard")


@router.put("/{flashcard_id}")
async def update_flashcard(
    flashcard_id: str,
    payload: FlashcardUpdate,
    current_user: dict = Depends(get_current_user),
):
    try:
        data = {k: v for k, v in payload.model_dump().items() if v is not None}
        result = (
            supabase.table("flashcards")
            .update(data)
            .eq("id", flashcard_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Flashcard not found.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        _supabase_error(e, "Failed to update flashcard")


@router.delete("/{flashcard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flashcard(
    flashcard_id: str, current_user: dict = Depends(get_current_user)
):
    try:
        supabase.table("flashcards").delete().eq("id", flashcard_id).eq(
            "user_id", current_user["id"]
        ).execute()
    except Exception as e:
        _supabase_error(e, "Failed to delete flashcard")
