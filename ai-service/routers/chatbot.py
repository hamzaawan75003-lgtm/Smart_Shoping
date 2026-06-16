# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false, reportUnknownVariableType=false, reportUnknownArgumentType=false, reportAny=false, reportExplicitAny=false
import os
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_classic.memory import ConversationBufferWindowMemory
from langchain_classic.chains import ConversationChain
from langchain_classic.prompts import ChatPromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate, HumanMessagePromptTemplate

_ = load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["chatbot"])

GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY",
    "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",
)

SYSTEM_PROMPT = """You are StyleAI Fashion Assistant, a helpful and friendly fashion advisor for an online clothing store.
You help customers with: finding the right size based on measurements, suggesting colours for their skin tone,
explaining how virtual try-on works, tracking orders, and answering product questions.
Size guide: XS=chest<34in, S=34-35, M=36-37, L=38-40, XL=41-43, XXL>43
Delivery: 3-5 business days, Cash on Delivery, Free delivery above Rs 2000
Returns: 7-day policy, unused items with tags only
If user writes in Urdu, respond in Urdu. If English, respond in English.
Keep responses concise, warm, and helpful."""

# Global memory storage
# In a real app, this would be backed by Redis or DB
memories = {}

def get_chat_chain(user_id: str):
    if user_id not in memories:
        memories[user_id] = ConversationBufferWindowMemory(k=10, return_messages=True)
    
    chat = ChatGroq(
        temperature=0.7,
        groq_api_key=GROQ_API_KEY,
        model_name="llama-3.1-8b-instant"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="history"),
        HumanMessagePromptTemplate.from_template("{input}")
    ])
    
    return ConversationChain(
        llm=chat,
        memory=memories[user_id],
        prompt=prompt,
        verbose=False
    )

class ChatRequest(BaseModel):
    message: str
    history: list = []
    user_id: str = "anonymous"
    language: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """AI chatbot endpoint using LangChain + Groq."""
    try:
        user_id = req.user_id or "anonymous"
        chain = get_chat_chain(user_id)
        
        # Prepare input
        user_input = req.message
        if req.language and req.language.lower() == 'urdu':
            user_input += " (Please respond in Urdu)"
            
        response = chain.predict(input=user_input)
        
        return ChatResponse(reply=response)
        
    except Exception as e:
        logger.error("Chatbot error: %s", e)
        raise HTTPException(status_code=500, detail=f"Chatbot error: {e}")

@router.get("/chatbot/health")
async def chatbot_health():
    return {"status": "chatbot router ready"}
