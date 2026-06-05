import type { OfficeZone } from "@/lib/officeData";

const zoneTheme: Record<string, {
  bg: string; border: string; header: string;
  text: string; badge: string; emoji: string; deco: string;
}> = {
  "z-marketing": {
    bg: "from-pink-50/90 to-rose-50/70",
    border: "border-pink-200/60",
    header: "bg-pink-100/70",
    text: "text-pink-600",
    badge: "bg-pink-200/70 text-pink-700",
    emoji: "💖",
    deco: "🌸 ✨",
  },
  "z-content": {
    bg: "from-sky-50/90 to-cyan-50/70",
    border: "border-sky-200/60",
    header: "bg-sky-100/70",
    text: "text-sky-600",
    badge: "bg-sky-200/70 text-sky-700",
    emoji: "🩵",
    deco: "📝 ☕",
  },
  "z-design": {
    bg: "from-violet-50/90 to-purple-50/70",
    border: "border-violet-200/60",
    header: "bg-violet-100/70",
    text: "text-violet-600",
    badge: "bg-violet-200/70 text-violet-700",
    emoji: "💜",
    deco: "🎨 ✏️",
  },
  "z-ads": {
    bg: "from-amber-50/90 to-yellow-50/70",
    border: "border-amber-200/60",
    header: "bg-amber-100/70",
    text: "text-amber-600",
    badge: "bg-amber-200/70 text-amber-700",
    emoji: "💛",
    deco: "📈 💰",
  },
  "z-support": {
    bg: "from-orange-50/90 to-amber-50/70",
    border: "border-orange-200/60",
    header: "bg-orange-100/70",
    text: "text-orange-500",
    badge: "bg-orange-200/70 text-orange-700",
    emoji: "🧡",
    deco: "🌱 💬",
  },
  "z-ops": {
    bg: "from-blue-50/90 to-indigo-50/70",
    border: "border-blue-200/60",
    header: "bg-blue-100/70",
    text: "text-blue-600",
    badge: "bg-blue-200/70 text-blue-700",
    emoji: "💙",
    deco: "💻 🔧",
  },
};

interface OfficeRoomProps {
  zone: OfficeZone;
  activeCount: number;
  totalCount: number;
  children: React.ReactNode;
}

export default function OfficeRoom({ zone, activeCount, totalCount, children }: OfficeRoomProps) {
  const t = zoneTheme[zone.id] ?? zoneTheme["z-ops"];

  return (
    <div
      className={`rounded-2xl overflow-hidden border ${t.border} bg-gradient-to-br ${t.bg} backdrop-blur-sm shadow-sm`}
    >
      {/* Zone header */}
      <div className={`flex items-center justify-between px-3 py-2.5 ${t.header} border-b ${t.border}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-base">{t.emoji}</span>
          <div>
            <h3 className={`text-[11px] font-bold ${t.text}`}>{zone.name}</h3>
            <p className="text-[9px] text-chibi-muted">{t.deco}</p>
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.badge}`}>
          {activeCount}/{totalCount}
        </span>
      </div>

      {/* Floor with dot pattern */}
      <div className="p-2.5 bg-dots-pastel">
        <div className="grid grid-cols-2 gap-2">{children}</div>
      </div>
    </div>
  );
}
