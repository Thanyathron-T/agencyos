"use client";

import { officeZones, officeAgents } from "@/lib/officeData";
import RoomScene from "./RoomScene";

interface OfficeSceneProps {
  bubbles: Record<string, string>;
  selectedAgentId: string | null;
  onAgentSelect: (id: string) => void;
}

export default function OfficeScene({ bubbles, selectedAgentId, onAgentSelect }: OfficeSceneProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {officeZones.map((zone) => {
        const agents = officeAgents.filter((a) => a.zoneId === zone.id);
        return (
          <RoomScene
            key={zone.id}
            zoneId={zone.id}
            zoneName={zone.name}
            agents={agents}
            bubbles={bubbles}
            selectedAgentId={selectedAgentId}
            onAgentSelect={onAgentSelect}
          />
        );
      })}
    </div>
  );
}
