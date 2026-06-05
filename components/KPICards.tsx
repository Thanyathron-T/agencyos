import { kpiData } from "@/lib/mockData";

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  violet: {
    bg: "rgba(124,58,237,0.1)",
    border: "rgba(124,58,237,0.3)",
    text: "#a78bfa",
    glow: "rgba(124,58,237,0.15)",
  },
  cyan: {
    bg: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.3)",
    text: "#22d3ee",
    glow: "rgba(6,182,212,0.15)",
  },
  emerald: {
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.3)",
    text: "#34d399",
    glow: "rgba(16,185,129,0.15)",
  },
  pink: {
    bg: "rgba(236,72,153,0.1)",
    border: "rgba(236,72,153,0.3)",
    text: "#f472b6",
    glow: "rgba(236,72,153,0.15)",
  },
};

const icons: Record<string, React.ReactNode> = {
  briefcase: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  sparkles: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  cpu: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H7a2 2 0 00-2 2v2M9 3h6M9 3v2m6-2h2a2 2 0 012 2v2m0 0V5M9 21H7a2 2 0 01-2-2v-2m4 4h6m-6 0v-2m6 2h2a2 2 0 002-2v-2m0 0v2M9 9h6v6H9V9z" />
    </svg>
  ),
  megaphone: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
};

export default function KPICards() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {kpiData.map((kpi) => {
        const c = colorMap[kpi.color];
        return (
          <div key={kpi.label}
            className="rounded-2xl p-5 relative overflow-hidden group transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--surface)", border: `1px solid ${c.border}` }}>
            {/* Glow bg */}
            <div className="absolute inset-0 rounded-2xl opacity-60"
              style={{ background: `radial-gradient(ellipse at top left, ${c.glow}, transparent 60%)` }} />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: c.bg, color: c.text }}>
                  {icons[kpi.icon]}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: kpi.trend === "up" ? "rgba(16,185,129,0.15)" : "rgba(148,163,184,0.15)",
                    color: kpi.trend === "up" ? "#34d399" : "var(--text-muted)",
                  }}>
                  {kpi.change}
                </span>
              </div>
              <div className="text-3xl font-bold tracking-tight mb-1" style={{ color: "var(--text)" }}>
                {kpi.value}
              </div>
              <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                {kpi.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
