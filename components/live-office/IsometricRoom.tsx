"use client";

/* ═══════════════════════════════════════════════════════
   IsometricRoom — SVG foundation
   1200 × 800 viewBox
   Isometric 2:1 ratio, right-facing camera
   Layer order: walls → floor → furniture → HTML overlays
═══════════════════════════════════════════════════════ */

// ── Projection constants ──────────────────────────────
const TW = 240;   // tile width  (screen px per world unit)
const TH = 120;   // tile height (= TW / 2,  2:1 isometric)
const WH = 130;   // wall/height (screen px per world height unit)
const OX = 660;   // isometric origin X in the SVG
const OY = 330;   // isometric origin Y in the SVG

// ── Room dimensions ───────────────────────────────────
const COLS        = 3;    // X width  (world units)
const ROWS        = 4;    // Z depth  (world units)
const WALL_H      = 2.0;  // Y height (world units)

// ── Core projection ───────────────────────────────────
function iso(col: number, row: number, height = 0) {
  return {
    x: OX + (col - row) * (TW / 2),
    y: OY + (col + row) * (TH / 2) - height * WH,
  };
}

function pt(col: number, row: number, height = 0) {
  const { x, y } = iso(col, row, height);
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

function pp(corners: [number, number, number][]) {
  return corners.map(([c, r, h]) => pt(c, r, h)).join(" ");
}

/* ═══════════════════════════════════════════════════════
   PRIMITIVE SHAPES
═══════════════════════════════════════════════════════ */

function Tile({ c, r }: { c: number; r: number }) {
  const even = (c + r) % 2 === 0;
  return (
    <polygon
      points={pp([[c, r, 0], [c + 1, r, 0], [c + 1, r + 1, 0], [c, r + 1, 0]])}
      fill={even ? "#2C1C0A" : "#241408"}
      stroke="#180E04"
      strokeWidth={1}
    />
  );
}

function Cuboid({
  col, row, cw, rd, h,
  topColor, leftColor, rightColor,
  stroke = "#0E0A04",
}: {
  col: number; row: number;
  cw: number; rd: number; h: number;
  topColor: string; leftColor: string; rightColor: string;
  stroke?: string;
}) {
  return (
    <g>
      <polygon
        points={pp([[col, row, 0],[col, row + rd, 0],[col, row + rd, h],[col, row, h]])}
        fill={leftColor} stroke={stroke} strokeWidth={0.5}
      />
      <polygon
        points={pp([[col, row, 0],[col + cw, row, 0],[col + cw, row, h],[col, row, h]])}
        fill={rightColor} stroke={stroke} strokeWidth={0.5}
      />
      <polygon
        points={pp([[col, row, h],[col + cw, row, h],[col + cw, row + rd, h],[col, row + rd, h]])}
        fill={topColor} stroke={stroke} strokeWidth={0.5}
      />
    </g>
  );
}

/* ── Desk ────────────────────────────────────────────── */
function Desk({ col, row }: { col: number; row: number }) {
  // 35% smaller from original: cw 0.84→0.55, rd 0.42→0.27
  return (
    <Cuboid
      col={col} row={row}
      cw={0.55} rd={0.27} h={0.33}
      topColor="#5C3D1E"
      leftColor="#3D2810"
      rightColor="#4A3018"
    />
  );
}

/* ── Bookshelf ───────────────────────────────────────── */
function Bookshelf({ col, row }: { col: number; row: number }) {
  // Main carcass — tall and narrow
  const cw = 0.6;
  const rd = 0.35;
  const h  = 1.5;
  const bookColors = ["#C0392B","#2980B9","#27AE60","#E67E22","#8E44AD","#16A085","#D35400"];
  // Build shelf lines at intervals on the left face
  const shelves = [0.4, 0.75, 1.1];

  const leftFacePoints = [
    iso(col, row,    0),
    iso(col, row+rd, 0),
    iso(col, row+rd, h),
    iso(col, row,    h),
  ];

  return (
    <g>
      {/* Carcass */}
      <Cuboid
        col={col} row={row}
        cw={cw} rd={rd} h={h}
        topColor="#6B5030"
        leftColor="#4a3520"
        rightColor="#3A2A18"
      />
      {/* Shelf planks — thin horizontal lines on the right face */}
      {shelves.map((sh, i) => (
        <line key={i}
          x1={iso(col, row, sh).x}       y1={iso(col, row, sh).y}
          x2={iso(col + cw, row, sh).x}  y2={iso(col + cw, row, sh).y}
          stroke="#2A1E0C" strokeWidth={1.5}
        />
      ))}
      {/* Book spines on the right face — vertical coloured slabs */}
      {bookColors.map((bc, i) => {
        const bx = col + i * (cw / bookColors.length);
        const bw = cw / bookColors.length - 0.005;
        const bh1 = 0.05;
        const bh2 = 0.38;
        return (
          <polygon key={i}
            points={pp([
              [bx,        row, bh1],
              [bx + bw,   row, bh1],
              [bx + bw,   row, bh2],
              [bx,        row, bh2],
            ])}
            fill={bc}
            opacity={0.85}
            stroke="#111" strokeWidth={0.3}
          />
        );
      })}
    </g>
  );
}

/* ── Floor Lamp ──────────────────────────────────────── */
function FloorLamp({ col, row, glowId }: { col: number; row: number; glowId: string }) {
  const base = iso(col, row, 0);
  const top  = iso(col, row, 1.2);
  return (
    <g>
      {/* Amber glow pool on floor */}
      <ellipse
        cx={base.x} cy={base.y}
        rx={55} ry={28}
        fill={`url(#${glowId})`}
      />
      {/* Pole */}
      <line
        x1={base.x} y1={base.y}
        x2={top.x}  y2={top.y}
        stroke="#5C3D14" strokeWidth={3}
      />
      {/* Shade */}
      <ellipse cx={top.x} cy={top.y} rx={18} ry={9}
        fill="#8B5E20" stroke="#4A3010" strokeWidth={1} />
      <ellipse cx={top.x} cy={top.y + 4} rx={12} ry={5}
        fill="#C97D2A" opacity={0.9} />
      {/* Warm light spill upward */}
      <ellipse cx={top.x} cy={top.y - 6} rx={20} ry={10}
        fill="#FF9F43" opacity={0.18} />
    </g>
  );
}

/* ── Sofa ────────────────────────────────────────────── */
function Sofa({ col, row }: { col: number; row: number }) {
  const cw = 1.6;
  const rd = 0.75;
  const seatH = 0.35;
  const backH = 0.75;
  const armW  = 0.18;

  return (
    <g>
      {/* Seat cushion */}
      <Cuboid col={col} row={row} cw={cw} rd={rd} h={seatH}
        topColor="#1e2a4a" leftColor="#141d33" rightColor="#0f1628"
      />
      {/* Backrest */}
      <Cuboid col={col} row={row} cw={cw} rd={0.18} h={backH}
        topColor="#253460" leftColor="#1a2550" rightColor="#141d40"
      />
      {/* Left arm */}
      <Cuboid col={col} row={row} cw={armW} rd={rd} h={backH * 0.7}
        topColor="#253460" leftColor="#1a2550" rightColor="#141d40"
      />
      {/* Right arm */}
      <Cuboid col={col + cw - armW} row={row} cw={armW} rd={rd} h={backH * 0.7}
        topColor="#253460" leftColor="#1a2550" rightColor="#141d40"
      />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function IsometricRoom() {
  const tiles: { c: number; r: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      tiles.push({ c, r });
    }
  }
  tiles.sort((a, b) => (a.c + a.r) - (b.c + b.r));

  return (
    <div className="relative w-full h-full" style={{ background: "#080614" }}>
      <svg
        viewBox="0 0 1200 800"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          <radialGradient id="roomBg" cx="55%" cy="38%" r="62%">
            <stop offset="0%"   stopColor="#201848" />
            <stop offset="100%" stopColor="#060412" />
          </radialGradient>

          <linearGradient id="wallL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#262044" />
            <stop offset="100%" stopColor="#1A1538" />
          </linearGradient>
          <linearGradient id="wallR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1C1840" />
            <stop offset="100%" stopColor="#14112E" />
          </linearGradient>

          {/* Amber lamp glow gradients */}
          <radialGradient id="lampGlow1" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#ff9f43" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#ff9f43" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="lampGlow2" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#ff9f43" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#ff9f43" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width="1200" height="800" fill="url(#roomBg)" />

        {/* ── 1. Walls ──────────────────────────────── */}
        <polygon
          points={pp([[0,0,0],[0,ROWS,0],[0,ROWS,WALL_H],[0,0,WALL_H]])}
          fill="url(#wallL)" stroke="#0E0C20" strokeWidth={1}
        />
        <polygon
          points={pp([[0,0,0],[COLS,0,0],[COLS,0,WALL_H],[0,0,WALL_H]])}
          fill="url(#wallR)" stroke="#0E0C20" strokeWidth={1}
        />

        {/* Ceiling edge highlights */}
        <line x1={iso(0,0,WALL_H).x} y1={iso(0,0,WALL_H).y}
              x2={iso(0,ROWS,WALL_H).x} y2={iso(0,ROWS,WALL_H).y}
              stroke="#302860" strokeWidth={1.5} />
        <line x1={iso(0,0,WALL_H).x} y1={iso(0,0,WALL_H).y}
              x2={iso(COLS,0,WALL_H).x} y2={iso(COLS,0,WALL_H).y}
              stroke="#282460" strokeWidth={1.5} />
        <line x1={iso(0,0,0).x} y1={iso(0,0,0).y}
              x2={iso(0,0,WALL_H).x} y2={iso(0,0,WALL_H).y}
              stroke="#302860" strokeWidth={1.5} />

        {/* Picture frames on left wall */}
        {/* Upper-left frame — outer border */}
        <polygon points={pp([[0,0.7,1.45],[0,1.3,1.45],[0,1.3,1.0],[0,0.7,1.0]])}
          fill="#2a1f0e" stroke="#1a1208" strokeWidth={1} />
        {/* Upper-left frame — inner canvas */}
        <polygon points={pp([[0,0.78,1.38],[0,1.22,1.38],[0,1.22,1.07],[0,0.78,1.07]])}
          fill="#111111" />
        {/* Lower-left frame — outer border */}
        <polygon points={pp([[0,1.9,1.1],[0,2.5,1.1],[0,2.5,0.65],[0,1.9,0.65]])}
          fill="#2a1f0e" stroke="#1a1208" strokeWidth={1} />
        {/* Lower-left frame — inner canvas */}
        <polygon points={pp([[0,1.98,1.03],[0,2.42,1.03],[0,2.42,0.72],[0,1.98,0.72]])}
          fill="#111111" />

        {/* ── Front wall panel — closes left-facing opening, low opacity ── */}
        <polygon
          points={pp([[0,ROWS,0],[COLS,ROWS,0],[COLS,ROWS,WALL_H],[0,ROWS,WALL_H]])}
          fill="#1a1420"
          opacity={0.3}
          stroke="#0E0C20"
          strokeWidth={1}
        />

        {/* ── 2. Floor tiles ────────────────────────── */}
        {tiles.map(({ c, r }) => (
          <Tile key={`tile-${c}-${r}`} c={c} r={r} />
        ))}

        {/* ── 3. Furniture (back → front, left → right) ── */}

        {/* Bookshelf — flush against back-left wall corner */}
        <Bookshelf col={0} row={0} />

        {/* Desk row along the left wall — spaced for smaller desks */}
        <Desk col={0.05} row={0.9} />
        <Desk col={0.05} row={1.55} />
        <Desk col={0.05} row={2.2} />

        {/* Original desk — mid-right */}
        <Desk col={1.1} row={2.0} />

        {/* Floor lamp 1 — near back-left */}
        <FloorLamp col={0.55} row={0.4} glowId="lampGlow1" />

        {/* Sofa — center-right */}
        <Sofa col={1.2} row={0.8} />

        {/* Floor lamp 2 — beside sofa */}
        <FloorLamp col={2.55} row={1.1} glowId="lampGlow2" />
      </svg>
    </div>
  );
}
