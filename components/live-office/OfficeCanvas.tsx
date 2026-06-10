"use client";

import { useEffect, useRef } from "react";

/* ── Canvas size (fixed) ───────────────────────────────────────── */
const CANVAS_W = 1100;
const CANVAS_H = 550;
const BG_COLOR = "#0a0a0f"; // dark cozy-loft base
const TILE = 32; // floor tiling step
const ISO_TILE_W = 64; // isometric tile width
const ISO_TILE_H = 32; // isometric tile height

/* ── Character sprite sheet geometry (shared by every character) ─
   Sheet: 1536x1024, three rows. Frames empirically aligned. Black
   background pixels are color-keyed to transparent at load time. ── */
const SHEET_W = 1536;
const SHEET_H = 1024;
const ROW_H = Math.floor(SHEET_H / 3); // 341
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

/* ── Sprite sources ──────────────────────────────────────────────
   Character filenames contain spaces — encode for use as URLs.   ── */
const sp = (name: string) => `/sprites/${encodeURIComponent(name)}.png`;

const S = {
  // floors
  floor: "/sprites/floor_iso.png",
  floorStone: "/sprites/floor_stone_iso.png",
  floorCarpet: "/sprites/floor_carpet_iso.png",
  floorEntrance: "/sprites/floor_entrance_iso.png",
  // walls
  wall: "/sprites/wall_iso.png",
  // furniture
  deskSE: "/sprites/desk_iso_se.png",
  deskSW: "/sprites/desk_iso_sw.png",
  deskNE: "/sprites/desk_iso_ne.png",
  chairSE: "/sprites/chair_iso_se.png",
  chairSW: "/sprites/chair_iso_sw.png",
  sofa: "/sprites/sofa_iso.png",
  coffeeTable: "/sprites/coffee_table_iso.png",
  bookshelf: "/sprites/bookshelf_iso.png",
  shelfOpen: "/sprites/shelf_open_iso.png",
  shelfWall: "/sprites/shelf_wall_iso.png",
  coffeeBar: "/sprites/coffee_bar_iso.png",
  waterCooler: "/sprites/water_cooler_iso.png",
  whiteboard: "/sprites/whiteboard_iso.png",
  rug: "/sprites/rug_iso.png",
  lamp: "/sprites/lamp_floor.png",
  plantLarge: "/sprites/plant_large.png",
  plantTall: "/sprites/plant_tall.png",
  window: "/sprites/window_iso.png",
  neonFocus: "/sprites/neon_focus.png",
  neonDesign: "/sprites/neon_design.png",
} as const;

/* ── Zone definitions ────────────────────────────────────────────
   Zones are quadrant-sized rectangles (px) on the canvas. Each one
   carries a label badge + a floor sprite that tiles across its area.
   Character "homes" anchor in zone-local fractional coords.       ── */
type ZoneDef = {
  id: string;
  rect: { x: number; y: number; w: number; h: number };
  floor: string;
};

const Z_W = CANVAS_W / 3;
const Z_H = CANVAS_H / 2;

const ZONES: ZoneDef[] = [
  { id: "marketing", rect: { x: 0, y: 0, w: Z_W, h: Z_H }, floor: S.floorStone },
  { id: "entrance", rect: { x: Z_W, y: 0, w: Z_W, h: Z_H }, floor: S.floorEntrance },
  { id: "design", rect: { x: Z_W * 2, y: 0, w: Z_W, h: Z_H }, floor: S.floor },
  { id: "content", rect: { x: 0, y: Z_H, w: Z_W, h: Z_H }, floor: S.floor },
  { id: "lounge", rect: { x: Z_W, y: Z_H, w: Z_W, h: Z_H }, floor: S.floorCarpet },
  { id: "ops", rect: { x: Z_W * 2, y: Z_H, w: Z_W, h: Z_H }, floor: S.floorStone },
];

/* ── Furniture placement (isometric scene) ──────────────────────
   xFrac/yFrac are fractional canvas coordinates of the sprite's
   bottom-centre on-floor anchor; `height` is the target on-screen
   height in px (width follows the art's measured aspect ratio).  */
type FurnitureDef = {
  id: string;
  src: string;
  xFrac: number;
  yFrac: number;
  height: number;
  glow?: boolean;
  isLamp?: boolean;
  inForeground?: boolean; // drawn in the final foreground pass
};

/* Seat groups use a canonical centre-point (cx, cy) in fractional canvas
   coords. Relative to that anchor the pieces are offset in px inside
   buildSceneItems:
     chair   → (cx, cy + 10)  backmost
     character → (cx, cy - 20)  middle
     desk    → (cx, cy)        frontmost (overlaps character lower body)
   The furniture defs below store the *centre-point* as xFrac/yFrac;
   the px offsets are applied at draw time.                          */
type SeatCentre = { x: number; y: number; group: string };

const SEAT_CENTRES: SeatCentre[] = [
  // Zone 1 — Marketing/Ads
  { x: 0.13, y: 0.32, group: "mk-1" },
  { x: 0.25, y: 0.32, group: "mk-2" },
  // Zone 2 — Design/Ops
  { x: 0.74, y: 0.32, group: "dz-1" },
  { x: 0.86, y: 0.32, group: "dz-2" },
  // Zone 5 — Content/SEO
  { x: 0.14, y: 0.82, group: "ct-1" },
  { x: 0.26, y: 0.82, group: "ct-2" },
  // Zone 6 — Analytics/Operations
  { x: 0.74, y: 0.82, group: "op-1" },
  { x: 0.86, y: 0.82, group: "op-2" },
];

const FURNITURE: FurnitureDef[] = [
  /* Zone 1 — Marketing/Ads (top-left) ────────────────────────── */
  { id: "mk-shelf-1", src: S.bookshelf, xFrac: 0.025, yFrac: 0.22, height: 95 },
  { id: "mk-shelf-2", src: S.bookshelf, xFrac: 0.07, yFrac: 0.10, height: 90 },
  // desk + chair generated from SEAT_CENTRES below
  { id: "mk-plant-1", src: S.plantLarge, xFrac: 0.30, yFrac: 0.18, height: 80 },
  { id: "mk-plant-2", src: S.plantLarge, xFrac: 0.02, yFrac: 0.46, height: 80, inForeground: true },
  { id: "mk-lamp", src: S.lamp, xFrac: 0.32, yFrac: 0.42, height: 80, glow: true, isLamp: true, inForeground: true },

  /* Zone 3 — Entrance / live sign (top-centre) ───────────────── */
  { id: "ent-water", src: S.waterCooler, xFrac: 0.40, yFrac: 0.36, height: 80 },
  { id: "ent-plant-1", src: S.plantTall, xFrac: 0.44, yFrac: 0.45, height: 100, inForeground: true },
  { id: "ent-plant-2", src: S.plantTall, xFrac: 0.59, yFrac: 0.45, height: 100, inForeground: true },

  /* Zone 2 — Design/Ops (top-right) ──────────────────────────── */
  { id: "dz-shelf-open", src: S.shelfOpen, xFrac: 0.95, yFrac: 0.22, height: 95 },

  /* Zone 4 — Lounge (centre) ─────────────────────────────────── */
  { id: "lg-shelf-w-1", src: S.shelfWall, xFrac: 0.40, yFrac: 0.55, height: 70 },
  { id: "lg-shelf-w-2", src: S.shelfWall, xFrac: 0.60, yFrac: 0.55, height: 70 },
  { id: "lg-coffee-bar", src: S.coffeeBar, xFrac: 0.40, yFrac: 0.86, height: 80, inForeground: true },
  // rug, sofas, coffee table, lamp, plants — custom hand-placed block in buildSceneItems()

  /* Zone 5 — Content/SEO (bottom-left) ───────────────────────── */
  { id: "ct-shelf-1", src: S.shelfOpen, xFrac: 0.025, yFrac: 0.72, height: 90 },
  { id: "ct-shelf-2", src: S.shelfOpen, xFrac: 0.07, yFrac: 0.60, height: 90 },
  { id: "ct-plant", src: S.plantLarge, xFrac: 0.32, yFrac: 0.95, height: 80, inForeground: true },

  /* Zone 6 — Analytics/Operations (bottom-right) ─────────────── */
  { id: "op-whiteboard", src: S.whiteboard, xFrac: 0.95, yFrac: 0.65, height: 80 },
  { id: "op-bookshelf", src: S.bookshelf, xFrac: 0.93, yFrac: 0.75, height: 95 },
];

/* Wall-mounted neon signs ‒ flat against the back wall, no depth sort. */
const WALL_SIGNS: { src: string; xFrac: number; yFrac: number; height: number }[] = [
  { src: S.neonFocus, xFrac: 0.16, yFrac: 0.02, height: 44 },
  { src: S.neonDesign, xFrac: 0.84, yFrac: 0.02, height: 44 },
];

/* Wall windows for zone 2 (decorative, flat against the wall). */
const WALL_WINDOWS: { src: string; xFrac: number; yFrac: number; height: number }[] = [
  { src: S.window, xFrac: 0.70, yFrac: 0.04, height: 60 },
  { src: S.window, xFrac: 0.90, yFrac: 0.04, height: 60 },
];

/* ── Characters & their zone homes ──────────────────────────── */
type CharDef = { sprite: string; zoneId: string; xFrac: number; yFrac: number; seatGroup?: string; stayPut?: boolean };

const CHARACTERS: CharDef[] = [
  // Zone 1 — Marketing/Ads
  { sprite: sp("Marketing Strategist"), zoneId: "marketing", xFrac: 0.13, yFrac: 0.30, seatGroup: "mk-1" },
  { sprite: sp("Ads Specialist"), zoneId: "marketing", xFrac: 0.25, yFrac: 0.30, seatGroup: "mk-2" },
  // Zone 2 — Design/Ops
  { sprite: sp("Graphic Designer"), zoneId: "design", xFrac: 0.74, yFrac: 0.30, seatGroup: "dz-1" },
  { sprite: sp("Brand Strategist"), zoneId: "design", xFrac: 0.86, yFrac: 0.30, seatGroup: "dz-2" },
  // Zone 3 — Entrance (CEO roams, no seat group)
  { sprite: sp("CEO"), zoneId: "entrance", xFrac: 0.50, yFrac: 0.38 },
  // Zone 5 — Content/SEO
  { sprite: sp("Content Creator"), zoneId: "content", xFrac: 0.14, yFrac: 0.80, seatGroup: "ct-1" },
  { sprite: sp("SEO Specialist"), zoneId: "content", xFrac: 0.26, yFrac: 0.80, seatGroup: "ct-2" },
  // Zone 6 — Analytics/Operations
  { sprite: sp("Analytics"), zoneId: "ops", xFrac: 0.74, yFrac: 0.80, seatGroup: "op-1" },
  { sprite: sp("Order Manager"), zoneId: "ops", xFrac: 0.86, yFrac: 0.80, seatGroup: "op-2" },
  // Zone 4 — Lounge (centre): two regulars permanently on the sofas (stayPut = always sitting)
  { sprite: sp("Customer Service"), zoneId: "lounge", xFrac: 0.4636, yFrac: 0.4455, seatGroup: "lg-top",    stayPut: true },
  { sprite: sp("Marketplace"),      zoneId: "lounge", xFrac: 0.5364, yFrac: 0.6091, seatGroup: "lg-bottom", stayPut: true },
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
  "Insight ตัวนี้น่าสนใจมาก 📊",
  "เทรนด์ใหม่กำลังมาแรง 🔥",
];

type Phase = "sitting" | "walkingTo" | "chatting" | "walkingBack";

type Character = {
  def: CharDef;
  img: HTMLCanvasElement | null;
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
const SCALE = 0.38; // character draw scale
const SOFA_H = 140; // sofa target render height — bigger than character (~130px)
const BLACK_THRESHOLD = 24;

/* ── Asset loader ─────────────────────────────────────────────── */
/** Color-keys pure-black -> transparent and returns the offscreen canvas. */
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

type LoadedAsset = { img: HTMLCanvasElement; bbox: { x: number; y: number; w: number; h: number } };

/** Same as loadKeyed, but also measures the bounding box of non-transparent
 *  pixels so scenery PNGs (which ship as oversized squares with art in the
 *  middle) can be cropped and sized by target on-screen height.            */
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
        /* tainted */
      }
      resolve({ img: off, bbox });
    };
    img.onerror = () => resolve({ img: document.createElement("canvas"), bbox: { x: 0, y: 0, w: 0, h: 0 } });
    img.src = src;
  });
}

/* Full list of static scene assets to pre-load. */
const ASSET_SOURCES: string[] = Object.values(S);

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
      const hx = def.xFrac * CANVAS_W;
      const hy = def.yFrac * CANVAS_H;
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
        phaseTimer: 8 + Math.random() * 2,
        target: null,
        speech: null,
        speechTimer: 0,
        speechCooldown: 5 + Math.random() * 3,
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

      // ── DEBUG: verify sofa_iso loaded + measured correctly ──────────
      const sofaDebug = assets.get(S.sofa);
      if (sofaDebug) {
        const charH = ROW_H * SCALE; // ~130px reference character height
        console.log("[OfficeCanvas] sofa_iso.png loaded:", {
          src: S.sofa,
          imgNaturalSize: { w: sofaDebug.img.width, h: sofaDebug.img.height },
          measuredBBox: sofaDebug.bbox,
          targetHeightPx: SOFA_H,
          effectiveScaleVsCharacter: +(SOFA_H / charH).toFixed(3),
        });
      } else {
        console.warn("[OfficeCanvas] sofa_iso.png FAILED to load — assets.get(S.sofa) returned undefined");
      }
    });

    /** Draws a scenery sprite cropped to its measured art bbox, scaled so
     *  it renders at `targetH` px tall (width follows aspect ratio),
     *  anchored at on-screen point (cx, bottomY) — bottom-centre.       */
    function drawAsset(asset: LoadedAsset, targetH: number, cx: number, bottomY: number) {
      const { bbox } = asset;
      if (bbox.w <= 0 || bbox.h <= 0) return;
      const w = targetH * (bbox.w / bbox.h);
      const h = targetH;
      ctx!.drawImage(asset.img, bbox.x, bbox.y, bbox.w, bbox.h, cx - w / 2, bottomY - h, w, h);
    }

    /** Same as drawAsset but mirrored horizontally about cx (for the
     *  bottom lounge sofa, which faces the opposite direction).        */
    function drawAssetFlipped(asset: LoadedAsset, targetH: number, cx: number, bottomY: number) {
      const { bbox } = asset;
      if (bbox.w <= 0 || bbox.h <= 0) return;
      const w = targetH * (bbox.w / bbox.h);
      const h = targetH;
      ctx!.save();
      ctx!.translate(cx, 0);
      ctx!.scale(-1, 1);
      ctx!.drawImage(asset.img, bbox.x, bbox.y, bbox.w, bbox.h, -w / 2, bottomY - h, w, h);
      ctx!.restore();
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
      if (Math.abs(dx) > Math.abs(dy)) c.facing = dx < 0 ? "walkLeft" : "walkRight";
      else c.facing = dy < 0 ? "walkUp" : "walkDown";
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
            c.facing = "sitting"; // use sitting frame at desk
            c.x = c.homeX;
            c.y = c.homeY;
            if (!c.def.stayPut && c.phaseTimer <= 0) {
              c.target = pickTarget(c);
              if (c.target) c.phase = "walkingTo";
              else c.phaseTimer = 8 + Math.random() * 2;
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
              c.x += (dx / dist) * WALK_SPEED * dt;
              c.y += (dy / dist) * WALK_SPEED * dt;
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
              c.facing = "sitting"; // use sitting frame at desk
              c.target = null;
            } else {
              setWalkFacing(c, dx, dy);
              c.x += (dx / dist) * WALK_SPEED * dt;
              c.y += (dy / dist) * WALK_SPEED * dt;
            }
            break;
          }
        }
      }
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

    /* ── 1. Dark base + per-zone floors + vignette ─────────────── */
    function drawBackdrop() {
      ctx!.fillStyle = BG_COLOR;
      ctx!.fillRect(0, 0, CANVAS_W, CANVAS_H);

      for (const zone of ZONES) {
        const tile = assets.get(zone.floor);
        if (!tile || !tile.img.width) continue;
        const { bbox } = tile;
        ctx!.save();
        ctx!.globalAlpha = 0.55;
        ctx!.beginPath();
        ctx!.rect(zone.rect.x, zone.rect.y, zone.rect.w, zone.rect.h);
        ctx!.clip();
        // Isometric diamond grid: tiles connect edge-to-edge with no gaps
        const offsetX = zone.rect.x + zone.rect.w / 2;
        const offsetY = zone.rect.y;
        const cols = Math.ceil(zone.rect.w / (ISO_TILE_W / 2)) + 2;
        const rows = Math.ceil(zone.rect.h / (ISO_TILE_H / 2)) + 2;
        for (let row = -2; row < rows; row++) {
          for (let col = -2; col < cols; col++) {
            const tx = (col - row) * ISO_TILE_W / 2 + offsetX;
            const ty = (col + row) * ISO_TILE_H / 2 + offsetY;
            ctx!.drawImage(tile.img, bbox.x, bbox.y, bbox.w, bbox.h, tx - ISO_TILE_W / 2, ty, ISO_TILE_W, ISO_TILE_H);
          }
        }
        ctx!.restore();
      }

      // dark vignette — late-night cinematic feel
      const v = ctx!.createRadialGradient(
        CANVAS_W / 2, CANVAS_H / 2, Math.min(CANVAS_W, CANVAS_H) * 0.22,
        CANVAS_W / 2, CANVAS_H / 2, Math.max(CANVAS_W, CANVAS_H) * 0.7
      );
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx!.fillStyle = v;
      ctx!.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    /* ── 2. Back wall + wall-mounted decor (neon, windows) ────── */
    function drawWalls() {
      const wall = assets.get(S.wall);
      if (wall && wall.img.width) {
        const { bbox } = wall;
        const wallH = CANVAS_H * 0.13;
        ctx!.save();
        ctx!.globalAlpha = 0.9;
        for (let x = 0; x < CANVAS_W; x += TILE) {
          ctx!.drawImage(wall.img, bbox.x, bbox.y, bbox.w, bbox.h, x, 0, TILE, wallH);
        }
        ctx!.restore();
        ctx!.fillStyle = "rgba(4,3,7,0.5)";
        ctx!.fillRect(0, wallH * 0.7, CANVAS_W, wallH * 0.3);
      }

      // windows — flat on the wall, no depth sort
      for (const w of WALL_WINDOWS) {
        const a = assets.get(w.src);
        if (!a) continue;
        drawAsset(a, w.height, w.xFrac * CANVAS_W, w.yFrac * CANVAS_H + w.height);
      }

      // neon wall signs (amber glow)
      ctx!.save();
      ctx!.shadowColor = "rgba(255,176,96,0.7)";
      ctx!.shadowBlur = 18;
      for (const sign of WALL_SIGNS) {
        const a = assets.get(sign.src);
        if (!a) continue;
        drawAsset(a, sign.height, sign.xFrac * CANVAS_W, sign.yFrac * CANVAS_H + sign.height);
      }
      ctx!.restore();

      // central neon-style "LIVE OFFICE" text over the entrance zone
      ctx!.save();
      ctx!.font = "700 16px ui-sans-serif, system-ui, sans-serif";
      ctx!.textBaseline = "middle";
      ctx!.textAlign = "center";
      ctx!.shadowColor = "rgba(255,200,120,0.9)";
      ctx!.shadowBlur = 14;
      ctx!.fillStyle = "#ffe6a0";
      ctx!.fillText("LIVE OFFICE", CANVAS_W / 2, 22);
      ctx!.restore();
    }

    /* Zone labels removed — handled by the LiveOffice overlay layer. */

    /* ── 3. Furniture + characters depth-sorted by Y ──────────── */
    type DrawItem = { y: number; draw: () => void };

    /** Pixel offsets from each seat's centre-point (cx, cy). */
    const CHAR_DX = -15;   // character X offset (shift left to centre behind desk)
    const CHAIR_DX = -15;  // chair X offset — identical to character (CHAIR_DX = CHAR_DX)
    const CHAR_DY = -25;   // character higher, not lying on desk
    const CHAIR_DY = CHAR_DY + 20; // chair below character — backrest shows behind character's back
    const DESK_DY = 15;    // desk in front overlapping legs only
    const CHAIR_H = 78;    // chair scale ~0.6 (bigger than character)
    const DESK_H = 96;     // desk scale ~0.7 (bigger than character)

    function buildSceneItems(): { mid: DrawItem[]; front: DrawItem[] } {
      const mid: DrawItem[] = [];
      const front: DrawItem[] = [];

      // Regular (non-seat) furniture via the generic Y-sort
      for (const f of FURNITURE) {
        const asset = assets.get(f.src);
        if (!asset) continue;
        const cx = f.xFrac * CANVAS_W;
        const bottomY = f.yFrac * CANVAS_H;
        const item: DrawItem = {
          y: bottomY,
          draw: () => drawAsset(asset, f.height, cx, bottomY),
        };
        if (f.inForeground) front.push(item);
        else mid.push(item);
      }

      // Index characters by their seat group
      const seatGroupChars = new Map<string, Character>();
      for (const c of characters) {
        if (c.def.seatGroup && c.phase === "sitting") {
          seatGroupChars.set(c.def.seatGroup, c);
        }
      }

      // Seat groups: explicit chair → character → desk ordering
      // with pixel offsets from the seat centre-point.
      const deskAsset = assets.get(S.deskNE);
      const chairAsset = assets.get(S.chairSE);

      for (const seat of SEAT_CENTRES) {
        const cx = seat.x * CANVAS_W;
        const cy = seat.y * CANVAS_H;
        const baseY = cy; // all three pieces keyed to the same depth band

        // 1. Chair (backmost) — identical X,Y as character (CHAIR_DX/DY = CHAR_DX/DY),
        //    drawn first so the character renders on top of it.
        if (chairAsset) {
          const chairCx = cx + CHAIR_DX;
          const chairBottomY = cy + CHAIR_DY;
          mid.push({
            y: baseY - 0.003,
            draw: () => drawAsset(chairAsset, CHAIR_H, chairCx, chairBottomY),
          });
        }

        // 2. Character (middle) at (cx, cy - 20), walkDown frame 0
        const resident = seatGroupChars.get(seat.group);
        if (resident) {
          const charDrawY = cy + CHAR_DY;
          mid.push({
            y: baseY - 0.002,
            draw: () => drawCharacterSitting(resident, cx, charDrawY),
          });
        }

        // 3. Desk (frontmost) at (cx, cy) — overlaps character's lower body
        if (deskAsset) {
          const deskBottomY = cy + DESK_DY;
          mid.push({
            y: baseY - 0.001,
            draw: () => drawAsset(deskAsset, DESK_H, cx, deskBottomY),
          });
        }
      }

      // ── Zone 4 — Lounge centre: custom hand-placed arrangement ──────
      // Explicit back-to-front draw order using absolute canvas coordinates.
      {
        const rugAsset    = assets.get(S.rug);
        const plantAsset  = assets.get(S.plantTall);
        const lampAsset   = assets.get(S.lamp);
        const sofaAsset   = assets.get(S.sofa);
        const coffeeAsset = assets.get(S.coffeeTable);

        const loungeChars = characters.filter(c => c.def.zoneId === "lounge");
        const loungeChar1 = loungeChars[0] ?? null;
        const loungeChar2 = loungeChars[1] ?? null;

        const BASE_Y = CANVAS_H * 0.50;
        const Z = (n: number) => BASE_Y + n * 0.5;

        if (rugAsset)    mid.push({ y: Z(0),  draw: () => drawAsset(rugAsset,    56,     550, 310) });
        if (lampAsset)   mid.push({ y: Z(1),  draw: () => drawAsset(lampAsset,   80,     550, 210) });
        if (plantAsset)  mid.push({ y: Z(2),  draw: () => drawAsset(plantAsset,  100,    420, 270) });
        if (plantAsset)  mid.push({ y: Z(3),  draw: () => drawAsset(plantAsset,  100,    680, 270) });
        if (coffeeAsset) mid.push({ y: Z(4),  draw: () => drawAsset(coffeeAsset, 36,     550, 320) });

        if (loungeChar1) mid.push({ y: Z(5),  draw: () => drawCharacterSitting(loungeChar1, 580, 270, false) });
        if (sofaAsset)   mid.push({ y: Z(6),  draw: () => drawAsset(sofaAsset,   SOFA_H, 580, 280) });

        if (loungeChar2) mid.push({ y: Z(7),  draw: () => drawCharacterSitting(loungeChar2, 480, 270, true) });
        if (sofaAsset)   mid.push({ y: Z(8),  draw: () => drawAssetFlipped(sofaAsset, SOFA_H, 480, 280) });

        if (plantAsset)  mid.push({ y: Z(9),  draw: () => drawAsset(plantAsset,  100,    400, 310) });
        if (plantAsset)  mid.push({ y: Z(10), draw: () => drawAsset(plantAsset,  100,    700, 310) });
      }

      // Non-sitting characters (walking, chatting) use their live Y position
      for (const c of characters) {
        if (c.phase !== "sitting") {
          mid.push({ y: c.y, draw: () => drawCharacter(c) });
        }
      }

      return { mid, front };
    }

    /** Draws a character at a fixed position using the SITTING frame
     *  (row 2, x:1196 w:137). Used only when phase === "sitting" —
     *  the generic drawCharacter handles all other phases.          */
    function drawCharacterSitting(c: Character, cx: number, footY: number, flip: boolean = true) {
      if (!c.img || c.img.width === 0) return;
      const anim = ROWS.sitting;
      const sx = anim.xs[0]; // sitting frame 0 (x:1196, w:137)
      const sy = anim.y;
      const sw = anim.w;
      const dw = sw * SCALE;
      const dh = ROW_H * SCALE;
      const charCx = cx + CHAR_DX; // shift left to centre behind desk (matches CHAIR_DX)
      const dx = charCx - dw / 2;
      const dy = footY - dh * 0.82;
      if (flip) {
        // Flip character horizontally (default — used at desks)
        ctx!.save();
        ctx!.scale(-1, 1);
        ctx!.drawImage(c.img, sx, sy, sw, ROW_H, -(dx + dw), dy, dw, dh);
        ctx!.restore();
      } else {
        ctx!.drawImage(c.img, sx, sy, sw, ROW_H, dx, dy, dw, dh);
      }
      if (c.speech) drawSpeechBubble(c.speech, charCx, dy - 6);
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
      ctx!.fillStyle = "rgba(28,22,34,0.94)";
      ctx!.strokeStyle = "rgba(255,200,150,0.20)";
      ctx!.lineWidth = 1;
      roundRect(ctx!, x, y, w, h, 10);
      ctx!.fill();
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.moveTo(cx - 6, y + h);
      ctx!.lineTo(cx + 6, y + h);
      ctx!.lineTo(cx, y + h + 8);
      ctx!.closePath();
      ctx!.fillStyle = "rgba(28,22,34,0.94)";
      ctx!.fill();

      ctx!.fillStyle = "#f6eade";
      ctx!.textBaseline = "middle";
      ctx!.fillText(text, x + padX, y + h / 2 + 1);
      ctx!.restore();
    }

    /* ── 4. Warm radial glow overlays near floor lamps ─────────── */
    function drawLampGlows() {
      ctx!.save();
      ctx!.globalCompositeOperation = "lighter";
      for (const f of FURNITURE) {
        if (!f.glow) continue;
        const cx = f.xFrac * CANVAS_W;
        const cy = f.yFrac * CANVAS_H - f.height * 0.6;
        const r = 110;
        const glow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
        // warm golden, matching the spec's rgba(255,140,0,0.08)
        glow.addColorStop(0, "rgba(255,180,80,0.28)");
        glow.addColorStop(0.4, "rgba(255,140,0,0.10)");
        glow.addColorStop(1, "rgba(255,140,0,0)");
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(cx, cy, r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      ctx!.clearRect(0, 0, CANVAS_W, CANVAS_H);

      drawBackdrop();   // dark base, floors, vignette
      drawWalls();      // back wall, neon, windows, LIVE OFFICE text

      update(dt);

      const { mid, front } = buildSceneItems();
      mid.sort((a, b) => a.y - b.y);
      for (const item of mid) item.draw();

      drawLampGlows();

      // foreground decor — plants/lamps in front of everything mid-ground
      front.sort((a, b) => a.y - b.y);
      for (const item of front) item.draw();

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
