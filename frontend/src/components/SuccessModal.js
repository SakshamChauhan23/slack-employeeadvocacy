import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink } from "lucide-react";

export const SuccessModal = ({ open, onClose, phoneNumber }) => {
  const openWhatsApp = () => {
    window.open("https://web.whatsapp.com", "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="success-modal">
        <DialogHeader>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <DialogTitle className="text-2xl font-semibold">Message Sent!</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="text-center space-y-2">
            <p className="text-slate-700 leading-relaxed">
              We've sent the message to your WhatsApp
            </p>
            <p className="text-sm text-slate-500">
              You can now forward it to your contacts
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Message preview:</p>
            <p className="text-sm text-slate-700">
              We're hiring at Your Company! 🚀<br />
              Check this out: [Post URL]
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={openWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              data-testid="open-whatsapp-button"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open WhatsApp
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
              data-testid="close-success-button"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;