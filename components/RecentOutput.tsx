import { recentOutputs } from "@/lib/mockData";

const typeColors: Record<string, { bg: string; text: string }> = {
  "Ad Copy": { bg: "bg-amber-500/10", text: "text-amber-400" },
  "Long-form": { bg: "bg-violet-600/10", text: "text-violet-400" },
  "Strategy Doc": { bg: "bg-cyan-500/10", text: "text-cyan-400" },
  Email: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  Blog: { bg: "bg-pink-500/10", text: "text-pink-400" },
  Copywriting: { bg: "bg-blue-500/10", text: "text-blue-400" },
  "Social Media": { bg: "bg-violet-500/10", text: "text-violet-300" },
  "Video Script": { bg: "bg-red-500/10", text: "text-red-400" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${h}:${m}`;
}

export default function RecentOutput() {
  return (
    <div className="space-y-3">
      {recentOutputs.map((output) => {
        const tc = typeColors[output.type] ?? { bg: "bg-slate-500/10", text: "text-slate-400" };
        return (
          <div
            key={output.id}
            className="rounded-xl p-4 cursor-pointer transition-colors bg-surface-2 border border-edge hover:border-violet-600/30"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="text-sm font-semibold leading-tight text-ink">
                {output.title}
              </h4>
              <span className={`text-xs px-2 py-0.5 rounded-md flex-shrink-0 font-medium ${tc.bg} ${tc.text}`}>
                {output.type}
              </span>
            </div>
            <p className="text-xs mb-3 line-clamp-2 text-ink-muted">
              {output.preview}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-ink-muted">
                <span>{output.agent}</span>
                <span>·</span>
                <span>{output.wordCount.toLocaleString("en-US")} words</span>
                <span>·</span>
                <span>{formatDate(output.completedAt)}</span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-3 h-3"
                    fill={i < output.rating ? "#fbbf24" : "none"}
                    stroke={i < output.rating ? "#fbbf24" : "#2a2a3a"}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
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
