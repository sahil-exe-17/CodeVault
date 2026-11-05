"""
Experiments router: full CRUD + import, bookmark, duplicate, mark-revised using SQLite.
"""
import json
import os
import re
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from middleware.auth import get_current_user
from models.experiment import ExperimentCreate, ExperimentUpdate
from services.db import get_connection
from services.gemini_service import extract_code_from_photo

router = APIRouter(prefix="/api/experiments", tags=["experiments"])


def _serialize_experiment(d: dict) -> dict:
    """Format experiment dictionary and unpack multi-code files."""
    d["is_bookmarked"] = bool(d.get("is_bookmarked", 0))
    d["is_revised"] = bool(d.get("is_revised", 0))
    d["subjects"] = {"name": d.get("subject_name") or "General Programming"}

    raw_files = d.get("code_files")
    if raw_files and isinstance(raw_files, str):
        try:
            d["code_files"] = json.loads(raw_files)
        except Exception:
            d["code_files"] = []
    elif not isinstance(raw_files, list):
        d["code_files"] = []

    if not d["code_files"]:
        d["code_files"] = [{
            "id": "c1",
            "title": "Code 1",
            "language": d.get("language") or "c",
            "code": d.get("source_code") or ""
        }]
    return d


@router.get("")
async def list_experiments(
    subject_id: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    bookmarked: Optional[bool] = Query(None),
    sort: Optional[str] = Query("newest"),
    current_user: dict = Depends(get_current_user),
):
    """List experiments with optional filters."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        query = """
            SELECT e.*, s.name as subject_name, s.color as subject_color
            FROM experiments e
            LEFT JOIN subjects s ON e.subject_id = s.id
            WHERE e.user_id = ?
        """
        params = [current_user["id"]]

        if subject_id and subject_id != "all":
            query += " AND e.subject_id = ?"
            params.append(subject_id)

        if language and language != "all":
            query += " AND LOWER(e.language) = LOWER(?)"
            params.append(language)

        if bookmarked is not None:
            query += " AND e.is_bookmarked = ?"
            params.append(1 if bookmarked else 0)

        if search:
            query += " AND (e.title LIKE ? OR e.topic LIKE ? OR e.aim LIKE ?)"
            term = f"%{search}%"
            params.extend([term, term, term])

        if sort == "oldest":
            query += " ORDER BY e.created_at ASC"
        elif sort == "az":
            query += " ORDER BY e.title ASC"
        elif sort == "za":
            query += " ORDER BY e.title DESC"
        else:
            query += " ORDER BY e.created_at DESC"

        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [_serialize_experiment(dict(r)) for r in rows]
    finally:
        conn.close()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_experiment(
    payload: ExperimentCreate, current_user: dict = Depends(get_current_user)
):
    """Create a new experiment with multi-code snippet support."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    exp_id = str(uuid.uuid4())
    try:
        data = payload.model_dump()

        code_files = data.get("code_files") or []
        if code_files and isinstance(code_files, list):
            code_files_json = json.dumps(code_files)
            primary_code = code_files[0].get("code", data.get("source_code") or "")
            primary_lang = code_files[0].get("language", data.get("language") or "c")
        else:
            primary_code = data.get("source_code") or ""
            primary_lang = data.get("language") or "c"
            code_files_json = json.dumps([{
                "id": "c1",
                "title": "Code 1",
                "language": primary_lang,
                "code": primary_code,
            }])

        cursor.execute("""
            INSERT INTO experiments (
                id, user_id, subject_id, title, experiment_number, topic, language,
                aim, theory, algorithm, source_code, code_files, sample_input, expected_output,
                actual_output, observations, personal_notes, time_complexity, space_complexity,
                is_bookmarked, is_revised, revision_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            exp_id,
            current_user["id"],
            data.get("subject_id"),
            data.get("title") or "Untitled Experiment",
            data.get("experiment_number") or "EXP-01",
            data.get("topic") or "",
            primary_lang,
            data.get("aim") or "",
            data.get("theory") or "",
            data.get("algorithm") or "",
            primary_code,
            code_files_json,
            data.get("sample_input") or "",
            data.get("expected_output") or "",
            data.get("actual_output") or "",
            data.get("observations") or "",
            data.get("personal_notes") or "",
            data.get("time_complexity") or "O(n)",
            data.get("space_complexity") or "O(1)",
            1 if data.get("is_bookmarked") else 0,
            1 if data.get("is_revised") else 0,
            data.get("revision_count") or 0,
            now,
            now
        ))
        conn.commit()

        cursor.execute("SELECT * FROM experiments WHERE id = ?", (exp_id,))
        created = dict(cursor.fetchone())
        return _serialize_experiment(created)
    finally:
        conn.close()


@router.get("/{experiment_id}")
async def get_experiment(
    experiment_id: str, current_user: dict = Depends(get_current_user)
):
    """Get single experiment by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT e.*, s.name as subject_name
            FROM experiments e
            LEFT JOIN subjects s ON e.subject_id = s.id
            WHERE e.id = ? AND e.user_id = ?
        """, (experiment_id, current_user["id"]))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Experiment not found")
        
        return _serialize_experiment(dict(row))
    finally:
        conn.close()


@router.put("/{experiment_id}")
async def update_experiment(
    experiment_id: str,
    payload: ExperimentUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update an existing experiment."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    try:
        cursor.execute("SELECT id FROM experiments WHERE id = ? AND user_id = ?", (experiment_id, current_user["id"]))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Experiment not found")

        updates = payload.model_dump(exclude_unset=True)
        if "is_bookmarked" in updates:
            updates["is_bookmarked"] = 1 if updates["is_bookmarked"] else 0
        if "is_revised" in updates:
            updates["is_revised"] = 1 if updates["is_revised"] else 0

        if "code_files" in updates:
            if isinstance(updates["code_files"], list):
                if updates["code_files"]:
                    updates["source_code"] = updates["code_files"][0].get("code", "")
                    updates["language"] = updates["code_files"][0].get("language", "c")
                updates["code_files"] = json.dumps(updates["code_files"])

        set_clauses = [f"{k} = ?" for k in updates.keys()]
        set_clauses.append("updated_at = ?")
        values = list(updates.values()) + [now, experiment_id]

        cursor.execute(f"UPDATE experiments SET {', '.join(set_clauses)} WHERE id = ?", values)
        conn.commit()

        cursor.execute("SELECT * FROM experiments WHERE id = ?", (experiment_id,))
        updated = dict(cursor.fetchone())
        return _serialize_experiment(updated)
    finally:
        conn.close()


@router.delete("/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_experiment(
    experiment_id: str, current_user: dict = Depends(get_current_user)
):
    """Delete experiment."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM experiments WHERE id = ? AND user_id = ?", (experiment_id, current_user["id"]))
        conn.commit()
    finally:
        conn.close()


@router.post("/{experiment_id}/duplicate")
async def duplicate_experiment(
    experiment_id: str, current_user: dict = Depends(get_current_user)
):
    """Duplicate an experiment."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    new_id = str(uuid.uuid4())
    try:
        cursor.execute("SELECT * FROM experiments WHERE id = ? AND user_id = ?", (experiment_id, current_user["id"]))
        source = cursor.fetchone()
        if not source:
            raise HTTPException(status_code=404, detail="Experiment not found")

        d = dict(source)
        cursor.execute("""
            INSERT INTO experiments (
                id, user_id, subject_id, title, experiment_number, topic, language,
                aim, theory, algorithm, source_code, sample_input, expected_output,
                actual_output, observations, personal_notes, time_complexity, space_complexity,
                is_bookmarked, is_revised, revision_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            new_id,
            current_user["id"],
            d["subject_id"],
            f"{d['title']} (Copy)",
            d["experiment_number"],
            d["topic"],
            d["language"],
            d["aim"],
            d["theory"],
            d["algorithm"],
            d["source_code"],
            d["sample_input"],
            d["expected_output"],
            d["actual_output"],
            d["observations"],
            d["personal_notes"],
            d["time_complexity"],
            d["space_complexity"],
            d["is_bookmarked"],
            0,
            0,
            now,
            now
        ))
        conn.commit()

        cursor.execute("SELECT * FROM experiments WHERE id = ?", (new_id,))
        dup = dict(cursor.fetchone())
        dup["is_bookmarked"] = bool(dup["is_bookmarked"])
        dup["is_revised"] = bool(dup["is_revised"])
        return dup
    finally:
        conn.close()


@router.post("/{experiment_id}/bookmark")
async def toggle_bookmark(
    experiment_id: str, current_user: dict = Depends(get_current_user)
):
    """Toggle bookmark state."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_bookmarked FROM experiments WHERE id = ? AND user_id = ?", (experiment_id, current_user["id"]))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Experiment not found")

        current_val = row["is_bookmarked"]
        new_val = 0 if current_val else 1
        cursor.execute("UPDATE experiments SET is_bookmarked = ? WHERE id = ?", (new_val, experiment_id))
        conn.commit()

        return {"is_bookmarked": bool(new_val)}
    finally:
        conn.close()


@router.post("/{experiment_id}/mark-revised")
async def mark_revised(
    experiment_id: str, current_user: dict = Depends(get_current_user)
):
    """Mark experiment as revised."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT is_revised, revision_count FROM experiments WHERE id = ? AND user_id = ?", (experiment_id, current_user["id"]))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Experiment not found")

        current_val = row["is_revised"]
        new_val = 0 if current_val else 1
        new_count = row["revision_count"] + (1 if new_val == 1 else 0)

        cursor.execute("UPDATE experiments SET is_revised = ?, revision_count = ? WHERE id = ?", (new_val, new_count, experiment_id))
        conn.commit()

        return {"is_revised": bool(new_val), "revision_count": new_count}
    finally:
        conn.close()


@router.get("/{experiment_id}/related")
async def get_related_experiments(
    experiment_id: str, current_user: dict = Depends(get_current_user)
):
    """Get related practicals by subject or language."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT subject_id, language FROM experiments WHERE id = ? AND user_id = ?", (experiment_id, current_user["id"]))
        source = cursor.fetchone()
        if not source:
            return []

        cursor.execute("""
            SELECT id, title, experiment_number, language, topic
            FROM experiments
            WHERE user_id = ? AND id != ? AND (subject_id = ? OR language = ?)
            LIMIT 5
        """, (current_user["id"], experiment_id, source["subject_id"], source["language"]))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@router.post("/import-file")
async def import_file(
    file: UploadFile = File(...), current_user: dict = Depends(get_current_user)
):
    """Import code file directly."""
    content_bytes = await file.read()
    content = content_bytes.decode("utf-8", errors="replace")

    filename = file.filename or "code.txt"
    ext = filename.split(".")[-1].lower() if "." in filename else "txt"
    lang_map = {
        "py": "python",
        "c": "c",
        "cpp": "cpp",
        "java": "java",
        "js": "javascript",
        "ts": "typescript",
    }
    language = lang_map.get(ext, "other")

    title = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").title()

    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    exp_id = str(uuid.uuid4())
    try:
        cursor.execute("""
            INSERT INTO experiments (
                id, user_id, title, experiment_number, language, aim, source_code,
                is_bookmarked, is_revised, revision_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            exp_id,
            current_user["id"],
            title,
            "IMP-01",
            language,
            f"Imported from {filename}",
            content,
            0, 0, 0, now, now
        ))
        conn.commit()
        return {"id": exp_id, "title": title, "language": language}
    finally:
        conn.close()


@router.post("/{experiment_id}/notebook-pdf")
async def upload_notebook_pdf(
    experiment_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload and archive student's practical notebook PDF for this experiment.
    Safeguards notes in case the physical book is lost, damaged, or submitted.
    """
    filename = file.filename or "notebook.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported for practical notebook uploads (.pdf)"
        )

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, notebook_pdf_url FROM experiments WHERE id = ? AND user_id = ?",
            (experiment_id, current_user["id"])
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Experiment not found")

        contents = await file.read()
        file_size = len(contents)
        if file_size > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds the 50MB limit.")

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        notebooks_dir = os.path.join(base_dir, "uploads", "notebooks")
        os.makedirs(notebooks_dir, exist_ok=True)

        clean_filename = re.sub(r"[^a-zA-Z0-9_\.-]", "_", filename)
        saved_filename = f"{experiment_id}_{clean_filename}"
        file_path = os.path.join(notebooks_dir, saved_filename)

        with open(file_path, "wb") as f:
            f.write(contents)

        old_url = row["notebook_pdf_url"]
        if old_url:
            old_filename = old_url.split("/")[-1]
            if old_filename != saved_filename:
                old_path = os.path.join(notebooks_dir, old_filename)
                if os.path.exists(old_path):
                    try:
                        os.remove(old_path)
                    except Exception:
                        pass

        pdf_url = f"/uploads/notebooks/{saved_filename}"
        now = datetime.now(timezone.utc).isoformat()

        cursor.execute("""
            UPDATE experiments 
            SET notebook_pdf_url = ?, notebook_pdf_name = ?, notebook_pdf_size = ?, notebook_uploaded_at = ?, updated_at = ?
            WHERE id = ?
        """, (pdf_url, filename, file_size, now, now, experiment_id))
        conn.commit()

        cursor.execute("SELECT * FROM experiments WHERE id = ?", (experiment_id,))
        updated = dict(cursor.fetchone())
        updated["is_bookmarked"] = bool(updated["is_bookmarked"])
        updated["is_revised"] = bool(updated["is_revised"])
        return updated
    finally:
        conn.close()


@router.delete("/{experiment_id}/notebook-pdf")
async def delete_notebook_pdf(
    experiment_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete the uploaded practical notebook PDF for this experiment."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, notebook_pdf_url FROM experiments WHERE id = ? AND user_id = ?",
            (experiment_id, current_user["id"])
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Experiment not found")

        old_url = row["notebook_pdf_url"]
        if old_url:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            notebooks_dir = os.path.join(base_dir, "uploads", "notebooks")
            old_filename = old_url.split("/")[-1]
            old_path = os.path.join(notebooks_dir, old_filename)
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                except Exception:
                    pass

        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
            UPDATE experiments 
            SET notebook_pdf_url = NULL, notebook_pdf_name = NULL, notebook_pdf_size = NULL, notebook_uploaded_at = NULL, updated_at = ?
            WHERE id = ?
        """, (now, experiment_id))
        conn.commit()

        return {"success": True, "message": "Practical notebook PDF removed."}
    finally:
        conn.close()


@router.post("/extract-code-photo")
async def extract_code_from_photo_endpoint(
    file: UploadFile = File(...),
    subject_id: Optional[str] = Form(None),
    auto_create: bool = Form(False),
    current_user: dict = Depends(get_current_user),
):
    """
    Read handwritten code or textbook/screen code from an uploaded photo using Gemini Multimodal Vision.
    If auto_create is True, automatically provisions a new experiment with the extracted code and logic.
    """
    filename = file.filename or "photo.jpg"
    mime_type = file.content_type or "image/jpeg"
    if not mime_type.startswith("image/"):
        ext = filename.split(".")[-1].lower()
        mime_map = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp"}
        mime_type = mime_map.get(ext, "image/jpeg")

    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds the 20MB limit.")

    extracted = await extract_code_from_photo(contents, mime_type=mime_type)

    if not auto_create:
        return extracted

    # Auto create experiment in SQLite
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    exp_id = str(uuid.uuid4())
    try:
        lang = extracted.get("language") or "c"
        code = extracted.get("source_code") or ""
        code_files_json = json.dumps([{
            "id": "c1",
            "title": "Code 1",
            "language": lang,
            "code": code,
        }])

        cursor.execute("""
            INSERT INTO experiments (
                id, user_id, subject_id, title, experiment_number, topic, language,
                aim, theory, algorithm, source_code, code_files, sample_input, expected_output,
                observations, personal_notes, time_complexity, space_complexity,
                is_bookmarked, is_revised, revision_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            exp_id,
            current_user["id"],
            subject_id,
            extracted.get("title") or "Photo Extracted Experiment",
            extracted.get("experiment_number") or "EXP-SCAN",
            extracted.get("topic") or "Extracted from Photo",
            lang,
            extracted.get("aim") or "Implementation transcribed from notebook photograph.",
            extracted.get("theory") or "",
            extracted.get("algorithm") or "",
            code,
            code_files_json,
            extracted.get("sample_input") or "",
            extracted.get("expected_output") or "",
            extracted.get("observations") or "",
            "Transcribed via CodeVault AI Vision.",
            "O(n)",
            "O(1)",
            0, 0, 0, now, now
        ))
        conn.commit()

        cursor.execute("SELECT * FROM experiments WHERE id = ?", (exp_id,))
        created = dict(cursor.fetchone())
        serialized = _serialize_experiment(created)
        return {**serialized, "extracted": extracted}
    finally:
        conn.close()


@router.post("/{experiment_id}/extract-from-photo")
async def extract_and_update_experiment(
    experiment_id: str,
    file: UploadFile = File(...),
    replace_code_only: bool = Form(False),
    current_user: dict = Depends(get_current_user),
):
    """
    Read code from an uploaded photo and upload/populate it into an EXISTING experiment.
    Updates or appends code snippets into the experiment.
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM experiments WHERE id = ? AND user_id = ?", (experiment_id, current_user["id"]))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Experiment not found")

        current_exp = dict(row)
        filename = file.filename or "photo.jpg"
        mime_type = file.content_type or "image/jpeg"
        if not mime_type.startswith("image/"):
            ext = filename.split(".")[-1].lower()
            mime_map = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp"}
            mime_type = mime_map.get(ext, "image/jpeg")

        contents = await file.read()
        extracted = await extract_code_from_photo(contents, mime_type=mime_type)

        now = datetime.now(timezone.utc).isoformat()
        new_code = extracted.get("source_code") or current_exp["source_code"]
        new_lang = extracted.get("language") or current_exp["language"]

        # Parse existing code files
        current_files = []
        if current_exp.get("code_files"):
            try:
                current_files = json.loads(current_exp["code_files"])
            except Exception:
                current_files = []

        new_snippet = {
            "id": f"scan_{uuid.uuid4().hex[:6]}",
            "title": f"Scanned Code ({new_lang.upper()})",
            "language": new_lang,
            "code": new_code,
        }

        if replace_code_only and current_files:
            # Replace active/first code
            current_files[0]["code"] = new_code
            current_files[0]["language"] = new_lang
        else:
            # Append as another code snippet
            current_files.append(new_snippet)

        code_files_json = json.dumps(current_files)

        new_title = current_exp["title"] if current_exp["title"] and current_exp["title"] != "New Experiment" else extracted.get("title", current_exp["title"])
        new_aim = current_exp["aim"] or extracted.get("aim")
        new_algo = current_exp["algorithm"] or extracted.get("algorithm")
        new_theory = current_exp["theory"] or extracted.get("theory")
        new_input = current_exp["sample_input"] or extracted.get("sample_input")
        new_output = current_exp["expected_output"] or extracted.get("expected_output")

        cursor.execute("""
            UPDATE experiments SET
                source_code = ?, language = ?, code_files = ?, title = ?, aim = ?,
                algorithm = ?, theory = ?, sample_input = ?, expected_output = ?,
                updated_at = ?
            WHERE id = ?
        """, (new_code, new_lang, code_files_json, new_title, new_aim, new_algo, new_theory, new_input, new_output, now, experiment_id))

        conn.commit()

        cursor.execute("SELECT * FROM experiments WHERE id = ?", (experiment_id,))
        updated = dict(cursor.fetchone())
        serialized = _serialize_experiment(updated)
        return {**serialized, "extracted": extracted}
    finally:
        conn.close()
