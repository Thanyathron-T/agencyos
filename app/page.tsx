"use client";

import { useState, useEffect, useRef } from "react";
import { officeAgents, officeActivityFeed, companyHealth, officeZones } from "@/lib/officeData";

/* ─────────────────────────────────────────────────────────────
   DERIVED DATA
───────────────────────────────────────────────────────────── */
function getStats() {
  const online  = officeAgents.filter(a => a.status !== "idle").length;
  const total   = officeAgents.length;
  return { online, total };
}

function agentsInZone(zoneId: string) {
  return officeAgents.filter(a => a.zoneId === zoneId);
}
function onlineInZone(zoneId: string) {
  return agentsInZone(zoneId).filter(a => a.status !== "idle").length;
}
function latestTaskInZone(zoneId: string) {
  const a = agentsInZone(zoneId).find(x => x.status === "working") ?? agentsInZone(zoneId)[0];
  return a?.task ?? "พร้อมรับงาน";
}

const STATUS_COUNTS = {
  working:    officeAgents.filter(a => a.status === "working").length,
  reviewing:  officeAgents.filter(a => a.status === "reviewing").length,
  waiting:    officeAgents.filter(a => a.status === "waiting").length,
  publishing: officeAgents.filter(a => a.status === "publishing").length,
  idle:       officeAgents.filter(a => a.status === "idle").length,
};

/* ─────────────────────────────────────────────────────────────
   ZONE CONFIG  — fine-tuned to pastel chibi image
───────────────────────────────────────────────────────────── */
const ZONES = [
  { id: "z-marketing", label: "Marketing",  emoji: "🩷", top: "8%",  left: "2%",  width: "33%", height: "44%", color: "#ffb7d5", glow: "rgba(255,183,213,0.45)" },
  { id: "z-content",   label: "Content",    emoji: "💙", top: "8%",  left: "34%", width: "25%", height: "44%", color: "#8ed7ff", glow: "rgba(142,215,255,0.45)" },
  { id: "z-design",    label: "Design",     emoji: "💜", top: "8%",  left: "58%", width: "40%", height: "44%", color: "#c4a8ff", glow: "rgba(196,168,255,0.45)" },
  { id: "z-ads",       label: "Ads",        emoji: "💛", top: "51%", left: "2%",  width: "31%", height: "46%", color: "#ffe29a", glow: "rgba(255,226,154,0.45)" },
  { id: "z-support",   label: "Support",    emoji: "🧡", top: "51%", left: "32%", width: "29%", height: "46%", color: "#ffcba4", glow: "rgba(255,203,164,0.45)" },
  { id: "z-ops",       label: "Operations", emoji: "🩵", top: "51%", left: "60%", width: "38%", height: "46%", color: "#a7f3d0", glow: "rgba(167,243,208,0.45)" },
];

/* ─────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────── */
function StatCard({ emoji, border, bg, accent, value, suffix, label, sub }: {
  emoji: string; border: string; bg: string; accent: string;
  value: string; suffix?: string; label: string; sub: string;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${border} px-3 py-2.5 flex items-center gap-2.5 min-w-0`}>
      <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center text-base shrink-0`}>{emoji}</div>
      <div className="min-w-0">
        <div className="text-base font-bold text-gray-900 leading-none">
          {value}<span className="text-xs font-medium text-gray-400">{suffix}</span>
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5 truncate">{label}</div>
        <div className={`text-[10px] font-semibold mt-0.5 truncate ${accent}`}>{sub}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ZONE OVERLAY BUTTON
───────────────────────────────────────────────────────────── */
function ZoneOverlay({ zone, onClick, active }: {
  zone: typeof ZONES[0];
  onClick: () => void;
  active: boolean;
}) {
  const online = onlineInZone(zone.id);
  const task   = latestTaskInZone(zone.id);

  return (
    <div
      onClick={onClick}
      className="absolute cursor-pointer group"
      style={{ top: zone.top, left: zone.left, width: zone.width, height: zone.height }}
    >
      {/* Hover / active glow border */}
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-200 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{ boxShadow: `0 0 0 2px ${zone.color}, 0 0 24px 4px ${zone.glow}`, opacity: active ? 1 : undefined }}
      />

      {/* Name + online badge — top-left of zone */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5">
        <span
          className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full shadow"
          style={{ background: "rgba(10,8,20,0.78)", color: zone.color, backdropFilter: "blur(6px)" }}
        >
          {zone.emoji} {zone.label}
        </span>
        <span
          className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
          style={{ background: zone.color + "33", color: zone.color, border: `1px solid ${zone.color}88` }}
        >
          {online} online
        </span>
      </div>

      {/* Speech bubble — centre-bottom of zone */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[80%] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div
          className="rounded-xl px-3 py-2 text-xs text-white shadow-lg text-center leading-snug"
          style={{ background: "rgba(10,8,20,0.82)", backdropFilter: "blur(8px)", border: `1px solid ${zone.color}55` }}
        >
          {task.length > 60 ? task.slice(0, 58) + "…" : task}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RIGHT CHAT PANEL  (connected to /api/chat-agent)
───────────────────────────────────────────────────────────── */
const COLOR_MAP: Record<string, string> = {
  violet: "#b794f4", cyan: "#67e8f9", pink: "#f9a8d4",
  amber: "#fcd34d", emerald: "#6ee7b7", blue: "#93c5fd",
};

interface ChatMsg { id: string; role: "user" | "ai"; text: string; }

function ChatPanel() {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, loading]);

  async function handleSend() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg: ChatMsg = { id: `u${Date.now()}`, role: "user", text: msg };
    setChatLog(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      const reply = data.reply ?? data.output ?? data.message ?? (data.success ? "✅ รับเรื่องแล้ว" : "❌ " + (data.error ?? "เกิดข้อผิดพลาด"));
      setChatLog(prev => [...prev, { id: `a${Date.now()}`, role: "ai", text: reply }]);
    } catch {
      setChatLog(prev => [...prev, { id: `e${Date.now()}`, role: "ai", text: "❌ ไม่สามารถเชื่อมต่อ agent ได้" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{ width: "100%", height: "calc(100vh - 40px)", background: "rgba(10,10,20,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 shrink-0">
        <span className="text-white text-sm font-semibold">ห้องแชทน้อง AI</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      </div>

      {/* Activity feed */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {officeActivityFeed.map(ev => (
          <div key={ev.id} className="flex gap-2 items-start">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
              style={{ background: (COLOR_MAP[ev.colorKey] ?? "#888") + "33", color: COLOR_MAP[ev.colorKey] ?? "#888" }}
            >
              {ev.agentName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-white leading-none">{ev.agentName}</span>
                <span className="text-[10px] text-white/40">{ev.timeAgo}</span>
              </div>
              <p className="text-[11px] text-white/60 mt-0.5 leading-snug line-clamp-2">
                <span className="text-white/80">{ev.action}</span> {ev.detail}
              </p>
            </div>
          </div>
        ))}

        {/* Divider if there are chat messages */}
        {chatLog.length > 0 && (
          <div className="flex items-center gap-2 py-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-white/30">แชทกับ AI</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        )}

        {/* Chat log */}
        {chatLog.map(m => (
          <div key={m.id} className={`flex gap-2 items-start ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
              style={{ background: m.role === "user" ? "#6d28d9" : "#0e7490", color: "#fff" }}
            >
              {m.role === "user" ? "คุณ" : "AI"}
            </div>
            <div
              className="max-w-[75%] rounded-xl px-3 py-2 text-[11px] leading-relaxed whitespace-pre-wrap"
              style={{
                background: m.role === "user" ? "rgba(109,40,217,0.25)" : "rgba(255,255,255,0.07)",
                color: m.role === "user" ? "#e9d5ff" : "#d1d5db",
                border: m.role === "user" ? "1px solid rgba(109,40,217,0.3)" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 items-center px-1">
            <div className="w-7 h-7 rounded-full bg-cyan-900/50 flex items-center justify-center text-[10px] text-cyan-300 font-bold shrink-0">AI</div>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="พิมพ์ข้อความถึง AI agent..."
            className="flex-1 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#7c3aed,#0891b2)" }}
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BOTTOM PANELS
───────────────────────────────────────────────────────────── */
const INITIAL_TASKS = [
  { id: 1, text: "ทำ Content Calendar ให้ TechNova", done: true },
  { id: 2, text: "Publish Blog SEO สำหรับ FinFlow",  done: true },
  { id: 3, text: "รีวิว EcoWear Visual Identity",     done: false },
  { id: 4, text: "จัดทำ Report ประจำสัปดาห์",          done: false },
  { id: 5, text: "ความคืบหน้า Campaign Strategy ใหม่",  done: false },
];

function BottomPanels() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const done = tasks.filter(t => t.done).length;

  function toggle(id: number) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  return (
    <div className="grid grid-cols-3 gap-3">

      {/* Panel 1 — Tasks */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-4" style={{ minHeight: 180 }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-800">🎯 ภารกิจวันนี้</span>
          <span className="text-xs font-semibold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">
            {done}/{tasks.length} เสร็จแล้ว
          </span>
        </div>
        <div className="space-y-2">
          {tasks.map(t => (
            <label key={t.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggle(t.id)}
                className="w-4 h-4 rounded accent-pink-500 shrink-0"
              />
              <span className={`text-xs leading-snug transition-colors ${t.done ? "line-through text-gray-400" : "text-gray-700 group-hover:text-pink-600"}`}>
                {t.text}
              </span>
            </label>
          ))}
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full bg-pink-50 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(done / tasks.length) * 100}%`, background: "linear-gradient(90deg,#f9a8d4,#b794f4)" }}
          />
        </div>
      </div>

      {/* Panel 2 — Team Mood */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4" style={{ minHeight: 180 }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-800">🌈 อารมณ์ทีมวันนี้</span>
          <span className="text-xs text-gray-500">😊</span>
        </div>
        {/* Big bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>ความสุขโดยรวม</span>
            <span className="font-semibold text-purple-500">47% Happy</span>
          </div>
          <div className="h-2 rounded-full bg-purple-50 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: "47%", background: "linear-gradient(90deg,#f9a8d4,#b794f4)" }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { emoji: "😄", label: "แฮปปี้",       count: 8, color: "text-pink-500",   bg: "bg-pink-50" },
            { emoji: "🎯", label: "โฟกัส",        count: 5, color: "text-purple-500", bg: "bg-purple-50" },
            { emoji: "🔥", label: "ไฟแรง",        count: 2, color: "text-orange-500", bg: "bg-orange-50" },
            { emoji: "😪", label: "ง่วงนิดหน่อย",  count: 2, color: "text-blue-400",   bg: "bg-blue-50" },
          ].map(m => (
            <div key={m.label} className={`flex items-center gap-2 ${m.bg} rounded-xl px-3 py-2`}>
              <span className="text-base">{m.emoji}</span>
              <div>
                <div className={`text-xs font-bold ${m.color}`}>{m.count} น้อง</div>
                <div className="text-[10px] text-gray-500">{m.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel 3 — Agent Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4" style={{ minHeight: 180 }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-800">🤖 สถานะน้อง</span>
        </div>
        <div className="space-y-2">
          {[
            { label: "กำลังทำงาน",   count: STATUS_COUNTS.working,    dot: "#6ee7b7", bg: "bg-emerald-50",  text: "text-emerald-700" },
            { label: "กำลังรีวิว",   count: STATUS_COUNTS.reviewing,  dot: "#fcd34d", bg: "bg-yellow-50",  text: "text-yellow-700" },
            { label: "รอข้อมูล",     count: STATUS_COUNTS.waiting,    dot: "#fb923c", bg: "bg-orange-50",  text: "text-orange-700" },
            { label: "กำลังเผยแพร่", count: STATUS_COUNTS.publishing, dot: "#93c5fd", bg: "bg-blue-50",    text: "text-blue-700" },
            { label: "พัก",          count: STATUS_COUNTS.idle,       dot: "#cbd5e1", bg: "bg-slate-50",   text: "text-slate-500" },
          ].map(s => (
            <div key={s.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${s.bg}`}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.dot }} />
              <span className={`text-xs font-medium flex-1 ${s.text}`}>{s.label}</span>
              <span className={`text-xs font-bold ${s.text}`}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function LiveOfficePage() {
  const stats = getStats();
  const [activeZone, setActiveZone] = useState<string | null>(null);

  function toggleZone(id: string) {
    setActiveZone(z => z === id ? null : id);
  }

  return (
    /* min-width 900px so content never collapses below readable size */
    <div className="-m-8 flex" style={{ minHeight: "100vh", minWidth: 900, background: "#fdf4ff" }}>

      {/* ── MAIN CONTENT ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-3 shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">Live Office</h1>
          <span className="inline-flex items-center gap-1.5 bg-pink-100 text-pink-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            Real-time
          </span>
          <p className="text-sm text-gray-400 ml-2 hidden lg:block">ศูนย์บัญชาการ AI Marketing ของเรา ✨</p>
        </div>

        {/* Stats bar — 4 equal cards */}
        <div className="grid grid-cols-4 gap-3 px-6 pb-3 shrink-0">
          <StatCard emoji="🤖" border="border-pink-100"   bg="bg-pink-50"   accent="text-pink-500"
            value={`${stats.online}`} suffix={`/${stats.total}`} label="น้อง AI ออนไลน์" sub="กำลังทำงาน" />
          <StatCard emoji="📂" border="border-orange-100" bg="bg-orange-50" accent="text-orange-500"
            value={`${companyHealth.activeProjects}`} label="โปรเจกต์กำลังทำ" sub="กำลังดำเนินการ" />
          <StatCard emoji="⭐" border="border-yellow-100" bg="bg-yellow-50" accent="text-yellow-600"
            value={`${companyHealth.outputsToday}`} label="ผลงานวันนี้" sub="เสร็จแล้ว" />
          <StatCard emoji="💰" border="border-green-100"  bg="bg-green-50"  accent="text-green-600"
            value={`฿${companyHealth.mrr.replace(/[^0-9,]/g, "")}`} label="รายได้เดือนนี้"
            sub={`${companyHealth.mrrChange} จากเดือนที่แล้ว`} />
        </div>

        {/* Office image + zone overlays — flex-1 so it fills remaining height */}
        <div className="relative overflow-hidden mx-6 rounded-3xl shadow-xl" style={{ flex: "1 1 0", minHeight: 320 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/live-office-pastel.png"
            onError={(e) => { (e.target as HTMLImageElement).src = "/reference/office-scene.png"; }}
            alt="Live Office"
            className="absolute inset-0 w-full h-full object-cover object-center"
            draggable={false}
          />
          <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5 pointer-events-none" />

          {ZONES.map(zone => (
            <ZoneOverlay key={zone.id} zone={zone}
              active={activeZone === zone.id}
              onClick={() => toggleZone(zone.id)} />
          ))}
        </div>

        {/* Bottom panels — proper padding, min-height per panel */}
        <div className="px-6 py-4 shrink-0">
          <BottomPanels />
        </div>
      </div>

      {/* ── RIGHT CHAT PANEL ───────────────────────────── */}
      <div className="shrink-0 pt-5 pr-4 pb-4" style={{ width: 256 }}>
        <ChatPanel />
      </div>

    </div>
  );
}
