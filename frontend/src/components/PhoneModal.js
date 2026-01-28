import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const PhoneModal = ({ open, onClose, onSubmit }) => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId] = useState("user-" + Math.random().toString(36).substr(2, 9));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/phone/verify`, {
        phone_number: phone,
        user_id: userId
      });
      toast.success("OTP sent to your phone!");
      onSubmit(phone);
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="phone-modal">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-semibold">Verify Phone Number</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-slate-600">
            Enter your phone number to receive content via WhatsApp. We'll send you a verification code.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full"
              data-testid="phone-input"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="cancel-phone-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
              data-testid="send-otp-button"
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneModal;