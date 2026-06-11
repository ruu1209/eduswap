import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";
import { Heart, MapPin, Eye, Flag, Phone, Mail, Trash2, Edit3 } from "lucide-react";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [listing, setListing] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [contact, setContact] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Inappropriate content");
  const [reportDetails, setReportDetails] = useState("");

  useEffect(() => {
    api.get(`/listings/${id}`).then((r) => setListing(r.data)).catch(() => toast.error("Listing not found"));
  }, [id]);

  if (!listing) return <div className="py-20 text-center font-bold uppercase tracking-wider">Loading…</div>;

  const isOwner = user && listing.seller_id === user.id;
  const isAdmin = user?.role === "admin";
  const saved = (user?.saved_listings || []).includes(listing.id);

  const onContact = async () => {
    if (!user) return toast.error("Please log in to contact seller");
    try {
      const res = await api.get(`/listings/${listing.id}/contact`);
      setContact(res.data);
    } catch {
      toast.error("Failed to fetch contact");
    }
  };

  const onSave = async () => {
    if (!user) return toast.error("Please log in to save");
    await api.post(`/listings/${listing.id}/save`);
    await refresh();
  };

  const onDelete = async () => {
    if (!window.confirm("Delete this listing?")) return;
    await api.delete(`/listings/${listing.id}`);
    toast.success("Deleted");
    navigate("/dashboard");
  };

  const onReport = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/listings/${listing.id}/report`, { reason: reportReason, details: reportDetails });
      toast.success("Report submitted");
      setReportOpen(false);
      setReportDetails("");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  const images = listing.images && listing.images.length ? listing.images : [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="listing-detail-page">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <img src={images[activeImg]} alt={listing.title} className="w-full aspect-[4/3] object-cover border-b-2 border-black" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 border-2 border-black rounded-md overflow-hidden ${activeImg === i ? "shadow-[3px_3px_0px_0px_rgba(37,99,235,1)]" : ""}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-[0.1em] font-bold border-2 border-black rounded px-2 py-0.5 bg-[#A7F3D0]">{listing.condition}</span>
            <span className="text-xs uppercase tracking-[0.1em] font-bold border-2 border-black rounded px-2 py-0.5 bg-white">{listing.category}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{listing.title}</h1>
          <div className="text-4xl font-black">₹{listing.price}</div>
          <div className="flex items-center gap-4 text-sm text-[#4B5563]">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" strokeWidth={3}/> {listing.campus_location}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" strokeWidth={3}/> {listing.views} views</span>
          </div>

          <div className="bg-white border-2 border-black rounded-lg p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs uppercase tracking-[0.15em] font-bold mb-2">Description</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </div>

          <div className="bg-[#FEF08A] border-2 border-black rounded-lg p-4">
            <p className="text-xs uppercase tracking-[0.15em] font-bold">Seller</p>
            <Link to={`/seller/${listing.seller_id}`} className="font-bold text-lg hover:underline">{listing.seller_name}</Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {isOwner || isAdmin ? (
              <>
                {isOwner && (
                  <Link to={`/edit/${listing.id}`} data-testid="edit-listing-btn" className="bg-white text-black border-2 border-black rounded-md px-5 py-3 font-bold uppercase tracking-wider hover:bg-[#FEF08A] flex items-center gap-2">
                    <Edit3 className="w-4 h-4" strokeWidth={3}/> Edit
                  </Link>
                )}
                <button onClick={onDelete} data-testid="delete-listing-btn" className="bg-[#EF4444] text-white border-2 border-black rounded-md px-5 py-3 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Trash2 className="w-4 h-4" strokeWidth={3}/> Delete
                </button>
              </>
            ) : (
              <>
                <button onClick={onContact} data-testid="contact-seller-btn" className="bg-black text-white border-2 border-black rounded-md px-5 py-3 font-bold uppercase tracking-wider hover:bg-gray-800">
                  Contact Seller
                </button>
                <button onClick={onSave} data-testid="save-detail-btn" className={`border-2 border-black rounded-md px-5 py-3 font-bold uppercase tracking-wider flex items-center gap-2 ${saved ? "bg-[#FFDDBF]" : "bg-white hover:bg-[#FEF08A]"}`}>
                  <Heart className="w-4 h-4" strokeWidth={3} fill={saved ? "#000" : "none"}/> {saved ? "Saved" : "Save"}
                </button>
                <button onClick={() => setReportOpen(!reportOpen)} data-testid="report-listing-btn" className="bg-white border-2 border-black rounded-md px-5 py-3 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Flag className="w-4 h-4" strokeWidth={3}/> Report
                </button>
              </>
            )}
          </div>

          {contact && (
            <div className="bg-white border-2 border-black rounded-lg p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" data-testid="contact-info">
              <p className="text-xs uppercase tracking-[0.15em] font-bold mb-2">Seller Contact</p>
              <div className="space-y-1 text-sm">
                <p><b>Name:</b> {contact.name}</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" strokeWidth={3}/> {contact.email}</p>
                {contact.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" strokeWidth={3}/> {contact.phone}</p>}
                {contact.branch && <p><b>Branch / Year:</b> {contact.branch} · {contact.year}</p>}
                {contact.hostel && <p><b>Hostel:</b> {contact.hostel}</p>}
              </div>
              <div className="mt-3 bg-[#FEF08A] border-2 border-black rounded-md p-3 text-xs">
                <b>Reminder:</b> Pay only after meeting in person on campus. EduSwap does not handle online payments.
              </div>
            </div>
          )}

          {reportOpen && (
            <form onSubmit={onReport} data-testid="report-form" className="bg-white border-2 border-black rounded-lg p-4 space-y-3">
              <p className="font-bold uppercase tracking-wider text-sm">Report this listing</p>
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="w-full border-2 border-black rounded-md px-3 py-2 font-semibold">
                <option>Inappropriate content</option>
                <option>Scam / Fraud</option>
                <option>Spam</option>
                <option>Counterfeit</option>
                <option>Other</option>
              </select>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Add details (optional)"
                className="w-full border-2 border-black rounded-md px-3 py-2 min-h-[80px]"
              />
              <button type="submit" className="bg-black text-white border-2 border-black rounded-md px-5 py-2 font-bold uppercase tracking-wider">Submit Report</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
