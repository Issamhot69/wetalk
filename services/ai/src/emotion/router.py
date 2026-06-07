from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .detector import detect_emotion, analyze_conversation

router = APIRouter()

class TextRequest(BaseModel):
    text: str
    userId: str | None = None
    messageId: str | None = None

class ConversationRequest(BaseModel):
    messages: list[str]
    userId: str | None = None

@router.post("/analyze")
async def analyze_text(req: TextRequest):
    if not req.text or len(req.text.strip()) < 2:
        raise HTTPException(status_code=400, detail="Texte trop court")

    result = await detect_emotion(req.text)
    return {
        "userId": req.userId,
        "messageId": req.messageId,
        **result
    }

@router.post("/conversation")
async def analyze_conv(req: ConversationRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="Aucun message fourni")

    result = await analyze_conversation(req.messages)
    return {
        "userId": req.userId,
        **result
    }

@router.get("/emotions")
def get_emotions():
    return {
        "emotions": [
            "joy", "sadness", "anger",
            "fear", "surprise", "disgust", "neutral"
        ]
    }
