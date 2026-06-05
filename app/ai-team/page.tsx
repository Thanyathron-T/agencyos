import Header from "@/components/Header";
import AgentStatus from "@/components/AgentStatus";
import { agents } from "@/lib/mockData";

const avatarColors: Record<string, string> = {
  violet: "linear-gradient(135deg,#7c3aed,#a78bfa)",
  cyan: "linear-gradient(135deg,#0891b2,#22d3ee)",
  emerald: "linear-gradient(135deg,#059669,#34d399)",
  amber: "linear-gradient(135deg,#d97706,#fbbf24)",
  pink: "linear-gradient(135deg,#db2777,#f472b6)",
  blue: "linear-gradient(135deg,#2563eb,#60a5fa)",
  orange: "linear-gradient(135deg,#ea580c,#fb923c)",
  rose: "linear-gradient(135deg,#e11d48,#fb7185)",
};

const statusDot: Record<string, string> = {
  active: "#10b981",
  idle: "#94a3b8",
  processing: "#f59e0b",
};

export default function AITeamPage() {
  const online = agents.filter((a) => a.status !== "idle").length;

  return (
    <div>
      <Header
        title="AI Team"
        subtitle={`${online} agents active · ${agents.length} total agents deployed`}
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active", value: agents.filter((a) => a.status === "active").length, color: "#10b981" },
          { label: "Processing", value: agents.filter((a) => a.status === "processing").length, color: "#f59e0b" },
          { label: "Idle", value: agents.filter((a) => a.status === "idle").length, color: "#94a3b8" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <span className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
            <div>
              <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>{s.value}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {agents.map((agent) => (
          <div key={agent.id}
            className="rounded-2xl p-5 group cursor-pointer hover:border-violet-500/30 transition-colors"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: avatarColors[agent.color] }}>
                  {agent.avatar}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
                  style={{
                    background: statusDot[agent.status],
                    borderColor: "var(--surface)",
                    boxShadow: `0 0 8px ${statusDot[agent.status]}`,
                  }} />
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>{agent.name}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{agent.role}</div>
              </div>
            </div>

            <div className="rounded-lg p-3 mb-4"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="text-xs mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Current Task</div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>{agent.task}</p>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "var(--text-muted)" }}>
                <span className="font-semibold" style={{ color: "var(--text)" }}>
                  {agent.completedTasks.toLocaleString()}
                </span> tasks completed
              </span>
              <span className="px-2 py-0.5 rounded-md"
                style={{
                  background: agent.status === "active" ? "rgba(16,185,129,0.12)"
                    : agent.status === "processing" ? "rgba(245,158,11,0.12)"
                      : "rgba(148,163,184,0.1)",
                  color: statusDot[agent.status],
                }}>
                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Status List */}
      <div className="rounded-2xl p-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Live Task Feed</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#10b981" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Real-time</span>
          </div>
        </div>
        <AgentStatus />
      </div>
    </div>
  );
}
