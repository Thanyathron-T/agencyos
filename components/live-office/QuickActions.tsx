const actions = [
  { icon: "➕", label: "New Task", style: "bg-[#9B6FE0]/25 text-[#D4BCF6] border-[#9B6FE0]/40" },
  { icon: "📅", label: "Start Meeting", style: "bg-[#5B82D8]/25 text-[#A6C2F6] border-[#5B82D8]/40" },
  { icon: "🎯", label: "Focus Mode", style: "bg-[#4FB8C8]/20 text-[#9DE2EC] border-[#4FB8C8]/35" },
  { icon: "☕", label: "Break Time", style: "bg-[#E0866E]/25 text-[#FFC0A0] border-[#E0866E]/40" },
];

export default function QuickActions() {
  return (
    <div className="dglass rounded-2xl p-3">
      <h3 className="text-[10px] font-bold text-[#A99FC8] uppercase tracking-widest mb-2.5">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <button key={a.label}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-[11px] font-semibold transition-transform hover:-translate-y-0.5 ${a.style}`}>
            <span>{a.icon}</span>
            <span className="truncate">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
