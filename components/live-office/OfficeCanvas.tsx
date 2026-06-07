"use client";

import { useEffect, useRef } from "react";

/* ── Canvas size (fixed, per design spec) ─────────────────────── */
const CANVAS_W = 1100;
const CANVAS_H = 550;
const TILE = 32; // on-screen tile size (floor/wall grid)

/* ── Character sprite sheet geometry ───────────────────────────
   Sheet ≈ 1536x1024, 3 rows of equal height (≈341px), empirically
   measured frame x-positions (consistent across all 8 character sheets):
     Row 1: walk_down x4, walk_up x4, idle x2
     Row 2: walk_left x4, walk_right x4, sitting_at_desk x2 (wider — incl. desk art)
     Row 3: idle x2 (extra)
   Background is pure black (#000) with no alpha — removed at runtime
   via per-pixel color-keying (getImageData/putImageData).        ──── */
const SHEET_W = 1536;
const SHEET_H = 1024;
const ROW_H = Math.floor(SHEET_H / 3);
const FRAME_W = 93;
const SIT_FRAME_W = 137;

const ROWS: Record<string, { y: number; xs: number[]; w: number }> = {
  walkDown: { y: 0 * ROW_H, xs: [61, 208, 355, 503], w: FRAME_W },
  walkUp: { y: 0 * ROW_H, xs: [668, 811, 956, 1100], w: FRAME_W },
  idle: { y: 0 * ROW_H, xs: [1241, 1383], w: FRAME_W },
  walkLeft: { y: 1 * ROW_H, xs: [55, 197, 339, 482], w: FRAME_W },
  walkRight: { y: 1 * ROW_H, xs: [647, 787, 928, 1070], w: FRAME_W },
  sitting: { y: 1 * ROW_H, xs: [1196, 1339], w: SIT_FRAME_W },
  idle2: { y: 2 * ROW_H, xs: [61, 208], w: FRAME_W },
};
type AnimName = keyof typeof ROWS;

/* ── office_tileset..png — 4 columns x 6 rows grid, ~313x209 cells ─ */
const TS_SRC = "/sprites/office_tileset..png";
const CELL_W = 1254 / 4;
const CELL_H = 1254 / 6;
const cell = (col: number, row: number) => ({ x: col * CELL_W, y: row * CELL_H, w: CELL_W, h: CELL_H });
const TILESET = {
  floor: { src: TS_SRC, ...cell(0, 0) }, // beige carpet — tileset row1 col1
  wall: { src: TS_SRC, ...cell(1, 0) }, // brick wall texture
  desk: { src: TS_SRC, ...cell(2, 2) }, // computer desk (with monitor)
  chair: { src: TS_SRC, ...cell(0, 3) }, // office chair
} as const;

type ZoneDef = {
  id: string;
  deskX: number;
  deskY: number;
  color: string;
  rugW: number;
  rugH: number;
};

const ZONES: ZoneDef[] = [
  { id: "z-marketing", deskX: 0.12, deskY: 0.22, color: "#ffd4e8", rugW: 0.22, rugH: 0.34 },
  { id: "z-content", deskX: 0.40, deskY: 0.20, color: "#cdeaff", rugW: 0.20, rugH: 0.32 },
  { id: "z-design", deskX: 0.78, deskY: 0.22, color: "#e1d4ff", rugW: 0.24, rugH: 0.34 },
  { id: "z-ads", deskX: 0.14, deskY: 0.74, color: "#fff0c4", rugW: 0.22, rugH: 0.34 },
  { id: "z-support", deskX: 0.48, deskY: 0.76, color: "#ffdfc7", rugW: 0.20, rugH: 0.32 },
  { id: "z-ops", deskX: 0.82, deskY: 0.74, color: "#c8f5e2", rugW: 0.24, rugH: 0.34 },
  // CEO's quiet centre desk — roams between every zone
  { id: "z-ceo", deskX: 0.5, deskY: 0.48, color: "#ffeec2", rugW: 0.16, rugH: 0.22 },
];

type CharDef = { sprite: string; zoneId: string };

/** sprite filenames contain spaces — encode for use as URLs */
const sp = (name: string) => `/sprites/${encodeURIComponent(name)}.png`;

const CHARACTERS: CharDef[] = [
  { sprite: sp("CEO"), zoneId: "z-ceo" },
  { sprite: sp("Marketing Strategist"), zoneId: "z-marketing" }, // pink hair
  { sprite: sp("Content Creator"), zoneId: "z-content" }, // blue hair
  { sprite: sp("Graphic Designer"), zoneId: "z-design" }, // purple hair
  { sprite: sp("Ads Specialist"), zoneId: "z-ads" }, // black hair
  { sprite: sp("Customer Service"), zoneId: "z-support" }, // brown hair, headset
  { sprite: sp("Order Manager"), zoneId: "z-ops" }, // light blue hair, cap
];

const PHRASES = [
  "วันนี้ยอดวิวพุ่งเลย! 🚀",
  "แคมเปญนี้ ROI ดีมาก 📈",
  "แคปชั่นนี้ปังแน่นอน ✨",
  "ลูกค้าตอบกลับเร็วมาก 💬",
  "ส่งงานทันเดดไลน์แล้วจ้า ✅",
  "ลองคอนเทนต์มุมใหม่ดูไหม? 💡",
  "ยอดขายเดือนนี้โตขึ้น 20% 🎉",
  "มาช่วยกันรีวิวงานหน่อย 👀",
];

type Phase = "sitting" | "walkingTo" | "chatting" | "walkingBack";

type Character = {
  def: CharDef;
  img: HTMLCanvasElement | null; // color-keyed copy
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  facing: AnimName;
  animFrame: number;
  animTimer: number;
  phase: Phase;
  phaseTimer: number;
  target: Character | null;
  speech: string | null;
  speechTimer: number;
  speechCooldown: number;
};

const ANIM_FPS = 6;
const WALK_SPEED = 70; // px/sec
const SCALE = 0.34; // character draw scale
const BLACK_THRESHOLD = 24;

/** Loads an image and returns a color-keyed copy: pure-black pixels -> transparent. */
function loadKeyed(src: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = img.naturalWidth;
      off.height = img.naturalHeight;
      const octx = off.getContext("2d")!;
      octx.drawImage(img, 0, 0);
      try {
        const data = octx.getImageData(0, 0, off.width, off.height);
        const px = data.data;
        for (let i = 0; i < px.length; i += 4) {
          if (px[i] < BLACK_THRESHOLD && px[i + 1] < BLACK_THRESHOLD && px[i + 2] < BLACK_THRESHOLD) {
            px[i + 3] = 0;
          }
        }
        octx.putImageData(data, 0, 0);
      } catch {
        /* tainted canvas (cross-origin) — leave as-is */
      }
      resolve(off);
    };
    img.onerror = () => resolve(document.createElement("canvas"));
    img.src = src;
  });
}

export default function OfficeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let cancelled = false;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const characters: Character[] = CHARACTERS.map((def) => {
      const zone = ZONES.find((z) => z.id === def.zoneId)!;
      const hx = zone.deskX * CANVAS_W + (Math.random() * 40 - 20);
      const hy = zone.deskY * CANVAS_H + (Math.random() * 16 - 8);
      return {
        def,
        img: null,
        homeX: hx,
        homeY: hy,
        x: hx,
        y: hy,
        facing: "idle",
        animFrame: 0,
        animTimer: 0,
        phase: "sitting",
        phaseTimer: 8 + Math.random() * 2, // visit another zone every 8-10s
        target: null,
        speech: null,
        speechTimer: 0,
        speechCooldown: 5 + Math.random() * 3, // speech bubble every 5-8s
      };
    });

    let floorTile: HTMLCanvasElement | null = null;
    let wallTile: HTMLCanvasElement | null = null;
    let deskTile: HTMLCanvasElement | null = null;
    let chairTile: HTMLCanvasElement | null = null;

    Promise.all([
      loadKeyed(TILESET.floor.src),
      loadKeyed(TILESET.wall.src),
      loadKeyed(TILESET.desk.src),
      loadKeyed(TILESET.chair.src),
      ...characters.map((c) => loadKeyed(c.def.sprite)),
    ]).then(([floorImg, wall, desk, chair, ...keyed]) => {
      if (cancelled) return;
      floorTile = floorImg;
      wallTile = wall;
      deskTile = desk;
      chairTile = chair;
      keyed.forEach((c, i) => (characters[i].img = c));
    });

    function pickTarget(c: Character): Character | null {
      const others = characters.filter((o) => o !== c);
      if (others.length === 0) return null;
      return others[Math.floor(Math.random() * others.length)];
    }

    function startSpeech(c: Character) {
      c.speech = PHRASES[Math.floor(Math.random() * PHRASES.length)];
      c.speechTimer = 3 + Math.random() * 1.5;
      c.speechCooldown = 5 + Math.random() * 3;
    }

    function setWalkFacing(c: Character, dx: number, dy: number) {
      if (Math.abs(dx) > Math.abs(dy)) {
        c.facing = dx < 0 ? "walkLeft" : "walkRight";
      } else {
        c.facing = dy < 0 ? "walkUp" : "walkDown";
      }
    }

    function update(dt: number) {
      for (const c of characters) {
        c.animTimer += dt;
        const animDef = ROWS[c.facing];
        const frameCount = animDef.xs.length;
        if (c.animTimer >= 1 / ANIM_FPS) {
          c.animTimer = 0;
          c.animFrame = (c.animFrame + 1) % frameCount;
        }

        if (c.speech) {
          c.speechTimer -= dt;
          if (c.speechTimer <= 0) c.speech = null;
        } else {
          c.speechCooldown -= dt;
          if (c.speechCooldown <= 0) startSpeech(c);
        }

        c.phaseTimer -= dt;

        switch (c.phase) {
          case "sitting": {
            c.facing = "sitting";
            c.x = c.homeX;
            c.y = c.homeY;
            if (c.phaseTimer <= 0) {
              c.target = pickTarget(c);
              if (c.target) {
                c.phase = "walkingTo";
              } else {
                c.phaseTimer = 8 + Math.random() * 2;
              }
            }
            break;
          }
          case "walkingTo": {
            const t = c.target!;
            const tx = t.homeX + (t.homeX > c.x ? -34 : 34);
            const ty = t.homeY + 8;
            const dx = tx - c.x;
            const dy = ty - c.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 4) {
              c.phase = "chatting";
              c.phaseTimer = 2.5 + Math.random() * 2.5;
              c.facing = "idle";
              startSpeech(c);
            } else {
              setWalkFacing(c, dx, dy);
              const speed = WALK_SPEED;
              c.x += (dx / dist) * speed * dt;
              c.y += (dy / dist) * speed * dt;
            }
            break;
          }
          case "chatting": {
            c.facing = "idle";
            if (c.phaseTimer <= 0) c.phase = "walkingBack";
            break;
          }
          case "walkingBack": {
            const dx = c.homeX - c.x;
            const dy = c.homeY - c.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 4) {
              c.x = c.homeX;
              c.y = c.homeY;
              c.phase = "sitting";
              c.phaseTimer = 8 + Math.random() * 2;
              c.facing = "sitting";
              c.target = null;
            } else {
              setWalkFacing(c, dx, dy);
              const speed = WALK_SPEED;
              c.x += (dx / dist) * speed * dt;
              c.y += (dy / dist) * speed * dt;
            }
            break;
          }
        }
      }
    }

    function drawFloorAndWalls() {
      // warm cozy base tone beneath everything
      ctx!.fillStyle = "#fbf2e7";
      ctx!.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // beige carpet tile, dialed down so it reads as a soft texture
      if (floorTile && floorTile.width) {
        ctx!.save();
        ctx!.globalAlpha = 0.3;
        const f = TILESET.floor;
        for (let y = 0; y < CANVAS_H; y += TILE) {
          for (let x = 0; x < CANVAS_W; x += TILE) {
            ctx!.drawImage(floorTile, f.x, f.y, f.w, f.h, x, y, TILE, TILE);
          }
        }
        ctx!.restore();
      }

      // pastel carpet patch per zone, matching its label badge hue
      for (const zone of ZONES) {
        const cx = zone.deskX * CANVAS_W;
        const cy = zone.deskY * CANVAS_H;
        const w = zone.rugW * CANVAS_W;
        const h = zone.rugH * CANVAS_H;
        ctx!.save();
        ctx!.globalAlpha = 0.4;
        ctx!.fillStyle = zone.color;
        roundRect(ctx!, cx - w / 2, cy - h / 2, w, h, 22);
        ctx!.fill();
        ctx!.restore();
      }

      // cozy vignette — darken only near the edges
      const vignette = ctx!.createRadialGradient(
        CANVAS_W / 2, CANVAS_H / 2, Math.min(CANVAS_W, CANVAS_H) * 0.32,
        CANVAS_W / 2, CANVAS_H / 2, Math.max(CANVAS_W, CANVAS_H) * 0.62
      );
      vignette.addColorStop(0, "rgba(60,40,30,0)");
      vignette.addColorStop(1, "rgba(60,40,30,0.16)");
      ctx!.fillStyle = vignette;
      ctx!.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // dark border wall around the edges
      if (wallTile && wallTile.width) {
        const wt = TILESET.wall;
        const wallH = TILE * 0.6;
        ctx!.save();
        ctx!.globalAlpha = 0.55;
        for (let x = 0; x < CANVAS_W; x += TILE) {
          ctx!.drawImage(wallTile, wt.x, wt.y, wt.w, wt.h, x, 0, TILE, wallH);
          ctx!.drawImage(wallTile, wt.x, wt.y, wt.w, wt.h, x, CANVAS_H - wallH, TILE, wallH);
        }
        for (let y = 0; y < CANVAS_H; y += TILE) {
          ctx!.drawImage(wallTile, wt.x, wt.y, wt.w, wt.h, 0, y, wallH, TILE);
          ctx!.drawImage(wallTile, wt.x, wt.y, wt.w, wt.h, CANVAS_W - wallH, y, wallH, TILE);
        }
        ctx!.restore();

        ctx!.fillStyle = "rgba(40,28,24,0.32)";
        ctx!.fillRect(0, 0, CANVAS_W, wallH * 0.5);
        ctx!.fillRect(0, CANVAS_H - wallH * 0.5, CANVAS_W, wallH * 0.5);
        ctx!.fillRect(0, 0, wallH * 0.5, CANVAS_H);
        ctx!.fillRect(CANVAS_W - wallH * 0.5, 0, wallH * 0.5, CANVAS_H);
      }
    }

    function drawDesks() {
      for (const zone of ZONES) {
        const cx = zone.deskX * CANVAS_W;
        const cy = zone.deskY * CANVAS_H;
        if (deskTile && deskTile.width) {
          const d = TILESET.desk;
          const dw = d.w * 0.34;
          const dh = d.h * 0.34;
          ctx!.drawImage(deskTile, d.x, d.y, d.w, d.h, cx - dw / 2, cy - dh / 2, dw, dh);
        }
        if (chairTile && chairTile.width) {
          const ch = TILESET.chair;
          const cw = ch.w * 0.26;
          const chh = ch.h * 0.26;
          ctx!.drawImage(chairTile, ch.x, ch.y, ch.w, ch.h, cx - cw / 2, cy + 14, cw, chh);
        }
      }
    }

    function drawCharacter(c: Character) {
      if (!c.img || c.img.width === 0) return;
      const animDef = ROWS[c.facing];
      const sx = animDef.xs[c.animFrame % animDef.xs.length];
      const sy = animDef.y;
      const sw = animDef.w;

      const dw = sw * SCALE;
      const dh = ROW_H * SCALE;
      const dx = c.x - dw / 2;
      const dy = c.y - dh + dh * 0.18;

      ctx!.drawImage(c.img, sx, sy, sw, ROW_H, dx, dy, dw, dh);

      if (c.speech) drawSpeechBubble(c.speech, c.x, dy - 6);
    }

    function drawSpeechBubble(text: string, cx: number, bottomY: number) {
      ctx!.font = "12px ui-sans-serif, system-ui, sans-serif";
      const padX = 10;
      const textW = ctx!.measureText(text).width;
      const w = textW + padX * 2;
      const h = 26;
      const x = Math.min(Math.max(cx - w / 2, 6), CANVAS_W - w - 6);
      const y = bottomY - h - 10;

      ctx!.save();
      ctx!.fillStyle = "rgba(255,255,255,0.96)";
      ctx!.strokeStyle = "rgba(0,0,0,0.08)";
      ctx!.lineWidth = 1;
      roundRect(ctx!, x, y, w, h, 10);
      ctx!.fill();
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.moveTo(cx - 6, y + h);
      ctx!.lineTo(cx + 6, y + h);
      ctx!.lineTo(cx, y + h + 8);
      ctx!.closePath();
      ctx!.fillStyle = "rgba(255,255,255,0.96)";
      ctx!.fill();

      ctx!.fillStyle = "#3b3245";
      ctx!.textBaseline = "middle";
      ctx!.fillText(text, x + padX, y + h / 2 + 1);
      ctx!.restore();
    }

    function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      ctx!.clearRect(0, 0, CANVAS_W, CANVAS_H);
      drawFloorAndWalls();
      drawDesks();

      update(dt);

      const sorted = [...characters].sort((a, b) => a.y - b.y);
      for (const c of sorted) drawCharacter(c);

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 m-auto"
      style={{ imageRendering: "pixelated", maxWidth: "100%", maxHeight: "100%" }}
    />
  );
}
