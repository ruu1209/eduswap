import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, GraduationCap, Coffee, HandshakeIcon } from "lucide-react";

const About = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="about-page">
    <p className="text-xs uppercase tracking-[0.15em] font-bold text-[#4B5563]">About</p>
    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">A marketplace built only for VITians.</h1>
    <p className="text-lg text-[#4B5563] mt-3 max-w-2xl">
      EduSwap is a peer-to-peer marketplace exclusively for verified VIT students.
      Buy and sell notes, books, gadgets, stationery, food and more — within your campus
      community.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
      {[
        { icon: ShieldCheck, t: "VIT email verified", d: "Every account is verified with a one-time-password sent to a @vitstudent.ac.in email. No outsiders. No bots." },
        { icon: GraduationCap, t: "Student-friendly listings", d: "Categories tailored for student life — class notes, second-hand books, lab kits, hostel essentials, snacks and more." },
        { icon: HandshakeIcon, t: "Offline-only payments", d: "Prices are listed for reference only. You meet face-to-face on campus and pay offline — no online payments, no fraud risk." },
        { icon: Coffee, t: "Built by students, for students", d: "Created as a side-project to make student life easier. Lightweight, fast, and ad-free." },
      ].map((b) => (
        <div key={b.t} className="bg-white border-2 border-black rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-[#A7F3D0] border-2 border-black rounded-md w-10 h-10 flex items-center justify-center mb-3">
            <b.icon className="w-5 h-5" strokeWidth={3}/>
          </div>
          <p className="font-bold text-lg">{b.t}</p>
          <p className="text-sm text-[#4B5563] mt-1 leading-relaxed">{b.d}</p>
        </div>
      ))}
    </div>

    <div className="mt-10 bg-[#FEF08A] border-2 border-black rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <p className="text-xs uppercase tracking-[0.15em] font-bold">How VIT-only access works</p>
      <ol className="mt-3 space-y-2 text-sm list-decimal pl-5">
        <li>Sign up using your <b>@vitstudent.ac.in</b> email. Any other email is rejected on the spot.</li>
        <li>We send a 6-digit one-time-password (OTP) to your VIT inbox.</li>
        <li>After verification, you can browse, post, save listings and contact other students.</li>
        <li>Reports & moderation are handled by EduSwap admins.</li>
      </ol>
      <Link to="/register" className="inline-block mt-4 bg-black text-white border-2 border-black rounded-md px-5 py-2 font-bold uppercase tracking-wider">Get started</Link>
    </div>
  </div>
);

export default About;
