import React, { useState } from "react";
import api from "../lib/api";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";

const fileToBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const Profile = () => {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    branch: user?.branch || "",
    year: user?.year || "",
    hostel: user?.hostel || "",
    phone: user?.phone || "",
    profile_photo: user?.profile_photo || "",
  });
  const [busy, setBusy] = useState(false);

  const onPhoto = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const b64 = await fileToBase64(f);
    setForm({ ...form, profile_photo: b64 });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put("/users/me", form);
      await refresh();
      toast.success("Profile updated");
    } catch (e) {
      toast.error("Failed to update");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="profile-page">
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-6">Edit Profile</h1>
      <form onSubmit={submit} className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 border-2 border-black rounded-full overflow-hidden bg-[#FEF08A] flex items-center justify-center font-black text-2xl">
            {form.profile_photo ? <img src={form.profile_photo} alt="" className="w-full h-full object-cover"/> : (user?.name || "?")[0].toUpperCase()}
          </div>
          <label className="bg-white border-2 border-black rounded-md px-4 py-2 font-bold uppercase tracking-wider hover:bg-[#FEF08A] cursor-pointer">
            Upload photo
            <input type="file" accept="image/*" className="hidden" onChange={onPhoto} data-testid="profile-photo-input"/>
          </label>
        </div>
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="profile-name"/>
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-bold mb-1">Email</label>
          <input value={user?.email || ""} disabled className="w-full border-2 border-black rounded-md px-3 py-2 bg-[#F9F9F6] text-[#4B5563]"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Branch" value={form.branch} onChange={(v) => setForm({ ...form, branch: v })} testid="profile-branch" placeholder="e.g. CSE"/>
          <Field label="Year" value={form.year} onChange={(v) => setForm({ ...form, year: v })} testid="profile-year" placeholder="e.g. 2nd Year"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Hostel (optional)" value={form.hostel} onChange={(v) => setForm({ ...form, hostel: v })} testid="profile-hostel"/>
          <Field label="Phone (shared with buyers)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} testid="profile-phone"/>
        </div>
        <button type="submit" disabled={busy} data-testid="save-profile-btn" className="bg-black text-white border-2 border-black rounded-md px-6 py-3 font-bold uppercase tracking-wider hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(167,243,208,1)]">
          {busy ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

const Field = ({ label, value, onChange, testid, placeholder }) => (
  <div>
    <label className="block text-xs uppercase tracking-[0.15em] font-bold mb-1">{label}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid} placeholder={placeholder} className="w-full border-2 border-black rounded-md px-3 py-2"/>
  </div>
);

export default Profile;
