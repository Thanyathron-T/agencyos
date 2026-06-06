"use client";

import { officeAgents } from "@/lib/officeData";
import type { OfficeStatus } from "@/lib/officeData";
import CharacterRenderer from "@/components/characters/CharacterRenderer";
import type { CharacterPose } from "@/components/characters/types";
import { motion, AnimatePresence } from "framer-motion";

/* ════════════════════════════════════════════
   ISO HELPERS
═══════════════════════════════════════════ */
const rh = (cx: number, cy: number, w: number, d: number) =>
  `${cx},${cy - d} ${cx + w},${cy} ${cx},${cy + d} ${cx - w},${cy}`;

function Cuboid({
  cx, cy, w, d, h, top, left, right, opacity = 1,
}: { cx: number; cy: number; w: number; d: number; h: number; top: string; left: string; right: string; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <polygon points={`${cx - w},${cy} ${cx},${cy + d} ${cx},${cy + d + h} ${cx - w},${cy + h}`} fill={left} />
      <polygon points={`${cx},${cy + d} ${cx + w},${cy} ${cx + w},${cy + h} ${cx},${cy + d + h}`} fill={right} />
      <polygon points={rh(cx, cy, w, d)} fill={top} />
    </g>
  );
}

/* Low partition wall (room divider) */
function Partition({ x1, y1, x2, y2, c = "#2A2248" }: { x1: number; y1: number; x2: number; y2: number; c?: string }) {
  const h = 36;
  return (
    <g opacity={0.85}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={3} />
      <line x1={x1} y1={y1 - h} x2={x2} y2={y2 - h} stroke={c} strokeWidth={2} opacity={0.6} />
      <line x1={x1} y1={y1} x2={x1} y2={y1 - h} stroke={c} strokeWidth={1.5} opacity={0.4} />
      <line x1={x2} y1={y2} x2={x2} y2={y2 - h} stroke={c} strokeWidth={1.5} opacity={0.4} />
    </g>
  );
}

function Plant({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M -9 7 L 9 7 L 7 -7 L -7 -7 Z" fill="#3A2A1E" />
      <path d="M -9 7 L 9 7 L 8 0 L -8 0 Z" fill="#28201A" />
      <ellipse cx="0" cy="-22" rx="14" ry="17" fill="#3E7D4E" />
      <ellipse cx="-10" cy="-14" rx="9" ry="13" fill="#2E5E3A" />
      <ellipse cx="10" cy="-14" rx="9" ry="13" fill="#4A8F5A" />
      <ellipse cx="0" cy="-32" rx="9" ry="12" fill="#4A8F5A" />
      <path d="M -3 -20 q 3 -8 1 -16" stroke="#6FB87A" strokeWidth="1.4" fill="none" opacity="0.5" />
    </g>
  );
}

function Monitor({ x, y, glow, dual = true }: { x: number; y: number; glow: string; dual?: boolean }) {
  const offsets = dual ? [-18, 18] : [0];
  return (
    <g>
      <Cuboid cx={x} cy={y} w={dual ? 30 : 22} d={15} h={3} top="#1E1A2E" left="#15121F" right="#191525" />
      {offsets.map((dx, i) => (
        <g key={i} transform={`translate(${x + dx},${y - 30})`}>
          <polygon points="-14,0 14,0 11,-22 -11,-22" fill="#0D0B16" />
          <polygon points="-11,-2 11,-2 9,-20 -9,-20" fill={glow} opacity="0.65" className="screen-glow" />
          <line x1="-6" y1="-8" x2="6" y2="-8" stroke="#fff" strokeWidth="0.8" opacity="0.3" />
          <line x1="-6" y1="-12" x2="3" y2="-12" stroke="#fff" strokeWidth="0.8" opacity="0.2" />
        </g>
      ))}
      <ellipse cx={x} cy={y - 16} rx={dual ? 44 : 28} ry={22} fill={glow} opacity="0.14" />
    </g>
  );
}

function Lamp({ x, y, c = "#FFB860", size = 1 }: { x: number; y: number; c?: string; size?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${size})`}>
      <circle cx={0} cy={22} r={52} fill={c} opacity="0.18" className="light-flick" />
      <line x1={0} y1={-78} x2={0} y2={-6} stroke="#2A2238" strokeWidth="2.5" />
      <polygon points="-14,-4 14,-4 9,-18 -9,-18" fill="#3A2E1E" />
      <ellipse cx={0} cy={-4} rx={14} ry={4} fill={c} opacity="0.85" />
      <circle cx={0} cy={-8} r={4} fill="#FFF0C8" opacity="0.9" />
    </g>
  );
}

function Bookshelf({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  const books = ["#8B4A4A", "#4A6B8B", "#7A5A8B", "#8B7A4A", "#4A8B6B", "#8B5A4A"];
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -1 : 1},1)`}>
      <polygon points="0,0 44,22 44,-78 0,-100" fill="#2A1E14" />
      <polygon points="0,0 44,22 44,18 0,-4" fill="#1A1209" />
      {[-4, -30, -56].map((sy, r) => (
        <g key={r}>
          <polygon points={`2,${sy} 42,${sy + 20} 42,${sy + 16} 2,${sy - 4}`} fill="#1A1209" />
          {books.slice(0, 5).map((c, b) => (
            <polygon key={b} points={`${4 + b * 8},${sy - 4 - b} ${10 + b * 8},${sy - 1 - b} ${10 + b * 8},${sy - 19 - b} ${4 + b * 8},${sy - 22 - b}`} fill={c} opacity="0.9" />
          ))}
        </g>
      ))}
    </g>
  );
}

function NeonSign({ x, y, text, color, size = 18 }: { x: number; y: number; text: string; color: string; size?: number }) {
  return (
    <g filter="url(#neon)">
      <text x={x} y={y} fontSize={size} fontWeight="800" fill={color} textAnchor="middle" letterSpacing="2px">{text}</text>
    </g>
  );
}

function RoomLabel({ x, y, label, color, icon }: { x: number; y: number; label: string; color: string; icon: string }) {
  return (
    <g>
      <rect x={x - 54} y={y - 14} width={108} height={22} rx={5} fill="rgba(10,7,20,0.85)" stroke={color} strokeWidth="1" opacity="0.9" />
      <text x={x} y={y + 3} fontSize={9} fontWeight="700" fill={color} textAnchor="middle" letterSpacing="1.5px">{icon} {label}</text>
    </g>
  );
}

function Whiteboard({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Cuboid cx={x} cy={y} w={40} d={5} h={55} top="#2A2248" left="#1A1530" right="#221A3C" />
      <polygon points={`${x - 34},${y - 55} ${x + 34},${y - 55} ${x + 34},${y - 18} ${x - 34},${y - 18}`} fill="#1E1B38" />
      <polygon points={`${x - 30},${y - 52} ${x + 30},${y - 52} ${x + 30},${y - 21} ${x - 30},${y - 21}`} fill="#16132A" />
      <line x1={x - 20} y1={y - 44} x2={x + 22} y2={y - 44} stroke="#6E56E0" strokeWidth="1.2" opacity="0.7" />
      <line x1={x - 20} y1={y - 38} x2={x + 10} y2={y - 38} stroke="#E96FA0" strokeWidth="1.2" opacity="0.5" />
      <line x1={x - 20} y1={y - 32} x2={x + 16} y2={y - 32} stroke="#4FC8B8" strokeWidth="1.2" opacity="0.5" />
      <circle cx={x + 18} cy={y - 32} r="3" fill="#4FC8B8" opacity="0.8" />
    </g>
  );
}

function RoundTable({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy + 6} rx="46" ry="20" fill="#2A1E14" opacity="0.6" />
      <ellipse cx={cx} cy={cy} rx="46" ry="20" fill="#5A3E26" />
      <ellipse cx={cx} cy={cy} rx="40" ry="16" fill="#6A4E32" />
      <ellipse cx={cx} cy={cy} rx="34" ry="12" fill="#7A5E42" opacity="0.5" />
      <circle cx={cx - 10} cy={cy - 2} r="4" fill="#C88A4A" opacity="0.7" />
      <circle cx={cx + 12} cy={cy + 4} r="3.5" fill="#8B5A3A" opacity="0.6" />
    </g>
  );
}

function Chair({ x, y, angle = 0, c = "#2A2840" }: { x: number; y: number; angle?: number; c?: string }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`}>
      <ellipse cx={0} cy={0} rx={10} ry={5} fill={c} />
      <rect x={-8} y={-14} width={16} height={12} rx={2} fill={c} opacity={0.9} />
    </g>
  );
}

function Pet({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="6" rx="13" ry="4" fill="#000" opacity="0.25" />
      <ellipse cx="0" cy="0" rx="13" ry="8" fill="#4A4458" />
      <circle cx="11" cy="-5" r="6" fill="#524C62" />
      <polygon points="7,-9 6,-15 12,-11" fill="#4A4458" />
      <polygon points="16,-9 18,-15 13,-11" fill="#4A4458" />
      <circle cx="10" cy="-5" r="1.3" fill="#FFD86B" />
      <circle cx="14" cy="-5" r="1.3" fill="#FFD86B" />
      <path className="kw-tail" d="M -11 0 Q -20 -4 -18 -12" stroke="#4A4458" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ════════════════════════════════════════════
   ZONE DEFINITIONS
═══════════════════════════════════════════ */
interface Slot { agentId: string; dx: number; dy: number; pose: CharacterPose }
interface Zone {
  id: string; ax: number; ay: number;
  glow: string; ring: string; label: string; icon: string;
  chars: Slot[];
  shelf?: { dx: number; dy: number; flip?: boolean };
  plant?: { dx: number; dy: number; s?: number };
  lamp?: { dx: number; dy: number };
  whiteboard?: { dx: number; dy: number };
}

/* 5 rooms mapped to the SVG floor */
const ZONES: Zone[] = [
  {
    id: "z-design",
    label: "CREATIVE STUDIO",
    icon: "✦",
    ax: 420, ay: 350,
    glow: "#FF6FB0", ring: "#F472B6",
    chars: [
      { agentId: "oa8", dx: 34, dy: -22, pose: "typing" },
      { agentId: "oa9", dx: -56, dy: 10, pose: "coffee" },
    ],
    shelf: { dx: -118, dy: -8, flip: true },
    plant: { dx: 94, dy: 6, s: 0.9 },
    lamp: { dx: 0, dy: -68 },
  },
  {
    id: "z-ads",
    label: "ADS COMMAND",
    icon: "◈",
    ax: 1060, ay: 350,
    glow: "#FFC857", ring: "#FCD34D",
    chars: [
      { agentId: "oa10", dx: 34, dy: -22, pose: "typing" },
      { agentId: "oa12", dx: -56, dy: 10, pose: "talking" },
    ],
    shelf: { dx: 118, dy: -8 },
    plant: { dx: -90, dy: 6, s: 0.9 },
    lamp: { dx: 0, dy: -68 },
  },
  {
    id: "z-ops",
    label: "ANALYTICS ROOM",
    icon: "◉",
    ax: 1060, ay: 560,
    glow: "#4EA8FF", ring: "#60A5FA",
    chars: [
      { agentId: "oa15", dx: 34, dy: -22, pose: "typing" },
      { agentId: "oa16", dx: -56, dy: 10, pose: "thinking" },
    ],
    plant: { dx: 94, dy: 6, s: 0.85 },
    lamp: { dx: 0, dy: -68 },
    whiteboard: { dx: -90, dy: 0 },
  },
  {
    id: "z-marketing",
    label: "FOCUS LOUNGE",
    icon: "◇",
    ax: 380, ay: 570,
    glow: "#A78BFA", ring: "#C084FC",
    chars: [
      { agentId: "oa3", dx: 34, dy: -22, pose: "typing" },
      { agentId: "oa1", dx: -56, dy: 10, pose: "talking" },
    ],
    plant: { dx: -90, dy: 6, s: 0.9 },
    lamp: { dx: 0, dy: -68 },
  },
  {
    id: "z-content",
    label: "CONTENT LAB",
    icon: "❖",
    ax: 720, ay: 460,
    glow: "#4FC8B8", ring: "#34D399",
    chars: [
      { agentId: "oa5", dx: 32, dy: -22, pose: "typing" },
      { agentId: "oa7", dx: -50, dy: 8, pose: "thinking" },
    ],
    plant: { dx: 80, dy: 8, s: 0.8 },
    lamp: { dx: 0, dy: -68 },
  },
];

/* PM Meeting room (special round-table setup) */
const MEETING = {
  ax: 720, ay: 280,
  chars: [
    { agentId: "oa2", dx: -6, dy: -50, pose: "talking" as CharacterPose },
    { agentId: "oa4", dx: 60, dy: -10, pose: "thinking" as CharacterPose },
    { agentId: "oa11", dx: -60, dy: -10, pose: "coffee" as CharacterPose },
  ],
};

/* Walker in the corridor */
const WALKER = { agentId: "oa17", x: 560, y: 430, pose: "talking" as CharacterPose };

function applyStatus(base: CharacterPose, s: OfficeStatus): CharacterPose {
  if (s === "idle") return "sleeping";
  if (s === "publishing") return "celebrating";
  if (s === "reviewing") return "thinking";
  return base;
}

const byId = new Map(officeAgents.map((a) => [a.id, a] as const));

export function buildPlacements() {
  const list: { agentId: string; x: number; headCy: number }[] = [];
  for (const z of ZONES)
    for (const c of z.chars)
      list.push({ agentId: c.agentId, x: z.ax + c.dx, headCy: z.ay + c.dy });
  for (const c of MEETING.chars)
    list.push({ agentId: c.agentId, x: MEETING.ax + c.dx, headCy: MEETING.ay + c.dy });
  list.push({ agentId: WALKER.agentId, x: WALKER.x, headCy: WALKER.y });
  return list;
}

/* ════════════════════════════════════════════
   STATUS RING COLOR
═══════════════════════════════════════════ */
const statusRing: Record<OfficeStatus, string> = {
  working: "#6EE7B7",
  reviewing: "#FCD34D",
  waiting: "#C084FC",
  publishing: "#7DD3FC",
  idle: "#4A4068",
};

/* ════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════ */
interface Props {
  bubbles: Record<string, string>;
  selectedAgentId: string | null;
  onAgentSelect: (id: string) => void;
}

export default function IsometricOffice({ bubbles, selectedAgentId, onAgentSelect }: Props) {
  const S = 0.62;

  /* Floor plank lines */
  const planks: React.ReactNode[] = [];
  for (let k = 0.06; k < 1; k += 0.085)
    planks.push(<line key={`p${k}`} x1={60 + 720 * k} y1={560 + 360 * k} x2={780 + 720 * k} y2={200 + 360 * k} stroke="#3A2614" strokeWidth="1.2" opacity="0.4" />);
  for (let k = 0.1; k < 1; k += 0.18)
    planks.push(<line key={`q${k}`} x1={60 + 720 * k} y1={560 - 360 * k} x2={780 + 720 * k} y2={920 - 360 * k} stroke="#3A2614" strokeWidth="0.9" opacity="0.18" />);

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Atmosphere */}
          <radialGradient id="amb" cx="50%" cy="38%" r="80%">
            <stop offset="0%" stopColor="#1E1540" />
            <stop offset="60%" stopColor="#100C28" />
            <stop offset="100%" stopColor="#070512" />
          </radialGradient>

          {/* Floor */}
          <linearGradient id="floorG" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#7A5030" />
            <stop offset="100%" stopColor="#3C2010" />
          </linearGradient>

          {/* Walls */}
          <linearGradient id="wL" x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0%" stopColor="#221A42" /><stop offset="100%" stopColor="#16103A" />
          </linearGradient>
          <linearGradient id="wR" x1="1" y1="0" x2="0" y2="0.3">
            <stop offset="0%" stopColor="#1C1638" /><stop offset="100%" stopColor="#110E2E" />
          </linearGradient>

          {/* Night sky */}
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A3A6A" /><stop offset="100%" stopColor="#1A2248" />
          </linearGradient>

          {/* Vignette */}
          <radialGradient id="vig" cx="50%" cy="46%" r="74%">
            <stop offset="52%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.65" />
          </radialGradient>

          {/* Room glow pads */}
          {ZONES.map((z) => (
            <radialGradient key={`rg${z.id}`} id={`rg${z.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={z.glow} stopOpacity="0.22" />
              <stop offset="100%" stopColor={z.glow} stopOpacity="0" />
            </radialGradient>
          ))}
          <radialGradient id="rgmeeting" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>

          {/* Neon glow filter */}
          <filter id="neon" x="-40%" y="-80%" width="180%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="neonSoft" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Background ── */}
        <rect width="1440" height="900" fill="url(#amb)" />

        {/* ── Back walls ── */}
        <polygon points="60,560 780,200 780,-20 60,340" fill="url(#wL)" />
        <polygon points="780,200 1380,560 1380,340 780,-20" fill="url(#wR)" />
        {/* Wall base shadow */}
        <polygon points="60,560 780,200 780,212 62,568" fill="#0A0718" opacity="0.7" />
        <polygon points="780,200 1380,560 1380,572 780,212" fill="#0A0718" opacity="0.7" />

        {/* ── Wall decorations ── */}
        {/* Left wall windows */}
        {[0.28, 0.58].map((t, i) => {
          const x = 60 + 720 * t, y = 560 - 360 * t;
          return (
            <g key={`wl${i}`}>
              <polygon points={`${x},${y - 60} ${x + 94},${y - 107} ${x + 94},${y - 207} ${x},${y - 160}`} fill="url(#sky)" />
              <polygon points={`${x},${y - 60} ${x + 94},${y - 107} ${x + 94},${y - 207} ${x},${y - 160}`} fill="none" stroke="#0E0A20" strokeWidth="3.5" />
              {/* Window pane divider */}
              <line x1={x + 47} y1={y - 67} x2={x + 47} y2={y - 200} stroke="#0E0A20" strokeWidth="1.5" opacity="0.8" />
              <line x1={x} y1={y - 134} x2={x + 94} y2={y - 157} stroke="#0E0A20" strokeWidth="1.5" opacity="0.8" />
              <circle cx={x + 54} cy={y - 164} r="7" fill="#FFF3C8" opacity="0.65" />
              <circle cx={x + 22} cy={y - 110} r="1.5" fill="#fff" opacity="0.7" />
              <circle cx={x + 72} cy={y - 178} r="1.2" fill="#fff" opacity="0.55" />
            </g>
          );
        })}
        {/* Right wall window */}
        {[0.52].map((t, i) => {
          const x = 780 + 720 * t, y = 200 + 360 * t;
          return (
            <g key={`wr${i}`}>
              <polygon points={`${x},${y - 60} ${x - 94},${y - 107} ${x - 94},${y - 207} ${x},${y - 160}`} fill="url(#sky)" />
              <polygon points={`${x},${y - 60} ${x - 94},${y - 107} ${x - 94},${y - 207} ${x},${y - 160}`} fill="none" stroke="#0E0A20" strokeWidth="3.5" />
              <circle cx={x - 50} cy={y - 155} r="6" fill="#FFF3C8" opacity="0.55" />
            </g>
          );
        })}

        {/* Wall text & art */}
        <text x="1050" y="82" fontSize="22" fontWeight="800" fill="#E8C878" opacity="0.45" transform="skewY(-26.5 1050 82)">PLAN</text>
        <text x="1050" y="112" fontSize="22" fontWeight="800" fill="#E8C878" opacity="0.45" transform="skewY(-26.5 1050 112)">BUILD</text>
        <text x="1050" y="142" fontSize="22" fontWeight="800" fill="#E8C878" opacity="0.45" transform="skewY(-26.5 1050 142)">GROW</text>

        {/* String lights on left wall */}
        {Array.from({ length: 18 }).map((_, i) => (
          <circle key={i} cx={100 + i * 42} cy={152 + (i % 3) * 8} r="2.6" fill="#FFD98A" opacity={0.7 + (i % 2) * 0.2} className="light-flick" />
        ))}

        {/* Neon signs on walls */}
        <NeonSign x={300} y={114} text="FOCUS MODE" color="#FF3FA0" size={17} />
        <NeonSign x={1260} y={430} text="LAUNCH" color="#4FC8B8" size={16} />
        <NeonSign x={148} y={480} text="AGENCY OS" color="#A78BFA" size={14} />

        {/* ── Floor ── */}
        <polygon points={rh(720, 560, 660, 330)} fill="url(#floorG)" />
        {planks}
        {/* Floor edge shadow */}
        <polygon points="60,560 780,200 780,215 62,572" fill="#1A0C04" opacity="0.35" />

        {/* ── Room ambient glow pads on floor ── */}
        {ZONES.map((z) => (
          <ellipse key={`gpad${z.id}`} cx={z.ax} cy={z.ay + 60} rx={160} ry={80} fill={`url(#rg${z.id})`} />
        ))}
        <ellipse cx={MEETING.ax} cy={MEETING.ay + 80} rx={180} ry={90} fill="url(#rgmeeting)" />

        {/* ── Room partition walls (dividers) ── */}
        {/* Between Creative Studio and Content Lab */}
        <Partition x1={600} y1={340} x2={680} y2={384} c="#2A2248" />
        {/* Between Ads Command and Content Lab */}
        <Partition x1={860} y1={384} x2={940} y2={340} c="#2A2248" />
        {/* Between Content Lab and Analytics Room */}
        <Partition x1={880} y1={500} x2={960} y2={456} c="#2A2248" />
        {/* Between Focus Lounge and Content Lab */}
        <Partition x1={560} y1={460} x2={640} y2={504} c="#2A2248" />

        {/* ── PM MEETING ROOM (back center) ── */}
        <RoundTable cx={MEETING.ax} cy={MEETING.ay + 60} />
        {/* Meeting chairs */}
        {[[-56, 48, -20], [56, 48, 20], [0, 30, 0]].map(([dx, dy, a], i) => (
          <Chair key={i} x={MEETING.ax + dx} y={MEETING.ay + dy} angle={a} />
        ))}
        <Lamp x={MEETING.ax} y={MEETING.ay - 80} c="#B46FFF" />
        {/* Room glow */}
        <ellipse cx={MEETING.ax} cy={MEETING.ay + 50} rx={140} ry={70} fill="#6E28D9" opacity="0.12" />
        <RoomLabel x={MEETING.ax} y={MEETING.ay - 110} label="PM MEETING ROOM" color="#C084FC" icon="⬡" />
        {/* Meeting characters */}
        {MEETING.chars.map((c, i) => {
          const a = byId.get(c.agentId); if (!a) return null;
          const x = MEETING.ax + c.dx, headCy = MEETING.ay + c.dy;
          const sel = selectedAgentId === c.agentId;
          const ring = statusRing[a.status] ?? "#4A4068";
          return (
            <g key={c.agentId} onClick={() => onAgentSelect(c.agentId)} style={{ cursor: "pointer" }}>
              {sel && <ellipse cx={x} cy={headCy + 38} rx={32} ry={13} fill="none" stroke={ring} strokeWidth="2.5" strokeDasharray="6 4" />}
              {!sel && a.status === "working" && <ellipse cx={x} cy={headCy + 38} rx={28} ry={11} fill={ring} opacity="0.12" className="agent-pulse" />}
              <CharacterRenderer agentId={c.agentId} pose={applyStatus(c.pose, a.status)} cx={x} headCy={headCy} scale={S} delay={i * 0.3} />
            </g>
          );
        })}

        {/* ── ZONE ROOMS (back-to-front render order) ── */}
        {ZONES.map((z, zi) => (
          <g key={z.id}>
            {/* Bookshelf */}
            {z.shelf && <Bookshelf x={z.ax + z.shelf.dx} y={z.ay + z.shelf.dy} flip={z.shelf.flip} />}

            {/* Whiteboard */}
            {z.whiteboard && <Whiteboard x={z.ax + z.whiteboard.dx} y={z.ay + z.whiteboard.dy} />}

            {/* Lamp */}
            {z.lamp && <Lamp x={z.ax + z.lamp.dx} y={z.ay + z.lamp.dy} c={z.glow} />}

            {/* Plant */}
            {z.plant && <Plant x={z.ax + z.plant.dx} y={z.ay + z.plant.dy} s={z.plant.s ?? 1} />}

            {/* Room label */}
            <RoomLabel x={z.ax} y={z.ay - 100} label={z.label} color={z.ring} icon={z.icon} />

            {/* Characters (rendered before desk so desk occludes feet) */}
            {z.chars.map((c, i) => {
              const a = byId.get(c.agentId); if (!a) return null;
              const x = z.ax + c.dx, headCy = z.ay + c.dy;
              const sel = selectedAgentId === c.agentId;
              const ring = statusRing[a.status] ?? "#4A4068";
              return (
                <g key={c.agentId} onClick={() => onAgentSelect(c.agentId)} style={{ cursor: "pointer" }}>
                  {sel && <ellipse cx={x} cy={headCy + 36} rx={32} ry={13} fill="none" stroke={ring} strokeWidth="2.5" strokeDasharray="6 4" />}
                  {!sel && a.status === "working" && (
                    <ellipse cx={x} cy={headCy + 36} rx={28} ry={11} fill={ring} opacity="0.1" className="agent-pulse" />
                  )}
                  <CharacterRenderer agentId={c.agentId} pose={applyStatus(c.pose, a.status)} cx={x} headCy={headCy} scale={S} delay={i * 0.4} />
                </g>
              );
            })}

            {/* Desk */}
            <Cuboid cx={z.ax + 8} cy={z.ay + 34} w={68} d={34} h={26} top="#5A3E26" left="#33210F" right="#43301A" />

            {/* Monitors */}
            <Monitor x={z.ax + 8} y={z.ay + 18} glow={z.glow} dual />

            {/* Mug */}
            <ellipse cx={z.ax - 46} cy={z.ay + 32} rx="6" ry="3" fill="#C8B090" />
            <rect x={z.ax - 50} y={z.ay + 24} width="8" height="8" rx="1.5" fill="#E8DCC8" />
          </g>
        ))}

        {/* ── WALKER corridor agent ── */}
        <g className="char-walk">
          <CharacterRenderer agentId={WALKER.agentId} pose={WALKER.pose} cx={WALKER.x} headCy={WALKER.y} scale={S} idleClass="char-bob" />
        </g>

        {/* Pet in lounge zone */}
        <Pet x={430} y={620} />

        {/* ── Foreground plants ── */}
        <g opacity="0.95">
          <Plant x={68} y={860} s={1.8} />
          <Plant x={1372} y={884} s={1.6} />
        </g>

        {/* ── Vignette overlay ── */}
        <rect width="1440" height="900" fill="url(#vig)" pointerEvents="none" />
      </svg>

      {/* ── Speech bubbles (Framer Motion) ── */}
      <AnimatePresence>
        {buildPlacements().map((p) => {
          const msg = bubbles[p.agentId];
          if (!msg) return null;
          const a = byId.get(p.agentId);
          const leftPct = (p.x / 1440) * 100;
          const topPct = ((p.headCy - 100) / 900) * 100;
          return (
            <motion.div
              key={`bubble-${p.agentId}`}
              initial={{ opacity: 0, scale: 0.6, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -6 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="pointer-events-none absolute z-20"
              style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: "translateX(-50%)" }}
            >
              <div className="relative">
                <div
                  className="rounded-2xl rounded-bl-sm px-3 py-2 text-[11px] font-semibold whitespace-nowrap max-w-[200px] text-center leading-snug shadow-2xl"
                  style={{
                    background: "rgba(18,12,38,0.97)",
                    color: "#F0EAFF",
                    border: "1.5px solid rgba(168,140,232,0.5)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span className="block text-[9px] font-bold opacity-50 mb-0.5">{a?.name}</span>
                  {msg}
                </div>
                <div
                  className="absolute left-5 -bottom-[7px] w-0 h-0"
                  style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "8px solid rgba(18,12,38,0.97)" }}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
