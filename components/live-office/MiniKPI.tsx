import { companyHealth } from "@/lib/officeData";

const stats = [
  { emoji: "🤖", label: "น้อง AI Online",    value: `${companyHealth.agentsOnline}/${companyHealth.agentsTotal}`, color: "text-violet-500" },
  { emoji: "📁", label: "Projects",          value: companyHealth.activeProjects.toString(),                     color: "text-sky-500"    },
  { emoji: "✨", label: "Outputs วันนี้",    value: companyHealth.outputsToday.toString(),                       color: "text-emerald-500" },
  { emoji: "💰", label: "MRR",               value: companyHealth.mrr,                                           color: "text-amber-500"  },
];

export default function MiniKPI() {
  return (
    <div className="flex items-center gap-2 mb-5 flex-wrap">
      {/* Title */}
      <div className="mr-1">
        <h1 className="text-xl font-bold text-chibi-ink leading-tight">
          🏠 Live Office <span className="text-base font-semibold text-chibi-muted">— น้อง AI Agency</span>
        </h1>
      </div>

      <div className="flex items-center gap-2 ml-auto flex-wrap">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[11px]"
          >
            <span>{s.emoji}</span>
            <span className={`font-bold ${s.color}`}>{s.value}</span>
            <span className="text-chibi-muted hidden sm:inline">{s.label}</span>
          </div>
        ))}

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-600">Real-time</span>
        </div>
      </div>
    </div>
  );
}
