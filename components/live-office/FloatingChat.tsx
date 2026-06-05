"use client";

import { useState, useEffect } from "react";
import { initialChatMessages, chatMessagePool } from "@/lib/chibiData";
import type { ChatMessage } from "@/lib/chibiData";
import type { OfficeAgent } from "@/lib/officeData";
import AgentPanel from "./AgentPanel";
import StatusBadge from "./StatusBadge";

const zoneAvatar: Record<string, string> = {
  "z-marketing": "bg-[#E96FA0]/25 text-[#F9A8D4]",
  "z-content":   "bg-[#4FB8C8]/25 text-[#7DD3FC]",
  "z-design":    "bg-[#9B6FE0]/25 text-[#C8A8F0]",
  "z-ads":       "bg-[#E0A94E]/25 text-[#FCD34D]",
  "z-support":   "bg-[#E0866E]/25 text-[#FFB088]",
  "z-ops":       "bg-[#5B82D8]/25 text-[#93C5FD]",
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
      {selectedAgent && (
        <div className="animate-[fade-slide-in_0.2s_ease-out]">
          <AgentPanel agent={selectedAgent} onClose={onClose} />
        </div>
      )}

      {/* Chat room */}
      <div className="dglass rounded-[28px] overflow-hidden flex flex-col"
        style={{ maxHeight: selectedAgent ? "340px" : "600px" }}>
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-[#A88CE8]/15 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base">💬</span>
            <span className="text-xs font-bold text-[#F4EEFF]">ห้องแชทน้อง AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-300 font-semibold">Live</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto dscroll divide-y divide-[#A88CE8]/8 min-h-0">
          {messages.map((msg, i) => {
            const av = zoneAvatar[msg.zoneId] ?? "bg-white/10 text-[#A99FC8]";
            return (
              <div key={msg.id}
                className={`flex items-start gap-2.5 px-4 py-3 hover:bg-white/5 transition-colors ${i === 0 ? "kw-chat" : ""}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${av}`}>
                  {msg.agentAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-[#F4EEFF]">{msg.agentName}</span>
                    <span className="text-[9px] text-[#8A7DB0]">{msg.timeAgo}</span>
                  </div>
                  <p className="text-xs text-[#D8CFF0] leading-relaxed">{msg.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Typing footer */}
        <div className="px-3 py-2.5 bg-white/5 border-t border-[#A88CE8]/15 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1638]/60 rounded-xl border border-[#A88CE8]/15">
            <span className="text-sm">✨</span>
            <span className="text-[10px] text-[#A99FC8] flex-1">น้อง AI กำลังพิมพ์…</span>
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC] kw-dot1" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC] kw-dot2" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC] kw-dot3" />
            </div>
          </div>
        </div>
      </div>

      {/* Status legend */}
      <div className="dglass rounded-2xl px-3 py-2.5 flex flex-wrap gap-x-2 gap-y-1.5">
        <p className="w-full text-[10px] font-semibold text-[#A99FC8] mb-0.5">สถานะน้องๆ</p>
        {(["working", "reviewing", "waiting", "publishing", "idle"] as const).map((s) => (
          <StatusBadge key={s} status={s} size="sm" />
        ))}
      </div>
    </div>
  );
}
