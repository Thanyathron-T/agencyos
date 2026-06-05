"use client";

import { officeAgents } from "@/lib/officeData";
import { characterStyles, fallbackStyle } from "@/lib/characterStyles";
import ChibiSprite from "@/components/characters/ChibiSprite";

const statusDot: Record<string, string> = {
  working: "#6EE7B7", reviewing: "#FCD34D", waiting: "#C8A8F0",
  publishing: "#7DD3FC", idle: "#7A6F9C",
};

interface Props {
  selectedAgentId: string | null;
  onSelect: (id: string) => void;
}

export default function AgentRoster({ selectedAgentId, onSelect }: Props) {
  const roster = officeAgents.slice(0, 8);
  return (
    <div className="dglass rounded-2xl p-3">
      <h3 className="text-[10px] font-bold text-[#A99FC8] uppercase tracking-widest mb-2.5">Agents</h3>
      <div className="flex gap-1.5 overflow-x-auto dscroll pb-1">
        {roster.map((a) => {
          const style = characterStyles[a.id] ?? fallbackStyle;
          const sel = selectedAgentId === a.id;
          return (
            <button key={a.id} onClick={() => onSelect(a.id)}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-1.5 py-1.5 transition-colors flex-shrink-0 w-[58px] ${sel ? "bg-white/10 ring-1 ring-[#A88CE8]/50" : "hover:bg-white/5"}`}>
              <div className="relative">
                <svg viewBox="0 0 70 62" width="42" height="38">
                  <ChibiSprite cx={35} headCy={30} scale={0.66} style={style} pose="sitting" idleClass="" />
                </svg>
                <span className="absolute bottom-0 right-1 w-2 h-2 rounded-full border border-[#1A1530]" style={{ background: statusDot[a.status] ?? "#7A6F9C" }} />
              </div>
              <span className="text-[9px] font-semibold text-[#E6DEFA] truncate w-full text-center leading-tight">{a.name.split(" ")[0]}</span>
              <span className="text-[8px] text-[#8A7DB0] truncate w-full text-center leading-tight">{a.role.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
