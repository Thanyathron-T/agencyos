"use client";

import type { OfficeZone, OfficeAgent } from "@/lib/officeData";
import OfficeRoom from "./OfficeRoom";
import AgentAvatar from "./AgentAvatar";

interface TeamZoneProps {
  zone: OfficeZone;
  agents: OfficeAgent[];
  selectedAgentId: string | null;
  onAgentSelect: (id: string) => void;
}

export default function TeamZone({ zone, agents, selectedAgentId, onAgentSelect }: TeamZoneProps) {
  const activeCount = agents.filter((a) => a.status !== "idle").length;

  return (
    <OfficeRoom zone={zone} activeCount={activeCount} totalCount={agents.length}>
      {agents.map((agent) => (
        <AgentAvatar
          key={agent.id}
          agent={agent}
          zoneColorKey={zone.colorKey}
          isSelected={selectedAgentId === agent.id}
          onSelect={onAgentSelect}
        />
      ))}
    </OfficeRoom>
  );
}
