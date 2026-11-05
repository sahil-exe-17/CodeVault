"""
Authentication middleware for CodeVault.
Operates with local SQLite user accounts and bearer session tokens.
"""
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from services.db import get_connection

logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)

DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    FastAPI dependency that resolves the authenticated user from SQLite.
    Resolves by token ID, user ID, or returns the primary active user.
    """
    token = credentials.credentials if credentials else None
    user_id_target = None
    if token and token.startswith("token_"):
        user_id_target = token.replace("token_", "")
    elif token and len(token) > 20 and "-" in token:
        user_id_target = token

    conn = get_connection()
    cursor = conn.cursor()

    try:
        if user_id_target:
            cursor.execute("SELECT * FROM users WHERE id = ? OR email = ?", (user_id_target, user_id_target))
            row = cursor.fetchone()
            if row:
                d = dict(row)
                d["token"] = token
                return d

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid authentication token. Please sign in again.",
        )
    finally:
        conn.close()
