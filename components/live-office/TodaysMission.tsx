import { todaysMissions } from "@/lib/chibiData";

export default function TodaysMission() {
  const done  = todaysMissions.filter((m) => m.done).length;
  const total = todaysMissions.length;
  const pct   = Math.round((done / total) * 100);

  return (
    <div className="glass rounded-3xl p-4 shadow-md shadow-chibi-primary/10">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🎯</span>
        <div>
          <h3 className="text-xs font-bold text-chibi-ink">ภารกิจวันนี้</h3>
          <p className="text-[10px] text-chibi-muted">Today&apos;s Mission</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm font-bold text-chibi-primary">{done}/{total}</div>
          <div className="text-[9px] text-chibi-muted">เสร็จแล้ว</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-violet-100 mb-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-chibi-primary to-chibi-pink transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Mission list */}
      <div className="space-y-2">
        {todaysMissions.map((m, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-sm flex-shrink-0 mt-0.5">
              {m.done ? "✅" : m.emoji}
            </span>
            <span
              className={`text-[11px] leading-snug ${
                m.done ? "line-through text-chibi-muted" : "text-chibi-ink"
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
