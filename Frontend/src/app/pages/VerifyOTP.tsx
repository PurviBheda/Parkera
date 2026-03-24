import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  ParkingCircle,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const userEmail = searchParams.get("email");
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [searchParams]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        email,
        otp: otpValue
      });

      toast.success(res.data.message || "Account verified successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error: any) {
      setIsVerifying(false);
      toast.error(error.response?.data?.message || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#EAB308] opacity-20"></div>
        <div className="max-w-md w-full space-y-10 relative z-10">
          <div className="text-center md:text-left space-y-4">
            <a href="/" className="inline-flex items-center space-x-2 mb-8 group">
              <div className="bg-black p-2 rounded-xl group-hover:scale-110 transition-transform">
                <ParkingCircle className="text-[#EAB308] w-6 h-6" />
              </div>
              <span className="font-black text-2xl tracking-tighter">
                PARK<span className="text-[#EAB308]">ERA</span>
              </span>
            </a>

            <div className="inline-flex items-center justify-center space-x-2 bg-yellow-100 text-[#EAB308] px-4 py-2 rounded-full mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Verification Step</span>
            </div>

            <h1 className="text-4xl font-black text-black tracking-tighter leading-tight">
              Verify your email.
            </h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              We've sent a 6-digit code to <br className="hidden md:block" />
              <span className="text-black font-bold bg-yellow-100/50 px-2 py-1 rounded-md">{email || "your email"}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-black text-black uppercase tracking-widest ml-1 text-center md:text-left block">
                Enter Security Code
              </label>
              <div className="flex justify-between space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-16 md:w-14 md:h-16 text-center text-2xl font-black bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-[#EAB308] focus:bg-yellow-50 focus:ring-4 focus:ring-yellow-100/50 transition-all shadow-sm"
                  />
                ))}
              </div>
            </div>

            <button
              disabled={isVerifying || otp.join("").length !== 6}
              className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:bg-gray-400 disabled:scale-100 group"
            >
              <span>{isVerifying ? "Verifying..." : "Confirm & Continue"}</span>
              {!isVerifying && (
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              )}
              {isVerifying && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
            </button>
          </form>

          <div className="text-center space-y-4 pt-4">
            <p className="text-gray-500 font-bold">
              Didn't receive the code?{" "}
              <button
                onClick={(e) => { e.preventDefault(); toast.info("Requesting new OTP..."); }}
                className="text-[#EAB308] hover:underline"
              >
                Resend carefully
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:block lg:w-1/2 bg-black relative p-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#EAB308] rounded-full blur-[160px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#EAB308] rounded-full blur-[140px] opacity-5 -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative h-full flex flex-col justify-center items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg space-y-8"
          >
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-[#EAB308]/30 transition-colors">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#EAB308] rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>

              <div className="w-20 h-20 bg-yellow-400/10 rounded-3xl flex items-center justify-center mb-8 border border-yellow-400/20">
                <Mail className="w-10 h-10 text-[#EAB308]" />
              </div>

              <h3 className="text-3xl font-black text-white leading-tight mb-4 tracking-tight">
                Almost there.<br />
                <span className="text-[#EAB308]">Check your inbox.</span>
              </h3>

              <p className="text-gray-400 font-medium leading-relaxed">
                To keep our community safe, we require all users to verify their identity. Enter the code sent to your email to unlock your smart parking dashboard.
              </p>

              <div className="mt-8 pt-8 border-t border-white/10 flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-bold">Secure Access</p>
                  <p className="text-gray-500 text-sm">Prevents unauthorized bookings</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}