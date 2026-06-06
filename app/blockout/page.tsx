"use client";


/* ═══════════════════════════════════════════════════════
   ISO PROJECTION
   T = tile size (world unit → screen pixels)
   CX, CY = projection origin
═══════════════════════════════════════════════════════ */
const T  = 38;
const CX = 682;
const CY = 244;
const VW = 1600;
const VH = 1000;

function iso(wx: number, wz: number, wy = 0) {
  return {
    x: CX + (wx - wz) * T,
    y: CY + (wx + wz) * T * 0.5 - wy * T,
  };
}

function pts(arr: { x: number; y: number }[]) {
  return arr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

/* ═══════════════════════════════════════════════════════
   ROOM DEFINITIONS
   x, z = floor origin (world units)
   w, d = floor dimensions
   h     = wall height (world units)
═══════════════════════════════════════════════════════ */
interface Room {
  id: string;
  x: number; z: number;
  w: number; d: number;
  h: number;
  circles?: { dx: number; dz: number }[];
  focal?: boolean;
}

const ROOMS: Room[] = [
  /* 2 – CREATIVE  upper-left  */
  { id: "creative",  x: 0,    z: 0,   w: 8,   d: 5.5, h: 4,
    circles: [{ dx: 2, dz: 2 }, { dx: 5.5, dz: 3.5 }] },
  /* 3 – COMMAND   upper-center */
  { id: "command",   x: 8,    z: 0,   w: 5,   d: 5,   h: 3.5,
    circles: [{ dx: 2.5, dz: 2.5 }] },
  /* 4 – MEETING   upper-right */
  { id: "meeting",   x: 13,   z: 0,   w: 8,   d: 5.5, h: 4,
    circles: [{ dx: 2, dz: 2 }, { dx: 5, dz: 2 }, { dx: 3.5, dz: 4 }] },
  /* 1 – ENTRY     bottom-left */
  { id: "entry",     x: 0,    z: 8,   w: 5,   d: 6,   h: 1.5 },
  /* 5 – FOCUS     center (focal) */
  { id: "focus",     x: 5,    z: 5.5, w: 9,   d: 4.5, h: 3,   focal: true,
    circles: [{ dx: 3.5, dz: 1.5 }, { dx: 6, dz: 3 }] },
  /* 6 – ANALYTICS bottom-center */
  { id: "analytics", x: 5,    z: 10,  w: 9,   d: 4,   h: 2.5 },
  /* 7 – DESIGN    bottom-right */
  { id: "design",    x: 14.5, z: 5.5, w: 6.5, d: 8.5, h: 3.5 },
];

/* Painter's order: sort by front-diagonal ascending (draw farthest first) */
const DRAW_ORDER = [...ROOMS].sort(
  (a, b) => (a.x + a.w / 2 + a.z + a.d / 2) - (b.x + b.w / 2 + b.z + b.d / 2)
);

/* Sofa/focal zone inside FOCUS room */
const SOFA = { x: 7, z: 6.5, w: 5, d: 3, h: 0.35 };

/* ═══════════════════════════════════════════════════════
   FACE HELPERS
═══════════════════════════════════════════════════════ */
function faceTop(x: number, z: number, w: number, d: number, h: number) {
  return [iso(x, z, h), iso(x + w, z, h), iso(x + w, z + d, h), iso(x, z + d, h)];
}
function faceLeft(x: number, z: number, d: number, h: number) {
  /* X-constant face (left in screen) */
  return [iso(x, z, 0), iso(x, z + d, 0), iso(x, z + d, h), iso(x, z, h)];
}
function faceRight(x: number, z: number, w: number, h: number) {
  /* Z-constant face (right in screen) */
  return [iso(x, z, 0), iso(x + w, z, 0), iso(x + w, z, h), iso(x, z, h)];
}

/* ═══════════════════════════════════════════════════════
   COLOR PALETTES
═══════════════════════════════════════════════════════ */
const BLOCKOUT: Record<string, { top: string; left: string; right: string }> = {
  entry:     { top: "#484848", left: "#282828", right: "#343434" },
  creative:  { top: "#787878", left: "#484848", right: "#5C5C5C" },
  command:   { top: "#6C6C6C", left: "#404040", right: "#545454" },
  meeting:   { top: "#7C7C7C", left: "#4C4C4C", right: "#606060" },
  focus:     { top: "#929292", left: "#5A5A5A", right: "#6E6E6E" },
  analytics: { top: "#585858", left: "#343434", right: "#444444" },
  design:    { top: "#686868", left: "#3E3E3E", right: "#525252" },
};

function massColor(h: number, face: "top" | "left" | "right") {
  /* height-coded: low=dark, high=light */
  const t = (h - 1.5) / 2.5; // 0→1
  const l = 12 + t * 38;     /* lightness 12%→50% */
  const s = 25 + t * 15;
  const hue = 210 + t * 25;
  const offset = face === "top" ? 12 : face === "right" ? -6 : -18;
  return `hsl(${hue},${s.toFixed(0)}%,${(l + offset).toFixed(0)}%)`;
}

/* ═══════════════════════════════════════════════════════
   CUBOID COMPONENT
═══════════════════════════════════════════════════════ */
type Mode = "blockout" | "wireframe" | "massing";

function Cuboid({
  room,
  mode,
  strokeOnly = false,
}: {
  room: Room;
  mode: Mode;
  strokeOnly?: boolean;
}) {
  const { id, x, z, w, d, h } = room;
  const top   = faceTop(x, z, w, d, h);
  const left  = faceLeft(x, z, d, h);
  const right = faceRight(x, z, w, h);

  if (mode === "wireframe") {
    const sc = room.focal ? "#AAAAAA" : "#666666";
    const sw = room.focal ? 1.5 : 1;
    return (
      <g>
        <polygon points={pts(left)}  fill="none" stroke={sc} strokeWidth={sw} />
        <polygon points={pts(right)} fill="none" stroke={sc} strokeWidth={sw} />
        <polygon points={pts(top)}   fill="none" stroke={room.focal ? "#CCCCCC" : "#888888"} strokeWidth={sw} />
        {/* vertical edges */}
        {[
          [iso(x,     z,     0), iso(x,     z,     h)],
          [iso(x + w, z,     0), iso(x + w, z,     h)],
          [iso(x,     z + d, 0), iso(x,     z + d, h)],
        ].map(([a, b], i) => (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={sc} strokeWidth={sw} />
        ))}
      </g>
    );
  }

  const pal = mode === "massing"
    ? { top: massColor(h, "top"), left: massColor(h, "left"), right: massColor(h, "right") }
    : BLOCKOUT[id] ?? BLOCKOUT.design;

  const stroke = mode === "blockout" ? "#111111" : "none";
  const sw = 0.6;

  return (
    <g>
      <polygon points={pts(left)}  fill={pal.left}  stroke={stroke} strokeWidth={sw} />
      <polygon points={pts(right)} fill={pal.right} stroke={stroke} strokeWidth={sw} />
      <polygon points={pts(top)}   fill={pal.top}   stroke={stroke} strokeWidth={sw} />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════
   FLOOR SLAB (full office footprint)
═══════════════════════════════════════════════════════ */
function FloorSlab({ mode }: { mode: Mode }) {
  const corners = [iso(0, 0), iso(21, 0), iso(21, 14), iso(0, 14)];
  if (mode === "wireframe") {
    return <polygon points={pts(corners)} fill="none" stroke="#333" strokeWidth="1" />;
  }
  const fill = mode === "massing" ? "#080E1A" : "#1C1C1C";
  return <polygon points={pts(corners)} fill={fill} stroke="#0A0A0A" strokeWidth="0.5" />;
}

/* ═══════════════════════════════════════════════════════
   OUTER WALLS (left, back, right boundary)
═══════════════════════════════════════════════════════ */
function OuterWalls({ mode }: { mode: Mode }) {
  const H = 4.2;
  const wallColor = mode === "massing" ? "#0A1428" : "#1A1A1A";
  const edgeColor = mode === "wireframe" ? "#444" : "#0A0A0A";
  const sw = mode === "wireframe" ? 1.5 : 0.5;

  /* Left outer wall: x=0, z=0→14 */
  const leftWall = [iso(0, 0, 0), iso(0, 14, 0), iso(0, 14, H), iso(0, 0, H)];
  /* Back wall: z=0, x=0→21 */
  const backWall = [iso(0, 0, 0), iso(21, 0, 0), iso(21, 0, H), iso(0, 0, H)];
  /* Right outer wall: x=21, z=0→14 */
  const rightWall = [iso(21, 0, 0), iso(21, 14, 0), iso(21, 14, H), iso(21, 0, H)];

  return (
    <g>
      <polygon points={pts(leftWall)}  fill={wallColor} stroke={edgeColor} strokeWidth={sw} />
      <polygon points={pts(backWall)}  fill={wallColor} stroke={edgeColor} strokeWidth={sw} />
      <polygon points={pts(rightWall)} fill={wallColor} stroke={edgeColor} strokeWidth={sw} />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════
   FOCAL SOFA ZONE
═══════════════════════════════════════════════════════ */
function FocalZone({ mode }: { mode: Mode }) {
  const { x, z, w, d, h } = SOFA;
  const top   = faceTop(x, z, w, d, h);
  const left  = faceLeft(x, z, d, h);
  const right = faceRight(x, z, w, h);

  if (mode === "wireframe") {
    return (
      <g>
        <polygon points={pts(left)}  fill="none" stroke="#999" strokeWidth="1.5" strokeDasharray="4 2" />
        <polygon points={pts(right)} fill="none" stroke="#999" strokeWidth="1.5" strokeDasharray="4 2" />
        <polygon points={pts(top)}   fill="none" stroke="#BBB" strokeWidth="1.5" strokeDasharray="4 2" />
      </g>
    );
  }
  const fill = mode === "massing" ? "hsl(40,40%,30%)" : "#AAAAAA";
  const stroke = mode === "blockout" ? "#111" : "none";
  return (
    <g opacity={0.9}>
      <polygon points={pts(left)}  fill={mode === "massing" ? "hsl(40,40%,18%)" : "#888"} stroke={stroke} strokeWidth="0.5" />
      <polygon points={pts(right)} fill={mode === "massing" ? "hsl(40,40%,22%)" : "#999"} stroke={stroke} strokeWidth="0.5" />
      <polygon points={pts(top)}   fill={fill} stroke={stroke} strokeWidth="0.5" />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════
   CHARACTER CIRCLES (placeholder agents)
═══════════════════════════════════════════════════════ */
function Characters({ mode }: { mode: Mode }) {
  const color = mode === "wireframe" ? "#888" : mode === "massing" ? "#304060" : "#BCBCBC";
  const stroke = mode === "wireframe" ? "#666" : "#0A0A0A";
  const circles: { x: number; y: number }[] = [];

  for (const room of ROOMS) {
    if (!room.circles) continue;
    for (const c of room.circles) {
      const p = iso(room.x + c.dx, room.z + c.dz, room.h + 0.2);
      circles.push(p);
    }
  }

  return (
    <g>
      {circles.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={7}
          fill={color} stroke={stroke} strokeWidth="0.8" opacity={0.85} />
      ))}
    </g>
  );
}

/* ═══════════════════════════════════════════════════════
   CORRIDOR HINTS — thin floor strips between rooms
═══════════════════════════════════════════════════════ */
function Corridors({ mode }: { mode: Mode }) {
  const fill = mode === "wireframe" ? "none" : mode === "massing" ? "#060C18" : "#161616";
  const stroke = mode === "wireframe" ? "#2A2A2A" : "none";

  /* corridor between CREATIVE/COMMAND/MEETING row and FOCUS/ENTRY row */
  const corridorA = [iso(0, 5.5), iso(13, 5.5), iso(13, 5.5), iso(0, 5.5)]; // z=5-5.5 gap at x=0-8
  /* Thin connector x=0-5, z=5.5-8 (left corridor between CREATIVE and ENTRY) */
  const connL = [iso(0, 5.5), iso(5, 5.5), iso(5, 8), iso(0, 8)];
  /* Connector z=5-5.5 at x=8-13 between COMMAND and FOCUS */
  const connM = [iso(8, 5), iso(13, 5), iso(13, 5.5), iso(8, 5.5)];
  /* Corridor x=14-14.5 between FOCUS and DESIGN (vertical strip) */
  const connR = [iso(14, 5.5), iso(14.5, 5.5), iso(14.5, 14), iso(14, 14)];

  return (
    <g>
      {[connL, connM, connR].map((poly, i) => (
        <polygon key={i} points={pts(poly)} fill={fill} stroke={stroke} strokeWidth="0.5" />
      ))}
    </g>
  );
}

/* ═══════════════════════════════════════════════════════
   FULL SCENE SVG
═══════════════════════════════════════════════════════ */
function Scene({ mode, svgId }: { mode: Mode; svgId: string }) {
  const bg = mode === "blockout" ? "#111111" : mode === "wireframe" ? "#0A0A0A" : "#06090F";

  return (
    <svg
      id={svgId}
      viewBox={`0 0 ${VW} ${VH}`}
      width={VW}
      height={VH}
      style={{ display: "block", background: bg }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Floor slab */}
      <FloorSlab mode={mode} />

      {/* Corridor fills */}
      <Corridors mode={mode} />

      {/* Outer boundary walls (behind rooms) */}
      <OuterWalls mode={mode} />

      {/* Room cuboids — back-to-front */}
      {DRAW_ORDER.map((room) => (
        <Cuboid key={room.id} room={room} mode={mode} />
      ))}

      {/* Focal sofa zone (in FOCUS room) */}
      <FocalZone mode={mode} />

      {/* Character circles */}
      <Characters mode={mode} />

      {/* Room boundary outlines (wireframe only: dashed top edges) */}
      {mode === "wireframe" && DRAW_ORDER.map((room) => {
        const { x, z, w, d, h } = room;
        const floorPts = [iso(x, z), iso(x + w, z), iso(x + w, z + d), iso(x, z + d)];
        return (
          <polygon key={`outline-${room.id}`}
            points={pts(floorPts)}
            fill="none"
            stroke={room.focal ? "#888" : "#333"}
            strokeWidth="0.5"
            strokeDasharray="3 3"
          />
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   PNG DOWNLOAD HELPER
═══════════════════════════════════════════════════════ */
function downloadSVGAsPNG(svgId: string, filename: string) {
  const svgEl = document.getElementById(svgId) as SVGSVGElement | null;
  if (!svgEl) return;
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = VW;
    canvas.height = VH;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
}

/* ═══════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════ */
const VIEWS: { mode: Mode; label: string; file: string; svgId: string }[] = [
  { mode: "blockout",  label: "blockout.png",  file: "blockout.png",  svgId: "svg-blockout"  },
  { mode: "wireframe", label: "wireframe.png", file: "wireframe.png", svgId: "svg-wireframe" },
  { mode: "massing",   label: "massing.png",   file: "massing.png",   svgId: "svg-massing"   },
];

export default function BlockoutPage() {
  return (
    <div
      style={{
        background: "#050505",
        minHeight: "100vh",
        padding: "32px",
        fontFamily: "monospace",
      }}
    >
      {/* header */}
      <div style={{ marginBottom: 32, color: "#666", fontSize: 11, letterSpacing: "0.15em" }}>
        BLOCKOUT / 1600 × 1000 / ISO 38° / 7 ROOMS / SPATIAL COMPOSITION ONLY
      </div>

      {VIEWS.map(({ mode, label, file, svgId }) => (
        <div key={mode} style={{ marginBottom: 64 }}>
          {/* label row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginBottom: 12,
            }}
          >
            <span style={{ color: "#555", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              {label}
            </span>
            <button
              onClick={() => downloadSVGAsPNG(svgId, file)}
              style={{
                background: "none",
                border: "1px solid #333",
                color: "#555",
                fontSize: 9,
                padding: "3px 10px",
                cursor: "pointer",
                letterSpacing: "0.15em",
              }}
            >
              SAVE PNG
            </button>
          </div>

          {/* SVG canvas */}
          <div style={{ border: "1px solid #1A1A1A", display: "inline-block" }}>
            <Scene mode={mode} svgId={svgId} />
          </div>
        </div>
      ))}

      {/* Spatial notes */}
      <div
        style={{
          marginTop: 32,
          color: "#444",
          fontSize: 10,
          letterSpacing: "0.12em",
          lineHeight: 2,
          maxWidth: 900,
        }}
      >
        <div>ROOMS — 7 spaces, connected, no dead ends</div>
        <div>CREATIVE  x=0–8    z=0–5.5   h=4.0   upper-left</div>
        <div>COMMAND   x=8–13   z=0–5.0   h=3.5   upper-center</div>
        <div>MEETING   x=13–21  z=0–5.5   h=4.0   upper-right</div>
        <div>ENTRY     x=0–5    z=8–14    h=1.5   bottom-left</div>
        <div>FOCUS     x=5–14   z=5.5–10  h=3.0   center  ← focal / sofa zone</div>
        <div>ANALYTICS x=5–14   z=10–14   h=2.5   bottom-center</div>
        <div>DESIGN    x=14.5–21 z=5.5–14 h=3.5   bottom-right</div>
        <div style={{ marginTop: 12 }}>CAMERA — T=38px/unit · CX=682 · CY=244 · right-facing isometric</div>
        <div>HEIGHT LEVELS — low (h≤2): entry · medium (2–3.5): focus analytics design command · high (h≥4): creative meeting</div>
        <div>OCCUPANCY — blockout only, no detail, no lighting, no characters (circles = placeholders only)</div>
      </div>
    </div>
  );
}
