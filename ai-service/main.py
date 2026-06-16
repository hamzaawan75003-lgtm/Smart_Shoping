# pyright: reportImplicitRelativeImport=false
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import body_detection, size_recommend, skin_tone, tryon, chatbot # type: ignore
import uvicorn

app = FastAPI(
    title="StyleAI AI Service",
    description="AI endpoints for body detection, size recommendation, skin tone, virtual try-on, and chatbot.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(body_detection.router)
app.include_router(size_recommend.router)
app.include_router(skin_tone.router)
app.include_router(tryon.router)
app.include_router(chatbot.router)


@app.get("/")
def read_root():
    return {"status": "StyleAI AI Service Running"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
