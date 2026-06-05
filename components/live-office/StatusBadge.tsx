import type { OfficeStatus } from "@/lib/officeData";

interface StatusBadgeProps {
  status: OfficeStatus;
  size?: "sm" | "md";
}

const config: Record<OfficeStatus, { label: string; emoji: string; bg: string; text: string }> = {
  working:    { label: "กำลังทำงาน",  emoji: "🟢", bg: "bg-emerald-100",   text: "text-emerald-700"  },
  reviewing:  { label: "กำลังรีวิว",  emoji: "🟡", bg: "bg-amber-100",    text: "text-amber-700"    },
  waiting:    { label: "รออนุมัติ",   emoji: "🟣", bg: "bg-violet-100",   text: "text-violet-700"   },
  publishing: { label: "กำลังเผยแพร่", emoji: "🔵", bg: "bg-sky-100",     text: "text-sky-700"      },
  idle:       { label: "พัก",         emoji: "⚪", bg: "bg-gray-100",     text: "text-gray-500"     },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap ${c.bg} ${c.text} ${
        size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[10px]"
      }`}
    >
      <span>{c.emoji}</span>
      {c.label}
    </span>
  );
}
