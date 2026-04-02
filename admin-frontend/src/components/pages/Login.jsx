import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Smartphone, Eye, EyeOff } from "lucide-react";
import { adminAuthAPI } from "../../utils/api";

export function Login() {
  const navigate = useNavigate();
  const [step, setStep]           = useState(1); // 1=phone, 2=otp
  const [phone, setPhone]         = useState("");
  const [otp, setOtp]             = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [devOtp, setDevOtp]       = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for resend
  const startTimer = () => {
    setResendTimer(30);
    const iv = setInterval(() => {
      setResendTimer(p => {
        if (p <= 1) { clearInterval(iv); return 0; }
        return p - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    setError("");
    if (!phone || phone.length !== 10) return setError("Enter a valid 10-digit number");
    setLoading(true);
    try {
      const res = await adminAuthAPI.sendOTP(phone);
      if (res.data.success) {
        setStep(2);
        startTimer();
        if (res.data.otp) setDevOtp(res.data.otp); // dev only
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    if (!otp || otp.length !== 6) return setError("Enter the 6-digit OTP");
    setLoading(true);
    try {
      const res = await adminAuthAPI.verifyOTP(phone, otp);
      if (res.data.success) {
        // Check if this user is admin or shop_owner
        const role = res.data.user?.role;
        if (role !== "admin" && role !== "shop_owner") {
          setError("Access denied. Admin privileges required.");
          setLoading(false);
          return;
        }
        localStorage.setItem("smartration_admin_token", res.data.token);
        localStorage.setItem("smartration_admin_user", JSON.stringify(res.data.user));
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1B45] via-[#5E4075] to-[#8B6FA8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">SmartRation</h1>
          <p className="text-white/70 mt-1 text-sm">Admin & Shop Owner Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          <div className="h-1.5 bg-gradient-to-r from-[#5E4075] via-[#8B6FA8] to-[#5E4075]" />

          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {step === 1 ? "Sign in to Dashboard" : "Verify your identity"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {step === 1
                ? "Enter your registered admin mobile number"
                : `OTP sent to +91 ${phone.slice(0,3)}XXXXX${phone.slice(-2)}`}
            </p>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
                {error}
              </div>
            )}

            {/* Dev OTP hint */}
            {devOtp && !error && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm mb-4 font-mono font-semibold text-center tracking-widest">
                Dev OTP: {devOtp}
              </div>
            )}

            {step === 1 ? (
              <>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="98765 43210"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#5E4075] focus:outline-none text-gray-900 font-medium transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full bg-[#5E4075] hover:bg-[#4a2f5c] disabled:bg-gray-300 text-white py-3.5 rounded-xl font-semibold transition-colors"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter 6-digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    autoFocus
                    className="w-full text-center text-2xl font-bold tracking-[0.5em] py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#5E4075] focus:outline-none transition-colors"
                  />
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="w-full bg-[#5E4075] hover:bg-[#4a2f5c] disabled:bg-gray-300 text-white py-3.5 rounded-xl font-semibold transition-colors mb-3"
                >
                  {loading ? "Verifying..." : "Verify & Enter Dashboard"}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={resendTimer > 0 ? undefined : handleSendOTP}
                    disabled={resendTimer > 0}
                    className="flex-1 text-sm text-center py-2.5 border-2 border-gray-200 rounded-xl font-medium text-gray-600 disabled:text-gray-400 hover:border-[#5E4075] hover:text-[#5E4075] transition-colors"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                  <button
                    onClick={() => { setStep(1); setOtp(""); setError(""); setDevOtp(""); }}
                    className="flex-1 text-sm text-center py-2.5 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:border-gray-400 transition-colors"
                  >
                    ← Change number
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          SmartRation Admin Portal · Government of India
        </p>
      </div>
    </div>
  );
}