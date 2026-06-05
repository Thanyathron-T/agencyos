import type { OfficeZone } from "@/lib/officeData";

const zoneStyles: Record<string, { topBar: string; headerText: string; countBadge: string; border: string }> = {
  violet: {
    topBar: "bg-violet-600",
    headerText: "text-violet-400",
    countBadge: "bg-violet-600/20 text-violet-400 border-violet-600/30",
    border: "border-violet-600/20",
  },
  cyan: {
    topBar: "bg-cyan-500",
    headerText: "text-cyan-400",
    countBadge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    border: "border-cyan-500/20",
  },
  pink: {
    topBar: "bg-pink-500",
    headerText: "text-pink-400",
    countBadge: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    border: "border-pink-500/20",
  },
  amber: {
    topBar: "bg-amber-500",
    headerText: "text-amber-400",
    countBadge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    border: "border-amber-500/20",
  },
  emerald: {
    topBar: "bg-emerald-500",
    headerText: "text-emerald-400",
    countBadge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    border: "border-emerald-500/20",
  },
  blue: {
    topBar: "bg-blue-500",
    headerText: "text-blue-400",
    countBadge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    border: "border-blue-500/20",
  },
};

interface OfficeRoomProps {
  zone: OfficeZone;
  activeCount: number;
  totalCount: number;
  children: React.ReactNode;
}

export default function OfficeRoom({ zone, activeCount, totalCount, children }: OfficeRoomProps) {
  const s = zoneStyles[zone.colorKey] ?? zoneStyles.violet;

  return (
    <div className={`rounded-xl overflow-hidden border ${s.border} bg-surface flex flex-col`}>
      {/* Top colour bar */}
      <div className={`h-0.5 w-full ${s.topBar}`} />

      {/* Zone header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-edge">
        <div>
          <h3 className={`text-xs font-semibold ${s.headerText}`}>{zone.name}</h3>
          <p className="text-[10px] text-ink-muted mt-0.5">{zone.description}</p>
        </div>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${s.countBadge}`}>
          {activeCount}/{totalCount}
        </span>
      </div>

      {/* Dot-grid floor */}
      <div className="p-3 bg-dots flex-1">
        <div className="grid grid-cols-2 gap-2">{children}</div>
      </div>
    </div>
  );
}
