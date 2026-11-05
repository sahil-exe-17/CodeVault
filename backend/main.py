"""
CodeVault Backend Application.
FastAPI REST API server with local SQLite Database & Google Gemini 2.5 Flash AI integration.
"""
import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Initialize SQLite database
from services.db import init_db

# Ensure uploads directory for student practical notebooks
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
NOTEBOOKS_DIR = os.path.join(UPLOAD_DIR, "notebooks")
os.makedirs(NOTEBOOKS_DIR, exist_ok=True)

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
init_db()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("codevault")

app = FastAPI(
    title="CodeVault API",
    description="Backend API for CodeVault - AI-Powered Coding Experiment & Revision Platform (SQLite + Gemini 2.5 Flash)",
    version="1.0.0",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# Mount Static Files for Uploaded Practical Notebooks
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


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
    db_path = os.getenv("DATABASE_PATH", "codevault.db")
    return {
        "status": "healthy",
        "service": "CodeVault API",
        "version": "1.0.0",
        "integrations": {
            "gemini_ai": "ready" if gemini_key else "not_configured",
            "database": f"sqlite_active ({db_path})",
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
