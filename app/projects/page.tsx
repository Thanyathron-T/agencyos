import Header from "@/components/Header";
import { projects } from "@/lib/mockData";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: "Active", bg: "bg-violet-600/15", text: "text-violet-400" },
  review: { label: "In Review", bg: "bg-amber-500/15", text: "text-amber-400" },
  completed: { label: "Completed", bg: "bg-emerald-500/15", text: "text-emerald-400" },
  paused: { label: "Paused", bg: "bg-slate-500/10", text: "text-slate-400" },
};

const categoryColors: Record<string, string> = {
  "Product Launch": "text-violet-400",
  Branding: "text-cyan-400",
  "Growth Marketing": "text-emerald-400",
  "Paid Advertising": "text-amber-400",
  "Email Marketing": "text-blue-400",
  "Influencer Marketing": "text-pink-400",
};

function formatDeadline(dateStr: string) {
  const d = new Date(dateStr);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
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
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 bg-gradient-to-r from-violet-600 to-cyan-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Projects", value: projects.length, color: "text-violet-400" },
          { label: "Active", value: active, color: "text-emerald-400" },
          { label: "Completed", value: completed, color: "text-cyan-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 bg-surface border border-edge">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs mt-1 text-ink-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projects.map((project) => {
          const st = statusConfig[project.status] ?? statusConfig.paused;
          const catColor = categoryColors[project.category] ?? "text-slate-400";
          return (
            <div
              key={project.id}
              className="rounded-2xl p-5 cursor-pointer bg-surface border border-edge hover:border-violet-600/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-3">
                  <h3 className="font-semibold text-sm mb-1 text-ink">{project.name}</h3>
                  <p className="text-xs text-ink-muted">{project.client}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium flex-shrink-0 ${st.bg} ${st.text}`}>
                  {st.label}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-ink-muted">Progress</span>
                  <span className="text-ink">{project.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-edge overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      project.progress >= 80
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                        : project.progress >= 50
                          ? "bg-gradient-to-r from-violet-600 to-violet-400"
                          : "bg-gradient-to-r from-cyan-600 to-cyan-400"
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-ink-muted">
                  <span>{project.contentItems} items</span>
                  <span>Due {formatDeadline(project.deadline)}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md bg-surface-2 ${catColor}`}>
                  {project.category}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-edge">
                <div className="flex flex-wrap gap-1.5">
                  {project.assignedAgents.map((a) => (
                    <span key={a} className="text-xs px-2 py-0.5 rounded-md bg-surface-2 text-ink-muted border border-edge">
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
