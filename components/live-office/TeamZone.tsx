"use client";

import type { OfficeZone, OfficeAgent } from "@/lib/officeData";
import OfficeRoom from "./OfficeRoom";
import AgentAvatar from "./AgentAvatar";

interface TeamZoneProps {
  zone: OfficeZone;
  agents: OfficeAgent[];
  selectedAgentId: string | null;
  bubbles: Record<string, string>;
  onAgentSelect: (id: string) => void;
}

export default function TeamZone({
  zone, agents, selectedAgentId, bubbles, onAgentSelect,
}: TeamZoneProps) {
  const activeCount = agents.filter((a) => a.status !== "idle").length;

  return (
    <OfficeRoom zone={zone} activeCount={activeCount} totalCount={agents.length}>
      {agents.map((agent, i) => (
        <AgentAvatar
          key={agent.id}
          agent={agent}
          index={i}
          isSelected={selectedAgentId === agent.id}
          bubble={bubbles[agent.id] ?? null}
          onSelect={onAgentSelect}
        />
      ))}
    </OfficeRoom>
  );
}
