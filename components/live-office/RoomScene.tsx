"use client";

import type { OfficeAgent, OfficeStatus } from "@/lib/officeData";
import ChibiFigure, { type ChiPose } from "./ChibiFigure";

/* ── Per-zone visual theme ─────────────────────────────────────────── */
interface RoomTheme {
  wall: string;
  wallAccent: string;
  floor: string;
  curtain: string;
  windowSky: string;
  deskTop: string;
  deskFront: string;
  deskSide: string;
  plantLeaf: string;
  plantDark: string;
  hairColor: string;
  skinColor: string;
  shirtColor: string;
  emoji: string;
  wallDeco: string; // emoji shown on wall
  deskDeco: string; // emoji shown on desk
  label: string;
  labelColor: string;
}

const themes: Record<string, RoomTheme> = {
  "z-marketing": {
    wall: "#FFE8F4", wallAccent: "#FFB7D5", floor: "#FDF4F7",
    curtain: "#FFB7D5", windowSky: "#FFF0FA",
    deskTop: "#FFD9EC", deskFront: "#FFC5DF", deskSide: "#FFB0D2",
    plantLeaf: "#66BB6A", plantDark: "#388E3C",
    hairColor: "#FFB7D5", skinColor: "#FFF0F5", shirtColor: "#FFD0E8",
    emoji: "💖", wallDeco: "🌸", deskDeco: "🏆",
    label: "Marketing", labelColor: "#FF80B5",
  },
  "z-content": {
    wall: "#E8F6FF", wallAccent: "#8ED7FF", floor: "#F2FAFF",
    curtain: "#70CAFC", windowSky: "#D6EFFF",
    deskTop: "#C8E8FF", deskFront: "#B0DAFF", deskSide: "#98CCFF",
    plantLeaf: "#4CAF50", plantDark: "#2E7D32",
    hairColor: "#8ED7FF", skinColor: "#F0F8FF", shirtColor: "#B8E0FF",
    emoji: "🩵", wallDeco: "📚", deskDeco: "☕",
    label: "Content", labelColor: "#3DB8F5",
  },
  "z-design": {
    wall: "#F0EAFF", wallAccent: "#B794F4", floor: "#F9F6FF",
    curtain: "#B794F4", windowSky: "#E8DFFF",
    deskTop: "#DDD0FF", deskFront: "#CAB8FF", deskSide: "#B8A0FF",
    plantLeaf: "#81C784", plantDark: "#388E3C",
    hairColor: "#B794F4", skinColor: "#F5F0FF", shirtColor: "#D8C8FF",
    emoji: "💜", wallDeco: "🎨", deskDeco: "✏️",
    label: "Design", labelColor: "#9B6FE8",
  },
  "z-ads": {
    wall: "#FFF8E1", wallAccent: "#FFD54F", floor: "#FFFDE7",
    curtain: "#FFCA28", windowSky: "#FFF9C4",
    deskTop: "#FFF0A0", deskFront: "#FFE870", deskSide: "#FFE040",
    plantLeaf: "#66BB6A", plantDark: "#388E3C",
    hairColor: "#FFE29A", skinColor: "#FFFBF0", shirtColor: "#FFF0B8",
    emoji: "💛", wallDeco: "📈", deskDeco: "💰",
    label: "Ads", labelColor: "#F5A800",
  },
  "z-support": {
    wall: "#FFF1E8", wallAccent: "#FFCBA4", floor: "#FFF7F2",
    curtain: "#FFB07A", windowSky: "#FFE8D8",
    deskTop: "#FFD8B8", deskFront: "#FFC8A0", deskSide: "#FFB888",
    plantLeaf: "#81C784", plantDark: "#4CAF50",
    hairColor: "#FFCBA4", skinColor: "#FFF5F0", shirtColor: "#FFD8C0",
    emoji: "🧡", wallDeco: "💬", deskDeco: "🌱",
    label: "Support", labelColor: "#FF8C42",
  },
  "z-ops": {
    wall: "#E8F0FF", wallAccent: "#A7C4F0", floor: "#F2F6FF",
    curtain: "#7CA8E0", windowSky: "#D8E8FF",
    deskTop: "#C0D8FF", deskFront: "#A8C8FF", deskSide: "#90B8F8",
    plantLeaf: "#4CAF50", plantDark: "#2E7D32",
    hairColor: "#A7C4F0", skinColor: "#F0F5FF", shirtColor: "#C8DCFF",
    emoji: "💙", wallDeco: "💻", deskDeco: "⚙️",
    label: "Operations", labelColor: "#5B8DE8",
  },
};

/* ── Position helpers ──────────────────────────────────────────────── */
interface CharPos { cx: number; headCy: number; atDesk: boolean }

function positions(count: number): CharPos[] {
  switch (count) {
    case 1: return [{ cx: 170, headCy: 112, atDesk: true }];
    case 2: return [
      { cx: 148, headCy: 112, atDesk: true  },
      { cx: 268, headCy:  96, atDesk: false },
    ];
    case 3: return [
      { cx: 168, headCy: 112, atDesk: true  },
      { cx:  62, headCy:  94, atDesk: false },
      { cx: 275, headCy:  94, atDesk: false },
    ];
    default: return [ // 4+
      { cx: 122, headCy: 112, atDesk: true  },
      { cx: 208, headCy: 112, atDesk: true  },
      { cx:  46, headCy:  92, atDesk: false },
      { cx: 285, headCy:  92, atDesk: false },
    ];
  }
}

function getPose(status: OfficeStatus, atDesk: boolean): ChiPose {
  if (atDesk) {
    if (status === "idle")      return "sleeping";
    if (status === "reviewing") return "thinking";
    return "typing";
  }
  if (status === "publishing")  return "celebrating";
  if (status === "reviewing")   return "thinking";
  if (status === "idle")        return "sleeping";
  return "standing";
}

/* ── Room SVG (340 × 218) ─────────────────────────────────────────── */
interface RoomSVGProps {
  t: RoomTheme;
  agents: OfficeAgent[];
  bubbles: Record<string, string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function RoomSVG({ t, agents, bubbles, selectedId, onSelect }: RoomSVGProps) {
  const charPositions = positions(agents.length);

  return (
    <div className="relative w-full" style={{ paddingBottom: "64%" }}>
      <svg
        viewBox="0 0 340 218"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Floor ── */}
        <rect width="340" height="218" fill={t.floor} />

        {/* ── Back wall ── */}
        <rect width="340" height="92" fill={t.wall} />

        {/* ── Baseboard ── */}
        <rect y="90" width="340" height="3.5" fill={t.wallAccent} opacity="0.45" />

        {/* ── Floor grid lines (subtle) ── */}
        {[115, 138, 161, 184, 207].map((y) => (
          <line key={y} x1="0" y1={y} x2="340" y2={y} stroke={t.wallAccent} strokeWidth="0.4" opacity="0.22" />
        ))}
        {[60, 120, 180, 240, 300].map((x) => (
          <line key={x} x1={x} y1="93" x2={x} y2="218" stroke={t.wallAccent} strokeWidth="0.4" opacity="0.22" />
        ))}

        {/* ── Window ── */}
        <rect x="104" y="10" width="132" height="70" rx="6" fill={t.windowSky} stroke={t.wallAccent} strokeWidth="2.2" />
        {/* frame cross */}
        <line x1="170" y1="10" x2="170" y2="80" stroke={t.wallAccent} strokeWidth="1.4" opacity="0.55" />
        <line x1="104" y1="45" x2="236" y2="45" stroke={t.wallAccent} strokeWidth="1.4" opacity="0.55" />
        {/* reflection */}
        <rect x="106" y="12" width="58" height="20" rx="3" fill="white" opacity="0.28" />
        {/* Curtains */}
        <polygon points="104,10 80,10 90,80 104,80" fill={t.curtain} opacity="0.6" />
        <polygon points="236,10 260,10 250,80 236,80" fill={t.curtain} opacity="0.6" />
        {/* Curtain fold lines */}
        <line x1="86" y1="14" x2="91" y2="78" stroke="white" strokeWidth="1" opacity="0.35" />
        <line x1="254" y1="14" x2="249" y2="78" stroke="white" strokeWidth="1" opacity="0.35" />

        {/* ── Wall decorations ── */}
        <text x="22" y="38" fontSize="18">{t.wallDeco}</text>
        <text x="300" y="38" fontSize="14">{t.emoji}</text>
        {/* Zone label */}
        <text x="22" y="52" fontSize="8" fontWeight="700" fill={t.labelColor} opacity="0.75">{t.label.toUpperCase()}</text>

        {/* ── Small poster on wall ── */}
        <rect x="22" y="57" width="30" height="24" rx="2" fill="white" opacity="0.5" stroke={t.wallAccent} strokeWidth="0.8" />
        <rect x="24" y="59" width="26" height="6"  rx="1" fill={t.curtain} opacity="0.4" />
        <rect x="24" y="67" width="18" height="3"  rx="1" fill={t.wallAccent} opacity="0.3" />
        <rect x="24" y="72" width="22" height="3"  rx="1" fill={t.wallAccent} opacity="0.2" />

        {/* ── Characters (behind desk) ── */}
        {agents.map((agent, i) => {
          const pos  = charPositions[i] ?? charPositions[0];
          const pose = getPose(agent.status, pos.atDesk);
          const isSelected = selectedId === agent.id;

          return (
            <g
              key={agent.id}
              onClick={() => onSelect(agent.id)}
              style={{ cursor: "pointer" }}
            >
              {/* Selection ring */}
              {isSelected && (
                <circle cx={pos.cx} cy={pos.headCy} r={22}
                  fill="none" stroke={t.wallAccent} strokeWidth="2.5" strokeDasharray="4 3" opacity="0.7"
                />
              )}
              <ChibiFigure
                cx={pos.cx}
                headCy={pos.headCy}
                hairColor={t.hairColor}
                skinColor={t.skinColor}
                shirtColor={t.shirtColor}
                pose={pose}
                floatDelay={i * 0.45}
              />
            </g>
          );
        })}

        {/* ── Desk (in front of characters) ── */}
        {/* Top face */}
        <polygon points="62,148 278,148 294,162 78,162" fill={t.deskTop} />
        {/* Front face */}
        <rect x="78" y="162" width="216" height="24" fill={t.deskFront} />
        {/* Left side */}
        <polygon points="62,148 78,162 78,186 62,172" fill={t.deskSide} />
        {/* Desk shadow under */}
        <ellipse cx="186" cy="188" rx="106" ry="5" fill={t.deskSide} opacity="0.25" />

        {/* Monitor */}
        <rect x="147" y="116" width="46" height="32" rx="3.5" fill="#1E1830" />
        <rect x="147" y="116" width="46" height="32" rx="3.5" fill={t.wallAccent} opacity="0.12" />
        <rect x="163" y="148" width="14" height="5" fill="#2D2240" />
        <rect x="158" y="153" width="24" height="2.5" fill="#38304C" />
        {/* Screen glow */}
        <rect x="149" y="118" width="42" height="28" rx="2" fill={t.labelColor} opacity="0.18" />

        {/* Desk item emoji */}
        <text x="94" y="154" fontSize="13">{t.deskDeco}</text>

        {/* Keyboard */}
        <rect x="185" y="153" width="48" height="10" rx="2" fill={t.deskSide} opacity="0.6" />
        <rect x="187" y="155" width="44" height="6"  rx="1" fill={t.deskTop} opacity="0.7" />

        {/* ── Plant (right corner) ── */}
        <polygon points="294,211 316,211 312,200 298,200" fill="#A0785A" />
        <rect x="294" y="198" width="22" height="5" rx="1.5" fill="#7A5540" />
        <circle cx="305" cy="185" r="17"  fill={t.plantLeaf} />
        <circle cx="292" cy="190" r="12"  fill={t.plantDark} />
        <circle cx="318" cy="190" r="12"  fill={t.plantDark} />
        <circle cx="305" cy="177" r="10"  fill={t.plantLeaf} opacity="0.8" />

        {/* ── Small rug ── */}
        <ellipse cx="170" cy="204" rx="72" ry="10" fill={t.curtain} opacity="0.18" />
      </svg>

      {/* ── Speech bubbles (HTML, absolute over SVG) ── */}
      {agents.map((agent, i) => {
        const msg = bubbles[agent.id];
        if (!msg) return null;
        const pos = charPositions[i] ?? charPositions[0];
        // Convert SVG coords → % of container
        const leftPct = (pos.cx / 340) * 100;
        const topPct  = Math.max(2, ((pos.headCy - 28) / 218) * 100);

        return (
          <div
            key={agent.id}
            className="bubble-in pointer-events-none absolute z-20"
            style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: "translateX(-50%)" }}
          >
            <div className="glass rounded-2xl rounded-bl-sm px-2.5 py-1.5 text-[10px] font-semibold text-chibi-ink whitespace-nowrap max-w-[130px] text-center shadow-lg leading-snug">
              {msg}
            </div>
            <div className="mx-auto w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-white/60" />
          </div>
        );
      })}
    </div>
  );
}

/* ── Public component ─────────────────────────────────────────────── */
interface RoomSceneProps {
  zoneId: string;
  zoneName: string;
  agents: OfficeAgent[];
  bubbles: Record<string, string>;
  selectedAgentId: string | null;
  onAgentSelect: (id: string) => void;
}

export default function RoomScene({
  zoneId, agents, bubbles, selectedAgentId, onAgentSelect,
}: RoomSceneProps) {
  const theme = themes[zoneId] ?? themes["z-ops"];
  const activeCount = agents.filter((a) => a.status !== "idle").length;

  return (
    <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      style={{ border: `1.5px solid ${theme.wallAccent}55` }}>
      {/* Room header chip */}
      <div
        className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold"
        style={{ background: `${theme.wall}ee`, color: theme.labelColor }}
      >
        <span>{theme.emoji} {theme.label}</span>
        <span style={{ color: theme.labelColor, opacity: 0.7 }}>
          {activeCount}/{agents.length} online
        </span>
      </div>

      <RoomSVG
        t={theme}
        agents={agents}
        bubbles={bubbles}
        selectedId={selectedAgentId}
        onSelect={onAgentSelect}
      />
    </div>
  );
}
