"use client";

import { useState, useEffect, useRef } from "react";
import { officeAgents } from "@/lib/officeData";
import { thaiConversations } from "@/lib/chibiData";
import MiniKPI from "./MiniKPI";
import OfficeScene from "./OfficeScene";
import FloatingChat from "./FloatingChat";
import TodaysMission from "./TodaysMission";
import TeamMood from "./TeamMood";
import PetAssistant from "./PetAssistant";

export default function LiveOffice() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Record<string, string>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Real-time Thai speech bubbles */
  useEffect(() => {
    const activeAgents = officeAgents.filter((a) => a.status !== "idle");

    function schedule() {
      const delay = 2800 + Math.random() * 4800;
      timerRef.current = setTimeout(() => {
        const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        const pool  = thaiConversations[agent.zoneId] ?? [];
        const msg   = pool[Math.floor(Math.random() * pool.length)];
        if (msg) {
          setBubbles((prev) => ({ ...prev, [agent.id]: msg }));
          setTimeout(() => {
            setBubbles((prev) => {
              const next = { ...prev };
              delete next[agent.id];
              return next;
            });
          }, 3200);
        }
        schedule();
      }, delay);
    }

    schedule();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const selectedAgent = selectedAgentId
    ? (officeAgents.find((a) => a.id === selectedAgentId) ?? null)
    : null;

  function handleSelect(id: string) {
    setSelectedAgentId((prev) => (prev === id ? null : id));
  }

  return (
    <div>
      {/* ── Top KPI strip ── */}
      <MiniKPI />

      {/* ── Main content ── */}
      <div className="flex gap-4 items-start">

        {/* ── Office scene (6 rooms) ── */}
        <div className="flex-1 min-w-0">
          <OfficeScene
            bubbles={bubbles}
            selectedAgentId={selectedAgentId}
            onAgentSelect={handleSelect}
          />

          {/* ── Hint ── */}
          <p className="mt-2 text-center text-[10px] text-chibi-muted">
            คลิกตัวละครเพื่อดูรายละเอียด · น้องจะพูดเองโดยอัตโนมัติ 💬
          </p>

          {/* ── Bottom widgets ── */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <TodaysMission />
            <TeamMood />
            <PetAssistant />
          </div>
        </div>

        {/* ── Floating chat / agent panel ── */}
        <div className="w-72 flex-shrink-0 sticky top-4">
          <FloatingChat
            selectedAgent={selectedAgent}
            onClose={() => setSelectedAgentId(null)}
          />
        </div>
      </div>
    </div>
  );
}
