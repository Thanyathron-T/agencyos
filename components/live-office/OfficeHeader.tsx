import { companyHealth } from "@/lib/officeData";

const kpis = [
  {
    label: "น้อง AI ออนไลน์",
    value: `${companyHealth.agentsOnline}/${companyHealth.agentsTotal}`,
    sub: "agents กำลังทำงาน",
    emoji: "🤖",
    bg: "bg-violet-100/80",
    text: "text-violet-600",
    border: "border-violet-200/50",
  },
  {
    label: "โปรเจกต์ที่ดำเนินการ",
    value: companyHealth.activeProjects.toString(),
    sub: "projects active",
    emoji: "📁",
    bg: "bg-sky-100/80",
    text: "text-sky-600",
    border: "border-sky-200/50",
  },
  {
    label: "ผลงานวันนี้",
    value: companyHealth.outputsToday.toString(),
    sub: "content items",
    emoji: "✨",
    bg: "bg-emerald-100/80",
    text: "text-emerald-600",
    border: "border-emerald-200/50",
  },
  {
    label: "รายได้ต่อเดือน",
    value: companyHealth.mrr,
    sub: companyHealth.mrrChange + " this month",
    emoji: "💰",
    bg: "bg-amber-100/80",
    text: "text-amber-600",
    border: "border-amber-200/50",
  },
];

export default function OfficeHeader() {
  return (
    <div className="mb-6">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-chibi-ink flex items-center gap-2">
            🏠 Live Office
            <span className="text-lg">— น้อง AI Agency</span>
          </h1>
          <p className="text-sm text-chibi-muted mt-0.5">
            ศูนย์ควบคุม AI Marketing · อัปเดต Real-time
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border-0 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-600 font-semibold">
            {companyHealth.agentsOnline} น้อง Online
          </span>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className={`rounded-2xl p-4 ${k.bg} border ${k.border} backdrop-blur-sm flex items-center gap-3 shadow-sm`}
          >
            <div className="text-2xl">{k.emoji}</div>
            <div>
              <div className={`text-xl font-bold leading-none ${k.text}`}>{k.value}</div>
              <div className="text-[10px] text-chibi-ink font-medium mt-0.5">{k.label}</div>
              <div className="text-[9px] text-chibi-muted">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
