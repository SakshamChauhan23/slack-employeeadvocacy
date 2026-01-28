import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "@/components/slack/Sidebar";
import ChannelView from "@/components/slack/ChannelView";
import DemoPanel from "@/components/slack/DemoPanel";
import ShareModal from "@/components/slack/ShareModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SlackView = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState(null); // { platform, post }
  const [userId] = useState("user-" + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
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
      <DemoPanel />
      
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