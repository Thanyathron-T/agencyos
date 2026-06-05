import { companyHealth } from "@/lib/officeData";

const chips = [
  { emoji: "🟢", label: "ออนไลน์", value: `${companyHealth.agentsOnline}`, glow: "#6EE7B7" },
  { emoji: "📁", label: "โปรเจกต์", value: `${companyHealth.activeProjects}`, glow: "#7DD3FC" },
  { emoji: "✨", label: "ผลงานวันนี้", value: `${companyHealth.outputsToday}`, glow: "#C8A8F0" },
  { emoji: "💰", label: "รายได้", value: companyHealth.mrr, glow: "#FCD34D" },
];

export default function MiniKPI() {
  return (
    <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{ background: "linear-gradient(135deg,#3A2E66,#1E1840)", boxShadow: "0 0 16px rgba(180,111,255,0.3)" }}>🏙️</div>
        <div>
          <h1 className="text-lg font-extrabold tracking-wide text-[#F4EEFF] leading-none">LIVE OFFICE</h1>
          <p className="text-[10px] text-[#A99FC8] mt-1 flex items-center gap-1.5">
            Studio Loft · Cozy Mode
            <span className="inline-flex items-center gap-1 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{companyHealth.agentsOnline} Online
            </span>
          </p>
        </div>
      </div>

      {/* KPI chips */}
      <div className="flex gap-2 flex-wrap">
        {chips.map((c) => (
          <div key={c.label} className="dchip rounded-xl px-3 py-1.5 flex items-center gap-2"
            style={{ boxShadow: `0 6px 18px ${c.glow}14` }}>
            <span style={{ filter: `drop-shadow(0 0 5px ${c.glow}aa)` }}>{c.emoji}</span>
            <span className="text-sm font-bold text-[#F4EEFF]">{c.value}</span>
            <span className="text-[10px] text-[#A99FC8]">{c.label}</span>
          </div>
        ))}
      </div>

      {/* Clock / weather */}
      <div className="dchip rounded-xl px-3.5 py-1.5 flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-bold text-[#F4EEFF] leading-none">21:47 <span className="text-[#C8A8F0]">🌙</span></div>
          <div className="text-[10px] text-[#A99FC8] mt-0.5">Mon, 12 May</div>
        </div>
        <div className="w-px h-7 bg-[#A88CE8]/20" />
        <div className="text-xs text-[#A99FC8]">☁️ 26°C</div>
      </div>
    </div>
  );
}
