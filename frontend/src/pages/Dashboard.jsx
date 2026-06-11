import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../lib/auth";
import ListingCard from "../components/ListingCard";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, refresh } = useAuth();
  const [tab, setTab] = useState("mine");
  const [mine, setMine] = useState([]);
  const [saved, setSaved] = useState([]);

  const load = async () => {
    const [m, s] = await Promise.all([
      api.get("/listings/mine"),
      api.get("/listings/saved"),
    ]);
    setMine(m.data);
    setSaved(s.data);
  };

  useEffect(() => { load(); }, []);

  const toggleSave = async (id) => {
    await api.post(`/listings/${id}/save`);
    await refresh();
    await load();
    toast.success("Updated");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="dashboard-page">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] font-bold text-[#4B5563]">Welcome back</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{user?.name}</h1>
          <p className="text-sm text-[#4B5563]">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/profile" data-testid="dashboard-profile-link" className="bg-white text-black border-2 border-black rounded-md px-4 py-2 font-bold uppercase tracking-wider hover:bg-[#FEF08A]">Edit Profile</Link>
          <Link to="/create" data-testid="dashboard-new-listing" className="bg-black text-white border-2 border-black rounded-md px-4 py-2 font-bold uppercase tracking-wider hover:bg-gray-800">+ New Listing</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Stat label="My Listings" value={mine.length} bg="#A7F3D0"/>
        <Stat label="Saved Items" value={saved.length} bg="#DDD6FE"/>
        <Stat label="Total Views" value={mine.reduce((a, l) => a + (l.views || 0), 0)} bg="#FEF08A"/>
      </div>

      <div className="flex gap-2 mb-4 border-b-2 border-black">
        {["mine", "saved"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            data-testid={`tab-${t}`}
            className={`px-4 py-2 font-bold uppercase tracking-wider text-sm -mb-0.5 border-b-4 ${tab === t ? "border-black" : "border-transparent"}`}
          >
            {t === "mine" ? `My Listings (${mine.length})` : `Saved (${saved.length})`}
          </button>
        ))}
      </div>

      {tab === "mine" ? (
        mine.length === 0 ? (
          <Empty msg="You haven't listed anything yet." cta="/create" ctaLabel="Post a Listing"/>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mine.map((l) => <ListingCard key={l.id} listing={l}/>)}
          </div>
        )
      ) : saved.length === 0 ? (
        <Empty msg="No saved items yet." cta="/marketplace" ctaLabel="Browse Marketplace"/>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {saved.map((l) => <ListingCard key={l.id} listing={l} onToggleSave={toggleSave} saved/>)}
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value, bg }) => (
  <div className="border-2 border-black rounded-lg p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: bg }}>
    <p className="text-xs uppercase tracking-[0.15em] font-bold">{label}</p>
    <p className="text-4xl font-black mt-1">{value}</p>
  </div>
);

const Empty = ({ msg, cta, ctaLabel }) => (
  <div className="bg-white border-2 border-black rounded-lg p-10 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
    <p className="text-[#4B5563] mb-4">{msg}</p>
    <Link to={cta} className="inline-block bg-black text-white border-2 border-black rounded-md px-6 py-2 font-bold uppercase tracking-wider">{ctaLabel}</Link>
  </div>
);

export default Dashboard;
