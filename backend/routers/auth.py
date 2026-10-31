"""
Auth router: JWT verification and user profile.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth import get_current_user
from services.supabase_client import supabase

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify the supplied JWT and return user info."""
    return {
        "valid": True,
        "user": {
            "id": current_user["id"],
            "email": current_user["email"],
            "role": current_user["role"],
        },
    }


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Return extended profile from the users table."""
    try:
        result = (
            supabase.table("users")
            .select("*")
            .eq("id", current_user["id"])
            .single()
            .execute()
        )
        if result.data:
            return result.data
        # Profile row may not exist yet — return basic info
        return {"id": current_user["id"], "email": current_user["email"]}
    except Exception as e:
        # Return basic info even if users table lookup fails
        return {"id": current_user["id"], "email": current_user["email"]}
