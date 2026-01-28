import { ThumbsUp, Share2, MessageCircle, MoreVertical, Linkedin, Twitter, Phone } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const BotMessage = ({ post, onShare, onAction }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleAction = (action) => {
    onAction(post.id, action);
    const messages = {
      like: "Liked!",
      retweet: "Retweeted!",
      reply: "Reply added!"
    };
    if (messages[action]) {
      toast.success(messages[action]);
    }
  };

  return (
    <div className="slack-message group" data-testid="bot-message">
      <div className="flex-shrink-0">
        <Avatar className="h-9 w-9 rounded-md">
          <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=SocialRipple" />
          <AvatarFallback>PS</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-bold text-[#1D1C1D]">Please Share</span>
          <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded">APP</span>
          <span className="text-xs text-[#616061]">{formatTime(post.timestamp)}</span>
        </div>

        <div className="text-[15px] text-[#1D1C1D] leading-relaxed mb-3">
          <p className="mb-2">
            {post.category === 'job_posting' && "Hi Team - we have an exciting job opening! Help us find the perfect candidate."}
            {post.category === 'product_update' && "Hi Team - we have a new announcement to share with the world!"}
            {post.category === 'company_event' && "Hi Team - let's celebrate this milestone together!"}
          </p>
        </div>

        <div className="border-l-4 border-[#E0E0E0] pl-3 ml-1 mb-3 bg-[#F8F8F8] rounded-r py-2">
          <div className="mb-2">
            <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="text-[#1264A3] hover:underline font-semibold">
              {post.title}
            </a>
          </div>
          <p className="text-sm text-[#616061] mb-3">
            {post.content}
          </p>
          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              className="rounded w-full max-w-md mb-2"
            />
          )}
          {post.link_url && (
            <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1264A3] hover:underline">
              {post.link_url}
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs border-gray-300 hover:bg-gray-50"
            onClick={() => handleAction('like')}
            data-testid="like-button"
          >
            <ThumbsUp className="w-3.5 h-3.5 mr-1" />
            Like
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs border-gray-300 hover:bg-gray-50"
            onClick={() => handleAction('retweet')}
            data-testid="retweet-button"
          >
            <Share2 className="w-3.5 h-3.5 mr-1" />
            Retweet
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs border-gray-300 hover:bg-gray-50"
            onClick={() => handleAction('reply')}
            data-testid="reply-button"
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1" />
            Reply
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs border-gray-300 hover:bg-gray-50"
            data-testid="more-button"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </Button>

          <div className="h-4 w-px bg-gray-300 mx-1"></div>

          <Button
            size="sm"
            className="h-7 text-xs bg-white border border-[#1d1c1d4d] text-[#1d1c1d] hover:bg-[#f8f8f8] font-semibold"
            onClick={() => onShare('twitter', post)}
            data-testid="post-to-twitter"
          >
            <Twitter className="w-3.5 h-3.5 mr-1" />
            Post to Twitter
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs bg-white border border-[#1d1c1d4d] text-[#1d1c1d] hover:bg-[#f8f8f8] font-semibold"
            onClick={() => onShare('linkedin', post)}
            data-testid="post-to-linkedin"
          >
            <Linkedin className="w-3.5 h-3.5 mr-1" />
            Post to LinkedIn
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs bg-[#25D366] text-white hover:bg-[#1DA851] font-semibold"
            onClick={() => onShare('whatsapp', post)}
            data-testid="send-to-whatsapp"
          >
            <Phone className="w-3.5 h-3.5 mr-1" />
            Send to WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BotMessage;