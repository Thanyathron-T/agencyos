import Header from "@/components/Header";
import KPICards from "@/components/KPICards";
import AgentStatus from "@/components/AgentStatus";
import RecentOutput from "@/components/RecentOutput";
import { projects } from "@/lib/mockData";
import Link from "next/link";

const activityEvents = [
  { time: "2m ago", text: "CopyBot Pro completed TechNova hero section draft", icon: "✍️" },
  { time: "14m ago", text: "DataPulse published Week 22 performance report", icon: "📊" },
  { time: "31m ago", text: "FinFlow SEO Blog sent for client review", icon: "🔍" },
  { time: "1h ago", text: "MindfulMeals Ads approved and live on Google", icon: "🚀" },
  { time: "2h ago", text: "TrendWatch detected 3 new trending topics", icon: "📈" },
];

function ActivityFeedSection() {
  return (
    <div className="space-y-1">
      {activityEvents.map((e, i) => (
        <div key={i} className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors">
          <span className="text-base mt-0.5 flex-shrink-0">{e.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs leading-relaxed text-ink">{e.text}</p>
          </div>
          <span className="text-xs flex-shrink-0 mt-0.5 text-ink-muted">{e.time}</span>
        </div>
      ))}
    </div>
  );
}

function TopProjects() {
  return (
    <div className="space-y-3">
      {projects.slice(0, 4).map((p) => (
        <div key={p.id} className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium truncate text-ink">{p.name}</span>
              <span className="text-xs ml-2 flex-shrink-0 text-ink-muted">{p.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-edge">
              <div
                className={`h-full rounded-full transition-all ${
                  p.progress >= 80
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                    : p.progress >= 50
                      ? "bg-gradient-to-r from-violet-600 to-violet-400"
                      : "bg-gradient-to-r from-cyan-600 to-cyan-400"
                }`}
                style={{ width: `${p.progress}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="7 AI agents online · All systems operational"
        action={
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 bg-gradient-to-r from-violet-600 to-cyan-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        }
      />

      <KPICards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 rounded-2xl p-5 bg-surface border border-edge">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-ink">Agent Status</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-ink-muted">Live</span>
            </div>
          </div>
          <AgentStatus limit={5} />
        </div>

        <div className="rounded-2xl p-5 bg-surface border border-edge">
          <h2 className="text-sm font-semibold mb-4 text-ink">Activity Feed</h2>
          <ActivityFeedSection />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5 bg-surface border border-edge">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-ink">Recent Output</h2>
            <Link href="/content-pipeline" className="text-xs text-violet-400 hover:opacity-80 transition-opacity">
              View all →
            </Link>
          </div>
          <RecentOutput />
        </div>

        <div className="rounded-2xl p-5 bg-surface border border-edge">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-ink">Project Progress</h2>
            <Link href="/projects" className="text-xs text-violet-400 hover:opacity-80 transition-opacity">
              All projects →
            </Link>
          </div>
          <TopProjects />
        </div>
      </div>
    </div>
  );
}
