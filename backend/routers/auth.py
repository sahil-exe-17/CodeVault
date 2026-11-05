"""
Auth router: login, signup, Google auth, profile onboarding & updates using SQLite.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth import get_current_user
from services.db import get_connection

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None


class SignupRequest(BaseModel):
    email: str
    password: Optional[str] = None
    display_name: Optional[str] = None


class GoogleAuthRequest(BaseModel):
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    google_id: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    roll_number: Optional[str] = None
    coding_goals: Optional[str] = None


def _format_user(row: dict) -> dict:
    return {
        "id": row["id"],
        "email": row["email"],
        "username": row.get("username") or row["email"].split("@")[0],
        "display_name": row.get("display_name") or row["email"].split("@")[0],
        "avatar_url": row.get("avatar_url") or "",
        "college": row.get("college") or "",
        "department": row.get("department") or "",
        "semester": row.get("semester") or "",
        "roll_number": row.get("roll_number") or "",
        "coding_goals": row.get("coding_goals") or "",
        "is_profile_completed": bool(row.get("is_profile_completed", 0)),
        "auth_provider": row.get("auth_provider") or "email",
        "created_at": row.get("created_at"),
    }


@router.post("/login")
async def login(payload: LoginRequest):
    """Authenticate user with email/password."""
    email = payload.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="No account found with this email. Please click Sign up to create an account.")

        user_row = dict(row)
        stored_hash = user_row.get("password_hash")
        # Validate password if user set a password and didn't use google auth
        if stored_hash and payload.password:
            if stored_hash != payload.password:
                raise HTTPException(status_code=400, detail="Incorrect password. Please check your credentials.")

        user = _format_user(user_row)
        return {
            "token": f"token_{user['id']}",
            "user": user,
            "is_profile_completed": user["is_profile_completed"],
        }
    finally:
        conn.close()


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest):
    """Create a new user account with email and password."""
    email = payload.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address")

    if payload.password and len(payload.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters long")

    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    try:
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()

        if row:
            raise HTTPException(
                status_code=400,
                detail="An account with this email already exists. Please switch to Sign in above."
            )

        user_id = str(uuid.uuid4())
        display_name = payload.display_name or email.split("@")[0].title()
        cursor.execute("""
            INSERT INTO users (id, email, username, display_name, password_hash, auth_provider, is_profile_completed, created_at)
            VALUES (?, ?, ?, ?, ?, 'email', 0, ?)
        """, (user_id, email, email.split("@")[0], display_name, payload.password or "", now))
        conn.commit()

        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        created = dict(cursor.fetchone())
        user = _format_user(created)

        return {
            "token": f"token_{user['id']}",
            "user": user,
            "is_profile_completed": False,
        }
    finally:
        conn.close()


@router.post("/google")
async def google_auth(payload: GoogleAuthRequest):
    """Sign in or register with Google OAuth credentials."""
    email = payload.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Google authentication failed: Email is required")

    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    try:
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()

        if row:
            user = _format_user(dict(row))
            return {
                "token": f"token_{user['id']}",
                "user": user,
                "is_profile_completed": user["is_profile_completed"],
            }

        user_id = str(uuid.uuid4())
        display_name = payload.name or email.split("@")[0].title()
        cursor.execute("""
            INSERT INTO users (id, email, username, display_name, avatar_url, auth_provider, is_profile_completed, created_at)
            VALUES (?, ?, ?, ?, ?, 'google', 0, ?)
        """, (user_id, email, email.split("@")[0], display_name, payload.avatar_url or "", now))
        conn.commit()

        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        created = dict(cursor.fetchone())
        user = _format_user(created)

        return {
            "token": f"token_{user['id']}",
            "user": user,
            "is_profile_completed": False,
        }
    finally:
        conn.close()


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Return user profile from SQLite users table."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE id = ?", (current_user["id"],))
        row = cursor.fetchone()
        if row:
            return _format_user(dict(row))
        return _format_user(current_user)
    finally:
        conn.close()


@router.put("/profile")
async def update_profile(
    payload: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update profile with onboarding answers and mark profile as completed."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        updates = payload.model_dump(exclude_unset=True)
        updates["is_profile_completed"] = 1

        set_clauses = [f"{k} = ?" for k in updates.keys()]
        values = list(updates.values()) + [current_user["id"]]

        cursor.execute(f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ?", values)
        conn.commit()

        cursor.execute("SELECT * FROM users WHERE id = ?", (current_user["id"],))
        updated = dict(cursor.fetchone())
        return _format_user(updated)
    finally:
        conn.close()


@router.post("/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify session token."""
    return {
        "valid": True,
        "user": _format_user(current_user),
    }
