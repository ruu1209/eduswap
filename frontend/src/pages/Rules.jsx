import React from "react";

const rules = [
  ["VIT email only", "Only accounts registered with @vitstudent.ac.in are allowed. Any other email is rejected during registration."],
  ["No online payments", "EduSwap never handles money. Prices listed on the platform are reference only. All payments happen offline, in person."],
  ["Meet on campus", "Always meet buyers/sellers on the VIT campus, in public, well-lit locations. Never share your hostel room location with strangers."],
  ["Honesty in listings", "Describe the item condition truthfully. Misleading listings will be removed and accounts may be banned."],
  ["No prohibited items", "Do not list alcohol, drugs, weapons, exam papers, copyrighted material or anything that violates institute policy or law."],
  ["Respect privacy", "Don't share another student's personal information without their consent."],
  ["Report misuse", "If you see a suspicious listing or user, hit the Report button. Admins will investigate."],
  ["Use your own account", "Accounts are non-transferable. One person, one account."],
];

const Rules = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="rules-page">
    <p className="text-xs uppercase tracking-[0.15em] font-bold text-[#4B5563]">Community Rules & Terms</p>
    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">Keep EduSwap safe.</h1>
    <p className="text-lg text-[#4B5563] mt-2 max-w-2xl">
      By using EduSwap you agree to these basic rules. They exist so the platform stays trusted
      and useful for everyone on campus.
    </p>

    <div className="mt-8 bg-[#FFDDBF] border-2 border-black rounded-lg p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <p className="font-bold">⚠ Important: EduSwap is offline-payments-only.</p>
      <p className="text-sm mt-1">We are not a payment processor. All transactions are between you and the other student, in person. EduSwap is not responsible for losses from transactions.</p>
    </div>

    <ol className="mt-8 space-y-4">
      {rules.map(([t, d], i) => (
        <li key={t} className="bg-white border-2 border-black rounded-lg p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-4">
          <div className="bg-[#A7F3D0] border-2 border-black rounded-md w-9 h-9 flex items-center justify-center font-black flex-shrink-0">{i + 1}</div>
          <div>
            <p className="font-bold text-lg">{t}</p>
            <p className="text-sm text-[#4B5563] mt-1 leading-relaxed">{d}</p>
          </div>
        </li>
      ))}
    </ol>
  </div>
);

export default Rules;
