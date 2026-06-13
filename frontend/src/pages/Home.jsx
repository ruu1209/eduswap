import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import ListingCard from "../components/ListingCard";
import { useAuth } from "../lib/auth";
import { ShieldCheck, Mail, HandshakeIcon, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

const categoryStyles = [
  { name: "Notes", bg: "#A7F3D0", emoji: "✎" },
  { name: "Books", bg: "#DDD6FE", emoji: "❒", img: "https://images.unsplash.com/photo-1517221514-0fc402968cb1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxzdGFjayUyMG9mJTIwY29sbGVnZSUyMHRleHRib29rcyUyMHN0dWR5aW5nfGVufDB8fHx8MTc3OTM5MTc0NXww&ixlib=rb-4.1.0&q=85" },
  { name: "Electronics", bg: "#FEF08A", emoji: "⌘", img: "https://images.unsplash.com/photo-1641057349981-48bdca8fe870?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwzfHxsYXB0b3AlMjBoZWFkcGhvbmVzJTIwc3R1ZHklMjBkZXNrfGVufDB8fHx8MTc3OTM5MTc0NXww&ixlib=rb-4.1.0&q=85" },
  { name: "Food", bg: "#FFDDBF", emoji: "★" },
  { name: "Accessories", bg: "#A7F3D0", emoji: "◆" },
  { name: "Stationery", bg: "#DDD6FE", emoji: "✦" },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const { user } = useAuth();

 useEffect(() => {
  api.get("/listings?limit=8")
    .then((r) => {
      console.log("API RESPONSE:", r.data);

      if (Array.isArray(r.data)) {
        setFeatured(r.data);
      } else if (Array.isArray(r.data.listings)) {
        setFeatured(r.data.listings);
      } else {
        setFeatured([]);
      }
    })
    .catch((err) => {
      console.log(err);
      setFeatured([]);
    });
}, []);

  const toggleSave = async (id) => {
    if (!user) return toast.error("Please log in to save items");
    try {
      const res = await api.post(`/listings/${id}/save`);
      toast.success(res.data.action === "saved" ? "Saved!" : "Removed");
    } catch {
      toast.error("Failed");
    }
  };
  console.log("FEATURED:", featured);
console.log("TYPE:", typeof featured);
console.log("IS ARRAY:", Array.isArray(featured));

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="border-b-2 border-black bg-[#F9F9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#FEF08A] border-2 border-black rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.15em] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={3} /> Verified VIT students only
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
              The campus marketplace
              <br />
              <span className="bg-[#A7F3D0] border-2 border-black px-2 inline-block mt-2">
                made for VITians.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#4B5563] max-w-xl leading-relaxed">
              Sell your old textbooks. Find lab equipment. Pass on hostel
              essentials. Buy & sell with people you actually share a campus
              with — pay offline, face to face.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/marketplace"
                data-testid="hero-browse-button"
                className="bg-black text-white border-2 border-black rounded-md px-6 py-3 font-bold uppercase tracking-wider hover:bg-gray-800 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(167,243,208,1)]"
              >
                Browse Marketplace <ArrowRight className="w-4 h-4" strokeWidth={3} />
              </Link>
              {!user && (
                <Link
                  to="/register"
                  data-testid="hero-signup-button"
                  className="bg-white text-black border-2 border-black rounded-md px-6 py-3 font-bold uppercase tracking-wider hover:bg-[#FEF08A]"
                >
                  Join with VIT email
                </Link>
              )}
              {user && (
                <Link
                  to="/create"
                  data-testid="hero-sell-button"
                  className="bg-white text-black border-2 border-black rounded-md px-6 py-3 font-bold uppercase tracking-wider hover:bg-[#FEF08A]"
                >
                  Post a Listing
                </Link>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" strokeWidth={3}/> @vitstudent.ac.in only</div>
              <div className="flex items-center gap-2"><HandshakeIcon className="w-4 h-4" strokeWidth={3}/> Offline payment, face-to-face</div>
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" strokeWidth={3}/> Free to use</div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1758270705641-acf09b68a91f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBoYW5naW5nJTIwb3V0JTIwY2FtcHVzfGVufDB8fHx8MTc3OTM5MTc0NXww&ixlib=rb-4.1.0&q=85"
                alt="VIT students"
                className="w-full aspect-[4/5] object-cover border-b-2 border-black"
              />
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] font-bold text-[#4B5563]">Active right now</p>
                  <p className="text-2xl font-black">1000+ students</p>
                </div>
                <div className="bg-[#A7F3D0] border-2 border-black rounded-full w-12 h-12 flex items-center justify-center font-black">VIT</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Shop by category</h2>
          <Link to="/marketplace" className="text-sm uppercase tracking-[0.1em] font-semibold underline underline-offset-4">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryStyles.map((c) => (
            <Link
              key={c.name}
              to={`/marketplace?category=${encodeURIComponent(c.name)}`}
              data-testid={`category-${c.name.toLowerCase()}`}
              className="border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform overflow-hidden bg-white"
            >
              <div
                className="aspect-square flex items-center justify-center border-b-2 border-black"
                style={{ background: c.bg }}
              >
                {c.img ? (
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover"/>
                ) : (
                  <span className="text-4xl font-black">{c.emoji}</span>
                )}
              </div>
              <div className="p-3 font-bold uppercase tracking-wider text-sm text-center">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] font-bold text-[#4B5563] mb-1">Fresh on the marketplace</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Latest Listings</h2>
          </div>
          <Link to="/marketplace" className="text-sm uppercase tracking-[0.1em] font-semibold underline underline-offset-4">See all</Link>
        </div>
        {featured.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-lg p-10 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[#4B5563]">No listings yet. Be the first to post!</p>
            {user && (
              <Link to="/create" className="mt-4 inline-block bg-black text-white border-2 border-black rounded-md px-6 py-2 font-bold uppercase tracking-wider">Post a Listing</Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(featured) &&
  featured.map((l) => (
              <ListingCard key={l.id} listing={l} onToggleSave={user ? toggleSave : undefined} />
            ))}
          </div>
        )}
      </section>

      {/* TRUST BAND */}
      <section className="bg-[#0A0A0A] text-white border-y-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { t: "VIT email verified", d: "Only students with a valid @vitstudent.ac.in email can join. Every account passes OTP verification." },
            { t: "No online payments", d: "Prices are listed for reference. You always meet face-to-face on campus and pay offline — no fraud, no chargebacks." },
            { t: "Moderated by admins", d: "Suspicious listings can be reported. Admins review and remove anything that doesn't belong." },
          ].map((b) => (
            <div key={b.t} className="border-2 border-white rounded-lg p-6 bg-[#111]">
              <p className="text-xs uppercase tracking-[0.15em] font-bold text-[#A7F3D0]">{b.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-300">{b.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
