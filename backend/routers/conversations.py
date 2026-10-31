"""
Conversations router: chat sessions with optional experiment context.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from middleware.auth import get_current_user
from models.conversation import ConversationCreate, MessageCreate
from services.supabase_client import supabase
import services.gemini_service as gemini_service

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


def _supabase_error(e: Exception, detail: str = "Database error"):
    raise HTTPException(status_code=500, detail=f"{detail}: {str(e)}")


@router.get("")
async def list_conversations(current_user: dict = Depends(get_current_user)):
    try:
        result = (
            supabase.table("conversations")
            .select("*")
            .eq("user_id", current_user["id"])
            .order("updated_at", desc=True)
            .execute()
        )
        return result.data or []
    except Exception as e:
        _supabase_error(e, "Failed to list conversations")


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_conversation(
    payload: ConversationCreate, current_user: dict = Depends(get_current_user)
):
    try:
        data = payload.model_dump()
        data["user_id"] = current_user["id"]
        result = supabase.table("conversations").insert(data).execute()
        return result.data[0]
    except Exception as e:
        _supabase_error(e, "Failed to create conversation")


@router.get("/{conversation_id}/messages")
async def get_messages(
    conversation_id: str, current_user: dict = Depends(get_current_user)
):
    try:
        # Verify ownership
        conv = (
            supabase.table("conversations")
            .select("id, experiment_id")
            .eq("id", conversation_id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )
        if not conv.data:
            raise HTTPException(status_code=404, detail="Conversation not found.")

        messages = (
            supabase.table("messages")
            .select("*")
            .eq("conversation_id", conversation_id)
            .order("created_at")
            .execute()
        )
        return messages.data or []
    except HTTPException:
        raise
    except Exception as e:
        _supabase_error(e, "Failed to get messages")


@router.post("/{conversation_id}/messages", status_code=status.HTTP_201_CREATED)
async def send_message(
    conversation_id: str,
    payload: MessageCreate,
    current_user: dict = Depends(get_current_user),
):
    try:
        # Verify ownership and get experiment context
        conv = (
            supabase.table("conversations")
            .select("id, experiment_id")
            .eq("id", conversation_id)
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )
        if not conv.data:
            raise HTTPException(status_code=404, detail="Conversation not found.")

        # Save user message
        user_msg = (
            supabase.table("messages")
            .insert(
                {
                    "conversation_id": conversation_id,
                    "role": "user",
                    "content": payload.content,
                }
            )
            .execute()
        )

        # Fetch conversation history for context
        history = (
            supabase.table("messages")
            .select("role, content")
            .eq("conversation_id", conversation_id)
            .order("created_at")
            .execute()
        )
        messages_history = history.data or []

        # Fetch experiment context if associated
        experiment_context = None
        if conv.data.get("experiment_id"):
            exp = (
                supabase.table("experiments")
                .select("name, language, description, code")
                .eq("id", conv.data["experiment_id"])
                .single()
                .execute()
            )
            experiment_context = exp.data

        # Generate AI response
        ai_response = await gemini_service.chat_with_context(
            messages=messages_history[:-1],  # Exclude just-added message
            experiment_context=experiment_context,
            user_message=payload.content,
        )

        # Save AI response
        ai_msg = (
            supabase.table("messages")
            .insert(
                {
                    "conversation_id": conversation_id,
                    "role": "assistant",
                    "content": ai_response,
                }
            )
            .execute()
        )

        # Update conversation timestamp
        supabase.table("conversations").update(
            {"updated_at": "now()"}
        ).eq("id", conversation_id).execute()

        return {
            "user_message": user_msg.data[0] if user_msg.data else {},
            "assistant_message": ai_msg.data[0] if ai_msg.data else {"content": ai_response},
        }
    except HTTPException:
        raise
    except Exception as e:
        _supabase_error(e, "Failed to send message")


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str, current_user: dict = Depends(get_current_user)
):
    try:
        # Delete messages first (if no cascade set in DB)
        supabase.table("messages").delete().eq(
            "conversation_id", conversation_id
        ).execute()
        supabase.table("conversations").delete().eq("id", conversation_id).eq(
            "user_id", current_user["id"]
        ).execute()
    except Exception as e:
        _supabase_error(e, "Failed to delete conversation")
