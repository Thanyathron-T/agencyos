"use client";

import { useState, useEffect } from "react";
import { initialChatMessages, chatMessagePool } from "@/lib/chibiData";
import type { ChatMessage } from "@/lib/chibiData";
import type { OfficeAgent } from "@/lib/officeData";
import AgentPanel from "./AgentPanel";
import StatusBadge from "./StatusBadge";

const zoneAvatarBg: Record<string, string> = {
  "z-marketing": "bg-pink-200 text-pink-700",
  "z-content":   "bg-sky-200 text-sky-700",
  "z-design":    "bg-violet-200 text-violet-700",
  "z-ads":       "bg-amber-200 text-amber-700",
  "z-support":   "bg-orange-200 text-orange-700",
  "z-ops":       "bg-blue-200 text-blue-700",
};

let msgIdCounter = 200;

interface FloatingChatProps {
  selectedAgent: OfficeAgent | null;
  onClose: () => void;
}

export default function FloatingChat({ selectedAgent, onClose }: FloatingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);

  useEffect(() => {
    let idx = 0;
    function schedule() {
      const delay = 4500 + Math.random() * 5000;
      return setTimeout(() => {
        const item = chatMessagePool[idx % chatMessagePool.length];
        idx++;
        msgIdCounter++;
        setMessages((prev) => [
          { ...item, id: `fcm${msgIdCounter}`, timeAgo: "เมื่อกี้" },
          ...prev,
        ].slice(0, 25));
        timer = schedule();
      }, delay);
    }
    let timer = schedule();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-3">

      {/* ── Agent detail panel (when selected) ── */}
      {selectedAgent && (
        <div className="animate-[fade-slide-in_0.2s_ease-out]">
          <AgentPanel agent={selectedAgent} onClose={onClose} />
        </div>
      )}

      {/* ── Chat room ── */}
      <div className="glass rounded-3xl overflow-hidden shadow-xl shadow-chibi-primary/10 flex flex-col"
        style={{ maxHeight: selectedAgent ? "340px" : "620px" }}>

        <div className="flex items-center justify-between px-4 py-3 bg-white/40 border-b border-chibi-primary/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base">💬</span>
            <span className="text-xs font-bold text-chibi-ink">ห้องแชทน้อง AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-600 font-semibold">Live</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto chibi-scroll divide-y divide-chibi-primary/8 min-h-0">
          {messages.map((msg, i) => {
            const avatarCls = zoneAvatarBg[msg.zoneId] ?? "bg-gray-100 text-gray-500";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 px-4 py-3 hover:bg-white/30 transition-colors ${i === 0 ? "chat-slide" : ""}`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${avatarCls}`}>
                  {msg.agentAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-chibi-ink">{msg.agentName}</span>
                    <span className="text-[9px] text-chibi-muted">{msg.timeAgo}</span>
                  </div>
                  <p className="text-xs text-chibi-ink/80 leading-relaxed">{msg.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Typing footer */}
        <div className="px-3 py-2.5 bg-white/40 border-t border-chibi-primary/10 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-xl border border-chibi-primary/15">
            <span className="text-sm">✨</span>
            <span className="text-[10px] text-chibi-muted flex-1">AI กำลังทำงาน...</span>
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-chibi-primary/60 dot-1" />
              <span className="w-1 h-1 rounded-full bg-chibi-primary/60 dot-2" />
              <span className="w-1 h-1 rounded-full bg-chibi-primary/60 dot-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Status legend */}
      <div className="glass rounded-2xl px-3 py-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
        <p className="w-full text-[10px] font-semibold text-chibi-muted mb-0.5">สถานะ</p>
        {(["working","reviewing","waiting","publishing","idle"] as const).map((s) => (
          <StatusBadge key={s} status={s} size="sm" />
        ))}
      </div>
    </div>
  );
}
