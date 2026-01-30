from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

app = FastAPI()
api_router = APIRouter(prefix="/api")

# In-memory storage for demo
share_events = []

class Post(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    link_url: Optional[str] = None
    image_url: Optional[str] = None
    category: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ShareRequest(BaseModel):
    user_id: str
    post_id: str
    platform: str


class TrackEventRequest(BaseModel):
    user_id: str
    post_id: str
    action: str


# Hardcoded demo posts
DEMO_POSTS = [
    Post(
        id="post-1",
        title="We're Hiring: Senior Full-Stack Developer",
        content="Join our growing engineering team! We're looking for talented developers passionate about building scalable solutions. Remote-friendly, competitive salary, and amazing team culture. Apply now!",
        category="job_posting",
        link_url="https://socialripple.com/careers/senior-fullstack",
        image_url="https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    ),
    Post(
        id="post-2",
        title="Product Launch: New AI-Powered Analytics Dashboard",
        content="We are excited to announce several major product enhancements to the SocialRipple platform that are designed to streamline workflows and boost end-user productivity. Check out the new features and share with your network!",
        category="product_update",
        link_url="https://socialripple.com/product/analytics",
        image_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    ),
    Post(
        id="post-3",
        title="Team Milestone: 50,000 Employees Empowered!",
        content="Incredible achievement! We've just helped our 50,000th employee become a brand advocate through our platform. Thank you to our amazing community for making this possible. Let's celebrate together!",
        category="company_event",
        link_url="https://socialripple.com/milestones",
        image_url="https://images.unsplash.com/photo-1529070538774-1843cb3265df?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    ),
    Post(
        id="post-4",
        title="Join Us: Customer Success Manager Opening",
        content="We're expanding our Customer Success team! If you're passionate about helping customers achieve their goals and have experience in SaaS, we want to hear from you. Great benefits and growth opportunities.",
        category="job_posting",
        link_url="https://socialripple.com/careers/csm",
        image_url="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    ),
    Post(
        id="post-5",
        title="New Feature: Automated Content Scheduling",
        content="Say goodbye to manual posting! Our new automated scheduling feature lets you plan your advocacy campaigns weeks in advance. Set it and forget it - your content will be shared at optimal times for maximum engagement.",
        category="product_update",
        link_url="https://socialripple.com/features/scheduling",
        image_url="https://images.unsplash.com/photo-1611224923853-80b023f02d71?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    ),
    Post(
        id="post-6",
        title="Q4 All-Hands Meeting Highlights",
        content="What an amazing quarter! Revenue up 40%, customer satisfaction at an all-time high, and we welcomed 25 new team members. Thank you to everyone who makes SocialRipple great. Here's to an even better Q1!",
        category="company_event",
        link_url="https://socialripple.com/blog/q4-recap",
        image_url="https://images.unsplash.com/photo-1515187029135-18ee286d815b?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    ),
    Post(
        id="post-7",
        title="Industry Recognition: Best Employee Advocacy Platform 2024",
        content="We're thrilled to announce that SocialRipple has been named the Best Employee Advocacy Platform by TechAwards! This recognition belongs to our incredible team and customers. Thank you for believing in us!",
        category="company_event",
        link_url="https://socialripple.com/awards",
        image_url="https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    ),
    Post(
        id="post-8",
        title="Now Hiring: DevOps Engineer",
        content="Help us scale our infrastructure! We're looking for a DevOps Engineer to join our platform team. Experience with AWS, Kubernetes, and CI/CD pipelines required. Fully remote position with competitive compensation.",
        category="job_posting",
        link_url="https://socialripple.com/careers/devops",
        image_url="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    )
]


@api_router.get("/")
async def root():
    return {"message": "SocialRipple API"}


@api_router.get("/posts", response_model=List[Post])
async def get_posts():
    return DEMO_POSTS


@api_router.post("/share")
async def share_post(request: ShareRequest):
    logging.info(f"User {request.user_id} sharing post {request.post_id} to {request.platform}")
    share_events.append({
        "user_id": request.user_id,
        "post_id": request.post_id,
        "platform": request.platform,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    return {
        "success": True,
        "message": f"Post shared to {request.platform}",
        "platform": request.platform
    }


@api_router.post("/events/track")
async def track_event(request: TrackEventRequest):
    logging.info(f"Event tracked: {request.action} by {request.user_id} on {request.post_id}")
    share_events.append({
        "user_id": request.user_id,
        "post_id": request.post_id,
        "action": request.action,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    return {"success": True}


@api_router.get("/stats/{user_id}")
async def get_user_stats(user_id: str):
    user_events = [e for e in share_events if e.get("user_id") == user_id]
    return {
        "total_shares": len(user_events),
        "shares_by_platform": {}
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
