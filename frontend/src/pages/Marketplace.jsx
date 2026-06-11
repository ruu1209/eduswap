import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import ListingCard from "../components/ListingCard";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";
import { Filter } from "lucide-react";

const Marketplace = () => {
  const { user, refresh } = useAuth();
  const [params, setParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ categories: [], conditions: [] });

  const q = params.get("q") || "";
  const category = params.get("category") || "All";
  const sort = params.get("sort") || "newest";
  const minPrice = params.get("min") || "";
  const maxPrice = params.get("max") || "";

  useEffect(() => {
    api.get("/categories").then((r) => setMeta(r.data));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const qs = new URLSearchParams();
      if (q) qs.set("q", q);
      if (category && category !== "All") qs.set("category", category);
      if (sort) qs.set("sort", sort);
      if (minPrice) qs.set("min_price", minPrice);
      if (maxPrice) qs.set("max_price", maxPrice);
      try {
        const res = await api.get(`/listings?${qs.toString()}`);
        setListings(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [q, category, sort, minPrice, maxPrice]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next);
  };

  const toggleSave = async (id) => {
    if (!user) return toast.error("Please log in to save items");
    try {
      await api.post(`/listings/${id}/save`);
      await refresh();
    } catch {
      toast.error("Failed");
    }
  };

  const savedSet = new Set(user?.saved_listings || []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="marketplace-page">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] font-bold text-[#4B5563]">EduSwap Marketplace</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Browse Listings</h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm">
          <Filter className="w-4 h-4" strokeWidth={3}/> Filters
        </div>
        <select
          value={category}
          onChange={(e) => setParam("category", e.target.value === "All" ? "" : e.target.value)}
          data-testid="filter-category"
          className="border-2 border-black rounded-md px-3 py-2 font-semibold bg-white"
        >
          <option value="All">All Categories</option>
          {meta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="number"
          placeholder="Min ₹"
          value={minPrice}
          onChange={(e) => setParam("min", e.target.value)}
          data-testid="filter-min-price"
          className="border-2 border-black rounded-md px-3 py-2 w-24 font-semibold"
        />
        <input
          type="number"
          placeholder="Max ₹"
          value={maxPrice}
          onChange={(e) => setParam("max", e.target.value)}
          data-testid="filter-max-price"
          className="border-2 border-black rounded-md px-3 py-2 w-24 font-semibold"
        />
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          data-testid="filter-sort"
          className="border-2 border-black rounded-md px-3 py-2 font-semibold bg-white ml-auto"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {q && (
        <p className="mb-4 text-sm">
          Showing results for <span className="font-bold">"{q}"</span>
          <button onClick={() => setParam("q", "")} className="ml-2 underline">clear</button>
        </p>
      )}

      {loading ? (
        <div className="py-20 text-center font-bold uppercase tracking-wider">Loading…</div>
      ) : listings.length === 0 ? (
        <div className="bg-white border-2 border-black rounded-lg p-10 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" data-testid="no-results">
          <p className="font-bold text-lg mb-2">No listings match your filters.</p>
          <p className="text-[#4B5563]">Try a different category or clear filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="listings-grid">
          {listings.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              onToggleSave={user ? toggleSave : undefined}
              saved={savedSet.has(l.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
