"use client";

import { useState } from "react";
import Header from "@/components/Header";
import AgentStatus from "@/components/AgentStatus";
import { agents } from "@/lib/mockData";

const avatarGradients: Record<string, string> = {
  violet: "from-violet-700 to-violet-400",
  cyan: "from-cyan-700 to-cyan-400",
  emerald: "from-emerald-700 to-emerald-400",
  amber: "from-amber-700 to-amber-400",
  pink: "from-pink-700 to-pink-400",
  blue: "from-blue-700 to-blue-400",
  orange: "from-orange-700 to-orange-400",
  rose: "from-rose-700 to-rose-400",
};

const statusDotColors: Record<string, string> = {
  active: "#10b981",
  idle: "#94a3b8",
  processing: "#f59e0b",
};

const statusBadge: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-emerald-500/12", text: "text-emerald-400" },
  idle: { bg: "bg-slate-500/10", text: "text-slate-400" },
  processing: { bg: "bg-amber-500/12", text: "text-amber-400" },
};

/* ─── Ad Copy Generator Panel ─── */
function AdCopyPanel() {
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!brief.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/ad-copy-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      const data = await res.json();
      if (data.success) {
        const text = data.adCopy ?? data.copy ?? data.output ?? data.captions ?? JSON.stringify(data, null, 2);
        setResult(text);
      } else {
        setError(data.error ?? "เกิดข้อผิดพลาด");
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อ API ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl p-5 bg-surface border border-edge mb-8">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
              style={{ background: "linear-gradient(135deg,#b45309,#d97706)" }}>📣</span>
            Ad Copy Generator
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">ให้ AI เขียนโฆษณาให้จาก brief ของคุณ</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-lg text-amber-400 bg-amber-500/10 border border-amber-500/20">
          Powered by n8n
        </span>
      </div>

      {/* Brief input */}
      <div className="flex gap-3">
        <textarea
          value={brief}
          onChange={e => setBrief(e.target.value)}
          placeholder="เช่น: โปรโมท Flash Sale ลด 50% สำหรับสินค้า Electronics ช่วงสิ้นเดือน เน้นความเร่งด่วน..."
          rows={3}
          className="flex-1 rounded-xl px-4 py-3 text-sm text-ink placeholder-ink-muted outline-none resize-none bg-surface-2 border border-edge focus:border-amber-500/50 transition-colors"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !brief.trim()}
          className="self-end px-5 py-3 rounded-xl text-sm font-semibold text-white whitespace-nowrap transition-opacity disabled:opacity-40 flex items-center gap-2"
          style={{ background: "linear-gradient(135deg,#b45309,#0891b2)" }}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              กำลังสร้าง…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 rounded-xl px-4 py-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20">
          ❌ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4 rounded-xl bg-surface-2 border border-edge overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-edge">
            <span className="text-xs font-semibold text-ink">✅ Ad Copy ที่ได้</span>
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy
            </button>
          </div>
          <pre className="px-4 py-3 text-xs text-ink-muted leading-relaxed whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}

export default function AITeamPage() {
  const online = agents.filter((a) => a.status !== "idle").length;

  return (
    <div>
      <Header
        title="AI Team"
        subtitle={`${online} agents active · ${agents.length} total agents deployed`}
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active", value: agents.filter((a) => a.status === "active").length, dotClass: "bg-emerald-400", shadow: "#10b981" },
          { label: "Processing", value: agents.filter((a) => a.status === "processing").length, dotClass: "bg-amber-400", shadow: "#f59e0b" },
          { label: "Idle", value: agents.filter((a) => a.status === "idle").length, dotClass: "bg-slate-500", shadow: "#94a3b8" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 flex items-center gap-3 bg-surface border border-edge">
            <span
              className={`w-3 h-3 rounded-full flex-shrink-0 ${s.dotClass}`}
              style={{ boxShadow: `0 0 8px ${s.shadow}` }}
            />
            <div>
              <div className="text-2xl font-bold text-ink">{s.value}</div>
              <div className="text-xs text-ink-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {agents.map((agent) => {
          const grad = avatarGradients[agent.color] ?? "from-slate-700 to-slate-400";
          const dot = statusDotColors[agent.status] ?? "#94a3b8";
          const badge = statusBadge[agent.status] ?? statusBadge.idle;
          return (
            <div
              key={agent.id}
              className="rounded-2xl p-5 cursor-pointer bg-surface border border-edge hover:border-violet-600/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${grad}`}>
                    {agent.avatar}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface"
                    style={{ background: dot, boxShadow: `0 0 8px ${dot}` }}
                  />
                </div>
                <div>
                  <div className="font-semibold text-sm text-ink">{agent.name}</div>
                  <div className="text-xs text-ink-muted">{agent.role}</div>
                </div>
              </div>

              <div className="rounded-lg p-3 mb-4 bg-surface-2 border border-edge">
                <div className="text-xs mb-1 font-medium text-ink-muted">Current Task</div>
                <p className="text-xs leading-relaxed text-ink">{agent.task}</p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-muted">
                  <span className="font-semibold text-ink">{agent.completedTasks.toLocaleString("en-US")}</span>{" "}
                  tasks completed
                </span>
                <span className={`px-2 py-0.5 rounded-md ${badge.bg} ${badge.text}`}>
                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ad Copy Generator */}
      <AdCopyPanel />

      {/* Live Task Feed */}
      <div className="rounded-2xl p-5 bg-surface border border-edge">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink">Live Task Feed</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-ink-muted">Real-time</span>
          </div>
        </div>
        <AgentStatus />
      </div>
    </div>
  );
}
