import { officeActivityFeed } from "@/lib/officeData";

const actionColors: Record<string, string> = {
  violet: "text-violet-400",
  cyan: "text-cyan-400",
  pink: "text-pink-400",
  amber: "text-amber-400",
  emerald: "text-emerald-400",
  blue: "text-blue-400",
};

const dotColors: Record<string, string> = {
  violet: "bg-violet-400",
  cyan: "bg-cyan-400",
  pink: "bg-pink-400",
  amber: "bg-amber-400",
  emerald: "bg-emerald-400",
  blue: "bg-blue-400",
};

export default function ActivityFeed() {
  return (
    <div className="rounded-2xl bg-surface border border-edge overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-edge">
        <span className="text-xs font-semibold text-ink-muted uppercase tracking-widest">Activity Feed</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      {/* Events */}
      <div className="divide-y divide-edge">
        {officeActivityFeed.map((event) => {
          const nameColor = actionColors[event.colorKey] ?? "text-ink";
          const dot = dotColors[event.colorKey] ?? "bg-slate-400";
          return (
            <div key={event.id} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-2 transition-colors">
              <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="w-px flex-1 bg-edge" />
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-xs leading-relaxed text-ink-muted">
                  <span className={`font-semibold ${nameColor}`}>{event.agentName}</span>
                  {" "}{event.action}{" "}
                  <span className="text-ink">{event.detail}</span>
                </p>
                <span className="text-[10px] text-ink-muted mt-1 block">{event.timeAgo}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
