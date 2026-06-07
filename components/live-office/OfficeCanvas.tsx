"use client";

import { useEffect, useRef } from "react";

/* ── Canvas size (fixed, per design spec) ─────────────────────── */
const CANVAS_W = 1100;
const CANVAS_H = 550;
const TILE = 32; // on-screen tile size (floor/wall grid)

/* ── Character sprite sheet geometry (1536x1024, empirically measured)
   Row 1 (y 0-512): walkDown(4), walkBack(4), idle(2), sitting(2)
   Row 2 (y 512-1024): walkLeft(4), walkRight(4)                ──── */
const FRAME_W = 104;
const FRAME_H = 512;
const ROWS: Record<string, { y: number; xs: number[] }> = {
  walkDown: { y: 0, xs: [20, 128, 236, 344] },
  walkBack: { y: 0, xs: [503, 615, 727, 839] },
  idle: { y: 0, xs: [1133, 1241] },
  sitting: { y: 0, xs: [1361, 1469] },
  walkLeft: { y: 512, xs: [42, 156, 270, 384] },
  walkRight: { y: 512, xs: [520, 632, 744, 856] },
};
type AnimName = keyof typeof ROWS;

/* ── Office tileset source rectangles (sampled from the sheets) ─── */
const TILESET = {
  floor: { src: "/sprites/Office tiles/Little_Bits_Office_Floors.png", x: 16, y: 0, w: 16, h: 16 },
  wall: { src: "/sprites/Office tiles/Little_Bits_office_walls.png", x: 0, y: 80, w: 21, h: 27 },
  desk: { src: "/sprites/Office tiles/Little_Bits_office_objects.png", x: 100, y: 70, w: 26, h: 15 },
  chair: { src: "/sprites/Office tiles/Little_Bits_office_objects.png", x: 16, y: 33, w: 16, h: 14 },
  computer: { src: "/sprites/Office tiles/Little_Bits_office_objects.png", x: 48, y: 4, w: 16, h: 18 },
} as const;

type ZoneDef = {
  id: string;
  /** desk anchor in fraction of canvas (0-1), characters sit just above the desk */
  deskX: number;
  deskY: number;
};

const ZONES: ZoneDef[] = [
  { id: "z-marketing", deskX: 0.12, deskY: 0.22 },
  { id: "z-content", deskX: 0.40, deskY: 0.20 },
  { id: "z-design", deskX: 0.78, deskY: 0.22 },
  { id: "z-ads", deskX: 0.14, deskY: 0.74 },
  { id: "z-support", deskX: 0.48, deskY: 0.76 },
  { id: "z-ops", deskX: 0.82, deskY: 0.74 },
];

type CharDef = { sprite: string; zoneId: string };

const CHARACTERS: CharDef[] = [
  { sprite: "/sprites/CEO.png", zoneId: "z-marketing" },
  { sprite: "/sprites/Marketing_Strategist.png", zoneId: "z-marketing" },
  { sprite: "/sprites/Content_Creator.png", zoneId: "z-content" },
  { sprite: "/sprites/Graphic_Designer.png", zoneId: "z-design" },
  { sprite: "/sprites/Video_Editor.png", zoneId: "z-design" },
  { sprite: "/sprites/Ads_Specialist.png", zoneId: "z-ads" },
  { sprite: "/sprites/Customer_Service.png", zoneId: "z-support" },
  { sprite: "/sprites/Order_Manager.png", zoneId: "z-ops" },
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
  raw: HTMLImageElement | null;
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
};

const ANIM_FPS = 6;
const WALK_SPEED = 70; // px/sec
const SCALE = 0.34; // character draw scale

/** Loads an image and returns a color-keyed copy (pure-black -> transparent) drawn on an offscreen canvas. */
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
          if (px[i] < 12 && px[i + 1] < 12 && px[i + 2] < 12) {
            px[i + 3] = 0;
          }
        }
        octx.putImageData(data, 0, 0);
      } catch {
        /* canvas tainted (cross-origin) — fall back to raw draw, alpha already present */
      }
      resolve(off);
    };
    img.onerror = () => resolve(document.createElement("canvas"));
    img.src = src;
  });
}

function loadPlain(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
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
        raw: null,
        img: null,
        homeX: hx,
        homeY: hy,
        x: hx,
        y: hy,
        facing: "idle",
        animFrame: 0,
        animTimer: 0,
        phase: "sitting",
        phaseTimer: 3 + Math.random() * 7,
        target: null,
        speech: null,
        speechTimer: 0,
      };
    });

    let floorTile: HTMLImageElement | null = null;
    let wallTile: HTMLImageElement | null = null;
    let deskTile: HTMLImageElement | null = null;
    let chairTile: HTMLImageElement | null = null;
    let computerTile: HTMLImageElement | null = null;

    Promise.all([
      loadPlain(TILESET.floor.src),
      loadPlain(TILESET.wall.src),
      loadPlain(TILESET.desk.src),
      loadPlain(TILESET.chair.src),
      loadPlain(TILESET.computer.src),
      ...characters.map((c) => loadKeyed(c.def.sprite)),
    ]).then(([floor, wall, desk, chair, computer, ...keyed]) => {
      if (cancelled) return;
      floorTile = floor;
      wallTile = wall;
      deskTile = desk;
      chairTile = chair;
      computerTile = computer;
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
    }

    function setWalkFacing(c: Character, dx: number, dy: number) {
      if (Math.abs(dx) > Math.abs(dy)) {
        c.facing = dx < 0 ? "walkLeft" : "walkRight";
      } else {
        c.facing = dy < 0 ? "walkBack" : "walkDown";
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
                c.phaseTimer = 4 + Math.random() * 6;
              }
            }
            if (Math.random() < 0.0007) startSpeech(c);
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
              c.phaseTimer = 5 + Math.random() * 8;
              c.facing = "sitting";
              c.target = null;
              if (Math.random() < 0.35) startSpeech(c);
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
      if (floorTile && floorTile.naturalWidth) {
        for (let y = 0; y < CANVAS_H; y += TILE) {
          for (let x = 0; x < CANVAS_W; x += TILE) {
            ctx!.drawImage(floorTile, TILESET.floor.x, TILESET.floor.y, TILESET.floor.w, TILESET.floor.h, x, y, TILE, TILE);
          }
        }
      } else {
        ctx!.fillStyle = "#f4ede2";
        ctx!.fillRect(0, 0, CANVAS_W, CANVAS_H);
      }

      if (wallTile && wallTile.naturalWidth) {
        const wt = TILESET.wall;
        const wallH = TILE * 0.7;
        // top & bottom borders
        for (let x = 0; x < CANVAS_W; x += TILE) {
          ctx!.drawImage(wallTile, wt.x, wt.y, wt.w, wt.h, x, 0, TILE, wallH);
          ctx!.drawImage(wallTile, wt.x, wt.y, wt.w, wt.h, x, CANVAS_H - wallH, TILE, wallH);
        }
        // left & right borders
        for (let y = 0; y < CANVAS_H; y += TILE) {
          ctx!.drawImage(wallTile, wt.x, wt.y, wt.w, wt.h, 0, y, wallH, TILE);
          ctx!.drawImage(wallTile, wt.x, wt.y, wt.w, wt.h, CANVAS_W - wallH, y, wallH, TILE);
        }
      }
    }

    function drawDesks() {
      for (const zone of ZONES) {
        const cx = zone.deskX * CANVAS_W;
        const cy = zone.deskY * CANVAS_H;
        if (deskTile && deskTile.naturalWidth) {
          const d = TILESET.desk;
          const dw = d.w * 1.8;
          const dh = d.h * 1.8;
          ctx!.drawImage(deskTile, d.x, d.y, d.w, d.h, cx - dw / 2, cy - dh / 2, dw, dh);
        }
        if (computerTile && computerTile.naturalWidth) {
          const m = TILESET.computer;
          const mw = m.w * 1.4;
          const mh = m.h * 1.4;
          ctx!.drawImage(computerTile, m.x, m.y, m.w, m.h, cx - mw / 2, cy - mh - 6, mw, mh);
        }
        if (chairTile && chairTile.naturalWidth) {
          const ch = TILESET.chair;
          const cw = ch.w * 1.6;
          const chh = ch.h * 1.6;
          ctx!.drawImage(chairTile, ch.x, ch.y, ch.w, ch.h, cx - cw / 2, cy + 8, cw, chh);
        }
      }
    }

    function drawCharacter(c: Character) {
      if (!c.img || c.img.width === 0) return;
      const animDef = ROWS[c.facing];
      const sx = animDef.xs[c.animFrame % animDef.xs.length];
      const sy = animDef.y;

      const dw = FRAME_W * SCALE;
      const dh = FRAME_H * SCALE;
      const dx = c.x - dw / 2;
      const dy = c.y - dh + dh * 0.18;

      ctx!.drawImage(c.img, sx, sy, FRAME_W, FRAME_H, dx, dy, dw, dh);

      if (c.speech) drawSpeechBubble(c.speech, c.x, dy - 6);
    }

    function drawSpeechBubble(text: string, cx: number, bottomY: number) {
      ctx!.font = "12px ui-sans-serif, system-ui, sans-serif";
      const padX = 10;
      const padY = 7;
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
      ctx!.fillText(text, x + padX, y + h / 2 + 1 + (padY - padY));
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
