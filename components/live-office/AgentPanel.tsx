"use client";

import type { OfficeAgent } from "@/lib/officeData";
import StatusBadge from "./StatusBadge";

const gradients: Record<string, string> = {
  violet: "from-violet-700 to-violet-500",
  cyan: "from-cyan-700 to-cyan-500",
  pink: "from-pink-700 to-pink-500",
  amber: "from-amber-600 to-amber-400",
  emerald: "from-emerald-700 to-emerald-500",
  blue: "from-blue-700 to-blue-500",
};

const progressColors: Record<string, string> = {
  violet: "from-violet-600 to-violet-400",
  cyan: "from-cyan-600 to-cyan-400",
  pink: "from-pink-600 to-pink-400",
  amber: "from-amber-600 to-amber-400",
  emerald: "from-emerald-600 to-emerald-400",
  blue: "from-blue-600 to-blue-400",
};

interface AgentPanelProps {
  agent: OfficeAgent;
  onClose: () => void;
}

export default function AgentPanel({ agent, onClose }: AgentPanelProps) {
  const grad = gradients[agent.colorKey] ?? gradients.violet;
  const prog = progressColors[agent.colorKey] ?? progressColors.violet;

  return (
    <div className="rounded-2xl bg-surface border border-edge overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-edge">
        <span className="text-xs font-semibold text-ink-muted uppercase tracking-widest">Agent Details</span>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Agent identity */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${grad} flex-shrink-0`}
          >
            {agent.avatar}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-ink text-sm">{agent.name}</h3>
            <p className="text-xs text-ink-muted">{agent.role}</p>
          </div>
        </div>

        <StatusBadge status={agent.status} size="md" />

        {/* Current task */}
        <div className="rounded-xl bg-surface-2 border border-edge p-3">
          <div className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-1.5">Current Task</div>
          <p className="text-xs text-ink leading-relaxed">{agent.task}</p>
          {agent.progress > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-ink-muted mb-1">
                <span>Progress</span>
                <span className="font-semibold text-ink">{agent.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-edge overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${prog} transition-all duration-500`}
                  style={{ width: `${agent.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-surface-2 border border-edge p-3">
            <div className="text-[10px] text-ink-muted mb-1">Tasks Done</div>
            <div className="text-lg font-bold text-ink">{agent.completedTasks.toLocaleString("en-US")}</div>
          </div>
          <div className="rounded-lg bg-surface-2 border border-edge p-3">
            <div className="text-[10px] text-ink-muted mb-1">Last Active</div>
            <div className="text-xs font-semibold text-ink">{agent.lastActivity}</div>
          </div>
        </div>

        {/* Zone tag */}
        <div className="flex items-center gap-2 text-xs text-ink-muted pt-1 border-t border-edge">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>Zone ID: {agent.zoneId.replace("z-", "")}</span>
        </div>
      </div>
    </div>
  );
}
