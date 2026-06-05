import Header from "@/components/Header";

const channelData = [
  { channel: "Organic Search", sessions: 14820, conversions: 312, revenue: "$28,400", change: "+22%", color: "violet" },
  { channel: "Paid Search", sessions: 9340, conversions: 228, revenue: "$19,800", change: "+8%", color: "cyan" },
  { channel: "Social Media", sessions: 7210, conversions: 94, revenue: "$7,100", change: "+31%", color: "pink" },
  { channel: "Email", sessions: 5880, conversions: 187, revenue: "$16,300", change: "+15%", color: "emerald" },
  { channel: "Direct", sessions: 4120, conversions: 76, revenue: "$6,600", change: "+4%", color: "amber" },
  { channel: "Referral", sessions: 2940, conversions: 43, revenue: "$3,800", change: "+19%", color: "blue" },
];

const colorMap: Record<string, { text: string; bar: string; bg: string }> = {
  violet: { text: "text-violet-400", bar: "bg-gradient-to-r from-violet-600 to-violet-400", bg: "bg-violet-600/10" },
  cyan: { text: "text-cyan-400", bar: "bg-gradient-to-r from-cyan-600 to-cyan-400", bg: "bg-cyan-500/10" },
  pink: { text: "text-pink-400", bar: "bg-gradient-to-r from-pink-600 to-pink-400", bg: "bg-pink-500/10" },
  emerald: { text: "text-emerald-400", bar: "bg-gradient-to-r from-emerald-600 to-emerald-400", bg: "bg-emerald-500/10" },
  amber: { text: "text-amber-400", bar: "bg-gradient-to-r from-amber-600 to-amber-400", bg: "bg-amber-500/10" },
  blue: { text: "text-blue-400", bar: "bg-gradient-to-r from-blue-600 to-blue-400", bg: "bg-blue-500/10" },
};

const topPages = [
  { path: "/features", views: 4820, bounce: "34%", avgTime: "3m 12s" },
  { path: "/pricing", views: 3940, bounce: "41%", avgTime: "4m 08s" },
  { path: "/blog/ai-marketing-guide", views: 3120, bounce: "28%", avgTime: "6m 44s" },
  { path: "/", views: 2880, bounce: "52%", avgTime: "1m 58s" },
  { path: "/case-studies", views: 1940, bounce: "22%", avgTime: "5m 31s" },
];

const maxSessions = Math.max(...channelData.map((c) => c.sessions));

export default function AnalyticsPage() {
  return (
    <div>
      <Header title="Analytics" subtitle="Performance overview — June 2026" />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Sessions", value: "44,310", change: "+18%", color: "violet" },
          { label: "Conversions", value: "940", change: "+24%", color: "emerald" },
          { label: "Revenue Attributed", value: "$82,000", change: "+12%", color: "amber" },
          { label: "Avg. Conv. Rate", value: "2.12%", change: "+0.4pt", color: "cyan" },
        ].map((k) => {
          const c = colorMap[k.color];
          return (
            <div key={k.label} className={`rounded-2xl p-5 bg-surface border border-edge relative overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} to-transparent opacity-50`} />
              <div className="relative">
                <div className={`text-2xl font-bold ${c.text}`}>{k.value}</div>
                <div className="text-xs text-ink-muted mt-1">{k.label}</div>
                <div className="text-xs text-emerald-400 mt-2 font-medium">{k.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Channel breakdown */}
        <div className="rounded-2xl p-5 bg-surface border border-edge">
          <h2 className="text-sm font-semibold text-ink mb-4">Traffic by Channel</h2>
          <div className="space-y-3">
            {channelData.map((c) => {
              const col = colorMap[c.color];
              const pct = Math.round((c.sessions / maxSessions) * 100);
              return (
                <div key={c.channel}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-ink">{c.channel}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-ink-muted">{c.sessions.toLocaleString("en-US")}</span>
                      <span className={`font-medium ${col.text}`}>{c.change}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-edge overflow-hidden">
                    <div className={`h-full rounded-full ${col.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top pages */}
        <div className="rounded-2xl p-5 bg-surface border border-edge">
          <h2 className="text-sm font-semibold text-ink mb-4">Top Pages</h2>
          <div className="space-y-2">
            {topPages.map((p, i) => (
              <div key={p.path} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-2 border border-edge">
                <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold bg-violet-600/15 text-violet-400 flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-ink truncate">{p.path}</div>
                  <div className="text-[10px] text-ink-muted">{p.views.toLocaleString("en-US")} views</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-ink-muted">{p.avgTime}</div>
                  <div className="text-[10px] text-ink-muted">{p.bounce} bounce</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Channel revenue table */}
      <div className="rounded-2xl overflow-hidden bg-surface border border-edge">
        <div className="px-5 py-4 border-b border-edge">
          <h2 className="text-sm font-semibold text-ink">Revenue Attribution</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-edge">
                {["Channel", "Sessions", "Conversions", "Conv. Rate", "Revenue", "Change"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-medium text-ink-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {channelData.map((row, i) => {
                const col = colorMap[row.color];
                const rate = ((row.conversions / row.sessions) * 100).toFixed(2);
                return (
                  <tr
                    key={row.channel}
                    className="hover:bg-white/5 transition-colors"
                    style={{ borderBottom: i < channelData.length - 1 ? "1px solid #2a2a3a" : "none" }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${col.bar}`} />
                        <span className="font-medium text-ink">{row.channel}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{row.sessions.toLocaleString("en-US")}</td>
                    <td className="px-5 py-3 text-ink-muted">{row.conversions.toLocaleString("en-US")}</td>
                    <td className="px-5 py-3 text-ink-muted">{rate}%</td>
                    <td className="px-5 py-3 font-semibold text-ink">{row.revenue}</td>
                    <td className="px-5 py-3">
                      <span className={`font-semibold ${col.text}`}>{row.change}</span>
                    </td>
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
