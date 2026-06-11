import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { LogOut, User, Plus, Search, ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/marketplace?q=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  const isActive = (p) => location.pathname === p;

  return (
    <nav
      data-testid="navbar"
      className="sticky top-0 z-50 bg-white border-b-2 border-black"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          to="/"
          data-testid="logo-link"
          className="flex items-center gap-2 font-black text-2xl tracking-tight"
        >
          <span className="bg-[#A7F3D0] border-2 border-black rounded-md px-2 py-0.5">
            Edu
          </span>
          <span>Swap</span>
        </Link>

        <form
          onSubmit={onSearch}
          className="hidden md:flex flex-1 max-w-xl"
          data-testid="navbar-search-form"
        >
          <div className="flex w-full">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search notes, books, gadgets..."
              data-testid="navbar-search-input"
              className="flex-1 bg-white border-2 border-black rounded-l-md px-4 py-2 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] transition-shadow"
            />
            <button
              type="submit"
              data-testid="navbar-search-button"
              className="bg-black text-white border-2 border-l-0 border-black rounded-r-md px-4 font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center"
            >
              <Search className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </form>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/marketplace"
            data-testid="nav-marketplace"
            className={`px-3 py-2 font-bold uppercase tracking-wider text-sm ${
              isActive("/marketplace") ? "underline underline-offset-4 decoration-2" : ""
            }`}
          >
            Browse
          </Link>
          {user ? (
            <>
              <Link
                to="/create"
                data-testid="nav-create"
                className="bg-[#FEF08A] text-black border-2 border-black rounded-md px-4 py-2 font-bold uppercase tracking-wider hover:translate-y-[-1px] transition-transform flex items-center gap-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <Plus className="w-4 h-4" strokeWidth={3} /> Sell
              </Link>
              <Link
                to="/dashboard"
                data-testid="nav-dashboard"
                className="px-3 py-2 font-bold uppercase tracking-wider text-sm flex items-center gap-1"
              >
                <User className="w-4 h-4" strokeWidth={3} /> Dashboard
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  data-testid="nav-admin"
                  className="px-3 py-2 font-bold uppercase tracking-wider text-sm flex items-center gap-1 text-[#2563EB]"
                >
                  <ShieldCheck className="w-4 h-4" strokeWidth={3} /> Admin
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                data-testid="nav-logout"
                className="p-2 border-2 border-black rounded-md bg-white hover:bg-[#FFDDBF]"
                title="Logout"
              >
                <LogOut className="w-4 h-4" strokeWidth={3} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                data-testid="nav-login"
                className="bg-white text-black border-2 border-black rounded-md px-4 py-2 font-bold uppercase tracking-wider hover:bg-[#FEF08A] transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                data-testid="nav-register"
                className="bg-black text-white border-2 border-black rounded-md px-4 py-2 font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 border-2 border-black rounded-md"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-testid="mobile-menu-toggle"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t-2 border-black bg-white px-4 py-4 space-y-3" data-testid="mobile-menu">
          <form onSubmit={onSearch} className="flex">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="flex-1 border-2 border-black rounded-l-md px-3 py-2"
            />
            <button className="bg-black text-white border-2 border-l-0 border-black rounded-r-md px-3">
              <Search className="w-4 h-4" />
            </button>
          </form>
          <Link to="/marketplace" onClick={() => setMobileOpen(false)} className="block font-bold uppercase tracking-wider text-sm">Browse</Link>
          {user ? (
            <>
              <Link to="/create" onClick={() => setMobileOpen(false)} className="block font-bold uppercase tracking-wider text-sm">+ Sell Item</Link>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block font-bold uppercase tracking-wider text-sm">Dashboard</Link>
              {user.role === "admin" && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="block font-bold uppercase tracking-wider text-sm text-[#2563EB]">Admin</Link>
              )}
              <button onClick={() => { logout(); navigate("/"); setMobileOpen(false); }} className="font-bold uppercase tracking-wider text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block font-bold uppercase tracking-wider text-sm">Log in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block font-bold uppercase tracking-wider text-sm">Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
