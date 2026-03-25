import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ParkingCircle,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

export const Auth = ({ type = "login" }: { type?: "login" | "register" }) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(type === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    vehicle: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const userData = await login(formData.email, formData.password);
        toast.success(t("Welcome back!"));
        if (userData?.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        if (!acceptedTerms) {
          toast.error(t("You must accept the Terms & Conditions to continue."));
          return;
        }

        setIsVerifying(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            vehicle: formData.vehicle,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        toast.success(t("OTP sent to your email"));

        setTimeout(() => {
          setIsVerifying(false);
          navigate(`/verify-otp?email=${formData.email}`);
        }, 1200);
      }
    } catch (error: any) {
      toast.error(error.message || t("An error occurred."));
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#EAB308] opacity-20"></div>
        <div className="max-w-md w-full space-y-10 relative z-10">
          <div className="text-center md:text-left space-y-4">
            <a
              href="/"
              className="inline-flex items-center space-x-2 mb-8 group"
            >
              <div className="bg-black p-2 rounded-xl group-hover:scale-110 transition-transform">
                <ParkingCircle className="text-[#EAB308] w-6 h-6" />
              </div>
              <span className="font-black text-2xl tracking-tighter">
                PARK<span className="text-[#EAB308]">ERA</span>
              </span>
            </a>
            <h1 className="text-4xl font-black text-black tracking-tighter leading-tight">
              {isLogin ? t("Welcome Back.") : t("Join the Future of Parking.")}
            </h1>
            <p className="text-gray-500 font-medium">
              {isLogin
                ? t("Enter your credentials to access your dashboard.")
                : t("Create an account to start booking smart parking spots.")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-black text-black uppercase tracking-widest ml-1">
                    {t("Full Name")}
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#EAB308] transition-colors" />
                    <input
                      type="text"
                      required
                      pattern="[A-Za-z ]+"
                      title={t("Please enter valid characters (letters only)")}
                      placeholder={t("Enter Your Name")}
                      className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#EAB308] transition-all font-semibold shadow-sm"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (!e.target.checkValidity()) {
                          e.target.reportValidity();
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-black text-black uppercase tracking-widest ml-1">
                {t("Email Address")}
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#EAB308] transition-colors" />
                <input
                  type="email"
                  required
                  placeholder={t("name@example.com")}
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#EAB308] transition-all font-semibold shadow-sm"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-black text-black uppercase tracking-widest">
                  {t("Password")}
                </label>
                {isLogin && (
                  <a
                    href="#"
                    className="text-xs font-bold text-[#EAB308] hover:underline"
                  >
                    {t("Forgot?")}
                  </a>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#EAB308] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  maxLength={6}
                  pattern="[A-Za-z0-9]{6}"
                  title={t("Password must be exactly 6 letters or numbers")}
                  placeholder="••••••"
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-[#EAB308] transition-all font-semibold shadow-sm"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (!e.target.checkValidity()) {
                      e.target.reportValidity();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Phone Number */}
                    <div className="space-y-2">
                      <label className="text-sm font-black text-black uppercase tracking-widest ml-1">
                        {t("Phone Number")}
                      </label>
                      <div className="relative group">
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          pattern="[6-9][0-9]{9}"
                          title={t("Enter valid 10-digit Indian mobile number")}
                          placeholder={t("Enter phone number")}
                          className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-4 outline-none focus:border-[#EAB308] transition-all font-semibold shadow-sm"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value });
                            if (!e.target.checkValidity()) {
                              e.target.reportValidity();
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Vehicle Number */}
                    <div className="space-y-2">
                      <label className="text-sm font-black text-black uppercase tracking-widest ml-1">
                        {t("Vehicle Number")}
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          required
                          pattern="[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}"
                          title={t("Enter valid vehicle number (e.g. GJ05AB1234)")}
                          placeholder={t("e.g. GJ05AB1234")}
                          className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-4 outline-none focus:border-[#EAB308] transition-all font-semibold shadow-sm uppercase"
                          value={formData.vehicle}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            setFormData({ ...formData, vehicle: value });

                            if (!e.target.checkValidity()) {
                              e.target.reportValidity();
                            }
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isLogin && (
              <div className="flex items-start space-x-3 pt-2">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 text-[#EAB308] bg-white border-gray-300 rounded focus:ring-[#EAB308] focus:ring-2 accent-[#EAB308] cursor-pointer"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700 cursor-pointer">
                    {t("I agree to the")}{" "}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-bold text-[#EAB308] hover:underline">
                      {t("Terms & Conditions")}
                    </a>
                  </label>
                </div>
              </div>
            )}

            <button
              disabled={isLoading || isVerifying}
              className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:bg-gray-400 disabled:scale-100 group"
            >
              <span>
                {isVerifying
                  ? t("Verifying Email...")
                  : isLogin
                    ? t("Sign In")
                    : t("Create Account")}
              </span>
              {!isLoading && !isVerifying && (
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              )}
              {(isLoading || isVerifying) && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
            </button>
          </form>

          <div className="text-center space-y-4 pt-4">
            <p className="text-gray-500 font-bold">
              {isLogin ? t("Don't have an account?") : t("Already have an account?")}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#EAB308] hover:underline"
              >
                {isLogin ? t("Sign up for free") : t("Sign in here")}
              </button>
            </p>
            <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" />
              <span>{t("Secure 256-bit SSL Encryption")}</span>
            </div>
          </div>
        </div>

        {/* Verification Modal Simulation */}
        <AnimatePresence>
          {isVerifying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-8"
            >
              <div className="max-w-sm w-full text-center space-y-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <Mail className="w-10 h-10 text-[#EAB308]" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-4 border-white">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black">{t("Verify your email")}</h3>
                  <p className="text-gray-500 font-medium">
                    {t("We've sent a 6-digit verification code to")}{" "}
                    <span className="text-black font-bold">
                      {formData.email}
                    </span>
                    . {t("Please enter the OTP sent to your email on the next screen.")}
                  </p>
                </div>
                <div className="flex justify-center space-x-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-14 bg-gray-100 rounded-xl border-2 border-gray-200 animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:block lg:w-1/2 bg-black relative p-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#EAB308] rounded-full blur-[160px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#EAB308] rounded-full blur-[140px] opacity-5 -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative h-full flex flex-col justify-between">
          <div className="space-y-6 max-w-lg">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-1 w-12 bg-[#EAB308] rounded-full opacity-30"
                ></div>
              ))}
            </div>
            <h2 className="text-6xl font-black text-white leading-none tracking-tighter">
              {t("A NEW WAY")} <br />
              <span className="text-[#EAB308]">{t("TO PARK.")}</span>
            </h2>
            <p className="text-gray-400 text-lg font-medium leading-relaxed">
              {t('"Since using ParkEra, I\'ve saved an average of 15 minutes every morning. The real-time slot tracking is a game changer."')}
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full border-2 border-[#EAB308] p-0.5">
                <img
                  src="/purvi.jpeg"
                  className="w-full h-full object-cover rounded-full"
                  alt={t("User")}
                />
              </div>
              <div>
                <p className="text-white font-bold">{t("Purvi")}</p>
                <p className="text-gray-500 text-xs uppercase font-black tracking-widest">
                  {t("Premium User")}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-[#EAB308] p-0.5">
                <img
                  src="/urja.jpeg"
                  className="w-full h-full object-cover rounded-full"
                  alt={t("User")}
                />
              </div>
              <div>
                <p className="text-white font-bold">{t("Urja")}</p>
                <p className="text-gray-500 text-xs uppercase font-black tracking-widest">
                  {t("Premium User")}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-[#EAB308] p-0.5">
                <img
                  src="/nidhi.jpeg"
                  className="w-full h-full object-cover rounded-full"
                  alt={t("User")}
                />
              </div>
              <div>
                <p className="text-white font-bold">{t("Nidhi")}</p>
                <p className="text-gray-500 text-xs uppercase font-black tracking-widest">
                  {t("Premium User")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-[2rem] space-y-4">
              <div className="w-12 h-12 bg-[#EAB308] rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-black" />
              </div>
              <h4 className="text-xl font-black text-white">{t("100% Secure")}</h4>
              <p className="text-gray-500 text-sm font-medium">
                {t("Your data and payment info are encrypted with bank-grade security protocols.")}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-[2rem] space-y-4">
              <div className="w-12 h-12 bg-[#EAB308] rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-black" />
              </div>
              <h4 className="text-xl font-black text-white">{t("Smart Alerts")}</h4>
              <p className="text-gray-500 text-sm font-medium">
                {t("Get instant notifications about your booking status and parking time remaining.")}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-[2rem] space-y-4">
              <div className="w-12 h-12 bg-[#EAB308] rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-black" />
              </div>
              <h4 className="text-xl font-black text-white">{t("Live Slots")}</h4>
              <p className="text-gray-500 text-sm font-medium">
                {t("Check real-time parking availability so you can quickly find and reserve an open spot nearby.")}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-[2rem] space-y-4">
              <div className="w-12 h-12 bg-[#EAB308] rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-black" />
              </div>
              <h4 className="text-xl font-black text-white">{t("Easy Booking")}</h4>
              <p className="text-gray-500 text-sm font-medium">
                {t("Reserve your parking space in seconds and avoid the hassle of searching for a place to park.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
