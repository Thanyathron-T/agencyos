import Header from "@/components/Header";
import KPICards from "@/components/KPICards";
import AgentStatus from "@/components/AgentStatus";
import RecentOutput from "@/components/RecentOutput";
import { projects } from "@/lib/mockData";

function ActivityFeed() {
  const events = [
    { time: "2m ago", text: "CopyBot Pro completed TechNova hero section draft", icon: "✍️" },
    { time: "14m ago", text: "DataPulse published Week 22 performance report", icon: "📊" },
    { time: "31m ago", text: "FinFlow SEO Blog sent for client review", icon: "🔍" },
    { time: "1h ago", text: "MindfulMeals Ads approved and live on Google", icon: "🚀" },
    { time: "2h ago", text: "TrendWatch detected 3 new trending topics", icon: "📈" },
  ];
  return (
    <div className="space-y-1">
      {events.map((e, i) => (
        <div key={i} className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors">
          <span className="text-base mt-0.5 flex-shrink-0">{e.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>{e.text}</p>
          </div>
          <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }}>{e.time}</span>
        </div>
      ))}
    </div>
  );
}

function TopProjects() {
  return (
    <div className="space-y-3">
      {projects.slice(0, 4).map((p) => (
        <div key={p.id} className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium truncate" style={{ color: "var(--text)" }}>{p.name}</span>
              <span className="text-xs ml-2 flex-shrink-0" style={{ color: "var(--text-muted)" }}>{p.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${p.progress}%`,
                  background: p.progress >= 80
                    ? "linear-gradient(90deg,#10b981,#34d399)"
                    : p.progress >= 50
                      ? "linear-gradient(90deg,#7c3aed,#a78bfa)"
                      : "linear-gradient(90deg,#0891b2,#22d3ee)",
                }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const activeAgents = 7;
  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`${activeAgents} AI agents online · All systems operational`}
        action={
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        }
      />

      <KPICards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Agent Status */}
        <div className="xl:col-span-2 rounded-2xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Agent Status</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#10b981" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Live</span>
            </div>
          </div>
          <AgentStatus limit={5} />
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>Activity Feed</h2>
          <ActivityFeed />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Output */}
        <div className="rounded-2xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Recent Output</h2>
            <a href="/content-pipeline" className="text-xs hover:opacity-80 transition-opacity"
              style={{ color: "#a78bfa" }}>View all →</a>
          </div>
          <RecentOutput />
        </div>

        {/* Project Progress */}
        <div className="rounded-2xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Project Progress</h2>
            <a href="/projects" className="text-xs hover:opacity-80 transition-opacity"
              style={{ color: "#a78bfa" }}>All projects →</a>
          </div>
          <TopProjects />
        </div>
      </div>
    </div>
  );
}
