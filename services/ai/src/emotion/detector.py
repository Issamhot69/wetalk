from openai import OpenAI
import os
import json

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

EMOTION_PROMPT = """
Analyse le texte suivant et retourne UNIQUEMENT un JSON avec:
- emotion: (joy, sadness, anger, fear, surprise, disgust, neutral)
- score: (0.0 à 1.0, confiance)
- valence: (-1.0 négatif à 1.0 positif)
- arousal: (0.0 calme à 1.0 intense)
- suggestion: (une suggestion courte pour répondre avec empathie)

Texte: "{text}"

Réponds UNIQUEMENT avec le JSON, sans markdown.
"""

async def detect_emotion(text: str) -> dict:
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": EMOTION_PROMPT.format(text=text)
                }
            ],
            temperature=0.3,
            max_tokens=200,
        )

        raw = response.choices[0].message.content.strip()
        result = json.loads(raw)

        return {
            "emotion": result.get("emotion", "neutral"),
            "score": float(result.get("score", 0.5)),
            "valence": float(result.get("valence", 0.0)),
            "arousal": float(result.get("arousal", 0.5)),
            "suggestion": result.get("suggestion", ""),
            "text": text,
        }

    except Exception as e:
        return {
            "emotion": "neutral",
            "score": 0.5,
            "valence": 0.0,
            "arousal": 0.5,
            "suggestion": "",
            "text": text,
            "error": str(e),
        }


async def analyze_conversation(messages: list[str]) -> dict:
    combined = " | ".join(messages[-5:])  # 5 derniers messages

    emotion_data = await detect_emotion(combined)

    # Adapter l'UI selon l'émotion
    ui_theme = get_ui_theme(emotion_data["emotion"], emotion_data["valence"])

    return {
        **emotion_data,
        "ui_theme": ui_theme,
    }


def get_ui_theme(emotion: str, valence: float) -> dict:
    themes = {
        "joy":     {"color": "#FFD700", "bg": "#FFFDF0", "icon": "😊"},
        "sadness": {"color": "#6B9BD2", "bg": "#F0F4FF", "icon": "💙"},
        "anger":   {"color": "#FF6B6B", "bg": "#FFF0F0", "icon": "😤"},
        "fear":    {"color": "#9B59B6", "bg": "#F8F0FF", "icon": "😰"},
        "surprise":{"color": "#F39C12", "bg": "#FFFBF0", "icon": "😮"},
        "disgust": {"color": "#27AE60", "bg": "#F0FFF4", "icon": "😒"},
        "neutral": {"color": "#95A5A6", "bg": "#F8F9FA", "icon": "😐"},
    }
    return themes.get(emotion, themes["neutral"])
