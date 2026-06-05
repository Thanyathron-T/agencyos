import { recentOutputs } from "@/lib/mockData";

const typeColors: Record<string, { bg: string; text: string }> = {
  "Ad Copy": { bg: "rgba(245,158,11,0.12)", text: "#fbbf24" },
  "Long-form": { bg: "rgba(124,58,237,0.12)", text: "#a78bfa" },
  "Strategy Doc": { bg: "rgba(6,182,212,0.12)", text: "#22d3ee" },
  Email: { bg: "rgba(16,185,129,0.12)", text: "#34d399" },
  Blog: { bg: "rgba(236,72,153,0.12)", text: "#f472b6" },
  Copywriting: { bg: "rgba(59,130,246,0.12)", text: "#60a5fa" },
  "Social Media": { bg: "rgba(168,85,247,0.12)", text: "#c084fc" },
  "Video Script": { bg: "rgba(239,68,68,0.12)", text: "#f87171" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function RecentOutput() {
  return (
    <div className="space-y-3">
      {recentOutputs.map((output) => {
        const tc = typeColors[output.type] ?? { bg: "rgba(148,163,184,0.1)", text: "#94a3b8" };
        return (
          <div key={output.id}
            className="rounded-xl p-4 group cursor-pointer transition-colors"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="text-sm font-semibold leading-tight" style={{ color: "var(--text)" }}>
                {output.title}
              </h4>
              <span className="text-xs px-2 py-0.5 rounded-md flex-shrink-0 font-medium"
                style={{ background: tc.bg, color: tc.text }}>
                {output.type}
              </span>
            </div>
            <p className="text-xs mb-3 line-clamp-2" style={{ color: "var(--text-muted)" }}>
              {output.preview}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                <span>{output.agent}</span>
                <span>·</span>
                <span>{output.wordCount.toLocaleString()} words</span>
                <span>·</span>
                <span>{formatDate(output.completedAt)}</span>
              </div>
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-3 h-3" fill={i < output.rating ? "#fbbf24" : "none"}
                    stroke={i < output.rating ? "#fbbf24" : "var(--border)"} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
