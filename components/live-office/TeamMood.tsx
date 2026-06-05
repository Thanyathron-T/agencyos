import { teamMoods } from "@/lib/chibiData";

const totalAgents = 17;
const happyCount  = teamMoods.find((m) => m.label === "แฮปปี้")?.count ?? 0;
const happyPct    = Math.round((happyCount / totalAgents) * 100);

export default function TeamMood() {
  return (
    <div className="glass rounded-3xl p-4 shadow-md shadow-chibi-primary/10">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🌈</span>
        <div>
          <h3 className="text-xs font-bold text-chibi-ink">อารมณ์ทีม</h3>
          <p className="text-[10px] text-chibi-muted">Team Mood Today</p>
        </div>
      </div>

      {/* Mood headline */}
      <div className="text-center mb-3">
        <p className="text-sm font-bold text-chibi-ink">น้อง AI มีอารมณ์ดีวันนี้! 😊</p>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <div className="h-2 rounded-full bg-pink-100 flex-1 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-chibi-pink to-chibi-primary"
              style={{ width: `${happyPct}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-chibi-primary">{happyPct}%</span>
        </div>
      </div>

      {/* Mood breakdown */}
      <div className="grid grid-cols-2 gap-1.5">
        {teamMoods.map((mood) => (
          <div
            key={mood.label}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${mood.color}`}
          >
            <span className="text-base">{mood.emoji}</span>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-chibi-ink truncate">{mood.label}</div>
              <div className="text-[9px] text-chibi-muted">{mood.count} น้อง</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
