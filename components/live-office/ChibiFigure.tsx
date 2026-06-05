/**
 * ChibiFigure — full-body chibi rendered as SVG <g> elements.
 * Drop this inside any <svg> with a transform to place it.
 *
 * (cx, headCy) = center of the head circle.
 */

export type ChiPose = "typing" | "standing" | "celebrating" | "thinking" | "sleeping";

export interface ChibiFigureProps {
  cx: number;
  headCy: number;
  hairColor: string;
  skinColor: string;
  shirtColor: string;
  pose?: ChiPose;
  floatDelay?: number;
}

export default function ChibiFigure({
  cx, headCy,
  hairColor, skinColor, shirtColor,
  pose = "standing",
  floatDelay = 0,
}: ChibiFigureProps) {
  const R       = 15;                  // head radius
  const bodyX   = cx;
  const bodyY   = headCy + R + 9;     // body center Y

  const isSleeping    = pose === "sleeping";
  const isCelebrating = pose === "celebrating";

  return (
    <g
      className={isCelebrating ? "chibi-float" : "chibi-float-alt"}
      style={{ animationDelay: `${floatDelay}s` }}
    >
      {/* ── Cat ears ── */}
      <polygon points={`${cx-14},${headCy-2} ${cx-18},${headCy-13} ${cx-7},${headCy-7}`} fill={hairColor} />
      <polygon points={`${cx+14},${headCy-2} ${cx+18},${headCy-13} ${cx+7},${headCy-7}`} fill={hairColor} />
      <polygon points={`${cx-13},${headCy-3} ${cx-16},${headCy-11} ${cx-8},${headCy-7}`} fill="#FFB7D5" opacity="0.55" />
      <polygon points={`${cx+13},${headCy-3} ${cx+16},${headCy-11} ${cx+8},${headCy-7}`} fill="#FFB7D5" opacity="0.55" />

      {/* ── Hair ── */}
      <ellipse cx={headX(cx)} cy={headCy - 7} rx={13} ry={9} fill={hairColor} />

      {/* ── Head ── */}
      <circle cx={cx} cy={headCy} r={R} fill={skinColor} />

      {/* ── Eyes ── */}
      {isSleeping ? (
        <>
          <path d={`M ${cx-7} ${headCy-1} Q ${cx-4} ${headCy+2} ${cx-1} ${headCy-1}`} stroke="#2D1B4E" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d={`M ${cx+1} ${headCy-1} Q ${cx+4} ${headCy+2} ${cx+7} ${headCy-1}`} stroke="#2D1B4E" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <text x={cx + 16} y={headCy - 10} fontSize="8" fill="#B794F4">zzz</text>
        </>
      ) : (
        <>
          <g className="chibi-eye">
            <ellipse cx={cx - 5} cy={headCy} rx={3.2} ry={3.8} fill="white" />
            <circle  cx={cx - 5} cy={headCy + 0.6} r={2}   fill="#2D1B4E" />
            <circle  cx={cx - 4} cy={headCy - 0.8} r={0.8} fill="white"   />
          </g>
          <g className="chibi-eye chibi-eye-r">
            <ellipse cx={cx + 5} cy={headCy} rx={3.2} ry={3.8} fill="white" />
            <circle  cx={cx + 5} cy={headCy + 0.6} r={2}   fill="#2D1B4E" />
            <circle  cx={cx + 6} cy={headCy - 0.8} r={0.8} fill="white"   />
          </g>
        </>
      )}

      {/* ── Blush ── */}
      <ellipse cx={cx - 10} cy={headCy + 5} rx={4.2} ry={2.6} fill="#FFB7D5" opacity="0.38" />
      <ellipse cx={cx + 10} cy={headCy + 5} rx={4.2} ry={2.6} fill="#FFB7D5" opacity="0.38" />

      {/* ── Mouth ── */}
      {!isSleeping && (
        <path
          d={isCelebrating
            ? `M ${cx-5} ${headCy+8} Q ${cx} ${headCy+13} ${cx+5} ${headCy+8}`
            : `M ${cx-5} ${headCy+8} Q ${cx} ${headCy+11} ${cx+5} ${headCy+8}`}
          stroke="#8B6BAE" strokeWidth="1.4" fill="none" strokeLinecap="round"
        />
      )}

      {/* ── Body ── */}
      <ellipse cx={bodyX} cy={bodyY + 3} rx={10} ry={9} fill={shirtColor} />

      {/* ── Pose arms / legs ── */}

      {pose === "typing" && (
        <>
          <path d={`M ${cx-9} ${bodyY} Q ${cx-13} ${bodyY+6} ${cx-11} ${bodyY+11}`} stroke={skinColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d={`M ${cx+9} ${bodyY} Q ${cx+13} ${bodyY+6} ${cx+11} ${bodyY+11}`} stroke={skinColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <circle cx={cx - 11} cy={bodyY + 13} r={3} fill={skinColor} />
          <circle cx={cx + 11} cy={bodyY + 13} r={3} fill={skinColor} />
        </>
      )}

      {pose === "standing" && (
        <>
          <path d={`M ${cx-9} ${bodyY} Q ${cx-13} ${bodyY+9} ${cx-12} ${bodyY+17}`} stroke={skinColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d={`M ${cx+9} ${bodyY} Q ${cx+13} ${bodyY+9} ${cx+12} ${bodyY+17}`} stroke={skinColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <ellipse cx={cx - 4} cy={bodyY + 22} rx={3.5} ry={6} fill={shirtColor} />
          <ellipse cx={cx + 4} cy={bodyY + 22} rx={3.5} ry={6} fill={shirtColor} />
          <ellipse cx={cx - 4} cy={bodyY + 29} rx={4.5} ry={2.5} fill="#9B6BAE" />
          <ellipse cx={cx + 4} cy={bodyY + 29} rx={4.5} ry={2.5} fill="#9B6BAE" />
        </>
      )}

      {pose === "celebrating" && (
        <>
          <path d={`M ${cx-9} ${bodyY} Q ${cx-17} ${bodyY-5} ${cx-14} ${bodyY-14}`} stroke={skinColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d={`M ${cx+9} ${bodyY} Q ${cx+17} ${bodyY-5} ${cx+14} ${bodyY-14}`} stroke={skinColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <circle cx={cx - 14} cy={bodyY - 15} r={3} fill={skinColor} />
          <circle cx={cx + 14} cy={bodyY - 15} r={3} fill={skinColor} />
          <text x={cx - 26} y={bodyY - 13} fontSize="10">⭐</text>
          <text x={cx + 17} y={bodyY -  8} fontSize="8">✨</text>
          <ellipse cx={cx - 4} cy={bodyY + 22} rx={3.5} ry={6} fill={shirtColor} />
          <ellipse cx={cx + 4} cy={bodyY + 22} rx={3.5} ry={6} fill={shirtColor} />
        </>
      )}

      {pose === "thinking" && (
        <>
          {/* Arm to chin */}
          <path d={`M ${cx-9} ${bodyY} Q ${cx-13} ${bodyY-3} ${cx-7} ${bodyY-8}`} stroke={skinColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <circle cx={cx - 6} cy={bodyY - 10} r={3} fill={skinColor} />
          {/* Other arm relaxed */}
          <path d={`M ${cx+9} ${bodyY} Q ${cx+13} ${bodyY+9} ${cx+12} ${bodyY+17}`} stroke={skinColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          {/* Thought bubbles */}
          <circle cx={cx + 20} cy={headCy - 8}  r={2.5} fill="white" opacity="0.75" />
          <circle cx={cx + 27} cy={headCy - 15} r={3.5} fill="white" opacity="0.75" />
          <circle cx={cx + 34} cy={headCy - 23} r={5.5} fill="white" opacity="0.75" />
          <text x={cx + 31} y={headCy - 20} fontSize="5" textAnchor="middle" fill="#9B8AB8">?</text>
          <ellipse cx={cx - 4} cy={bodyY + 22} rx={3.5} ry={6} fill={shirtColor} />
          <ellipse cx={cx + 4} cy={bodyY + 22} rx={3.5} ry={6} fill={shirtColor} />
        </>
      )}

      {pose === "sleeping" && (
        <>
          <path d={`M ${cx-9} ${bodyY} Q ${cx-13} ${bodyY+6} ${cx-11} ${bodyY+11}`} stroke={skinColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d={`M ${cx+9} ${bodyY} Q ${cx+13} ${bodyY+6} ${cx+11} ${bodyY+11}`} stroke={skinColor} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

/* tiny helper avoids repeating cx inline */
function headX(cx: number) { return cx; }
