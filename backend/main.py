"""
CodeVault Backend Application.
FastAPI REST API server with Supabase & Google Gemini AI integrations.
"""
import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Import routers
from routers import (
    auth,
    subjects,
    experiments,
    ai,
    conversations,
    flashcards,
    quizzes,
    revision,
    analytics,
)
from services.github_service import get_repo_files, get_file_content

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("codevault")

app = FastAPI(
    title="CodeVault API",
    description="Backend API for CodeVault - AI-Powered Coding Experiment & Revision Platform",
    version="1.0.0",
)

# CORS setup
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development permissive
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(subjects.router)
app.include_router(experiments.router)
app.include_router(ai.router)
app.include_router(conversations.router)
app.include_router(flashcards.router)
app.include_router(quizzes.router)
app.include_router(revision.router)
app.include_router(analytics.router)


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An unexpected error occurred: {str(exc)}"},
    )


# Health Check
@app.get("/api/health", tags=["system"])
async def health_check():
    gemini_key = bool(os.getenv("GEMINI_API_KEY"))
    supabase_configured = bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_SERVICE_KEY"))
    return {
        "status": "healthy",
        "service": "CodeVault API",
        "version": "1.0.0",
        "integrations": {
            "gemini_ai": "ready" if gemini_key else "not_configured",
            "supabase": "ready" if supabase_configured else "offline_or_unconfigured",
        }
    }


# GitHub Integration Endpoints
@app.get("/api/github/files", tags=["integrations"])
async def list_github_repo_files(repo_url: str, token: str = None):
    try:
        files = await get_repo_files(repo_url, token)
        return files
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"detail": f"Failed to list GitHub files: {str(e)}"}
        )


@app.get("/api/github/file-content", tags=["integrations"])
async def read_github_file(repo_url: str, file_path: str, token: str = None):
    try:
        content = await get_file_content(repo_url, file_path, token)
        return {"content": content, "file_path": file_path}
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"detail": f"Failed to read GitHub file content: {str(e)}"}
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
