import { agents } from "@/lib/mockData";

const statusConfig: Record<string, { label: string; bgClass: string; textClass: string; dotColor: string }> = {
  active: {
    label: "Active",
    bgClass: "bg-emerald-500/15",
    textClass: "text-emerald-400",
    dotColor: "#10b981",
  },
  idle: {
    label: "Idle",
    bgClass: "bg-slate-500/10",
    textClass: "text-slate-400",
    dotColor: "#94a3b8",
  },
  processing: {
    label: "Processing",
    bgClass: "bg-amber-500/15",
    textClass: "text-amber-400",
    dotColor: "#f59e0b",
  },
};

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

interface AgentStatusProps {
  limit?: number;
}

export default function AgentStatus({ limit }: AgentStatusProps) {
  const displayed = limit ? agents.slice(0, limit) : agents;

  return (
    <div className="space-y-2">
      {displayed.map((agent) => {
        const st = statusConfig[agent.status] ?? statusConfig.idle;
        const grad = avatarGradients[agent.color] ?? "from-slate-700 to-slate-400";
        return (
          <div
            key={agent.id}
            className="flex items-center gap-3 p-3 rounded-xl cursor-default bg-surface-2 border border-edge"
          >
            <div className="relative flex-shrink-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${grad}`}
              >
                {agent.avatar}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-2"
                style={{ background: st.dotColor, boxShadow: `0 0 6px ${st.dotColor}` }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold truncate text-ink">{agent.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md flex-shrink-0 ${st.bgClass} ${st.textClass}`}>
                  {st.label}
                </span>
              </div>
              <p className="text-xs truncate text-ink-muted">{agent.task}</p>
            </div>

            <div className="text-right flex-shrink-0 hidden sm:block">
              <div className="text-sm font-semibold text-ink">
                {agent.completedTasks.toLocaleString("en-US")}
              </div>
              <div className="text-xs text-ink-muted">tasks</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
