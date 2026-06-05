import { officeAgents } from "@/lib/officeData";

export default function StatusPanel() {
  const focus = officeAgents.filter((a) => a.status === "working" || a.status === "publishing").length;
  const meeting = officeAgents.filter((a) => a.status === "reviewing").length;
  const breakN = officeAgents.filter((a) => a.status === "waiting").length;
  const offline = officeAgents.filter((a) => a.status === "idle").length;

  const rows = [
    { icon: "🎯", label: "Focus Time", value: `${focus} คน`, color: "#6EE7B7" },
    { icon: "💬", label: "In Meeting", value: `${meeting} คน`, color: "#FCD34D" },
    { icon: "☕", label: "On Break", value: `${breakN} คน`, color: "#C8A8F0" },
    { icon: "🌙", label: "Offline", value: `${offline} คน`, color: "#7A6F9C" },
  ];

  return (
    <div className="dglass rounded-2xl p-3">
      <h3 className="text-[10px] font-bold text-[#A99FC8] uppercase tracking-widest mb-2.5">Status</h3>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
              style={{ background: `${r.color}1f`, boxShadow: `0 0 8px ${r.color}33` }}>{r.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-[#E6DEFA] leading-tight">{r.label}</div>
              <div className="text-[9px] text-[#8A7DB0]">{r.value}</div>
            </div>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
          </div>
        ))}
      </div>
    </div>
  );
}
