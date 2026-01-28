import { useState, useEffect } from "react";
import axios from "axios";
import MessageCard from "@/components/MessageCard";
import PhoneModal from "@/components/PhoneModal";
import OTPModal from "@/components/OTPModal";
import SuccessModal from "@/components/SuccessModal";
import { MessageSquare } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userId] = useState("user-" + Math.random().toString(36).substr(2, 9));
  const [hasVerifiedPhone, setHasVerifiedPhone] = useState(false);

  useEffect(() => {
    fetchPosts();
    checkUserPhone();
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

  const checkUserPhone = async () => {
    try {
      const response = await axios.get(`${API}/user/${userId}/phone`);
      if (response.data.has_phone) {
        setHasVerifiedPhone(true);
        setPhoneNumber(response.data.phone_number);
      }
    } catch (error) {
      console.error("Error checking user phone:", error);
    }
  };

  const handleSendToWhatsApp = (post) => {
    setCurrentPost(post);
    if (hasVerifiedPhone) {
      sendDirectly(post);
    } else {
      setShowPhoneModal(true);
    }
  };

  const sendDirectly = async (post) => {
    try {
      await axios.post(`${API}/whatsapp/send`, {
        user_id: userId,
        post_id: post.id
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error sending to WhatsApp:", error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              AdvocacyFlow
            </h1>
          </div>
          <p className="text-lg text-slate-600 ml-13">
            Share company updates privately with your network
          </p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <MessageCard
              key={post.id}
              post={post}
              onSendToWhatsApp={handleSendToWhatsApp}
              onAction={handleAction}
            />
          ))}
        </div>
      </div>

      <PhoneModal
        open={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSubmit={(phone) => {
          setPhoneNumber(phone);
          setShowPhoneModal(false);
          setShowOTPModal(true);
        }}
      />

      <OTPModal
        open={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        phoneNumber={phoneNumber}
        userId={userId}
        onSuccess={() => {
          setShowOTPModal(false);
          setHasVerifiedPhone(true);
          if (currentPost) {
            sendDirectly(currentPost);
          }
        }}
      />

      <SuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        phoneNumber={phoneNumber}
      />
    </div>
  );
};

export default Dashboard;