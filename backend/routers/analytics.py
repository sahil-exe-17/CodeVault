"""
Analytics router: provides overview stats, language distribution,
weekly activity, quiz performance, and weak topics.
"""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user
from services.supabase_client import supabase

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview")
async def get_overview(current_user: dict = Depends(get_current_user)):
    """Fetch high-level overview metrics."""
    try:
        user_id = current_user["id"]
        
        # Total experiments
        exp_res = (
            supabase.table("experiments")
            .select("id, is_revised, is_bookmarked", count="exact")
            .eq("user_id", user_id)
            .execute()
        )
        total_experiments = exp_res.count if exp_res.count is not None else len(exp_res.data or [])
        revised_count = sum(1 for e in (exp_res.data or []) if e.get("is_revised"))
        bookmarked_count = sum(1 for e in (exp_res.data or []) if e.get("is_bookmarked"))
        revision_completion_percent = round((revised_count / total_experiments * 100), 1) if total_experiments > 0 else 0

        # Total subjects
        sub_res = (
            supabase.table("subjects")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .execute()
        )
        total_subjects = sub_res.count if sub_res.count is not None else len(sub_res.data or [])

        # Quiz attempts
        quiz_res = (
            supabase.table("quiz_attempts")
            .select("score, total_questions")
            .eq("user_id", user_id)
            .execute()
        )
        attempts = quiz_res.data or []
        if attempts:
            scores = [
                (a["score"] / a["total_questions"] * 100)
                for a in attempts
                if a.get("total_questions", 0) > 0
            ]
            avg_quiz_score = round(sum(scores) / len(scores), 1) if scores else 0
        else:
            avg_quiz_score = 0

        # Pending revision count
        pending_revision = total_experiments - revised_count

        return {
            "total_experiments": total_experiments,
            "total_subjects": total_subjects,
            "revised_count": revised_count,
            "pending_revision": pending_revision,
            "revision_completion_percent": revision_completion_percent,
            "avg_quiz_score": avg_quiz_score,
            "bookmarked_count": bookmarked_count,
            "this_week_added": 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch overview: {str(e)}")


@router.get("/by-subject")
async def get_by_subject(current_user: dict = Depends(get_current_user)):
    """Experiments count and revision rate grouped by subject."""
    try:
        user_id = current_user["id"]
        res = (
            supabase.table("subjects")
            .select("id, name, experiments(id, is_revised)")
            .eq("user_id", user_id)
            .execute()
        )
        
        result = []
        for s in (res.data or []):
            exps = s.get("experiments") or []
            total = len(exps)
            revised = sum(1 for e in exps if e.get("is_revised"))
            result.append({
                "subject_id": s["id"],
                "subject_name": s["name"],
                "total_experiments": total,
                "revised_experiments": revised,
                "progress_percent": round((revised / total * 100), 1) if total > 0 else 0,
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch by-subject analytics: {str(e)}")


@router.get("/by-language")
async def get_by_language(current_user: dict = Depends(get_current_user)):
    """Count of experiments grouped by programming language."""
    try:
        user_id = current_user["id"]
        res = (
            supabase.table("experiments")
            .select("language")
            .eq("user_id", user_id)
            .execute()
        )
        
        counts = {}
        for row in (res.data or []):
            lang = row.get("language") or "other"
            counts[lang] = counts.get(lang, 0) + 1
            
        return [{"language": lang, "count": count} for lang, count in counts.items()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch language analytics: {str(e)}")


@router.get("/weekly-activity")
async def get_weekly_activity(current_user: dict = Depends(get_current_user)):
    """Activity stats for the last 7 to 14 days."""
    try:
        user_id = current_user["id"]
        # Generate 7 days labels
        today = datetime.now(timezone.utc).date()
        days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
        
        # Fetch experiments created recently
        start_date = (today - timedelta(days=7)).isoformat()
        exp_res = (
            supabase.table("experiments")
            .select("created_at")
            .eq("user_id", user_id)
            .gte("created_at", start_date)
            .execute()
        )
        
        # Fetch completed revision sessions
        rev_res = (
            supabase.table("revision_sessions")
            .select("completed_at")
            .eq("user_id", user_id)
            .gte("completed_at", start_date)
            .execute()
        )
        
        added_by_day = {d.isoformat(): 0 for d in days}
        revised_by_day = {d.isoformat(): 0 for d in days}
        
        for item in (exp_res.data or []):
            created_d = item["created_at"][:10]
            if created_d in added_by_day:
                added_by_day[created_d] += 1
                
        for item in (rev_res.data or []):
            if item.get("completed_at"):
                rev_d = item["completed_at"][:10]
                if rev_d in revised_by_day:
                    revised_by_day[rev_d] += 1
                    
        activity = []
        for d in days:
            iso_d = d.isoformat()
            activity.append({
                "date": iso_d,
                "day_name": d.strftime("%a"),
                "added": added_by_day[iso_d],
                "revised": revised_by_day[iso_d],
                "total": added_by_day[iso_d] + revised_by_day[iso_d],
            })
            
        return activity
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weekly activity: {str(e)}")


@router.get("/quiz-performance")
async def get_quiz_performance(current_user: dict = Depends(get_current_user)):
    """Historical quiz performance."""
    try:
        user_id = current_user["id"]
        res = (
            supabase.table("quiz_attempts")
            .select("id, score, total_questions, time_taken_seconds, completed_at, quizzes(title, quiz_type)")
            .eq("user_id", user_id)
            .order("completed_at", desc=False)
            .limit(20)
            .execute()
        )
        
        history = []
        for a in (res.data or []):
            total = a.get("total_questions") or 1
            score = a.get("score") or 0
            history.append({
                "id": a["id"],
                "quiz_title": a.get("quizzes", {}).get("title") if a.get("quizzes") else "Quiz",
                "score_percent": round(score / total * 100, 1),
                "completed_at": a.get("completed_at"),
            })
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch quiz performance: {str(e)}")


@router.get("/weak-topics")
async def get_weak_topics(current_user: dict = Depends(get_current_user)):
    """List of topics with low revision or quiz scores."""
    try:
        user_id = current_user["id"]
        # Fetch experiments that are unrevised or have low scores
        res = (
            supabase.table("experiments")
            .select("id, title, topic, subjects(name), is_revised, revision_count")
            .eq("user_id", user_id)
            .eq("is_revised", False)
            .limit(5)
            .execute()
        )
        
        weak_list = []
        for exp in (res.data or []):
            sub_name = exp.get("subjects", {}).get("name") if exp.get("subjects") else "General"
            weak_list.append({
                "experiment_id": exp["id"],
                "topic": exp.get("topic") or exp.get("title"),
                "subject": sub_name,
                "revision_count": exp.get("revision_count", 0),
                "suggestion": "Schedule a flashcard or MCQ session to reinforce core logic.",
            })
        return weak_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weak topics: {str(e)}")


@router.get("/revision-streak")
async def get_revision_streak(current_user: dict = Depends(get_current_user)):
    """Calculate current learning/revision streak in days."""
    try:
        user_id = current_user["id"]
        res = (
            supabase.table("revision_sessions")
            .select("completed_at")
            .eq("user_id", user_id)
            .order("completed_at", desc=True)
            .execute()
        )
        
        completed_dates = set()
        for r in (res.data or []):
            if r.get("completed_at"):
                completed_dates.add(r["completed_at"][:10])
                
        streak = 0
        current_date = datetime.now(timezone.utc).date()
        
        # Check if today is present, or start from yesterday
        if current_date.isoformat() in completed_dates:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            yesterday = current_date - timedelta(days=1)
            if yesterday.isoformat() in completed_dates:
                streak += 1
                current_date = yesterday - timedelta(days=1)
            else:
                return {"streak_days": 0, "last_active": None}
                
        while current_date.isoformat() in completed_dates:
            streak += 1
            current_date -= timedelta(days=1)
            
        return {
            "streak_days": streak,
            "active_days_count": len(completed_dates),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate streak: {str(e)}")
