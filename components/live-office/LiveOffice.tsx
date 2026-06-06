"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { officeAgents, companyHealth } from "@/lib/officeData";
import { thaiConversations } from "@/lib/chibiData";
import { buildPlacements } from "./IsometricOffice";
import IsometricOffice from "./IsometricOffice";
import AgentPanel from "./AgentPanel";
import StatusBadge from "./StatusBadge";
import { characterStyles, fallbackStyle } from "@/lib/characterStyles";
import ChibiSprite from "@/components/characters/ChibiSprite";
import { supabase, type AgentRow, type TaskRow } from "@/lib/supabase";
import { seedIfNeeded } from "@/lib/seedSupabase";

const VISIBLE_IDS = buildPlacements().map((p) => p.agentId);

const statusDot: Record<string, string> = {
  working: "#6EE7B7",
  reviewing: "#FCD34D",
  waiting: "#C084FC",
  publishing: "#7DD3FC",
  idle: "#4A4068",
};

const zoneColor: Record<string, string> = {
  "z-marketing": "#C084FC",
  "z-content": "#34D399",
  "z-design": "#F472B6",
  "z-ads": "#FCD34D",
  "z-support": "#FB923C",
  "z-ops": "#60A5FA",
};

const colorKeyToHex: Record<string, string> = {
  violet: "#C084FC",
  cyan: "#34D399",
  pink: "#F472B6",
  amber: "#FCD34D",
  emerald: "#FB923C",
  blue: "#60A5FA",
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function LiveOffice() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Record<string, string>>({});
  const [panelOpen, setPanelOpen] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Supabase state
  const [dbAgents, setDbAgents] = useState<AgentRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [dbReady, setDbReady] = useState(false);

  /* Seed + initial fetch */
  useEffect(() => {
    async function init() {
      await seedIfNeeded();

      const [{ data: agentData }, { data: taskData }] = await Promise.all([
        supabase.from('agents').select('*').order('id'),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      if (agentData) setDbAgents(agentData as AgentRow[]);
      if (taskData) setTasks(taskData as TaskRow[]);
      setDbReady(true);
    }
    init();
  }, []);

  /* Realtime subscription for new tasks */
  useEffect(() => {
    const channel = supabase
      .channel('tasks')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          setTasks((prev) => [payload.new as TaskRow, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  /* Ambient speech bubbles */
  useEffect(() => {
    const visible = officeAgents.filter((a) => VISIBLE_IDS.includes(a.id));
    function loop() {
      timer.current = setTimeout(() => {
        const agent = visible[Math.floor(Math.random() * visible.length)];
        const msgs = thaiConversations[agent.zoneId] ?? [];
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        if (msg) {
          setBubbles((p) => ({ ...p, [agent.id]: msg }));
          setTimeout(() => setBubbles((p) => { const n = { ...p }; delete n[agent.id]; return n; }), 3800);
        }
        loop();
      }, 2800 + Math.random() * 4200);
    }
    loop();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  const selectedAgent = selectedAgentId ? officeAgents.find((a) => a.id === selectedAgentId) ?? null : null;
  const select = (id: string) => setSelectedAgentId((p) => (p === id ? null : id));

  // Derived stats from Supabase (fall back to mock if not ready)
  const onlineCount = dbReady
    ? dbAgents.filter((a) => a.status !== "idle").length
    : officeAgents.filter((a) => a.status !== "idle").length;

  const totalCount = dbReady ? dbAgents.length : officeAgents.length;

  const statusCounts = (["working", "reviewing", "idle"] as const).map((s) => ({
    s,
    count: dbReady
      ? dbAgents.filter((a) => a.status === s).length
      : officeAgents.filter((a) => a.status === s).length,
  }));

  const zoneCounts: Record<string, number> = {};
  (dbReady ? dbAgents : officeAgents).forEach((a) => {
    const z = 'zoneId' in a ? (a as { zoneId: string }).zoneId : (a as AgentRow).zone_id;
    zoneCounts[z] = (zoneCounts[z] ?? 0) + 1;
  });

  const kpiStats = [
    { label: "MRR", value: companyHealth.mrr, sub: companyHealth.mrrChange, up: true },
    { label: "Outputs", value: dbReady ? tasks.length * 5 : companyHealth.outputsToday, sub: "today" },
    { label: "Projects", value: companyHealth.activeProjects, sub: "active" },
    { label: "Online", value: `${onlineCount}/${totalCount}`, sub: "agents" },
  ];

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: "#070512" }}>

      {/* ── LEFT RAIL ── */}
      <AnimatePresence initial={false}>
        {panelOpen && (
          <motion.aside
            key="rail"
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="w-60 flex-shrink-0 flex flex-col border-r overflow-hidden z-10"
            style={{
              background: "rgba(10,7,22,0.92)",
              borderColor: "rgba(120,80,220,0.15)",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Header */}
            <div className="px-4 pt-5 pb-4 border-b" style={{ borderColor: "rgba(120,80,220,0.12)" }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: "linear-gradient(135deg, #6E28D9, #2563EB)" }}>
                  ◈
                </div>
                <span className="text-sm font-bold text-white tracking-tight">Live Office</span>
                {dbReady && (
                  <span className="ml-auto text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
                    live
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-300">{onlineCount} agents active</span>
              </div>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-2 gap-2 px-3 py-3 border-b" style={{ borderColor: "rgba(120,80,220,0.1)" }}>
              {kpiStats.map((k) => (
                <div key={k.label} className="rounded-xl px-2.5 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="text-[9px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "rgba(160,140,200,0.7)" }}>{k.label}</div>
                  <div className="text-sm font-bold text-white leading-none">{k.value}</div>
                  {k.sub && <div className={`text-[9px] mt-0.5 ${k.up ? "text-emerald-400" : "text-[#7A6FA0]"}`}>{k.sub}</div>}
                </div>
              ))}
            </div>

            {/* Agent roster — visual uses officeAgents for chibi sprites */}
            <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "rgba(160,140,200,0.6)" }}>Agents</p>
              <div className="space-y-1">
                {officeAgents.slice(0, 12).map((a) => {
                  const style = characterStyles[a.id] ?? fallbackStyle;
                  const sel = selectedAgentId === a.id;
                  // Use live status from Supabase if available
                  const liveAgent = dbAgents.find((d) => d.id === a.id);
                  const status = liveAgent ? liveAgent.status : a.status;
                  const dot = statusDot[status] ?? "#4A4068";
                  const zc = zoneColor[a.zoneId] ?? "#A88CE8";
                  return (
                    <button
                      key={a.id}
                      onClick={() => select(a.id)}
                      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all text-left"
                      style={{
                        background: sel ? `${zc}18` : "transparent",
                        border: sel ? `1px solid ${zc}40` : "1px solid transparent",
                      }}
                    >
                      <div className="relative flex-shrink-0">
                        <svg viewBox="0 0 70 62" width="34" height="30">
                          <ChibiSprite cx={35} headCy={30} scale={0.62} style={style} pose="sitting" idleClass="" />
                        </svg>
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#0A0714]" style={{ background: dot }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-white truncate leading-tight">
                          {liveAgent ? liveAgent.name : a.name}
                        </div>
                        <div className="text-[9px] truncate leading-tight" style={{ color: "rgba(160,140,200,0.6)" }}>
                          {liveAgent ? liveAgent.role : a.role}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Activity feed — realtime tasks from Supabase */}
            <div className="border-t px-3 py-3" style={{ borderColor: "rgba(120,80,220,0.12)" }}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(160,140,200,0.6)" }}>Recent</p>
              <div className="space-y-2">
                {tasks.slice(0, 4).map((ev) => {
                  const zc = colorKeyToHex[ev.color_key] ?? "#A88CE8";
                  return (
                    <div key={ev.id} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: zc }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold" style={{ color: zc }}>{ev.agent_name}</span>
                        <span className="text-[10px]" style={{ color: "rgba(200,190,230,0.7)" }}> {ev.action}</span>
                        <div className="text-[9px] mt-0.5" style={{ color: "rgba(160,140,200,0.5)" }}>
                          {timeAgo(ev.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status legend */}
            <div className="px-3 pb-4 pt-2 border-t" style={{ borderColor: "rgba(120,80,220,0.1)" }}>
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                {(["working", "reviewing", "waiting", "publishing", "idle"] as const).map((s) => (
                  <StatusBadge key={s} status={s} size="sm" />
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── MAIN OFFICE CANVAS ── */}
      <div className="flex-1 relative overflow-hidden">

        {/* Toggle rail button */}
        <button
          onClick={() => setPanelOpen((p) => !p)}
          className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            background: "rgba(18,10,40,0.85)",
            border: "1px solid rgba(120,80,220,0.3)",
            backdropFilter: "blur(8px)",
            color: "rgba(160,140,200,0.8)",
          }}
          title={panelOpen ? "Hide panel" : "Show panel"}
        >
          {panelOpen ? "←" : "→"}
        </button>

        {/* The office fills the entire space */}
        <div className="absolute inset-0">
          <IsometricOffice bubbles={bubbles} selectedAgentId={selectedAgentId} onAgentSelect={select} />
        </div>

        {/* ── FLOATING AGENT DETAIL PANEL ── */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div
              key="agent-detail"
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="absolute top-4 right-4 z-30 w-72"
            >
              <AgentPanel agent={selectedAgent} onClose={() => setSelectedAgentId(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BOTTOM STATUS BAR ── */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-full"
          style={{
            background: "rgba(12,8,28,0.88)",
            border: "1px solid rgba(120,80,220,0.25)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-300">All systems operational</span>
          <span className="w-px h-3 bg-white/10" />
          {statusCounts.map(({ s, count }) => (
            <span key={s} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusDot[s] }} />
              <span className="text-[10px]" style={{ color: "rgba(200,180,240,0.65)" }}>{count} {s}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
