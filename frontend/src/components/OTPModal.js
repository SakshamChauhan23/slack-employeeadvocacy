import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Lock } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const OTPModal = ({ open, onClose, phoneNumber, userId, onSuccess }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setOtp("");
    }
  }, [open]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/phone/confirm`, {
        phone_number: phoneNumber,
        otp_code: otp,
        user_id: userId
      });
      toast.success("Phone number verified successfully!");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const maskPhone = (phone) => {
    if (!phone) return "";
    const last4 = phone.slice(-4);
    return `***-***-${last4}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="otp-modal">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-semibold">Enter Verification Code</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-slate-600">
            We sent a 6-digit code to {maskPhone(phoneNumber)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              data-testid="otp-input"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={handleVerify}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={loading || otp.length !== 6}
            data-testid="verify-otp-button"
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>

          <div className="text-center">
            <button
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              onClick={() => toast.info("Resending code...")}
              data-testid="resend-code-button"
            >
              Resend code
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPModal;