import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  const verify = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      login(res.data.token, res.data.user);
      toast.success("Verified! Welcome to EduSwap.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid OTP");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      const res = await api.post("/auth/resend-otp", { email });
      if (res.data.dev_otp) toast.success(`DEV mode — your OTP: ${res.data.dev_otp}`, { duration: 10000 });
      else toast.success("OTP re-sent");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10" data-testid="verify-page">
      <div className="w-full max-w-md bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
        <p className="text-xs uppercase tracking-[0.15em] font-bold text-[#4B5563]">Last step</p>
        <h1 className="text-3xl font-black tracking-tight mb-1">Verify your email</h1>
        <p className="text-sm text-[#4B5563] mb-6">Enter the 6-digit code sent to your VIT email.</p>
        <form onSubmit={verify} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] font-bold mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid="verify-email" className="w-full border-2 border-black rounded-md px-3 py-2"/>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] font-bold mb-1">OTP Code</label>
            <input
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              data-testid="verify-otp"
              maxLength={6}
              className="w-full border-2 border-black rounded-md px-3 py-3 text-center text-2xl font-black tracking-[0.5em]"
              placeholder="••••••"
            />
          </div>
          <button type="submit" disabled={busy} data-testid="verify-submit" className="w-full bg-black text-white border-2 border-black rounded-md py-3 font-bold uppercase tracking-wider hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(167,243,208,1)] disabled:opacity-50">
            {busy ? "Verifying…" : "Verify & Continue"}
          </button>
        </form>
        <button onClick={resend} data-testid="resend-otp" className="mt-4 w-full text-sm font-bold uppercase tracking-wider underline underline-offset-4">
          Resend code
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;
