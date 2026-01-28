import { X, Twitter, Linkedin, Phone } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const ShareModal = ({ platform, post, onClose, onConfirm }) => {
  const handleConfirm = () => {
    onConfirm();
    toast.success(`Posted to ${platform}!`);
    onClose();
  };

  const platformConfig = {
    twitter: {
      title: "Post update to Twitter",
      icon: Twitter,
      color: "text-blue-500"
    },
    linkedin: {
      title: "Post update to LinkedIn",
      icon: Linkedin,
      color: "text-blue-700"
    },
    whatsapp: {
      title: "Send to WhatsApp",
      icon: Phone,
      color: "text-green-600"
    }
  };

  const config = platformConfig[platform];
  const Icon = config.icon;

  const getMessage = () => {
    if (platform === 'whatsapp') {
      return `Check this out from SocialRipple:\n${post.title}\n${post.link_url || 'https://socialripple.com'}`;
    }
    return `We are excited to announce several major product enhancements to the SocialRipple platform that are designed to streamline workflows and boost end-user productivity. Read more here: ${post.link_url || 'https://socialripple.com'}`;
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

        <div className="py-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Message Preview</h3>
          <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-800">
            {getMessage()}
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            data-testid="close-modal-button"
          >
            Close
          </Button>
          <Button
            className="flex-1 bg-[#007a5a] hover:bg-[#148567] text-white font-bold"
            onClick={handleConfirm}
            data-testid="confirm-post-button"
          >
            Post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;