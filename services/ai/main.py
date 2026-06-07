from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from src.emotion.router import router as emotion_router

load_dotenv()

app = FastAPI(
    title="WeTalk AI Service",
    description="Moteur d'intelligence émotionnelle",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(emotion_router, prefix="/emotion", tags=["Emotion"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "wetalk-ai"}
