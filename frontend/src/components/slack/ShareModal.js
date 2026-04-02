import { useState } from "react";
import { X, Twitter, Linkedin } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const ShareModal = ({ platform, post, onClose, onConfirm }) => {
  const [thoughts, setThoughts] = useState("");

  const platformConfig = {
    twitter: {
      title: "Post to Twitter",
      icon: Twitter,
      color: "text-blue-500",
    },
    linkedin: {
      title: "Share on LinkedIn",
      icon: Linkedin,
      color: "text-blue-700",
      showThoughts: false,
    },
    linkedin_thoughts: {
      title: "Share with Thoughts on LinkedIn",
      icon: Linkedin,
      color: "text-blue-700",
      showThoughts: true,
    },
  };

  const config = platformConfig[platform];
  const Icon = config.icon;

  const getPreviewMessage = () => {
    if (platform === "twitter") {
      return `${post.title} ${post.link_url || ""}`.trim();
    }
    return `${post.title}\n\n${post.content}${post.link_url ? "\n\n" + post.link_url : ""}`;
  };

  const handleConfirm = () => {
    if (platform === "linkedin" || platform === "linkedin_thoughts") {
      const url = post.link_url || "https://www.linkedin.com/company/patersoncapital/";
      let shareUrl;
      if (platform === "linkedin_thoughts" && thoughts.trim()) {
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(thoughts)}`;
      } else {
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      }
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    } else if (platform === "twitter") {
      const text = `${post.title} ${post.link_url || ""}`.trim();
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    }

    onConfirm();
    toast.success(
      platform === "linkedin_thoughts"
        ? "Opening LinkedIn to share with thoughts..."
        : `Opening ${platform === "twitter" ? "Twitter" : "LinkedIn"} to share...`
    );
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="share-modal">
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${config.color}`} />
            <h2 className="text-lg font-semibold">{config.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {config.showThoughts && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Add Your Thoughts</h3>
              <Textarea
                placeholder="What do you think about this? Share your perspective..."
                value={thoughts}
                onChange={(e) => setThoughts(e.target.value)}
                className="resize-none h-24 text-sm"
                data-testid="thoughts-input"
              />
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Post Preview</h3>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-800 whitespace-pre-line">
              {config.showThoughts && thoughts.trim()
                ? `${thoughts}\n\n${getPreviewMessage()}`
                : getPreviewMessage()}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            data-testid="close-modal-button"
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold"
            onClick={handleConfirm}
            data-testid="confirm-post-button"
          >
            {platform === "twitter" ? "Post" : "Share on LinkedIn"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
