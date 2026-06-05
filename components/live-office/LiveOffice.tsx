"use client";

import { useState, useEffect, useRef } from "react";
import { officeZones, officeAgents } from "@/lib/officeData";
import { thaiConversations } from "@/lib/chibiData";
import OfficeHeader from "./OfficeHeader";
import TeamZone from "./TeamZone";
import AgentPanel from "./AgentPanel";
import ActivityFeed from "./ActivityFeed";
import TodaysMission from "./TodaysMission";
import TeamMood from "./TeamMood";
import PetAssistant from "./PetAssistant";

export default function LiveOffice() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Record<string, string>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Real-time speech bubbles: pick random agent every 3-8 s */
  useEffect(() => {
    const activeAgents = officeAgents.filter((a) => a.status !== "idle");

    function schedule() {
      const delay = 3000 + Math.random() * 5000;
      timerRef.current = setTimeout(() => {
        const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        const pool  = thaiConversations[agent.zoneId] ?? [];
        const msg   = pool[Math.floor(Math.random() * pool.length)];
        if (msg) {
          setBubbles((prev) => ({ ...prev, [agent.id]: msg }));
          // Clear after 3.5 s
          setTimeout(() => {
            setBubbles((prev) => {
              const next = { ...prev };
              delete next[agent.id];
              return next;
            });
          }, 3500);
        }
        schedule();
      }, delay);
    }

    schedule();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const selectedAgent = selectedAgentId
    ? officeAgents.find((a) => a.id === selectedAgentId) ?? null
    : null;

  function handleSelect(id: string) {
    setSelectedAgentId((prev) => (prev === id ? null : id));
  }

  return (
    <div>
      <OfficeHeader />

      <div className="flex gap-5 items-start">
        {/* ── Office grid ── */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-3 gap-3">
            {officeZones.map((zone) => (
              <TeamZone
                key={zone.id}
                zone={zone}
                agents={officeAgents.filter((a) => a.zoneId === zone.id)}
                selectedAgentId={selectedAgentId}
                bubbles={bubbles}
                onAgentSelect={handleSelect}
              />
            ))}
          </div>

          {/* Status legend */}
          <div className="mt-3 flex flex-wrap items-center gap-4 px-1">
            {[
              { emoji: "🟢", label: "กำลังทำงาน" },
              { emoji: "🟡", label: "กำลังรีวิว" },
              { emoji: "🟣", label: "รออนุมัติ"  },
              { emoji: "🔵", label: "กำลังเผยแพร่" },
              { emoji: "⚪", label: "พัก"        },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1">
                <span className="text-xs">{s.emoji}</span>
                <span className="text-[10px] text-chibi-muted">{s.label}</span>
              </div>
            ))}
            <span className="ml-auto text-[10px] text-chibi-muted">
              คลิก Avatar เพื่อดูรายละเอียด · Hover เพื่อ Preview
            </span>
          </div>

          {/* ── Bottom widgets ── */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <TodaysMission />
            <TeamMood />
            <PetAssistant />
          </div>
        </div>

        {/* ── Side panel (288 px) ── */}
        <div className="w-72 flex-shrink-0 sticky top-4">
          {selectedAgent ? (
            <AgentPanel
              agent={selectedAgent}
              onClose={() => setSelectedAgentId(null)}
            />
          ) : (
            <ActivityFeed />
          )}
        </div>
      </div>
    </div>
  );
}
