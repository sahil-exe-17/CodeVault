import os
import logging
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")


def get_supabase_client() -> Optional[Client]:
    """Return a service-role Supabase client for server-side operations."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        logger.warning("SUPABASE_URL and SUPABASE_SERVICE_KEY not set. Operating in offline/mock mode.")
        try:
            # Create a client with placeholder url/key to prevent NoneType attribute errors on table calls
            return create_client("https://placeholder.supabase.co", "placeholder-key")
        except Exception:
            return None
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def get_user_client(user_jwt: str) -> Optional[Client]:
    """Return a Supabase client scoped to the authenticated user's JWT."""
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        logger.warning("SUPABASE_URL and SUPABASE_ANON_KEY not set.")
        return None
    client: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    client.auth.set_session(user_jwt, "")
    return client


# Singleton service client used across the application
supabase: Client = get_supabase_client()
