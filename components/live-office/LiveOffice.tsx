"use client";

import { useState, useEffect, useRef } from "react";
import { officeAgents } from "@/lib/officeData";
import { thaiConversations } from "@/lib/chibiData";
import { buildPlacements } from "./IsometricOffice";
import MiniKPI from "./MiniKPI";
import IsometricOffice from "./IsometricOffice";
import FloatingChat from "./FloatingChat";
import AgentRoster from "./AgentRoster";
import StatusPanel from "./StatusPanel";
import QuickActions from "./QuickActions";

const VISIBLE_IDS = buildPlacements().map((p) => p.agentId);

export default function LiveOffice() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Record<string, string>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const visible = officeAgents.filter((a) => VISIBLE_IDS.includes(a.id));
    function loop() {
      timer.current = setTimeout(() => {
        const agent = visible[Math.floor(Math.random() * visible.length)];
        const msgs = thaiConversations[agent.zoneId] ?? [];
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        if (msg) {
          setBubbles((p) => ({ ...p, [agent.id]: msg }));
          setTimeout(() => setBubbles((p) => { const n = { ...p }; delete n[agent.id]; return n; }), 3600);
        }
        loop();
      }, 3000 + Math.random() * 5000);
    }
    loop();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  const selectedAgent = selectedAgentId ? officeAgents.find((a) => a.id === selectedAgentId) ?? null : null;
  const select = (id: string) => setSelectedAgentId((p) => (p === id ? null : id));

  return (
    <div>
      <MiniKPI />

      <div className="flex gap-3 items-start">
        {/* scene + bottom bar */}
        <div className="flex-1 min-w-0">
          <div className="rounded-[28px] overflow-hidden dglass p-1.5">
            <IsometricOffice bubbles={bubbles} selectedAgentId={selectedAgentId} onAgentSelect={select} />
          </div>

          {/* bottom bar: roster | status | quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 mt-3">
            <AgentRoster selectedAgentId={selectedAgentId} onSelect={select} />
            <div className="w-full md:w-48"><StatusPanel /></div>
            <div className="w-full md:w-56"><QuickActions /></div>
          </div>
        </div>

        {/* right live chat */}
        <div className="w-72 flex-shrink-0 sticky top-4">
          <FloatingChat selectedAgent={selectedAgent} onClose={() => setSelectedAgentId(null)} />
        </div>
      </div>
    </div>
  );
}
