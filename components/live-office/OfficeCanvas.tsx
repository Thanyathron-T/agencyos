"use client";

import { useEffect, useRef } from "react";

/* ── Sprite sheet geometry (1536x1024, empirically measured) ──────────
   Row 1 (y 0-512): walkDown(4), walkBack(4), idle(2), sitting(2)
   Row 2 (y 512-1024): walkLeft(4), walkRight(4)
   PNGs already carry real alpha — background pixels are ~0 alpha,
   so no color-keying is needed; drawImage is enough.            ──── */
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

type CharDef = {
  sprite: string;
  zoneId: string;
  /** home desk position, in fraction of canvas (0-1) */
  home: { x: number; y: number };
};

const CHARACTERS: CharDef[] = [
  { sprite: "/sprites/CEO.png", zoneId: "z-marketing", home: { x: 0.16, y: 0.16 } },
  { sprite: "/sprites/Marketing_Strategist.png", zoneId: "z-marketing", home: { x: 0.10, y: 0.34 } },
  { sprite: "/sprites/Content_Creator.png", zoneId: "z-content", home: { x: 0.46, y: 0.20 } },
  { sprite: "/sprites/Graphic_Designer.png", zoneId: "z-design", home: { x: 0.72, y: 0.18 } },
  { sprite: "/sprites/Video_Editor.png", zoneId: "z-design", home: { x: 0.86, y: 0.34 } },
  { sprite: "/sprites/Ads_Specialist.png", zoneId: "z-ads", home: { x: 0.10, y: 0.74 } },
  { sprite: "/sprites/Customer_Service.png", zoneId: "z-support", home: { x: 0.42, y: 0.78 } },
  { sprite: "/sprites/Order_Manager.png", zoneId: "z-ops", home: { x: 0.78, y: 0.76 } },
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

type Phase = "idleAtDesk" | "walkingTo" | "chatting" | "walkingBack";

type Character = {
  def: CharDef;
  img: HTMLImageElement | null;
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
const WALK_SPEED = 36; // px/sec at base scale

export default function OfficeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let width = 0;
    let height = 0;

    const characters: Character[] = CHARACTERS.map((def) => ({
      def,
      img: null,
      x: 0,
      y: 0,
      facing: "idle",
      animFrame: 0,
      animTimer: 0,
      phase: "idleAtDesk",
      phaseTimer: 2 + Math.random() * 6,
      target: null,
      speech: null,
      speechTimer: 0,
    }));

    characters.forEach((c) => {
      const img = new Image();
      img.src = c.def.sprite;
      c.img = img;
    });

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      characters.forEach((c) => {
        c.x = c.def.home.x * width;
        c.y = c.def.home.y * height;
      });
    }

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const charScale = () => Math.max(0.16, Math.min(0.26, height / 1100));

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
          case "idleAtDesk": {
            c.facing = "idle";
            if (c.phaseTimer <= 0) {
              c.target = pickTarget(c);
              if (c.target) {
                c.phase = "walkingTo";
              } else {
                c.phaseTimer = 4 + Math.random() * 6;
              }
            }
            break;
          }
          case "walkingTo": {
            const t = c.target!;
            const tx = t.x + (t.x > c.x ? -28 : 28);
            const ty = t.y + 6;
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
              const speed = WALK_SPEED * charScale() * 4.2;
              c.x += (dx / dist) * speed * dt;
              c.y += (dy / dist) * speed * dt;
            }
            break;
          }
          case "chatting": {
            c.facing = "idle";
            if (c.phaseTimer <= 0) {
              c.phase = "walkingBack";
            }
            break;
          }
          case "walkingBack": {
            const hx = c.def.home.x * width;
            const hy = c.def.home.y * height;
            const dx = hx - c.x;
            const dy = hy - c.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 4) {
              c.x = hx;
              c.y = hy;
              c.phase = "idleAtDesk";
              c.phaseTimer = 5 + Math.random() * 8;
              c.facing = "idle";
              c.target = null;
              if (Math.random() < 0.35) startSpeech(c);
            } else {
              setWalkFacing(c, dx, dy);
              const speed = WALK_SPEED * charScale() * 4.2;
              c.x += (dx / dist) * speed * dt;
              c.y += (dy / dist) * speed * dt;
            }
            break;
          }
        }

        // ambient chatter while idle at desk
        if (c.phase === "idleAtDesk" && !c.speech && Math.random() < 0.0009) {
          startSpeech(c);
        }
      }
    }

    function drawCharacter(c: Character) {
      if (!c.img || !c.img.complete || c.img.naturalWidth === 0) return;
      const animDef = ROWS[c.facing];
      const sx = animDef.xs[c.animFrame % animDef.xs.length];
      const sy = animDef.y;

      const scale = charScale();
      const dw = FRAME_W * scale;
      const dh = FRAME_H * scale;
      const dx = c.x - dw / 2;
      const dy = c.y - dh + dh * 0.18;

      ctx!.drawImage(c.img, sx, sy, FRAME_W, FRAME_H, dx, dy, dw, dh);

      if (c.speech) {
        drawSpeechBubble(c.speech, c.x, dy - 6);
      }
    }

    function drawSpeechBubble(text: string, cx: number, bottomY: number) {
      ctx!.font = "12px ui-sans-serif, system-ui, sans-serif";
      const padX = 10;
      const padY = 7;
      const textW = ctx!.measureText(text).width;
      const w = textW + padX * 2;
      const h = 26;
      const x = Math.min(Math.max(cx - w / 2, 6), width - w - 6);
      const y = bottomY - h - 10;

      ctx!.save();
      ctx!.fillStyle = "rgba(255,255,255,0.96)";
      ctx!.strokeStyle = "rgba(0,0,0,0.08)";
      ctx!.lineWidth = 1;
      roundRect(ctx!, x, y, w, h, 10);
      ctx!.fill();
      ctx!.stroke();

      // little pointer triangle
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

      ctx!.clearRect(0, 0, width, height);

      update(dt);

      const sorted = [...characters].sort((a, b) => a.y - b.y);
      for (const c of sorted) drawCharacter(c);

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
