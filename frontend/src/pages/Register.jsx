import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", branch: "", year: "", hostel: "", phone: "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email.toLowerCase().endsWith("@vitstudent.ac.in")) {
      return toast.error("Only @vitstudent.ac.in emails allowed");
    }
    setBusy(true);
    try {
      const res = await api.post("/auth/register", form);
      if (res.data.dev_otp) {
        toast.success(`DEV mode — your OTP: ${res.data.dev_otp}`, { duration: 10000 });
      } else {
        toast.success("Check your VIT email for the OTP");
      }
      navigate("/verify", { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10" data-testid="register-page">
      <div className="w-full max-w-xl bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
        <p className="text-xs uppercase tracking-[0.15em] font-bold text-[#4B5563]">Join EduSwap</p>
        <h1 className="text-3xl font-black tracking-tight mb-1">Create your account</h1>
        <p className="text-sm text-[#4B5563] mb-6">Must use your <b>@vitstudent.ac.in</b> email</p>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Full name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="register-name"/>
          <Input label="VIT Email" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} testid="register-email" placeholder="yourname.bawa23@vitstudent.ac.in"/>
          <Input label="Password (min 6 chars)" type="password" required value={form.password} onChange={(v) => setForm({ ...form, password: v })} testid="register-password"/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Branch" value={form.branch} onChange={(v) => setForm({ ...form, branch: v })} testid="register-branch" placeholder="CSE"/>
            <Input label="Year" value={form.year} onChange={(v) => setForm({ ...form, year: v })} testid="register-year" placeholder="2nd Year"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Hostel (optional)" value={form.hostel} onChange={(v) => setForm({ ...form, hostel: v })} testid="register-hostel"/>
            <Input label="Phone (optional)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} testid="register-phone"/>
          </div>
          <button type="submit" disabled={busy} data-testid="register-submit" className="w-full bg-black text-white border-2 border-black rounded-md py-3 font-bold uppercase tracking-wider hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(167,243,208,1)] disabled:opacity-50">
            {busy ? "Sending OTP…" : "Create account"}
          </button>
        </form>
        <p className="text-sm text-center mt-6">
          Already a member? <Link to="/login" className="font-bold underline underline-offset-4">Log in</Link>
        </p>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text", required, testid, placeholder }) => (
  <div>
    <label className="block text-xs uppercase tracking-[0.15em] font-bold mb-1">{label}</label>
    <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid} placeholder={placeholder} className="w-full border-2 border-black rounded-md px-3 py-2"/>
  </div>
);

export default Register;
