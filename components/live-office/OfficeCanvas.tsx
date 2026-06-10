"use client";

import { useEffect, useRef } from "react";

/* ── Canvas size (fixed, per design spec) ─────────────────────── */
const CANVAS_W = 1100;
const CANVAS_H = 550;
const TILE = 32; // on-screen tile size (floor grid)
const BG_COLOR = "#0d0a0f"; // dark cozy-loft base

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

/* ── sprite sources ─────────────────────────────────────────────
   filenames with spaces (character sheets) need URL-encoding.   ── */
const sp = (name: string) => `/sprites/${encodeURIComponent(name)}.png`;

const SPRITES = {
  floor: "/sprites/floor_iso.png",
  wall: "/sprites/wall_iso.png",
  deskSE: "/sprites/desk_iso_se.png",
  deskSW: "/sprites/desk_iso_sw.png",
  deskNE: "/sprites/desk_iso_ne.png",
  chairSE: "/sprites/chair_iso_se.png",
  chairSW: "/sprites/chair_iso_sw.png",
  sofa: "/sprites/sofa_iso.png",
  coffeeTable: "/sprites/coffee_table_iso.png",
  lamp: "/sprites/lamp_floor.png",
  neonFocus: "/sprites/neon_focus.png",
  neonDesign: "/sprites/neon_design.png",
} as const;

/* ── Zones — character homes + label badges ────────────────────── */
type ZoneDef = {
  id: string;
  homeX: number; // fractional canvas position of the character's seat
  homeY: number;
  color: string; // badge / rug accent hue
  rugW: number;
  rugH: number;
  label?: string; // emoji + zone name (omitted for the roaming CEO)
};

const ZONES: ZoneDef[] = [
  { id: "z-marketing", homeX: 0.12, homeY: 0.30, color: "#ff9fc4", rugW: 0.20, rugH: 0.30, label: "💗 Marketing" },
  { id: "z-content", homeX: 0.40, homeY: 0.27, color: "#8fcdfa", rugW: 0.18, rugH: 0.28, label: "💙 Content" },
  { id: "z-design", homeX: 0.80, homeY: 0.30, color: "#c6a6ff", rugW: 0.20, rugH: 0.30, label: "💜 Design" },
  { id: "z-ads", homeX: 0.13, homeY: 0.80, color: "#ffe08a", rugW: 0.20, rugH: 0.28, label: "💛 Ads" },
  { id: "z-support", homeX: 0.50, homeY: 0.83, color: "#ffb685", rugW: 0.18, rugH: 0.26, label: "🧡 Support" },
  { id: "z-ops", homeX: 0.84, homeY: 0.80, color: "#8fe9c4", rugW: 0.20, rugH: 0.28, label: "💚 Operations" },
  // CEO's quiet lounge seat — roams between every zone, no badge of its own
  { id: "z-ceo", homeX: 0.5, homeY: 0.55, color: "#ffd9a0", rugW: 0.16, rugH: 0.20 },
];

type CharDef = { sprite: string; zoneId: string };

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

/** Scenery sprite + the bounding box of its actual (non-transparent) art —
 *  every scenery PNG ships as a large square canvas with the object drawn
 *  somewhere inside it, so we measure the real art to size it correctly. */
type LoadedAsset = { img: HTMLCanvasElement; bbox: { x: number; y: number; w: number; h: number } };

function loadKeyedAsset(src: string): Promise<LoadedAsset> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = img.naturalWidth;
      off.height = img.naturalHeight;
      const octx = off.getContext("2d")!;
      octx.drawImage(img, 0, 0);
      let bbox = { x: 0, y: 0, w: off.width, h: off.height };
      try {
        const data = octx.getImageData(0, 0, off.width, off.height);
        const px = data.data;
        let minX = off.width, minY = off.height, maxX = -1, maxY = -1;
        for (let y = 0; y < off.height; y++) {
          for (let x = 0; x < off.width; x++) {
            const i = (y * off.width + x) * 4;
            if (px[i] < BLACK_THRESHOLD && px[i + 1] < BLACK_THRESHOLD && px[i + 2] < BLACK_THRESHOLD) {
              px[i + 3] = 0;
            } else {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        octx.putImageData(data, 0, 0);
        if (maxX >= minX && maxY >= minY) {
          bbox = { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
        }
      } catch {
        /* tainted canvas (cross-origin) — leave as full-frame */
      }
      resolve({ img: off, bbox });
    };
    img.onerror = () => resolve({ img: document.createElement("canvas"), bbox: { x: 0, y: 0, w: 0, h: 0 } });
    img.src = src;
  });
}

/* ── Static furniture & decoration layout (isometric scene) ─────────
   Every piece anchors at (xFrac, yFrac) — its on-floor footprint centre
   — and is scaled from its natural sprite size. Depth (Y) ordering is
   derived straight from these anchors, so desk → chair → seated
   character naturally resolves back-to-front per the spec.        ── */
type FurnitureDef = {
  id: string;
  src: string;
  xFrac: number;
  yFrac: number;
  height: number; // target on-screen height in px — width follows the art's aspect ratio
  glow?: boolean; // warm lamp — emits a radial amber glow overlay
};

/** Per-zone desk/chair sprite picks, matching the isometric layout spec. */
const ZONE_SEATING: Record<string, { desk: string; chair: string }> = {
  "z-marketing": { desk: SPRITES.deskSE, chair: SPRITES.chairSE },
  "z-content": { desk: SPRITES.deskSE, chair: SPRITES.chairSE },
  "z-design": { desk: SPRITES.deskSW, chair: SPRITES.chairSW },
  "z-ads": { desk: SPRITES.deskNE, chair: SPRITES.chairSE },
  "z-support": { desk: SPRITES.deskSW, chair: SPRITES.chairSW },
  "z-ops": { desk: SPRITES.deskSW, chair: SPRITES.chairSW },
};

const FURNITURE: FurnitureDef[] = [
  // Desk + chair pairs, offset just behind each zone's seat so the
  // Y-sort naturally draws desk → chair → character back-to-front.
  ...ZONES.filter((z) => ZONE_SEATING[z.id]).flatMap((zone): FurnitureDef[] => {
    const seat = ZONE_SEATING[zone.id];
    return [
      { id: `desk-${zone.id}`, src: seat.desk, xFrac: zone.homeX, yFrac: zone.homeY - 0.05, height: 70 },
      { id: `chair-${zone.id}`, src: seat.chair, xFrac: zone.homeX, yFrac: zone.homeY - 0.022, height: 50 },
    ];
  }),
  // Lounge — bottom-centre, anchors the CEO's roaming seat
  { id: "sofa", src: SPRITES.sofa, xFrac: 0.5, yFrac: 0.50, height: 78 },
  { id: "coffee-table", src: SPRITES.coffeeTable, xFrac: 0.5, yFrac: 0.555, height: 38 },
  // Floor lamps — also drive the warm glow overlay pass
  { id: "lamp-1", src: SPRITES.lamp, xFrac: 0.06, yFrac: 0.66, height: 95, glow: true },
  { id: "lamp-2", src: SPRITES.lamp, xFrac: 0.94, yFrac: 0.66, height: 95, glow: true },
  { id: "lamp-3", src: SPRITES.lamp, xFrac: 0.5, yFrac: 0.34, height: 95, glow: true },
];

/** Wall-mounted neon signs — flat against the back wall, no depth sort. */
const WALL_SIGNS: { src: string; xFrac: number; yFrac: number; height: number }[] = [
  { src: SPRITES.neonFocus, xFrac: 0.18, yFrac: 0.045, height: 46 },
  { src: SPRITES.neonDesign, xFrac: 0.80, yFrac: 0.045, height: 46 },
];

/** All static scene assets (furniture, walls, signs) loaded up front. */
const ASSET_SOURCES: string[] = [
  SPRITES.floor,
  SPRITES.wall,
  SPRITES.deskSE,
  SPRITES.deskSW,
  SPRITES.deskNE,
  SPRITES.chairSE,
  SPRITES.chairSW,
  SPRITES.sofa,
  SPRITES.coffeeTable,
  SPRITES.lamp,
  SPRITES.neonFocus,
  SPRITES.neonDesign,
];

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
      const hx = zone.homeX * CANVAS_W + (Math.random() * 40 - 20);
      const hy = zone.homeY * CANVAS_H + (Math.random() * 16 - 8);
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

    /** Color-keyed scenery sprites (with measured art bbox), by source path. */
    const assets = new Map<string, LoadedAsset>();

    Promise.all([
      Promise.all(ASSET_SOURCES.map((src) => loadKeyedAsset(src))),
      Promise.all(characters.map((c) => loadKeyed(c.def.sprite))),
    ]).then(([sceneAssets, charImgs]) => {
      if (cancelled) return;
      ASSET_SOURCES.forEach((src, i) => assets.set(src, sceneAssets[i]));
      charImgs.forEach((img, i) => (characters[i].img = img));
    });

    /** Draws a scenery sprite cropped to its measured art bbox, scaled so
     *  it renders at `targetH` px tall (width follows its aspect ratio),
     *  anchored at on-screen point (cx, bottomY) — bottom-centre. */
    function drawAsset(asset: LoadedAsset, targetH: number, cx: number, bottomY: number) {
      const { bbox } = asset;
      if (bbox.w <= 0 || bbox.h <= 0) return;
      const w = targetH * (bbox.w / bbox.h);
      const h = targetH;
      ctx!.drawImage(asset.img, bbox.x, bbox.y, bbox.w, bbox.h, cx - w / 2, bottomY - h, w, h);
    }

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

    /* ---- 1. dark base + 2. floor + zone rugs + 3. back wall + 4. neon ---- */
    function drawBackdrop() {
      // 1. dark cinematic base — cozy studio loft at night
      ctx!.fillStyle = BG_COLOR;
      ctx!.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // 2. isometric floor tiles, dialed down to a soft dark texture
      const floor = assets.get(SPRITES.floor);
      if (floor && floor.img.width) {
        ctx!.save();
        ctx!.globalAlpha = 0.4;
        for (let y = 0; y < CANVAS_H; y += TILE) {
          for (let x = 0; x < CANVAS_W; x += TILE) {
            ctx!.drawImage(floor.img, x, y, TILE, TILE);
          }
        }
        ctx!.restore();
      }

      // pastel zone rugs — muted accents that match each badge hue
      for (const zone of ZONES) {
        const cx = zone.homeX * CANVAS_W;
        const cy = zone.homeY * CANVAS_H;
        const w = zone.rugW * CANVAS_W;
        const h = zone.rugH * CANVAS_H;
        ctx!.save();
        ctx!.globalAlpha = 0.14;
        ctx!.fillStyle = zone.color;
        roundRect(ctx!, cx - w / 2, cy - h / 2, w, h, 22);
        ctx!.fill();
        ctx!.restore();
      }

      // moody dark vignette — deepens the cinematic, late-night feel
      const vignette = ctx!.createRadialGradient(
        CANVAS_W / 2, CANVAS_H / 2, Math.min(CANVAS_W, CANVAS_H) * 0.22,
        CANVAS_W / 2, CANVAS_H / 2, Math.max(CANVAS_W, CANVAS_H) * 0.68
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx!.fillStyle = vignette;
      ctx!.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // 3. dark brick back wall along the top edge
      const wall = assets.get(SPRITES.wall);
      if (wall && wall.img.width) {
        const wallH = CANVAS_H * 0.15;
        ctx!.save();
        ctx!.globalAlpha = 0.92;
        for (let x = 0; x < CANVAS_W; x += TILE) {
          ctx!.drawImage(wall.img, x, 0, TILE, wallH);
        }
        ctx!.restore();
        ctx!.fillStyle = "rgba(4,3,7,0.45)";
        ctx!.fillRect(0, wallH * 0.72, CANVAS_W, wallH * 0.28);
      }

      // 4. neon wall signs — warm amber glow against the dark brick
      ctx!.save();
      ctx!.shadowColor = "rgba(255,176,96,0.65)";
      ctx!.shadowBlur = 16;
      for (const sign of WALL_SIGNS) {
        const asset = assets.get(sign.src);
        if (!asset) continue;
        drawAsset(asset, sign.height, sign.xFrac * CANVAS_W, sign.yFrac * CANVAS_H + sign.height);
      }
      ctx!.restore();

      drawZoneLabels();
    }

    function drawZoneLabels() {
      ctx!.save();
      ctx!.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx!.textBaseline = "middle";
      for (const zone of ZONES) {
        if (!zone.label) continue;
        const cx = zone.homeX * CANVAS_W;
        const cy = zone.homeY * CANVAS_H;
        const w = zone.rugW * CANVAS_W;
        const h = zone.rugH * CANVAS_H;
        const text = zone.label;
        const padX = 8;
        const tw = ctx!.measureText(text).width;
        const bx = cx - w / 2 + 6;
        const by = cy - h / 2 + 6;
        const bw = tw + padX * 2;
        const bh = 20;

        ctx!.fillStyle = "rgba(15,12,22,0.72)";
        ctx!.strokeStyle = "rgba(255,255,255,0.08)";
        ctx!.lineWidth = 1;
        roundRect(ctx!, bx, by, bw, bh, 9);
        ctx!.fill();
        ctx!.stroke();

        ctx!.fillStyle = "#f4e9da";
        ctx!.fillText(text, bx + padX, by + bh / 2 + 1);
      }
      ctx!.restore();
    }

    type DrawItem = { y: number; draw: () => void };

    /** 5. Furniture + characters in one Y-sorted list — desk behind chair
     *  behind character, interleaved correctly with everyone walking. */
    function buildSceneItems(): DrawItem[] {
      const items: DrawItem[] = [];

      for (const f of FURNITURE) {
        const asset = assets.get(f.src);
        if (!asset) continue;
        const cx = f.xFrac * CANVAS_W;
        const bottomY = f.yFrac * CANVAS_H;
        items.push({
          y: bottomY,
          draw: () => drawAsset(asset, f.height, cx, bottomY),
        });
      }

      for (const c of characters) {
        items.push({ y: c.y, draw: () => drawCharacter(c) });
      }

      return items;
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
      const dy = c.y - dh * 0.82; // foot anchor

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
      ctx!.fillStyle = "rgba(28,22,34,0.92)";
      ctx!.strokeStyle = "rgba(255,200,150,0.18)";
      ctx!.lineWidth = 1;
      roundRect(ctx!, x, y, w, h, 10);
      ctx!.fill();
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.moveTo(cx - 6, y + h);
      ctx!.lineTo(cx + 6, y + h);
      ctx!.lineTo(cx, y + h + 8);
      ctx!.closePath();
      ctx!.fillStyle = "rgba(28,22,34,0.92)";
      ctx!.fill();

      ctx!.fillStyle = "#f6eade"; // warm parchment text
      ctx!.textBaseline = "middle";
      ctx!.fillText(text, x + padX, y + h / 2 + 1);
      ctx!.restore();
    }

    /* ---- 7. warm radial glow overlays near floor lamps ---- */
    function drawLampGlows() {
      ctx!.save();
      ctx!.globalCompositeOperation = "lighter";
      for (const f of FURNITURE) {
        if (!f.glow) continue;
        const cx = f.xFrac * CANVAS_W;
        const cy = f.yFrac * CANVAS_H - 36;
        const r = 100;
        const glow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
        glow.addColorStop(0, "rgba(255,196,120,0.32)");
        glow.addColorStop(1, "rgba(255,196,120,0)");
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(cx, cy, r, 0, Math.PI * 2);
        ctx!.fill();
      }
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

      drawBackdrop(); // 1-4: base, floor, walls, neon, labels

      update(dt);

      // 5-6: furniture + characters (with speech), depth-sorted by Y
      const sceneItems = buildSceneItems();
      sceneItems.sort((a, b) => a.y - b.y);
      for (const item of sceneItems) item.draw();

      drawLampGlows(); // 7: warm golden glow near lamps

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
