"use client";

import type { OfficeAgent } from "@/lib/officeData";
import { thaiTasks } from "@/lib/chibiData";
import ChibiSVG from "./ChibiSVG";
import StatusBadge from "./StatusBadge";

const zonePalette: Record<string, { hair: string; skin: string; accent: string; bg: string }> = {
  "z-marketing": { hair: "#FFB7D5", skin: "#FFF0F5", accent: "text-pink-500",   bg: "bg-pink-50"   },
  "z-content":   { hair: "#8ED7FF", skin: "#F0F8FF", accent: "text-sky-500",    bg: "bg-sky-50"    },
  "z-design":    { hair: "#B794F4", skin: "#F5F0FF", accent: "text-violet-500", bg: "bg-violet-50" },
  "z-ads":       { hair: "#FFE29A", skin: "#FFFBF0", accent: "text-amber-500",  bg: "bg-amber-50"  },
  "z-support":   { hair: "#FFCBA4", skin: "#FFF5F0", accent: "text-orange-500", bg: "bg-orange-50" },
  "z-ops":       { hair: "#A7C4F0", skin: "#F0F5FF", accent: "text-blue-500",   bg: "bg-blue-50"   },
};

const progressColor: Record<string, string> = {
  "z-marketing": "from-pink-400 to-rose-300",
  "z-content":   "from-sky-400 to-cyan-300",
  "z-design":    "from-violet-400 to-purple-300",
  "z-ads":       "from-amber-400 to-yellow-300",
  "z-support":   "from-orange-400 to-amber-300",
  "z-ops":       "from-blue-400 to-indigo-300",
};

interface AgentPanelProps {
  agent: OfficeAgent;
  onClose: () => void;
}

export default function AgentPanel({ agent, onClose }: AgentPanelProps) {
  const p   = zonePalette[agent.zoneId] ?? zonePalette["z-ops"];
  const pg  = progressColor[agent.zoneId] ?? "from-violet-400 to-purple-300";
  const task = thaiTasks[agent.id] ?? agent.task;

  return (
    <div className="glass rounded-3xl overflow-hidden shadow-xl shadow-chibi-primary/10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/40 border-b border-chibi-primary/10">
        <span className="text-[10px] font-bold text-chibi-muted uppercase tracking-widest">
          รายละเอียด Agent
        </span>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full flex items-center justify-center text-chibi-muted hover:text-chibi-ink hover:bg-white/60 transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Identity */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <ChibiSVG
            hairColor={p.hair}
            skinColor={p.skin}
            status={agent.status}
            isTyping={agent.status === "working"}
            floatClass="chibi-float"
          />
          <div className="text-center">
            <h3 className="font-bold text-chibi-ink text-sm">{agent.name}</h3>
            <p className="text-xs text-chibi-muted">{agent.role}</p>
          </div>
          <StatusBadge status={agent.status} size="md" />
        </div>

        {/* Current task */}
        <div className={`rounded-2xl p-3 ${p.bg} border border-chibi-primary/10`}>
          <div className="text-[10px] font-bold text-chibi-muted uppercase tracking-wider mb-1.5">
            งานปัจจุบัน
          </div>
          <p className="text-xs text-chibi-ink leading-relaxed">{task}</p>
          {agent.progress > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-chibi-muted mb-1">
                <span>ความคืบหน้า</span>
                <span className="font-bold text-chibi-ink">{agent.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/60 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${pg} transition-all duration-500`}
                  style={{ width: `${agent.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="glass-soft rounded-2xl p-3 text-center">
            <div className="text-lg font-bold text-chibi-ink">
              {agent.completedTasks.toLocaleString("en-US")}
            </div>
            <div className="text-[10px] text-chibi-muted mt-0.5">งานที่เสร็จ</div>
          </div>
          <div className="glass-soft rounded-2xl p-3 text-center">
            <div className="text-xs font-bold text-chibi-ink">{agent.lastActivity}</div>
            <div className="text-[10px] text-chibi-muted mt-0.5">ใช้งานล่าสุด</div>
          </div>
        </div>

        {/* Zone tag */}
        <div className={`flex items-center justify-center gap-1.5 text-[10px] ${p.accent} pt-1`}>
          <span>📍</span>
          <span>{agent.zoneId.replace("z-", "").toUpperCase()} ZONE</span>
        </div>
      </div>
    </div>
  );
}
