"use client";

import type { OfficeAgent } from "@/lib/officeData";
import { thaiTasks } from "@/lib/chibiData";
import CharacterRenderer from "@/components/characters/CharacterRenderer";
import type { CharacterPose } from "@/components/characters/types";
import StatusBadge from "./StatusBadge";

const accentByZone: Record<string, { text: string; bar: string; soft: string }> = {
  "z-marketing": { text: "text-[#F9A8D4]", bar: "from-[#E96FA0] to-[#F9A8D4]", soft: "bg-[#E96FA0]/12" },
  "z-content":   { text: "text-[#7DD3FC]", bar: "from-[#4FB8C8] to-[#7DD3FC]", soft: "bg-[#4FB8C8]/12" },
  "z-design":    { text: "text-[#C8A8F0]", bar: "from-[#9B6FE0] to-[#C8A8F0]", soft: "bg-[#9B6FE0]/12" },
  "z-ads":       { text: "text-[#FCD34D]", bar: "from-[#E0A94E] to-[#FCD34D]", soft: "bg-[#E0A94E]/12" },
  "z-support":   { text: "text-[#FFB088]", bar: "from-[#E0866E] to-[#FFB088]", soft: "bg-[#E0866E]/12" },
  "z-ops":       { text: "text-[#93C5FD]", bar: "from-[#5B82D8] to-[#93C5FD]", soft: "bg-[#5B82D8]/12" },
};

const poseForStatus: Record<string, CharacterPose> = {
  working: "typing",
  reviewing: "thinking",
  publishing: "celebrating",
  waiting: "talking",
  idle: "sleeping",
};

interface AgentPanelProps {
  agent: OfficeAgent;
  onClose: () => void;
}

export default function AgentPanel({ agent, onClose }: AgentPanelProps) {
  const a = accentByZone[agent.zoneId] ?? accentByZone["z-ops"];
  const task = thaiTasks[agent.id] ?? agent.task;

  return (
    <div className="dglass rounded-[28px] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-[#A88CE8]/15">
        <span className="text-[10px] font-bold text-[#A99FC8] uppercase tracking-widest">รายละเอียดน้อง AI</span>
        <button onClick={onClose}
          className="w-6 h-6 rounded-full flex items-center justify-center text-[#A99FC8] hover:text-[#F4EEFF] hover:bg-white/10 transition-colors text-sm">
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center gap-2 pt-1">
          <div className={`rounded-2xl ${a.soft} px-6 pt-3`}>
            <svg viewBox="0 0 90 130" width="78" height="112" xmlns="http://www.w3.org/2000/svg">
              <CharacterRenderer
                agentId={agent.id}
                pose={poseForStatus[agent.status] ?? "talking"}
                cx={45}
                headCy={40}
                scale={0.62}
                idleClass="char-bob"
              />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-[#F4EEFF] text-sm">{agent.name}</h3>
            <p className="text-xs text-[#A99FC8]">{agent.role}</p>
          </div>
          <StatusBadge status={agent.status} size="md" />
        </div>

        <div className="rounded-2xl p-3 bg-[#1c1638]/50 border border-[#A88CE8]/12">
          <div className="text-[10px] font-bold text-[#A99FC8] uppercase tracking-wider mb-1.5">งานปัจจุบัน</div>
          <p className="text-xs text-[#E6DEFA] leading-relaxed">{task}</p>
          {agent.progress > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-[#A99FC8] mb-1">
                <span>ความคืบหน้า</span>
                <span className="font-bold text-[#F4EEFF]">{agent.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#16122e] overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${a.bar} transition-all duration-500`} style={{ width: `${agent.progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="dglass-soft rounded-2xl p-3 text-center">
            <div className="text-lg font-bold text-[#F4EEFF]">{agent.completedTasks.toLocaleString("en-US")}</div>
            <div className="text-[10px] text-[#A99FC8] mt-0.5">งานที่เสร็จ</div>
          </div>
          <div className="dglass-soft rounded-2xl p-3 text-center">
            <div className="text-xs font-bold text-[#F4EEFF]">{agent.lastActivity}</div>
            <div className="text-[10px] text-[#A99FC8] mt-0.5">ใช้งานล่าสุด</div>
          </div>
        </div>

        <div className={`flex items-center justify-center gap-1.5 text-[10px] ${a.text} pt-1`}>
          <span>📍</span>
          <span>{agent.zoneId.replace("z-", "").toUpperCase()} ZONE</span>
        </div>
      </div>
    </div>
  );
}
