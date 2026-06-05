import Header from "@/components/Header";
import { projects } from "@/lib/mockData";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: "Active", bg: "rgba(124,58,237,0.15)", text: "#a78bfa" },
  review: { label: "In Review", bg: "rgba(245,158,11,0.15)", text: "#fbbf24" },
  completed: { label: "Completed", bg: "rgba(16,185,129,0.15)", text: "#34d399" },
  paused: { label: "Paused", bg: "rgba(148,163,184,0.12)", text: "#94a3b8" },
};

const categoryColors: Record<string, string> = {
  "Product Launch": "#a78bfa",
  "Branding": "#22d3ee",
  "Growth Marketing": "#34d399",
  "Paid Advertising": "#fbbf24",
  "Email Marketing": "#60a5fa",
  "Influencer Marketing": "#f472b6",
};

function formatDeadline(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ProjectsPage() {
  const active = projects.filter((p) => p.status === "active").length;
  const completed = projects.filter((p) => p.status === "completed").length;

  return (
    <div>
      <Header
        title="Projects"
        subtitle={`${active} active · ${completed} completed · ${projects.length} total`}
        action={
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        }
      />

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Projects", value: projects.length.toString(), color: "#a78bfa" },
          { label: "Active", value: active.toString(), color: "#34d399" },
          { label: "Completed", value: completed.toString(), color: "#22d3ee" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projects.map((project) => {
          const st = statusConfig[project.status];
          const catColor = categoryColors[project.category] ?? "#94a3b8";
          return (
            <div key={project.id}
              className="rounded-2xl p-5 group hover:border-violet-500/40 transition-colors cursor-pointer"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-3">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
                    {project.name}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{project.client}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md font-medium flex-shrink-0"
                  style={{ background: st.bg, color: st.text }}>
                  {st.label}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: "var(--text-muted)" }}>Progress</span>
                  <span style={{ color: "var(--text)" }}>{project.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full"
                    style={{
                      width: `${project.progress}%`,
                      background: project.progress >= 80
                        ? "linear-gradient(90deg,#10b981,#34d399)"
                        : project.progress >= 50
                          ? "linear-gradient(90deg,#7c3aed,#a78bfa)"
                          : "linear-gradient(90deg,#0891b2,#22d3ee)",
                    }} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>{project.contentItems} items</span>
                  <span>Due {formatDeadline(project.deadline)}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md"
                  style={{ background: "rgba(148,163,184,0.08)", color: catColor }}>
                  {project.category}
                </span>
              </div>

              {/* Agents */}
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex flex-wrap gap-1.5">
                  {project.assignedAgents.map((a) => (
                    <span key={a} className="text-xs px-2 py-0.5 rounded-md"
                      style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
