import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { toast } from "sonner";
import { ShieldCheck, Trash2, Ban, CheckCircle2 } from "lucide-react";

const Admin = () => {
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  const load = async () => {
    const [s, u, r] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/users"),
      api.get("/admin/reports"),
    ]);
    setStats(s.data);
    setUsers(u.data);
    setReports(r.data);
  };

  useEffect(() => { load(); }, []);

  const toggleBan = async (u) => {
    await api.patch(`/admin/users/${u.id}`, { is_banned: !u.is_banned });
    toast.success(u.is_banned ? "Unbanned" : "Banned");
    load();
  };

  const resolveReport = async (id, action) => {
    await api.patch(`/admin/reports/${id}?action=${action}`);
    toast.success(action);
    load();
  };

  const deleteListing = async (listing_id) => {
    if (!window.confirm("Delete this listing?")) return;
    await api.delete(`/admin/listings/${listing_id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#2563EB] text-white border-2 border-black rounded-md p-2"><ShieldCheck className="w-5 h-5" strokeWidth={3}/></div>
        <div>
          <p className="text-xs uppercase tracking-[0.15em] font-bold text-[#4B5563]">EduSwap Admin</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Moderation Dashboard</h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b-2 border-black">
        {[["stats", "Overview"], ["users", `Users (${users.length})`], ["reports", `Reports (${reports.filter((r) => r.status === "pending").length})`]].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            data-testid={`admin-tab-${k}`}
            className={`px-4 py-2 font-bold uppercase tracking-wider text-sm -mb-0.5 border-b-4 ${tab === k ? "border-black" : "border-transparent"}`}
          >{l}</button>
        ))}
      </div>

      {tab === "stats" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="bg-white border-2 border-black rounded-lg p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs uppercase tracking-[0.15em] font-bold text-[#4B5563]">{k.replace(/_/g, " ")}</p>
              <p className="text-4xl font-black mt-1">{v}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9F9F6] border-b-2 border-black">
              <tr className="text-left">
                <th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Verified</th><th className="p-3">Banned</th><th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[#E5E5E5]">
                  <td className="p-3 font-semibold">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.is_verified ? "✓" : "—"}</td>
                  <td className="p-3">{u.is_banned ? "Yes" : "—"}</td>
                  <td className="p-3">
                    {u.role !== "admin" && (
                      <button onClick={() => toggleBan(u)} data-testid={`ban-${u.id}`} className="bg-white border-2 border-black rounded-md px-3 py-1 text-xs uppercase font-bold flex items-center gap-1">
                        <Ban className="w-3 h-3" strokeWidth={3}/> {u.is_banned ? "Unban" : "Ban"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-3">
          {reports.length === 0 && <p className="text-[#4B5563]">No reports yet.</p>}
          {reports.map((r) => (
            <div key={r.id} className="bg-white border-2 border-black rounded-lg p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-bold">{r.listing_title} <span className="text-xs uppercase ml-2 bg-[#FEF08A] border border-black px-2 rounded">{r.reason}</span></p>
                  <p className="text-sm text-[#4B5563] mt-1">Reported by: {r.reporter_email}</p>
                  {r.details && <p className="text-sm mt-1">{r.details}</p>}
                  <p className="text-xs text-[#4B5563] mt-2">Status: <b>{r.status}</b></p>
                </div>
                <div className="flex gap-2">
                  {r.status === "pending" && (
                    <>
                      <button onClick={() => resolveReport(r.id, "resolved")} data-testid={`resolve-${r.id}`} className="bg-[#A7F3D0] border-2 border-black rounded-md px-3 py-1 text-xs uppercase font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" strokeWidth={3}/> Resolve
                      </button>
                      <button onClick={() => resolveReport(r.id, "dismissed")} className="bg-white border-2 border-black rounded-md px-3 py-1 text-xs uppercase font-bold">Dismiss</button>
                    </>
                  )}
                  <button onClick={() => deleteListing(r.listing_id)} data-testid={`delete-listing-${r.listing_id}`} className="bg-[#EF4444] text-white border-2 border-black rounded-md px-3 py-1 text-xs uppercase font-bold flex items-center gap-1">
                    <Trash2 className="w-3 h-3" strokeWidth={3}/> Delete Listing
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
