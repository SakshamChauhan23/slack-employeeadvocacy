from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class Post(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    link_url: Optional[str] = None
    image_url: Optional[str] = None
    category: str  # job_posting, product_update, company_event
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ShareEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    post_id: str
    action: str  # like, reshare, comment, share_whatsapp, share_linkedin, share_twitter
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ShareRequest(BaseModel):
    user_id: str
    post_id: str
    platform: str  # whatsapp, linkedin, twitter


class TrackEventRequest(BaseModel):
    user_id: str
    post_id: str
    action: str


@api_router.get("/")
async def root():
    return {"message": "SocialRipple API"}


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
                content="Join our growing engineering team! We're looking for talented developers passionate about building scalable solutions. Remote-friendly, competitive salary, and amazing team culture. Apply now!",
                category="job_posting",
                link_url="https://socialripple.com/careers/senior-fullstack",
                image_url="https://images.unsplash.com/photo-1758691736933-bb0f88fe2e0c?crop=entropy&cs=srgb&fm=jpg&q=85"
            ),
            Post(
                title="Product Launch: New AI-Powered Analytics Dashboard",
                content="We are excited to announce several major product enhancements to the SocialRipple platform that are designed to streamline workflows and boost end-user productivity. Check out the new features and share with your network!",
                category="product_update",
                link_url="https://pls.sh/s/15a95251a2",
                image_url="https://images.unsplash.com/photo-1582192904915-d89c7250b235?crop=entropy&cs=srgb&fm=jpg&q=85"
            ),
            Post(
                title="Team Milestone: 50,000 Employees Empowered!",
                content="Incredible achievement! We've just helped our 50,000th employee become a brand advocate through our platform. Thank you to our amazing community for making this possible. Let's celebrate together!",
                category="company_event",
                link_url="https://socialripple.com/milestones"
            )
        ]
        
        for post in sample_posts:
            doc = post.model_dump()
            doc['timestamp'] = doc['timestamp'].isoformat()
            await db.posts.insert_one(doc)
        
        return sample_posts
    
    return posts


@api_router.post("/share")
async def share_post(request: ShareRequest):
    logging.info(f"User {request.user_id} sharing post {request.post_id} to {request.platform}")
    
    event = ShareEvent(
        user_id=request.user_id,
        post_id=request.post_id,
        action=f"share_{request.platform}"
    )
    
    doc = event.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.share_events.insert_one(doc)
    
    return {
        "success": True,
        "message": f"Post shared to {request.platform}",
        "platform": request.platform
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


@api_router.get("/stats/{user_id}")
async def get_user_stats(user_id: str):
    total_shares = await db.share_events.count_documents({"user_id": user_id})
    
    shares_by_platform = await db.share_events.aggregate([
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$action", "count": {"$sum": 1}}}
    ]).to_list(100)
    
    return {
        "total_shares": total_shares,
        "shares_by_platform": shares_by_platform
    }


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