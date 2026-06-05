import Header from "@/components/Header";
import { contentPipeline } from "@/lib/mockData";

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  in_progress: { label: "In Progress", bg: "rgba(124,58,237,0.12)", text: "#a78bfa", border: "rgba(124,58,237,0.3)" },
  review: { label: "In Review", bg: "rgba(245,158,11,0.12)", text: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  queued: { label: "Queued", bg: "rgba(148,163,184,0.08)", text: "#94a3b8", border: "rgba(148,163,184,0.2)" },
  completed: { label: "Completed", bg: "rgba(16,185,129,0.12)", text: "#34d399", border: "rgba(16,185,129,0.3)" },
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  high: { color: "#f87171", label: "High" },
  medium: { color: "#fbbf24", label: "Med" },
  low: { color: "#94a3b8", label: "Low" },
};

const typeColors: Record<string, string> = {
  "Copywriting": "#a78bfa",
  "Social Media": "#c084fc",
  "Blog": "#f472b6",
  "Ad Copy": "#fbbf24",
  "Email": "#34d399",
  "Long-form": "#a78bfa",
  "Video Script": "#f87171",
  "Strategy Doc": "#22d3ee",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Content
          </button>
        }
      />

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        {columns.map((col) => {
          const count = contentPipeline.filter((c) => c.status === col.key).length;
          const st = statusConfig[col.key];
          return (
            <div key={col.key} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.text }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.text }} />
              {col.label} · {count}
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const items = contentPipeline.filter((c) => c.status === col.key);
          const st = statusConfig[col.key];
          return (
            <div key={col.key} className="flex flex-col gap-3">
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>{col.label}</span>
                  <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold"
                    style={{ background: st.bg, color: st.text }}>
                    {items.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                {items.map((item) => {
                  const pr = priorityConfig[item.priority];
                  const tc = typeColors[item.type] ?? "#94a3b8";
                  return (
                    <div key={item.id}
                      className="rounded-xl p-4 group cursor-pointer hover:border-violet-500/30 transition-colors"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

                      {/* Type + Priority */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ background: `${tc}18`, color: tc }}>
                          {item.type}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded"
                          style={{ background: `${pr.color}15`, color: pr.color }}>
                          {pr.label}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold leading-snug mb-2"
                        style={{ color: "var(--text)" }}>
                        {item.title}
                      </h4>

                      <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                        {item.project}
                      </p>

                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}
                        className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {item.agent}
                        </span>
                        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                          <span>{item.wordCount}w</span>
                          <span>·</span>
                          <span>Due {formatDate(item.dueAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {items.length === 0 && (
                  <div className="rounded-xl p-4 text-center text-xs"
                    style={{ border: "1px dashed var(--border)", color: "var(--text-muted)" }}>
                    No items
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Table view below kanban */}
      <div className="mt-8 rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>All Content Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Title", "Type", "Project", "Agent", "Words", "Status", "Due"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-medium" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contentPipeline.map((item, i) => {
                const st = statusConfig[item.status];
                const tc = typeColors[item.type] ?? "#94a3b8";
                return (
                  <tr key={item.id}
                    className="hover:bg-white/5 transition-colors"
                    style={{ borderBottom: i < contentPipeline.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-5 py-3 font-medium" style={{ color: "var(--text)", maxWidth: "200px" }}>
                      <span className="truncate block">{item.title}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-1.5 py-0.5 rounded" style={{ background: `${tc}15`, color: tc }}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ color: "var(--text-muted)" }}>{item.project}</td>
                    <td className="px-5 py-3" style={{ color: "var(--text-muted)" }}>{item.agent}</td>
                    <td className="px-5 py-3" style={{ color: "var(--text-muted)" }}>{item.wordCount.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded" style={{ background: st.bg, color: st.text }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ color: "var(--text-muted)" }}>{formatDate(item.dueAt)}</td>
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
