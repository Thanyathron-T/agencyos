import Header from "@/components/Header";
import AgentStatus from "@/components/AgentStatus";
import { agents } from "@/lib/mockData";

const avatarGradients: Record<string, string> = {
  violet: "from-violet-700 to-violet-400",
  cyan: "from-cyan-700 to-cyan-400",
  emerald: "from-emerald-700 to-emerald-400",
  amber: "from-amber-700 to-amber-400",
  pink: "from-pink-700 to-pink-400",
  blue: "from-blue-700 to-blue-400",
  orange: "from-orange-700 to-orange-400",
  rose: "from-rose-700 to-rose-400",
};

const statusDotColors: Record<string, string> = {
  active: "#10b981",
  idle: "#94a3b8",
  processing: "#f59e0b",
};

const statusBadge: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-emerald-500/12", text: "text-emerald-400" },
  idle: { bg: "bg-slate-500/10", text: "text-slate-400" },
  processing: { bg: "bg-amber-500/12", text: "text-amber-400" },
};

export default function AITeamPage() {
  const online = agents.filter((a) => a.status !== "idle").length;

  return (
    <div>
      <Header
        title="AI Team"
        subtitle={`${online} agents active · ${agents.length} total agents deployed`}
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active", value: agents.filter((a) => a.status === "active").length, dotClass: "bg-emerald-400", shadow: "#10b981" },
          { label: "Processing", value: agents.filter((a) => a.status === "processing").length, dotClass: "bg-amber-400", shadow: "#f59e0b" },
          { label: "Idle", value: agents.filter((a) => a.status === "idle").length, dotClass: "bg-slate-500", shadow: "#94a3b8" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 flex items-center gap-3 bg-surface border border-edge">
            <span
              className={`w-3 h-3 rounded-full flex-shrink-0 ${s.dotClass}`}
              style={{ boxShadow: `0 0 8px ${s.shadow}` }}
            />
            <div>
              <div className="text-2xl font-bold text-ink">{s.value}</div>
              <div className="text-xs text-ink-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {agents.map((agent) => {
          const grad = avatarGradients[agent.color] ?? "from-slate-700 to-slate-400";
          const dot = statusDotColors[agent.status] ?? "#94a3b8";
          const badge = statusBadge[agent.status] ?? statusBadge.idle;
          return (
            <div
              key={agent.id}
              className="rounded-2xl p-5 cursor-pointer bg-surface border border-edge hover:border-violet-600/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${grad}`}>
                    {agent.avatar}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface"
                    style={{ background: dot, boxShadow: `0 0 8px ${dot}` }}
                  />
                </div>
                <div>
                  <div className="font-semibold text-sm text-ink">{agent.name}</div>
                  <div className="text-xs text-ink-muted">{agent.role}</div>
                </div>
              </div>

              <div className="rounded-lg p-3 mb-4 bg-surface-2 border border-edge">
                <div className="text-xs mb-1 font-medium text-ink-muted">Current Task</div>
                <p className="text-xs leading-relaxed text-ink">{agent.task}</p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-muted">
                  <span className="font-semibold text-ink">{agent.completedTasks.toLocaleString("en-US")}</span>{" "}
                  tasks completed
                </span>
                <span className={`px-2 py-0.5 rounded-md ${badge.bg} ${badge.text}`}>
                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl p-5 bg-surface border border-edge">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink">Live Task Feed</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-ink-muted">Real-time</span>
          </div>
        </div>
        <AgentStatus />
      </div>
    </div>
  );
}
