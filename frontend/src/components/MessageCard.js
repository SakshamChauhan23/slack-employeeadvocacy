import { ThumbsUp, MessageSquare, Share2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const MessageCard = ({ post, onSendToWhatsApp, onAction }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const handleAction = (action) => {
    onAction(post.id, action);
    const messages = {
      like: "Post liked!",
      reshare: "Post reshared!",
      comment: "Comment added!"
    };
    toast.success(messages[action]);
  };

  return (
    <div 
      className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300"
      data-testid="message-card"
    >
      <div className="flex items-start gap-4 mb-4">
        <img
          src={post.author_avatar}
          alt={post.author_name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900">{post.author_name}</span>
            <span className="text-sm text-slate-500">{formatTime(post.timestamp)}</span>
          </div>
          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-md">
            {post.channel}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-semibold text-slate-900 mb-2 tracking-tight">
          {post.title}
        </h3>
        <p className="text-slate-700 leading-relaxed">
          {post.content}
        </p>
      </div>

      {post.image_url && (
        <div className="mb-4">
          <img
            src={post.image_url}
            alt="Post content"
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {post.post_url && (
        <a
          href={post.post_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-4"
          data-testid="post-link"
        >
          View full post →
        </a>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
          onClick={() => handleAction("like")}
          data-testid="like-button"
        >
          <ThumbsUp className="w-4 h-4 mr-1.5" />
          Like
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
          onClick={() => handleAction("reshare")}
          data-testid="reshare-button"
        >
          <Share2 className="w-4 h-4 mr-1.5" />
          Re-share
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
          onClick={() => handleAction("comment")}
          data-testid="comment-button"
        >
          <MessageSquare className="w-4 h-4 mr-1.5" />
          Comment
        </Button>
        <div className="flex-1"></div>
        <Button
          className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-full px-6 shadow-sm hover:shadow-md"
          onClick={() => onSendToWhatsApp(post)}
          data-testid="send-to-whatsapp-button"
        >
          <Send className="w-4 h-4 mr-2" />
          Send to WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default MessageCard;