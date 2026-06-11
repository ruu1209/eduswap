import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

const fileToBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const CreateListing = () => {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const [meta, setMeta] = useState({ categories: [], conditions: [] });
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    campus_location: "",
    images: [],
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/categories").then((r) => setMeta(r.data));
    if (editing) {
      api.get(`/listings/${id}`).then((r) => setForm({
        title: r.data.title || "",
        description: r.data.description || "",
        price: r.data.price ?? "",
        category: r.data.category || "",
        condition: r.data.condition || "",
        campus_location: r.data.campus_location || "",
        images: r.data.images || [],
      }));
    }
  }, [id, editing]);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - form.images.length);
    const b64 = await Promise.all(files.map(fileToBase64));
    setForm({ ...form, images: [...form.images, ...b64].slice(0, 5) });
  };

  const removeImage = (i) =>
    setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.condition || !form.campus_location) {
      return toast.error("Please fill all required fields");
    }
    setBusy(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) || 0 };
      const res = editing
        ? await api.put(`/listings/${id}`, payload)
        : await api.post("/listings", payload);
      toast.success(editing ? "Updated!" : "Listing posted!");
      navigate(`/listing/${editing ? id : res.data.id}`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="create-listing-page">
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-6">
        {editing ? "Edit Listing" : "Post a New Listing"}
      </h1>
      <form onSubmit={submit} className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-bold mb-1">Title *</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            data-testid="create-title"
            required
            className="w-full border-2 border-black rounded-md px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] font-bold mb-1">Price (₹) *</label>
            <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} data-testid="create-price" required className="w-full border-2 border-black rounded-md px-3 py-2"/>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] font-bold mb-1">Category *</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} data-testid="create-category" required className="w-full border-2 border-black rounded-md px-3 py-2 bg-white">
              <option value="">Select…</option>
              {meta.categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] font-bold mb-1">Condition *</label>
            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} data-testid="create-condition" required className="w-full border-2 border-black rounded-md px-3 py-2 bg-white">
              <option value="">Select…</option>
              {meta.conditions.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-bold mb-1">Campus Location *</label>
          <input value={form.campus_location} onChange={(e) => setForm({ ...form, campus_location: e.target.value })} data-testid="create-location" required placeholder="e.g. Men's Hostel Block A, MG Auditorium" className="w-full border-2 border-black rounded-md px-3 py-2"/>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-bold mb-1">Description *</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="create-description" required rows={5} className="w-full border-2 border-black rounded-md px-3 py-2"/>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-bold mb-1">Images (up to 5)</label>
          <div className="flex flex-wrap gap-3">
            {form.images.map((src, i) => (
              <div key={i} className="relative w-24 h-24 border-2 border-black rounded-md overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-0 right-0 bg-black text-white p-0.5"><X className="w-3 h-3"/></button>
              </div>
            ))}
            {form.images.length < 5 && (
              <label className="w-24 h-24 border-2 border-dashed border-black rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-[#FEF08A]" data-testid="upload-image-btn">
                <Upload className="w-5 h-5" strokeWidth={3}/>
                <span className="text-[10px] uppercase font-bold mt-1">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles}/>
              </label>
            )}
          </div>
        </div>
        <button type="submit" disabled={busy} data-testid="submit-listing-btn" className="bg-black text-white border-2 border-black rounded-md px-6 py-3 font-bold uppercase tracking-wider hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(167,243,208,1)] disabled:opacity-50">
          {busy ? "Saving…" : editing ? "Update Listing" : "Publish Listing"}
        </button>
      </form>
    </div>
  );
};

export default CreateListing;
