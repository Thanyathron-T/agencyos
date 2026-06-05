"use client";

import { officeAgents } from "@/lib/officeData";
import type { OfficeStatus } from "@/lib/officeData";
import CharacterRenderer from "@/components/characters/CharacterRenderer";
import type { CharacterPose } from "@/components/characters/types";

/* ════════ iso helpers ════════ */
const rh = (cx: number, cy: number, w: number, d: number) =>
  `${cx},${cy - d} ${cx + w},${cy} ${cx},${cy + d} ${cx - w},${cy}`;

function Cuboid({ cx, cy, w, d, h, top, left, right }: { cx: number; cy: number; w: number; d: number; h: number; top: string; left: string; right: string }) {
  return (
    <g>
      <polygon points={`${cx - w},${cy} ${cx},${cy + d} ${cx},${cy + d + h} ${cx - w},${cy + h}`} fill={left} />
      <polygon points={`${cx},${cy + d} ${cx + w},${cy} ${cx + w},${cy + h} ${cx},${cy + d + h}`} fill={right} />
      <polygon points={rh(cx, cy, w, d)} fill={top} />
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

function DualMonitor({ x, y, glow }: { x: number; y: number; glow: string }) {
  return (
    <g>
      <Cuboid cx={x} cy={y} w={26} d={13} h={3} top="#1E1A2E" left="#15121F" right="#191525" />
      {[-16, 16].map((dx, i) => (
        <g key={i} transform={`translate(${x + dx},${y - 28})`}>
          <polygon points="-15,0 15,0 12,-20 -12,-20" fill="#0D0B16" />
          <polygon points="-12,-2 12,-2 10,-18 -10,-18" fill={glow} opacity="0.6" className="screen-glow" />
        </g>
      ))}
      <ellipse cx={x} cy={y - 14} rx="40" ry="20" fill={glow} opacity="0.12" />
    </g>
  );
}

function Lamp({ x, y, c = "#FFB860" }: { x: number; y: number; c?: string }) {
  return (
    <g>
      <circle cx={x} cy={y + 22} r="52" fill={c} opacity="0.16" className="light-flick" />
      <line x1={x} y1={y - 78} x2={x} y2={y - 6} stroke="#2A2238" strokeWidth="2.5" />
      <polygon points={`${x - 15},${y - 4} ${x + 15},${y - 4} ${x + 9},${y - 18} ${x - 9},${y - 18}`} fill="#3A2E1E" />
      <ellipse cx={x} cy={y - 4} rx="15" ry="4" fill={c} opacity="0.85" />
      <circle cx={x} cy={y - 8} r="4" fill="#FFF0C8" opacity="0.9" />
    </g>
  );
}

function Bookshelf({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  const sx = flip ? -1 : 1;
  const books = ["#8B4A4A", "#4A6B8B", "#7A5A8B", "#8B7A4A", "#4A8B6B", "#8B5A4A"];
  return (
    <g transform={`translate(${x},${y}) scale(${sx},1)`}>
      {/* frame */}
      <polygon points="0,0 44,22 44,-78 0,-100" fill="#2A1E14" />
      <polygon points="0,0 44,22 44,18 0,-4" fill="#1A1209" />
      {[-4, -30, -56].map((sy, r) => (
        <g key={r}>
          <polygon points={`2,${sy} 42,${sy + 20} 42,${sy + 16} 2,${sy - 4}`} fill="#1A1209" />
          {books.slice(0, 5).map((c, b) => (
            <polygon key={b} points={`${4 + b * 8},${sy - 4 - b * 1} ${10 + b * 8},${sy - 1 - b * 1} ${10 + b * 8},${sy - 19 - b * 1} ${4 + b * 8},${sy - 22 - b * 1}`} fill={c} opacity="0.9" />
          ))}
        </g>
      ))}
      <circle cx="22" cy="-40" r="30" fill="#FFB860" opacity="0.06" />
    </g>
  );
}

function NeonSign({ x, y, text, color, size = 22 }: { x: number; y: number; text: string; color: string; size?: number }) {
  return (
    <g filter="url(#neon)">
      <text x={x} y={y} fontSize={size} fontWeight="800" fill={color} textAnchor="middle" style={{ letterSpacing: "1px" }}>{text}</text>
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

/* ════════ zones ════════ */
interface Slot { agentId: string; dx: number; dy: number; pose: CharacterPose }
interface Zone {
  id: string; ax: number; ay: number;
  glow: string; ring: string;
  chars: Slot[];
  shelf?: { dx: number; dy: number; flip?: boolean };
  plant: { dx: number; dy: number; s?: number };
  pet?: { dx: number; dy: number };
}

const ZONES: Zone[] = [
  { id: "z-ops", ax: 430, ay: 396, glow: "#4EA8FF", ring: "#6E92E0",
    chars: [{ agentId: "oa15", dx: 30, dy: -24, pose: "typing" }, { agentId: "oa16", dx: -54, dy: 6, pose: "thinking" }],
    shelf: { dx: -120, dy: -10, flip: true }, plant: { dx: 86, dy: 4, s: 0.95 } },
  { id: "z-design", ax: 896, ay: 396, glow: "#FF6FB0", ring: "#C08AFF",
    chars: [{ agentId: "oa8", dx: 32, dy: -24, pose: "typing" }, { agentId: "oa9", dx: -54, dy: 8, pose: "coffee" }],
    shelf: { dx: 122, dy: -10 }, plant: { dx: -88, dy: 4, s: 0.95 } },
  { id: "z-content", ax: 1058, ay: 512, glow: "#4EA8FF", ring: "#7DD3FC",
    chars: [{ agentId: "oa5", dx: 26, dy: -24, pose: "typing" }, { agentId: "oa7", dx: -50, dy: 6, pose: "thinking" }],
    plant: { dx: 70, dy: 8 }, pet: { dx: 60, dy: 26 } },
  { id: "z-support", ax: 380, ay: 600, glow: "#FFB860", ring: "#E0866E",
    chars: [{ agentId: "oa13", dx: 34, dy: -10, pose: "coffee" }, { agentId: "oa14", dx: -50, dy: 12, pose: "talking" }],
    plant: { dx: -84, dy: 6 } },
  { id: "z-marketing", ax: 660, ay: 658, glow: "#FF6FB0", ring: "#E96FA0",
    chars: [{ agentId: "oa3", dx: 34, dy: -24, pose: "typing" }, { agentId: "oa1", dx: -56, dy: 10, pose: "talking" }],
    plant: { dx: 92, dy: 8 } },
  { id: "z-ads", ax: 948, ay: 636, glow: "#FFC857", ring: "#E0A94E",
    chars: [{ agentId: "oa10", dx: -52, dy: 10, pose: "talking" }, { agentId: "oa12", dx: 34, dy: -24, pose: "typing" }],
    plant: { dx: 86, dy: 8 } },
];

const LOUNGE = { ax: 642, ay: 466, charId: "oa2" };
const WALKER = { agentId: "oa17", x: 250, y: 600, pose: "talking" as CharacterPose };

function applyStatus(base: CharacterPose, s: OfficeStatus): CharacterPose {
  if (s === "idle") return "sleeping";
  if (s === "publishing") return "celebrating";
  if (s === "reviewing" && (base === "typing" || base === "sitting")) return "thinking";
  return base;
}

const byId = new Map(officeAgents.map((a) => [a.id, a] as const));

export function buildPlacements() {
  const list: { agentId: string; x: number; headCy: number }[] = [];
  for (const z of ZONES) for (const c of z.chars) list.push({ agentId: c.agentId, x: z.ax + c.dx, headCy: z.ay + c.dy });
  list.push({ agentId: LOUNGE.charId, x: LOUNGE.ax + 4, headCy: LOUNGE.ay - 12 });
  list.push({ agentId: WALKER.agentId, x: WALKER.x, headCy: WALKER.y });
  return list;
}

/* ════════ component ════════ */
interface Props {
  bubbles: Record<string, string>;
  selectedAgentId: string | null;
  onAgentSelect: (id: string) => void;
}

export default function IsometricOffice({ bubbles, selectedAgentId, onAgentSelect }: Props) {
  const S = 0.6;

  const planks: React.ReactNode[] = [];
  for (let k = 0.08; k < 1; k += 0.1)
    planks.push(<line key={`p${k}`} x1={60 + 600 * k} y1={500 + 300 * k} x2={660 + 600 * k} y2={200 + 300 * k} stroke="#3A2614" strokeWidth="1.4" opacity="0.5" />);
  for (let k = 0.14; k < 1; k += 0.2)
    planks.push(<line key={`q${k}`} x1={60 + 600 * k} y1={500 - 300 * k} x2={660 + 600 * k} y2={800 - 300 * k} stroke="#3A2614" strokeWidth="1" opacity="0.25" />);

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 1320 880" className="w-full h-auto block" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="amb" cx="48%" cy="36%" r="80%">
            <stop offset="0%" stopColor="#241B45" /><stop offset="55%" stopColor="#16112E" /><stop offset="100%" stopColor="#0C0820" />
          </radialGradient>
          <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6E4A2C" /><stop offset="100%" stopColor="#4A3018" />
          </linearGradient>
          <linearGradient id="wL" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0%" stopColor="#272042" /><stop offset="100%" stopColor="#1C1734" /></linearGradient>
          <linearGradient id="wR" x1="1" y1="0" x2="0" y2="0.3"><stop offset="0%" stopColor="#201A38" /><stop offset="100%" stopColor="#15112A" /></linearGradient>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3A4A7A" /><stop offset="100%" stopColor="#1E2444" /></linearGradient>
          <radialGradient id="vig" cx="50%" cy="44%" r="72%"><stop offset="58%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#000" stopOpacity="0.5" /></radialGradient>
          <filter id="neon" x="-40%" y="-60%" width="180%" height="220%">
            <feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="1320" height="880" fill="url(#amb)" />

        {/* ── back walls ── */}
        <polygon points="60,500 660,200 660,-10 60,290" fill="url(#wL)" />
        <polygon points="660,200 1260,500 1260,290 660,-10" fill="url(#wR)" />
        <polygon points="60,500 660,200 660,212 60,512" fill="#0E0A20" opacity="0.7" />
        <polygon points="660,200 1260,500 1260,512 660,212" fill="#0E0A20" opacity="0.7" />

        {/* windows w/ night sky */}
        {[0.5, 0.78].map((t, i) => {
          const x = 60 + 600 * t, y = 500 - 300 * t;
          return (<g key={`wl${i}`}>
            <polygon points={`${x},${y - 50} ${x + 88},${y - 94} ${x + 88},${y - 184} ${x},${y - 140}`} fill="url(#sky)" />
            <polygon points={`${x},${y - 50} ${x + 88},${y - 94} ${x + 88},${y - 184} ${x},${y - 140}`} fill="none" stroke="#0E0A20" strokeWidth="3" />
            <circle cx={x + 50} cy={y - 130} r="7" fill="#FFF3C8" opacity="0.7" />
            <circle cx={x + 26} cy={y - 100} r="1.4" fill="#fff" opacity="0.7" /><circle cx={x + 64} cy={y - 150} r="1.2" fill="#fff" opacity="0.6" />
          </g>);
        })}
        {[0.46].map((t, i) => {
          const x = 660 + 600 * t, y = 200 + 300 * t;
          return (<g key={`wr${i}`}>
            <polygon points={`${x},${y - 50} ${x - 88},${y - 94} ${x - 88},${y - 184} ${x},${y - 140}`} fill="url(#sky)" />
            <polygon points={`${x},${y - 50} ${x - 88},${y - 94} ${x - 88},${y - 184} ${x},${y - 140}`} fill="none" stroke="#0E0A20" strokeWidth="3" />
          </g>);
        })}

        {/* PLAN BUILD GROW wall text */}
        <text x="930" y="120" fontSize="20" fontWeight="800" fill="#E8C878" opacity="0.55" transform="skewY(-26.5 930 120)">PLAN</text>
        <text x="930" y="150" fontSize="20" fontWeight="800" fill="#E8C878" opacity="0.55" transform="skewY(-26.5 930 150)">BUILD</text>
        <text x="930" y="180" fontSize="20" fontWeight="800" fill="#E8C878" opacity="0.55" transform="skewY(-26.5 930 180)">GROW</text>

        {/* neon signs */}
        <NeonSign x={340} y={130} text="FOCUS" color="#FF3FA0" size={20} />
        <NeonSign x={1170} y={470} text="DESIGN" color="#FF5FB0" size={18} />
        <NeonSign x={150} y={520} text="LIVE OFFICE" color="#B46FFF" size={16} />

        {/* string lights */}
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={110 + i * 38} cy={140 + (i % 2) * 7} r="2.4" fill="#FFD98A" opacity="0.85" className="light-flick" />
        ))}

        {/* ── floor ── */}
        <polygon points={rh(660, 500, 600, 300)} fill="url(#floorG)" />
        {planks}
        <polygon points="60,500 660,200 660,212 62,508" fill="#241404" opacity="0.4" />

        {/* ── central lounge ── */}
        <polygon points={rh(LOUNGE.ax, LOUNGE.ay + 30, 130, 66)} fill="#5E2630" opacity="0.85" />
        <polygon points={rh(LOUNGE.ax, LOUNGE.ay + 30, 116, 58)} fill="none" stroke="#8B4048" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
        {/* sofa back */}
        <Cuboid cx={LOUNGE.ax} cy={LOUNGE.ay - 16} w={70} d={34} h={20} top="#2E2A4A" left="#1E1B33" right="#262240" />
        {/* sofa seat */}
        <Cuboid cx={LOUNGE.ax} cy={LOUNGE.ay + 8} w={74} d={36} h={12} top="#363258" left="#221E3A" right="#2C2848" />
        {/* round table */}
        <ellipse cx={LOUNGE.ax} cy={LOUNGE.ay + 44} rx="34" ry="17" fill="#3A2616" />
        <ellipse cx={LOUNGE.ax} cy={LOUNGE.ay + 41} rx="34" ry="17" fill="#5A3E26" />
        <circle cx={LOUNGE.ax - 8} cy={LOUNGE.ay + 40} r="4" fill="#C88A4A" />
        <circle cx={LOUNGE.ax + 8} cy={LOUNGE.ay + 42} r="3" fill="#8B5A3A" />
        {/* lounge character */}
        {(() => {
          const a = byId.get(LOUNGE.charId); if (!a) return null;
          const sel = selectedAgentId === LOUNGE.charId;
          return (
            <g onClick={() => onAgentSelect(LOUNGE.charId)} style={{ cursor: "pointer" }}>
              {sel && <ellipse cx={LOUNGE.ax + 4} cy={LOUNGE.ay + 24} rx={30} ry={12} fill="none" stroke="#B46FFF" strokeWidth="2.5" strokeDasharray="6 4" />}
              <CharacterRenderer agentId={LOUNGE.charId} pose={applyStatus("sitting", a.status)} cx={LOUNGE.ax + 4} headCy={LOUNGE.ay - 12} scale={S} />
            </g>
          );
        })()}
        <Pet x={LOUNGE.ax + 96} y={LOUNGE.ay + 18} />

        {/* ── zones back-to-front ── */}
        {ZONES.map((z) => (
          <g key={z.id}>
            {z.shelf && <Bookshelf x={z.ax + z.shelf.dx} y={z.ay + z.shelf.dy} flip={z.shelf.flip} />}
            <Lamp x={z.ax} y={z.ay - 70} />
            <Plant x={z.ax + z.plant.dx} y={z.ay + z.plant.dy} s={z.plant.s ?? 1} />
            {z.pet && <Pet x={z.ax + z.pet.dx} y={z.ay + z.pet.dy} />}

            {z.chars.map((c, i) => {
              const a = byId.get(c.agentId); if (!a) return null;
              const x = z.ax + c.dx, headCy = z.ay + c.dy;
              const sel = selectedAgentId === c.agentId;
              return (
                <g key={c.agentId} onClick={() => onAgentSelect(c.agentId)} style={{ cursor: "pointer" }}>
                  {sel && <ellipse cx={x} cy={headCy + 36} rx={30} ry={12} fill="none" stroke={z.ring} strokeWidth="2.5" strokeDasharray="6 4" />}
                  <CharacterRenderer agentId={c.agentId} pose={applyStatus(c.pose, a.status)} cx={x} headCy={headCy} scale={S} delay={i * 0.5} />
                </g>
              );
            })}

            {/* desk + dual monitors */}
            <Cuboid cx={z.ax + 8} cy={z.ay + 30} w={66} d={32} h={24} top="#5A3E26" left="#33210F" right="#43301A" />
            <DualMonitor x={z.ax + 8} y={z.ay + 16} glow={z.glow} />
            {/* mug */}
            <ellipse cx={z.ax - 44} cy={z.ay + 30} rx="6" ry="3" fill="#C8B090" />
            <rect x={z.ax - 48} y={z.ay + 22} width="8" height="8" rx="1.5" fill="#E8DCC8" />
          </g>
        ))}

        {/* walker */}
        <g className="char-walk">
          <CharacterRenderer agentId={WALKER.agentId} pose={WALKER.pose} cx={WALKER.x} headCy={WALKER.y} scale={S} idleClass="char-bob" />
        </g>

        {/* foreground plants */}
        <g opacity="0.95"><Plant x={64} y={812} s={1.7} /><Plant x={1256} y={836} s={1.5} /></g>
        <rect width="1320" height="880" fill="url(#vig)" pointerEvents="none" />
      </svg>

      {/* speech bubbles */}
      {buildPlacements().map((p) => {
        const msg = bubbles[p.agentId]; if (!msg) return null;
        const a = byId.get(p.agentId);
        return (
          <div key={p.agentId} className="kw-bubble pointer-events-none absolute z-20"
            style={{ left: `${(p.x / 1320) * 100}%`, top: `${((p.headCy - 92) / 880) * 100}%`, transform: "translateX(-50%)" }}>
            <div className="relative">
              <div className="rounded-2xl rounded-bl-sm px-3 py-1.5 text-[11px] font-bold whitespace-nowrap max-w-[180px] text-center leading-snug shadow-xl"
                style={{ background: "rgba(30,24,54,0.96)", color: "#F4EEFF", border: "1.5px solid rgba(168,140,232,0.45)" }}>
                <span className="block text-[8px] font-semibold opacity-55">{a?.name}</span>
                {msg}
              </div>
              <div className="absolute left-4 -bottom-[7px] w-0 h-0" style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "8px solid rgba(30,24,54,0.96)" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
