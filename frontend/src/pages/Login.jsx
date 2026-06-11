import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(location.state?.from || "/");
    } catch (err) {
      const detail = err.response?.data?.detail || "Login failed";
      toast.error(detail);
      if (detail.includes("verify")) {
        navigate("/verify", { state: { email: form.email } });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10" data-testid="login-page">
      <div className="w-full max-w-md bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
        <p className="text-xs uppercase tracking-[0.15em] font-bold text-[#4B5563]">EduSwap</p>
        <h1 className="text-3xl font-black tracking-tight mb-1">Log in</h1>
        <p className="text-sm text-[#4B5563] mb-6">VIT students only — @vitstudent.ac.in</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] font-bold mb-1">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="login-email" className="w-full border-2 border-black rounded-md px-3 py-2"/>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] font-bold mb-1">Password</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="login-password" className="w-full border-2 border-black rounded-md px-3 py-2"/>
          </div>
          <button type="submit" disabled={busy} data-testid="login-submit" className="w-full bg-black text-white border-2 border-black rounded-md py-3 font-bold uppercase tracking-wider hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(167,243,208,1)] disabled:opacity-50">
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="text-sm text-center mt-6">
          New here? <Link to="/register" className="font-bold underline underline-offset-4">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
