import type { CharacterPose, RenderMode } from "./types";
import { characterStyles, fallbackStyle } from "@/lib/characterStyles";
import ChibiSprite from "./ChibiSprite";

/**
 * Adapter that renders a character at a point inside an SVG scene.
 * Phase 1 → "svg" (layered ChibiSprite).
 * Later → "png": drop a transparent sprite at /public/agents/<id>-<pose>.png
 *         and this component will emit an <image> with the SAME placement,
 *         so no layout/scene code has to change.
 */
interface CharacterRendererProps {
  agentId: string;
  pose: CharacterPose;
  cx: number;
  headCy: number;
  scale?: number;
  delay?: number;
  idleClass?: string;
  mode?: RenderMode;
}

export default function CharacterRenderer({
  agentId, pose, cx, headCy, scale = 1, delay = 0, idleClass, mode = "svg",
}: CharacterRendererProps) {
  if (mode === "png") {
    // Future: swap in painted sprites without touching the scene.
    const w = 120 * scale;
    const h = 150 * scale;
    return (
      <image
        href={`/agents/${agentId}.png`}
        x={cx - w / 2}
        y={headCy - 30 * scale}
        width={w}
        height={h}
        className={idleClass ?? "char-bob"}
        style={{ animationDelay: `${delay}s` }}
        preserveAspectRatio="xMidYMax meet"
      />
    );
  }

  const style = characterStyles[agentId] ?? fallbackStyle;
  return (
    <ChibiSprite
      cx={cx}
      headCy={headCy}
      scale={scale}
      style={style}
      pose={pose}
      delay={delay}
      idleClass={idleClass}
    />
  );
}
