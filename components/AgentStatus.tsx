import { agents } from "@/lib/mockData";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "rgba(16,185,129,0.15)", dot: "#10b981" },
  idle: { label: "Idle", color: "rgba(148,163,184,0.12)", dot: "#94a3b8" },
  processing: { label: "Processing", color: "rgba(245,158,11,0.15)", dot: "#f59e0b" },
};

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

interface AgentStatusProps {
  limit?: number;
}

export default function AgentStatus({ limit }: AgentStatusProps) {
  const displayed = limit ? agents.slice(0, limit) : agents;

  return (
    <div className="space-y-2">
      {displayed.map((agent) => {
        const st = statusConfig[agent.status];
        return (
          <div key={agent.id}
            className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-default"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                style={{ background: avatarColors[agent.color] }}>
                {agent.avatar}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                style={{
                  background: st.dot,
                  borderColor: "var(--surface-2)",
                  boxShadow: `0 0 6px ${st.dot}`,
                }} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                  {agent.name}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-md flex-shrink-0"
                  style={{ background: st.color, color: st.dot }}>
                  {st.label}
                </span>
              </div>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                {agent.task}
              </p>
            </div>

            {/* Tasks count */}
            <div className="text-right flex-shrink-0 hidden sm:block">
              <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                {agent.completedTasks.toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>tasks</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
