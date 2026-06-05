"use client";

import type { OfficeAgent } from "@/lib/officeData";
import ChibiSVG from "./ChibiSVG";
import StatusBadge from "./StatusBadge";

/* Per-zone chibi colour scheme */
const zonePalette: Record<string, { hair: string; skin: string; ring: string }> = {
  "z-marketing": { hair: "#FFB7D5", skin: "#FFF0F5", ring: "ring-pink-300"    },
  "z-content":   { hair: "#8ED7FF", skin: "#F0F8FF", ring: "ring-sky-300"     },
  "z-design":    { hair: "#B794F4", skin: "#F5F0FF", ring: "ring-violet-300"  },
  "z-ads":       { hair: "#FFE29A", skin: "#FFFBF0", ring: "ring-amber-300"   },
  "z-support":   { hair: "#FFCBA4", skin: "#FFF5F0", ring: "ring-orange-200"  },
  "z-ops":       { hair: "#A7C4F0", skin: "#F0F5FF", ring: "ring-blue-300"    },
};

const floatClasses = [
  "chibi-float", "chibi-float-alt", "chibi-float",
  "chibi-float-alt", "chibi-float", "chibi-float-alt",
];

interface AgentAvatarProps {
  agent: OfficeAgent;
  index: number;
  isSelected: boolean;
  bubble: string | null;
  onSelect: (id: string) => void;
}

export default function AgentAvatar({ agent, index, isSelected, bubble, onSelect }: AgentAvatarProps) {
  const palette  = zonePalette[agent.zoneId] ?? { hair: "#C4B5FD", skin: "#F5F0FF", ring: "ring-violet-200" };
  const isTyping = agent.status === "working" || agent.status === "publishing";
  const floatCls = floatClasses[index % floatClasses.length];
  const floatDelay: React.CSSProperties = { animationDelay: `${(index % 5) * 0.55}s` };

  return (
    <div className="group relative flex flex-col items-center">
      {/* Speech bubble */}
      {bubble && (
        <div className="bubble-in absolute -top-12 left-1/2 -translate-x-1/2 z-30 w-36 pointer-events-none">
          <div className="glass rounded-2xl rounded-bl-sm px-2.5 py-1.5 text-[10px] text-chibi-ink font-medium leading-snug text-center shadow-md">
            {bubble}
          </div>
          <div className="mx-auto w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/60 translate-x-0" />
        </div>
      )}

      {/* Clickable chibi */}
      <button
        onClick={() => onSelect(agent.id)}
        className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-200 w-full ${
          isSelected
            ? "bg-white/80 shadow-lg shadow-chibi-primary/20 ring-2 ring-offset-1 ring-offset-transparent " + palette.ring
            : "hover:bg-white/60 hover:shadow-md hover:shadow-chibi-primary/10"
        }`}
      >
        {/* Chibi face */}
        <ChibiSVG
          hairColor={palette.hair}
          skinColor={palette.skin}
          isTyping={isTyping}
          status={agent.status}
          floatClass={floatCls}
          delayStyle={floatDelay}
        />

        {/* Name */}
        <span className="text-[10px] font-bold text-chibi-ink leading-tight text-center max-w-[72px] truncate">
          {agent.name}
        </span>
        <span className="text-[9px] text-chibi-muted truncate max-w-[72px] text-center">
          {agent.role.split(" ")[0]}
        </span>
      </button>

      {/* Hover detail card (CSS-only) */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-40 w-52 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="glass rounded-2xl p-3 shadow-xl shadow-chibi-primary/15">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${palette.hair}, ${palette.hair}bb)` }}
            >
              {agent.avatar}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-chibi-ink truncate">{agent.name}</div>
              <div className="text-[9px] text-chibi-muted">{agent.role}</div>
            </div>
            <StatusBadge status={agent.status} />
          </div>
          <p className="text-[10px] text-chibi-ink/80 leading-relaxed line-clamp-2 mb-2">
            {agent.task}
          </p>
          {agent.progress > 0 && (
            <>
              <div className="flex justify-between text-[9px] text-chibi-muted mb-1">
                <span>Progress</span>
                <span className="font-semibold text-chibi-ink">{agent.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-violet-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-chibi-primary to-chibi-pink"
                  style={{ width: `${agent.progress}%` }}
                />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-center -mt-px">
          <div className="w-2.5 h-2.5 bg-white/60 rotate-45 border-b border-r border-chibi-primary/20" />
        </div>
      </div>
    </div>
  );
}
