"use client";

import { useState } from "react";
import { officeZones, officeAgents } from "@/lib/officeData";
import OfficeHeader from "./OfficeHeader";
import TeamZone from "./TeamZone";
import AgentPanel from "./AgentPanel";
import ActivityFeed from "./ActivityFeed";

export default function LiveOffice() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const selectedAgent = selectedAgentId
    ? officeAgents.find((a) => a.id === selectedAgentId) ?? null
    : null;

  function handleAgentSelect(id: string) {
    setSelectedAgentId((prev) => (prev === id ? null : id));
  }

  return (
    <div>
      <OfficeHeader />

      <div className="flex gap-5">
        {/* Office floor grid */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-3 gap-4">
            {officeZones.map((zone) => {
              const agents = officeAgents.filter((a) => a.zoneId === zone.id);
              return (
                <TeamZone
                  key={zone.id}
                  zone={zone}
                  agents={agents}
                  selectedAgentId={selectedAgentId}
                  onAgentSelect={handleAgentSelect}
                />
              );
            })}
          </div>

          {/* Floor legend */}
          <div className="mt-4 flex items-center gap-5 px-1">
            {[
              { label: "Working", dot: "bg-violet-400" },
              { label: "Reviewing", dot: "bg-amber-400" },
              { label: "Publishing", dot: "bg-emerald-400" },
              { label: "Waiting", dot: "bg-slate-400" },
              { label: "Idle", dot: "bg-slate-600" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className="text-[10px] text-ink-muted">{s.label}</span>
              </div>
            ))}
            <span className="ml-auto text-[10px] text-ink-muted">
              Click an agent to inspect · Hover to preview
            </span>
          </div>
        </div>

        {/* Side panel — 288px fixed */}
        <div className="w-72 flex-shrink-0">
          {selectedAgent ? (
            <AgentPanel agent={selectedAgent} onClose={() => setSelectedAgentId(null)} />
          ) : (
            <ActivityFeed />
          )}
        </div>
      </div>
    </div>
  );
}
