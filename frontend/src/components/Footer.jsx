import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer data-testid="footer" className="border-t-2 border-black bg-white mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <div className="font-black text-2xl">
          <span className="bg-[#A7F3D0] border-2 border-black rounded-md px-2 py-0.5">Edu</span>
          <span>Swap</span>
        </div>
        <p className="text-sm text-[#4B5563] mt-3 leading-relaxed">
          A verified VIT-only peer-to-peer marketplace. Buy & sell notes, books, gadgets, and more — safely, on campus.
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.15em] font-bold mb-3">Platform</p>
        <ul className="space-y-2 text-sm">
          <li><Link to="/marketplace" className="hover:underline">Browse Marketplace</Link></li>
          <li><Link to="/about" className="hover:underline">About EduSwap</Link></li>
          <li><Link to="/rules" className="hover:underline">Rules & Terms</Link></li>
        </ul>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.15em] font-bold mb-3">Stay safe</p>
        <ul className="space-y-2 text-sm text-[#4B5563]">
          <li>Meet only on campus, in well-lit places.</li>
          <li>No online payments — always pay cash/UPI in person.</li>
          <li>Report suspicious listings to admin.</li>
        </ul>
      </div>
    </div>
    <div className="border-t-2 border-black py-4 text-center text-xs uppercase tracking-[0.15em] font-semibold">
      © 2026 EduSwap · Built for VIT Students
    </div>
  </footer>
);

export default Footer;
