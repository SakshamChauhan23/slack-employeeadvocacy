import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "@/components/slack/Sidebar";
import ChannelView from "@/components/slack/ChannelView";
import ShareModal from "@/components/slack/ShareModal";
import { PhoneModal } from "@/components/PhoneModal";
import { OTPModal } from "@/components/OTPModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;

// Fallback demo posts — Paterson Capital LinkedIn content
const DEMO_POSTS = [
  {
    id: "post-1",
    title: "₹700 Crore In Record Deals. Stock Still Down 50%.",
    content: "₹700 Crore In Record Deals. Stock Still Down 50%. How does a company post three consecutive record-breaking deals — and still see its stock cut in half? We break down the full story of Aurionpro Solutions in our latest podcast. Full episode now live on our YouTube channel!",
    category: "company_event",
    link_url: "https://lnkd.in/gxHqwFuS",
    image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  },
  {
    id: "post-2",
    title: "Aurionpro's Comeback: The Numbers Behind the Paradox",
    content: "Net worth jumped from ₹337 crore to ₹1,504 crore. Revenue tripled at a 33% CAGR. Profit swung from a ₹192 crore loss to a ₹188 crore gain. Yet the stock price still halved. Our latest deep-dive explores why strong fundamentals don't always translate to market performance — and what investors should watch for next.",
    category: "product_update",
    link_url: "https://lnkd.in/gxHqwFuS",
    image_url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  },
  {
    id: "post-3",
    title: "We're Pivoting — An Official Announcement from Team Paterson",
    content: "An official announcement from Team Paterson. We're evolving how we deliver investment research and financial insights to our community. Big changes are coming — all designed to bring you deeper, more actionable analysis. Stay tuned.",
    category: "company_event",
    link_url: "https://www.linkedin.com/company/patersoncapital/",
    image_url: "https://images.unsplash.com/photo-1553484771-371a605b060b?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  },
  {
    id: "post-4",
    title: "The Invisible Company Behind Your Metro Ride",
    content: "Every time you tap your metro card in Mumbai, Delhi, or Bengaluru, there's a good chance Aurionpro Solutions is powering that transaction. The company has quietly secured three consecutive record deals across banking, metro rail, and data centres. Yet despite this momentum, the stock is down 50%. Our latest analysis unpacks the full picture.",
    category: "product_update",
    link_url: "https://lnkd.in/gxHqwFuS",
    image_url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  },
  {
    id: "post-5",
    title: "Indian IT Sector: What the Numbers Really Say",
    content: "TCS, Infosys, Wipro — three giants, three very different stories playing out right now. With macro headwinds, client budget cuts, and the AI disruption looming, our team has been digging into the earnings data to separate noise from signal. Here's our take on where Indian IT is actually headed.",
    category: "product_update",
    link_url: "https://www.linkedin.com/company/patersoncapital/",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  },
  {
    id: "post-6",
    title: "Market Volatility & the Long-Term Investor",
    content: "Markets are down. Headlines are loud. Portfolios are bleeding. This is exactly the environment where long-term conviction gets tested — and where the best opportunities are quietly forming. Our latest note covers how we're thinking about risk, valuation, and positioning during the current volatility.",
    category: "company_event",
    link_url: "https://www.linkedin.com/company/patersoncapital/",
    image_url: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  },
  {
    id: "post-7",
    title: "Why We Research What Others Overlook",
    content: "The most interesting investment ideas are rarely the ones on everyone's radar. At Paterson Capital, we focus on under-researched, under-covered companies where the gap between perception and reality is widest. That's where long-term alpha lives. Sharing our research process in today's post.",
    category: "company_event",
    link_url: "https://www.linkedin.com/company/patersoncapital/",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  },
  {
    id: "post-8",
    title: "New Episode: Deep Dive on India's Infrastructure Boom",
    content: "India's infrastructure buildout is one of the most significant investment themes of this decade — and most retail investors are still missing the real plays. In our latest podcast episode, we go beyond the obvious names and identify the second-order beneficiaries driving the biggest returns. Listen now on YouTube.",
    category: "product_update",
    link_url: "https://www.linkedin.com/company/patersoncapital/",
    image_url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  }
];

const SlackView = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState(null);
  const [userId] = useState("user-" + Math.random().toString(36).substr(2, 9));
  const [whatsappFlow, setWhatsappFlow] = useState(null);
  // whatsappFlow: null | { step: 'phone' | 'otp', post, phone: string }

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      if (API) {
        const response = await axios.get(`${API}/posts`);
        setPosts(response.data);
      } else {
        // Use demo posts when no backend configured
        setPosts(DEMO_POSTS);
      }
    } catch (error) {
      console.error("Error fetching posts, using demo data:", error);
      setPosts(DEMO_POSTS);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform, post) => {
    if (platform === "whatsapp") {
      setWhatsappFlow({ step: "phone", post, phone: "" });
    } else {
      setShareModal({ platform, post });
    }
  };

  const handleWhatsappPhoneSubmit = (phone) => {
    setWhatsappFlow((prev) => ({ ...prev, step: "otp", phone }));
  };

  const handleWhatsappVerified = () => {
    if (!whatsappFlow) return;
    const { post, phone } = whatsappFlow;
    const message = `${post.title}\n\n${post.content}\n\n${post.link_url || ""}`.trim();
    const digits = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setWhatsappFlow(null);
    if (API) {
      axios.post(`${API}/share`, { user_id: userId, post_id: post.id, platform: "whatsapp" }).catch(() => {});
    }
  };

  const confirmShare = async () => {
    if (!shareModal) return;

    try {
      await axios.post(`${API}/share`, {
        user_id: userId,
        post_id: shareModal.post.id,
        platform: shareModal.platform
      });
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  const handleAction = async (postId, action) => {
    try {
      await axios.post(`${API}/events/track`, {
        user_id: userId,
        post_id: postId,
        action: action
      });
    } catch (error) {
      console.error("Error tracking action:", error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" data-testid="slack-view">
      <Sidebar />
      <ChannelView 
        posts={posts}
        loading={loading}
        onShare={handleShare}
        onAction={handleAction}
      />
      
      {shareModal && (
        <ShareModal
          platform={shareModal.platform}
          post={shareModal.post}
          onClose={() => setShareModal(null)}
          onConfirm={confirmShare}
        />
      )}

      <PhoneModal
        open={whatsappFlow?.step === "phone"}
        onClose={() => setWhatsappFlow(null)}
        onSubmit={handleWhatsappPhoneSubmit}
      />

      <OTPModal
        open={whatsappFlow?.step === "otp"}
        onClose={() => setWhatsappFlow(null)}
        phoneNumber={whatsappFlow?.phone || ""}
        userId={userId}
        onSuccess={handleWhatsappVerified}
      />
    </div>
  );
};

export default SlackView;