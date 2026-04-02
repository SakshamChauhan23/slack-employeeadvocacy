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


# Hardcoded demo posts — Paterson Capital LinkedIn content
DEMO_POSTS = [
    Post(
        id="post-1",
        title="₹700 Crore In Record Deals. Stock Still Down 50%.",
        content="₹700 Crore In Record Deals. Stock Still Down 50%. How does a company post three consecutive record-breaking deals — and still see its stock cut in half? We break down the full story of Aurionpro Solutions in our latest podcast. Full episode now live on our YouTube channel!",
        category="company_event",
        link_url="https://lnkd.in/gxHqwFuS",
        image_url="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    ),
    Post(
        id="post-2",
        title="Aurionpro's Comeback: The Numbers Behind the Paradox",
        content="Net worth jumped from ₹337 crore to ₹1,504 crore. Revenue tripled at a 33% CAGR. Profit swung from a ₹192 crore loss to a ₹188 crore gain. Yet the stock price still halved. Our latest deep-dive explores why strong fundamentals don't always translate to market performance — and what investors should watch for next.",
        category="product_update",
        link_url="https://lnkd.in/gxHqwFuS",
        image_url="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    ),
    Post(
        id="post-3",
        title="We're Pivoting — An Official Announcement from Team Paterson",
        content="An official announcement from Team Paterson. We're evolving how we deliver investment research and financial insights to our community. Big changes are coming — all designed to bring you deeper, more actionable analysis. Stay tuned.",
        category="company_event",
        link_url="https://www.linkedin.com/company/patersoncapital/",
        image_url="https://images.unsplash.com/photo-1553484771-371a605b060b?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    ),
    Post(
        id="post-4",
        title="The Invisible Company Behind Your Metro Ride",
        content="Every time you tap your metro card in Mumbai, Delhi, or Bengaluru, there's a good chance Aurionpro Solutions is powering that transaction. The company has quietly secured three consecutive record deals across banking, metro rail, and data centres. Yet despite this momentum, the stock is down 50%. Our latest analysis unpacks the full picture.",
        category="product_update",
        link_url="https://lnkd.in/gxHqwFuS",
        image_url="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    ),
    Post(
        id="post-5",
        title="Indian IT Sector: What the Numbers Really Say",
        content="TCS, Infosys, Wipro — three giants, three very different stories playing out right now. With macro headwinds, client budget cuts, and the AI disruption looming, our team has been digging into the earnings data to separate noise from signal. Here's our take on where Indian IT is actually headed.",
        category="product_update",
        link_url="https://www.linkedin.com/company/patersoncapital/",
        image_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    ),
    Post(
        id="post-6",
        title="Market Volatility & the Long-Term Investor",
        content="Markets are down. Headlines are loud. Portfolios are bleeding. This is exactly the environment where long-term conviction gets tested — and where the best opportunities are quietly forming. Our latest note covers how we're thinking about risk, valuation, and positioning during the current volatility.",
        category="company_event",
        link_url="https://www.linkedin.com/company/patersoncapital/",
        image_url="https://images.unsplash.com/photo-1579621970795-87facc2f976d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    ),
    Post(
        id="post-7",
        title="Why We Research What Others Overlook",
        content="The most interesting investment ideas are rarely the ones on everyone's radar. At Paterson Capital, we focus on under-researched, under-covered companies where the gap between perception and reality is widest. That's where long-term alpha lives. Sharing our research process in today's post.",
        category="company_event",
        link_url="https://www.linkedin.com/company/patersoncapital/",
        image_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    ),
    Post(
        id="post-8",
        title="New Episode: Deep Dive on India's Infrastructure Boom",
        content="India's infrastructure buildout is one of the most significant investment themes of this decade — and most retail investors are still missing the real plays. In our latest podcast episode, we go beyond the obvious names and identify the second-order beneficiaries driving the biggest returns. Listen now on YouTube.",
        category="product_update",
        link_url="https://www.linkedin.com/company/patersoncapital/",
        image_url="https://images.unsplash.com/photo-1486325212027-8081e485255e?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
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
