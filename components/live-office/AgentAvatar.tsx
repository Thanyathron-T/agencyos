"use client";

import type { OfficeAgent } from "@/lib/officeData";
import StatusBadge from "./StatusBadge";

const zoneAccent: Record<string, { border: string; bg: string; ring: string; grad: string }> = {
  violet: {
    border: "border-violet-600/35",
    bg: "bg-violet-600/10",
    ring: "ring-violet-600",
    grad: "from-violet-700 to-violet-500",
  },
  cyan: {
    border: "border-cyan-500/35",
    bg: "bg-cyan-500/10",
    ring: "ring-cyan-500",
    grad: "from-cyan-700 to-cyan-500",
  },
  pink: {
    border: "border-pink-500/35",
    bg: "bg-pink-500/10",
    ring: "ring-pink-500",
    grad: "from-pink-700 to-pink-500",
  },
  amber: {
    border: "border-amber-500/35",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500",
    grad: "from-amber-600 to-amber-400",
  },
  emerald: {
    border: "border-emerald-500/35",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500",
    grad: "from-emerald-700 to-emerald-500",
  },
  blue: {
    border: "border-blue-500/35",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500",
    grad: "from-blue-700 to-blue-500",
  },
};

const idleDot = "bg-slate-500";
const activeDots: Record<string, string> = {
  working: "bg-violet-400",
  reviewing: "bg-amber-400",
  publishing: "bg-emerald-400",
  waiting: "bg-slate-400",
  idle: idleDot,
};

interface AgentAvatarProps {
  agent: OfficeAgent;
  zoneColorKey: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function AgentAvatar({ agent, zoneColorKey, isSelected, onSelect }: AgentAvatarProps) {
  const accent = zoneAccent[zoneColorKey] ?? zoneAccent.violet;
  const dot = activeDots[agent.status] ?? idleDot;
  const isActive = agent.status !== "idle";

  return (
    <div className="group relative">
      <button
        onClick={() => onSelect(agent.id)}
        className={`w-full rounded-xl p-2.5 flex flex-col items-center gap-1.5 transition-all duration-150 border ${accent.bg} ${
          isSelected
            ? `${accent.border} ring-1 ${accent.ring} scale-105`
            : `${accent.border} hover:scale-102 hover:brightness-110`
        }`}
      >
        {/* Avatar circle */}
        <div className="relative">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${accent.grad}`}
          >
            {agent.avatar}
          </div>
          {/* Status dot */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface ${dot} ${
              isActive ? "shadow-[0_0_5px_currentColor]" : ""
            }`}
          />
        </div>
        <div className="text-center w-full">
          <div className="text-[10px] font-semibold text-ink truncate">{agent.name}</div>
          <div className="text-[9px] text-ink-muted truncate">{agent.role.split(" ")[0]}</div>
        </div>
      </button>

      {/* Hover tooltip (CSS-only, pointer-events-none) */}
      {!isSelected && (
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div className="bg-surface-2 border border-edge rounded-xl p-3 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${accent.grad}`}
              >
                {agent.avatar}
              </div>
              <div>
                <div className="text-xs font-semibold text-ink">{agent.name}</div>
                <div className="text-[10px] text-ink-muted">{agent.role}</div>
              </div>
              <StatusBadge status={agent.status} />
            </div>
            <p className="text-[10px] text-ink-muted leading-relaxed line-clamp-2 mb-2">{agent.task}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-ink-muted">
                <span>Progress</span>
                <span>{agent.progress}%</span>
              </div>
              <div className="h-1 rounded-full bg-edge overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all"
                  style={{ width: `${agent.progress}%` }}
                />
              </div>
            </div>
          </div>
          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-surface-2 border-b border-r border-edge rotate-45 -mt-1" />
          </div>
        </div>
      )}
    </div>
  );
}
