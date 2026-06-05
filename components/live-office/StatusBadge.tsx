import type { OfficeStatus } from "@/lib/officeData";

interface StatusBadgeProps {
  status: OfficeStatus;
  size?: "sm" | "md";
}

const config: Record<OfficeStatus, { label: string; bg: string; text: string; dot: string }> = {
  working: {
    label: "Working",
    bg: "bg-violet-600/15",
    text: "text-violet-400",
    dot: "bg-violet-400",
  },
  reviewing: {
    label: "Reviewing",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  publishing: {
    label: "Publishing",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  waiting: {
    label: "Waiting",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    dot: "bg-slate-400",
  },
  idle: {
    label: "Idle",
    bg: "bg-slate-500/8",
    text: "text-slate-500",
    dot: "bg-slate-500",
  },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium ${c.bg} ${c.text} ${
        size === "md" ? "px-2.5 py-1 text-xs" : "px-1.5 py-0.5 text-[10px]"
      }`}
    >
      <span className={`rounded-full flex-shrink-0 ${c.dot} ${size === "md" ? "w-1.5 h-1.5" : "w-1 h-1"}`} />
      {c.label}
    </span>
  );
}
