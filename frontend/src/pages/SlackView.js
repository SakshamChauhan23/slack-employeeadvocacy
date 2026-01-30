import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "@/components/slack/Sidebar";
import ChannelView from "@/components/slack/ChannelView";
import ShareModal from "@/components/slack/ShareModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;

// Fallback demo posts for when backend is unavailable
const DEMO_POSTS = [
  {
    id: "post-1",
    title: "We're Hiring: Senior Full-Stack Developer",
    content: "Join our growing engineering team! We're looking for talented developers passionate about building scalable solutions. Remote-friendly, competitive salary, and amazing team culture. Apply now!",
    category: "job_posting",
    link_url: "https://socialripple.com/careers/senior-fullstack",
    image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  },
  {
    id: "post-2",
    title: "Product Launch: New AI-Powered Analytics Dashboard",
    content: "We are excited to announce several major product enhancements to the SocialRipple platform that are designed to streamline workflows and boost end-user productivity. Check out the new features and share with your network!",
    category: "product_update",
    link_url: "https://socialripple.com/product/analytics",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  },
  {
    id: "post-3",
    title: "Team Milestone: 50,000 Employees Empowered!",
    content: "Incredible achievement! We've just helped our 50,000th employee become a brand advocate through our platform. Thank you to our amazing community for making this possible. Let's celebrate together!",
    category: "company_event",
    link_url: "https://socialripple.com/milestones",
    image_url: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  },
  {
    id: "post-4",
    title: "Join Us: Customer Success Manager Opening",
    content: "We're expanding our Customer Success team! If you're passionate about helping customers achieve their goals and have experience in SaaS, we want to hear from you. Great benefits and growth opportunities.",
    category: "job_posting",
    link_url: "https://socialripple.com/careers/csm",
    image_url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  },
  {
    id: "post-5",
    title: "New Feature: Automated Content Scheduling",
    content: "Say goodbye to manual posting! Our new automated scheduling feature lets you plan your advocacy campaigns weeks in advance. Set it and forget it - your content will be shared at optimal times for maximum engagement.",
    category: "product_update",
    link_url: "https://socialripple.com/features/scheduling",
    image_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  },
  {
    id: "post-6",
    title: "Q4 All-Hands Meeting Highlights",
    content: "What an amazing quarter! Revenue up 40%, customer satisfaction at an all-time high, and we welcomed 25 new team members. Thank you to everyone who makes SocialRipple great. Here's to an even better Q1!",
    category: "company_event",
    link_url: "https://socialripple.com/blog/q4-recap",
    image_url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  },
  {
    id: "post-7",
    title: "Industry Recognition: Best Employee Advocacy Platform 2024",
    content: "We're thrilled to announce that SocialRipple has been named the Best Employee Advocacy Platform by TechAwards! This recognition belongs to our incredible team and customers. Thank you for believing in us!",
    category: "company_event",
    link_url: "https://socialripple.com/awards",
    image_url: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  },
  {
    id: "post-8",
    title: "Now Hiring: DevOps Engineer",
    content: "Help us scale our infrastructure! We're looking for a DevOps Engineer to join our platform team. Experience with AWS, Kubernetes, and CI/CD pipelines required. Fully remote position with competitive compensation.",
    category: "job_posting",
    link_url: "https://socialripple.com/careers/devops",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    timestamp: new Date().toISOString()
  }
];

const SlackView = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState(null);
  const [userId] = useState("user-" + Math.random().toString(36).substr(2, 9));

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
    setShareModal({ platform, post });
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
    </div>
  );
};

export default SlackView;