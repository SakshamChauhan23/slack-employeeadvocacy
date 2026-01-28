from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slack_user_id: str
    phone_number: Optional[str] = None
    verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Post(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    author_name: str
    author_avatar: str
    channel: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    post_url: Optional[str] = None
    image_url: Optional[str] = None


class ShareEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    post_id: str
    action: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OTPSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone_number: str
    otp_code: str
    expires_at: datetime
    verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PhoneVerifyRequest(BaseModel):
    phone_number: str
    user_id: str


class OTPConfirmRequest(BaseModel):
    phone_number: str
    otp_code: str
    user_id: str


class WhatsAppSendRequest(BaseModel):
    user_id: str
    post_id: str


class TrackEventRequest(BaseModel):
    user_id: str
    post_id: str
    action: str


@api_router.get("/")
async def root():
    return {"message": "AdvocacyFlow API"}


@api_router.get("/posts", response_model=List[Post])
async def get_posts():
    posts = await db.posts.find({}, {"_id": 0}).to_list(100)
    
    for post in posts:
        if isinstance(post.get('timestamp'), str):
            post['timestamp'] = datetime.fromisoformat(post['timestamp'])
    
    if not posts:
        sample_posts = [
            Post(
                title="We're Hiring: Senior Full-Stack Developer",
                content="Join our growing engineering team! We're looking for talented developers passionate about building scalable solutions. Remote-friendly, competitive salary, and amazing team culture.",
                author_name="Sarah Chen",
                author_avatar="https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=srgb&fm=jpg&q=85",
                channel="#hiring",
                post_url="https://careers.company.com/senior-fullstack",
                image_url="https://images.unsplash.com/photo-1758518729685-f88df7890776?crop=entropy&cs=srgb&fm=jpg&q=85"
            ),
            Post(
                title="Product Launch: New AI-Powered Features",
                content="Excited to announce our latest product update! We've integrated cutting-edge AI capabilities that will transform how teams collaborate. Check out the demo and share with your network.",
                author_name="Michael Rodriguez",
                author_avatar="https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=srgb&fm=jpg&q=85",
                channel="#product-updates",
                post_url="https://company.com/product-launch",
                image_url="https://images.unsplash.com/photo-1758873268631-fa944fc5cad2?crop=entropy&cs=srgb&fm=jpg&q=85"
            ),
            Post(
                title="Team Milestone: 10,000 Customers!",
                content="We've just crossed 10,000 happy customers! This wouldn't be possible without our amazing team and supportive community. Let's celebrate this achievement together!",
                author_name="Emma Thompson",
                author_avatar="https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=srgb&fm=jpg&q=85",
                channel="#announcements",
                post_url="https://company.com/milestone"
            )
        ]
        
        for post in sample_posts:
            doc = post.model_dump()
            doc['timestamp'] = doc['timestamp'].isoformat()
            await db.posts.insert_one(doc)
        
        return sample_posts
    
    return posts


@api_router.post("/phone/verify")
async def verify_phone(request: PhoneVerifyRequest):
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    otp_session = OTPSession(
        phone_number=request.phone_number,
        otp_code=otp_code,
        expires_at=expires_at
    )
    
    doc = otp_session.model_dump()
    doc['expires_at'] = doc['expires_at'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.otp_sessions.insert_one(doc)
    
    logging.info(f"OTP Code for {request.phone_number}: {otp_code}")
    
    return {
        "success": True,
        "message": "OTP sent successfully",
        "otp_hint": otp_code[:2] + "****"
    }


@api_router.post("/phone/confirm")
async def confirm_otp(request: OTPConfirmRequest):
    session = await db.otp_sessions.find_one(
        {
            "phone_number": request.phone_number,
            "otp_code": request.otp_code,
            "verified": False
        },
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
    
    expires_at = datetime.fromisoformat(session['expires_at'])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired")
    
    await db.otp_sessions.update_one(
        {"phone_number": request.phone_number, "otp_code": request.otp_code},
        {"$set": {"verified": True}}
    )
    
    existing_user = await db.users.find_one(
        {"id": request.user_id},
        {"_id": 0}
    )
    
    if existing_user:
        await db.users.update_one(
            {"id": request.user_id},
            {"$set": {"phone_number": request.phone_number, "verified": True}}
        )
    else:
        user = User(
            id=request.user_id,
            slack_user_id=request.user_id,
            phone_number=request.phone_number,
            verified=True
        )
        doc = user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
    
    return {
        "success": True,
        "message": "Phone number verified successfully"
    }


@api_router.get("/user/{user_id}/phone")
async def get_user_phone(user_id: str):
    user = await db.users.find_one(
        {"id": user_id},
        {"_id": 0}
    )
    
    if not user or not user.get('verified'):
        return {"has_phone": False}
    
    return {
        "has_phone": True,
        "phone_number": user.get('phone_number')
    }


@api_router.post("/whatsapp/send")
async def send_whatsapp(request: WhatsAppSendRequest):
    user = await db.users.find_one(
        {"id": request.user_id, "verified": True},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=400, detail="User phone not verified")
    
    post = await db.posts.find_one(
        {"id": request.post_id},
        {"_id": 0}
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    company_name = "Your Company"
    message = f"We're hiring at {company_name}! 🚀\nCheck this out: {post.get('post_url', 'https://company.com')}"
    
    logging.info(f"Sending WhatsApp message to {user['phone_number']}: {message}")
    
    event = ShareEvent(
        user_id=request.user_id,
        post_id=request.post_id,
        action="sent_to_whatsapp"
    )
    
    doc = event.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.share_events.insert_one(doc)
    
    return {
        "success": True,
        "message": "Message sent to your WhatsApp",
        "phone_number": user['phone_number']
    }


@api_router.post("/events/track")
async def track_event(request: TrackEventRequest):
    event = ShareEvent(
        user_id=request.user_id,
        post_id=request.post_id,
        action=request.action
    )
    
    doc = event.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.share_events.insert_one(doc)
    
    return {"success": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()