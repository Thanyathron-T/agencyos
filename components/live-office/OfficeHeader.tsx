import { companyHealth } from "@/lib/officeData";

const kpis = [
  {
    label: "Agents Online",
    value: `${companyHealth.agentsOnline}/${companyHealth.agentsTotal}`,
    sub: "team members",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1" />
      </svg>
    ),
    iconBg: "bg-violet-600/10",
    iconColor: "text-violet-400",
    valueColor: "text-violet-400",
  },
  {
    label: "Active Projects",
    value: companyHealth.activeProjects.toString(),
    sub: "in progress",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    ),
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    valueColor: "text-cyan-400",
  },
  {
    label: "Outputs Today",
    value: companyHealth.outputsToday.toString(),
    sub: "content items",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    valueColor: "text-emerald-400",
  },
  {
    label: "MRR",
    value: companyHealth.mrr,
    sub: companyHealth.mrrChange + " this month",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    valueColor: "text-amber-400",
  },
];

export default function OfficeHeader() {
  return (
    <div className="mb-6">
      {/* Title row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Live Office</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            AI Marketing Command Centre — real-time agent activity
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">
            {companyHealth.agentsOnline} agents online
          </span>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl p-4 bg-surface border border-edge flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${k.iconBg} ${k.iconColor}`}>
              {k.icon}
            </div>
            <div>
              <div className={`text-xl font-bold leading-none ${k.valueColor}`}>{k.value}</div>
              <div className="text-[10px] text-ink-muted mt-0.5">{k.label}</div>
              <div className="text-[9px] text-ink-muted">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
