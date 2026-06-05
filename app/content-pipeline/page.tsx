import Header from "@/components/Header";
import { contentPipeline } from "@/lib/mockData";

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  in_progress: { label: "In Progress", bg: "bg-violet-600/12", text: "text-violet-400", border: "border-violet-600/30" },
  review: { label: "In Review", bg: "bg-amber-500/12", text: "text-amber-400", border: "border-amber-500/30" },
  queued: { label: "Queued", bg: "bg-slate-500/8", text: "text-slate-400", border: "border-slate-500/20" },
  completed: { label: "Completed", bg: "bg-emerald-500/12", text: "text-emerald-400", border: "border-emerald-500/30" },
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  high: { color: "text-red-400", label: "High" },
  medium: { color: "text-amber-400", label: "Med" },
  low: { color: "text-slate-400", label: "Low" },
};

const typeColors: Record<string, { bg: string; text: string }> = {
  Copywriting: { bg: "bg-violet-600/12", text: "text-violet-400" },
  "Social Media": { bg: "bg-violet-500/10", text: "text-violet-300" },
  Blog: { bg: "bg-pink-500/10", text: "text-pink-400" },
  "Ad Copy": { bg: "bg-amber-500/10", text: "text-amber-400" },
  Email: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  "Long-form": { bg: "bg-violet-600/10", text: "text-violet-400" },
  "Video Script": { bg: "bg-red-500/10", text: "text-red-400" },
  "Strategy Doc": { bg: "bg-cyan-500/10", text: "text-cyan-400" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

const columns = [
  { key: "queued", label: "Queue" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "completed", label: "Completed" },
] as const;

export default function ContentPipelinePage() {
  return (
    <div>
      <Header
        title="Content Pipeline"
        subtitle={`${contentPipeline.length} content items · ${contentPipeline.filter((c) => c.status === "in_progress").length} in progress`}
        action={
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 bg-gradient-to-r from-violet-600 to-cyan-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Content
          </button>
        }
      />

      {/* Status pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        {columns.map((col) => {
          const count = contentPipeline.filter((c) => c.status === col.key).length;
          const st = statusConfig[col.key];
          return (
            <div key={col.key} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${st.bg} border ${st.border} ${st.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
              {col.label} · {count}
            </div>
          );
        })}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {columns.map((col) => {
          const items = contentPipeline.filter((c) => c.status === col.key);
          const st = statusConfig[col.key];
          return (
            <div key={col.key} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-semibold text-ink">{col.label}</span>
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${st.bg} ${st.text}`}>
                  {items.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {items.map((item) => {
                  const pr = priorityConfig[item.priority] ?? priorityConfig.low;
                  const tc = typeColors[item.type] ?? { bg: "bg-slate-500/10", text: "text-slate-400" };
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl p-4 cursor-pointer bg-surface border border-edge hover:border-violet-600/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${tc.bg} ${tc.text}`}>
                          {item.type}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${pr.color} bg-current/10`}>
                          {pr.label}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold leading-snug mb-2 text-ink">{item.title}</h4>
                      <p className="text-xs mb-3 text-ink-muted">{item.project}</p>
                      <div className="flex items-center justify-between border-t border-edge pt-2.5">
                        <span className="text-xs text-ink-muted">{item.agent}</span>
                        <div className="flex items-center gap-2 text-xs text-ink-muted">
                          <span>{item.wordCount}w</span>
                          <span>·</span>
                          <span>Due {formatDate(item.dueAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {items.length === 0 && (
                  <div className="rounded-xl p-4 text-center text-xs border border-dashed border-edge text-ink-muted">
                    No items
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Table view */}
      <div className="rounded-2xl overflow-hidden bg-surface border border-edge">
        <div className="px-5 py-4 border-b border-edge">
          <h2 className="text-sm font-semibold text-ink">All Content Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-edge">
                {["Title", "Type", "Project", "Agent", "Words", "Status", "Due"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-medium text-ink-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contentPipeline.map((item, i) => {
                const st = statusConfig[item.status];
                const tc = typeColors[item.type] ?? { bg: "bg-slate-500/10", text: "text-slate-400" };
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-white/5 transition-colors"
                    style={{ borderBottom: i < contentPipeline.length - 1 ? "1px solid #2a2a3a" : "none" }}
                  >
                    <td className="px-5 py-3 font-medium text-ink max-w-[200px]">
                      <span className="truncate block">{item.title}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-1.5 py-0.5 rounded ${tc.bg} ${tc.text}`}>{item.type}</span>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{item.project}</td>
                    <td className="px-5 py-3 text-ink-muted">{item.agent}</td>
                    <td className="px-5 py-3 text-ink-muted">{item.wordCount.toLocaleString("en-US")}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded ${st.bg} ${st.text}`}>{st.label}</span>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{formatDate(item.dueAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
