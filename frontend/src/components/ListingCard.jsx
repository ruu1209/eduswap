import React from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";

const conditionColors = {
  New: "#A7F3D0",
  "Like New": "#DDD6FE",
  Good: "#FEF08A",
  Used: "#FFDDBF",
  "For Parts": "#E5E5E5",
};

const ListingCard = ({ listing, onToggleSave, saved }) => {
  const img =
    (listing.images && listing.images[0]) ||
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80";
  return (
    <div
      data-testid={`listing-card-${listing.id}`}
      className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform overflow-hidden flex flex-col"
    >
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="aspect-[4/3] bg-[#F9F9F6] border-b-2 border-black overflow-hidden">
          <img src={img} alt={listing.title} className="w-full h-full object-cover" />
        </div>
      </Link>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] uppercase tracking-[0.1em] font-bold border-2 border-black rounded px-2 py-0.5"
            style={{ background: conditionColors[listing.condition] || "#FEF08A" }}
          >
            {listing.condition}
          </span>
          <span className="text-[10px] uppercase tracking-[0.1em] font-bold border-2 border-black rounded px-2 py-0.5 bg-white">
            {listing.category}
          </span>
        </div>
        <Link to={`/listing/${listing.id}`}>
          <h3 className="font-bold text-lg leading-tight line-clamp-2 hover:underline">
            {listing.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 text-xs text-[#4B5563]">
          <MapPin className="w-3 h-3" strokeWidth={3} /> {listing.campus_location}
        </div>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="text-2xl font-black">₹{listing.price}</div>
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(listing.id)}
              data-testid={`save-toggle-${listing.id}`}
              className={`p-2 border-2 border-black rounded-md ${
                saved ? "bg-[#FFDDBF]" : "bg-white hover:bg-[#FEF08A]"
              }`}
              title={saved ? "Unsave" : "Save"}
            >
              <Heart
                className="w-4 h-4"
                strokeWidth={3}
                fill={saved ? "#000" : "none"}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
