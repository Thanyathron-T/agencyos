"use client";

import { useEffect, useRef } from "react";
import {
  IsometricCanvas,
  IsometricRectangle,
  PlaneView,
} from "@elchininet/isometric";

/* ─────────────────────────────────────────────────────
   Room constants
───────────────────────────────────────────────────── */
const SCALE  = 48;
const ROOM_W = 6;    // right-axis units
const ROOM_D = 4;    // left-axis units
const WALL_H = 3;    // height units

/* ─────────────────────────────────────────────────────
   Cuboid helper — adds 3 faces (TOP, FRONT, SIDE) to canvas
   The box origin is its bottom-back-left corner.
   top  = floor height the box sits on (default 0)
───────────────────────────────────────────────────── */
type BoxProps = {
  right: number; left: number; top?: number;
  width: number; depth: number; height: number;
  topColor: string; frontColor: string; sideColor: string;
};

function makeBox({
  right, left, top = 0,
  width, depth, height,
  topColor, frontColor, sideColor,
}: BoxProps): IsometricRectangle[] {
  return [
    // LEFT wall of box (SIDE face, at fixed right=right)
    new IsometricRectangle({
      right, left, top,
      width: depth, height,
      planeView: PlaneView.SIDE,
      fillColor: sideColor,
      strokeColor: "#0a0704",
      strokeWidth: 0.4,
    }),
    // FRONT wall of box (FRONT face, at fixed left=left)
    new IsometricRectangle({
      right, left, top,
      width, height,
      planeView: PlaneView.FRONT,
      fillColor: frontColor,
      strokeColor: "#0a0704",
      strokeWidth: 0.4,
    }),
    // TOP face of box
    new IsometricRectangle({
      right, left, top: top + height,
      width, height: depth,
      planeView: PlaneView.TOP,
      fillColor: topColor,
      strokeColor: "#0a0704",
      strokeWidth: 0.4,
    }),
  ];
}

/* ─────────────────────────────────────────────────────
   Scene builder — imperative, called inside useEffect
───────────────────────────────────────────────────── */
function buildScene(canvas: IsometricCanvas) {

  // ── 1. Walls (drawn first = furthest back) ──────────

  // Back-right wall: FRONT face at left=0, spans right=0..ROOM_W
  canvas.addChild(new IsometricRectangle({
    right: 0, left: 0, top: 0,
    width: ROOM_W, height: WALL_H,
    planeView: PlaneView.FRONT,
    fillColor: "#16133A",
    strokeColor: "#0E0C20",
    strokeWidth: 0.5,
  }));

  // Back-left wall: SIDE face at right=0, spans left=0..ROOM_D
  canvas.addChild(new IsometricRectangle({
    right: 0, left: 0, top: 0,
    width: ROOM_D, height: WALL_H,
    planeView: PlaneView.SIDE,
    fillColor: "#1E1A3E",
    strokeColor: "#0E0C20",
    strokeWidth: 0.5,
  }));

  // ── 2. Floor tiles (back → front) ──────────────────
  // Sort by right+left ascending so back tiles render first
  const tileOrder: [number, number][] = [];
  for (let r = 0; r < ROOM_W; r++) {
    for (let l = 0; l < ROOM_D; l++) {
      tileOrder.push([r, l]);
    }
  }
  tileOrder.sort(([r1, l1], [r2, l2]) => (r1 + l1) - (r2 + l2));

  for (const [r, l] of tileOrder) {
    const even = (r + l) % 2 === 0;
    canvas.addChild(new IsometricRectangle({
      right: r, left: l, top: 0,
      width: 1, height: 1,
      planeView: PlaneView.TOP,
      fillColor: even ? "#2C1C0A" : "#241408",
      strokeColor: "#180E04",
      strokeWidth: 0.5,
    }));
  }

  // ── 3. Furniture (painter order: back → front) ─────
  // Depth = right + left; lower = further back = drawn earlier

  // Bookshelf — back-left corner (depth ≈ 0.2)
  makeBox({
    right: 0.1, left: 0.1,
    width: 0.7, depth: 0.4, height: 2.2,
    topColor: "#5C4030",
    frontColor: "#3A2818",
    sideColor: "#4A3220",
  }).forEach(f => canvas.addChild(f));

  // Desk 1 — left wall, back (depth ≈ 0.95)
  const DESK = { width: 1.2, depth: 0.8, height: 1.0, topColor: "#5C3D1E", frontColor: "#4A3018", sideColor: "#3D2810" };
  makeBox({ right: 0.1, left: 0.8, ...DESK }).forEach(f => canvas.addChild(f));

  // Desk 2 — left wall, middle (depth ≈ 2.1)
  makeBox({ right: 0.1, left: 1.9, ...DESK }).forEach(f => canvas.addChild(f));

  // Sofa — center-right (depth ≈ 3.7)
  const SR = 2.3, SL = 1.2, SW = 2.0, SD = 1.4;
  // Seat cushion
  makeBox({ right: SR, left: SL, width: SW, depth: SD, height: 0.8,
    topColor: "#1e3a5f", frontColor: "#1a3358", sideColor: "#152a45",
  }).forEach(f => canvas.addChild(f));
  // Backrest (far-left edge of sofa)
  makeBox({ right: SR, left: SL + SD - 0.25, width: SW, depth: 0.25, height: 2.0,
    topColor: "#24426e", frontColor: "#1e3a6a", sideColor: "#1a3060",
  }).forEach(f => canvas.addChild(f));
  // Left arm
  makeBox({ right: SR, left: SL, width: 0.25, depth: SD, height: 1.4,
    topColor: "#24426e", frontColor: "#1e3a6a", sideColor: "#1a3060",
  }).forEach(f => canvas.addChild(f));
  // Right arm
  makeBox({ right: SR + SW - 0.25, left: SL, width: 0.25, depth: SD, height: 1.4,
    topColor: "#24426e", frontColor: "#1e3a6a", sideColor: "#1a3060",
  }).forEach(f => canvas.addChild(f));

  // Desk 3 — left wall, front (depth ≈ 3.1)
  makeBox({ right: 0.1, left: 3.0, ...DESK }).forEach(f => canvas.addChild(f));
}

/* ─────────────────────────────────────────────────────
   React component
───────────────────────────────────────────────────── */
export default function IsometricRoom() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function init() {
      if (!el) return;
      el.innerHTML = "";

      const w = el.offsetWidth  || 900;
      const h = el.offsetHeight || 600;

      const canvas = new IsometricCanvas({
        container: el,
        backgroundColor: "#080614",
        scale: SCALE,
        width: w,
        height: h,
      });

      buildScene(canvas);

      // Make the SVG fill the container
      const svg = el.querySelector("svg");
      if (svg) {
        svg.style.width  = "100%";
        svg.style.height = "100%";
      }
    }

    // Use rAF to ensure layout is complete before reading dimensions
    const raf = requestAnimationFrame(init);

    return () => {
      cancelAnimationFrame(raf);
      if (el) el.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: "#080614" }}
    />
  );
}
