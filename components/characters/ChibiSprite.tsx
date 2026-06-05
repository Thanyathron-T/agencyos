import type { CharacterStyle, CharacterPose } from "./types";

interface ChibiSpriteProps {
  cx: number;
  headCy: number;
  scale?: number;
  style: CharacterStyle;
  pose: CharacterPose;
  delay?: number;
  idleClass?: string; // override outer animation (e.g. char-walk)
}

const OUT = "#4A3568";   // soft plum linework
const SW = 2;

export default function ChibiSprite({
  cx, headCy, scale = 1, style: s, pose, delay = 0, idleClass = "char-bob",
}: ChibiSpriteProps) {
  const seated = pose === "sitting" || pose === "typing";
  const sleeping = pose === "sleeping";
  const celebrating = pose === "celebrating";

  return (
    <g transform={`translate(${cx},${headCy}) scale(${scale})`}>
      {/* whole-body idle bob */}
      <g className={idleClass} style={{ animationDelay: `${delay}s` }}>
        {/* ground contact shadow */}
        <ellipse cx="0" cy={seated ? 70 : 104} rx={seated ? 24 : 20} ry="5" fill="#16122e" opacity="0.28" />

        {/* ─── HAIR BACK ─── */}
        {hairBack(s)}

        {/* ─── BODY ─── */}
        {body(s, pose)}

        {/* ─── ARMS / LEGS ─── */}
        {limbs(s, pose)}

        {/* ─── HEAD ─── */}
        <g>
          {/* neck */}
          <rect x="-5" y="20" width="10" height="10" rx="3" fill={s.skin} stroke={OUT} strokeWidth={SW} />
          {/* head */}
          <circle cx="0" cy="0" r="27" fill={s.skin} stroke={OUT} strokeWidth={SW} />
          {/* face shade */}
          <path d="M 18 -8 A 27 27 0 0 1 -6 24 A 27 27 0 0 0 18 -8 Z" fill={s.skinShade} opacity="0.45" />

          {/* ears */}
          <ellipse cx="-26" cy="2" rx="4" ry="6" fill={s.skin} stroke={OUT} strokeWidth={SW} />
          <ellipse cx="26" cy="2" rx="4" ry="6" fill={s.skin} stroke={OUT} strokeWidth={SW} />

          {/* ─── EYES ─── */}
          {sleeping ? (
            <>
              <path d="M -16 -1 Q -10 4 -4 -1" stroke={OUT} strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d="M 4 -1 Q 10 4 16 -1" stroke={OUT} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <g className="kw-blink">
              {/* brows */}
              <path d="M -16 -10 Q -10 -13 -5 -11" stroke={s.hairDark} strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M 5 -11 Q 10 -13 16 -10" stroke={s.hairDark} strokeWidth="1.8" fill="none" strokeLinecap="round" />
              {/* left eye */}
              <ellipse cx="-10" cy="-1" rx="4.6" ry="6" fill="#fff" stroke={OUT} strokeWidth="1.4" />
              <circle cx="-10" cy="0" r="3.6" fill={s.hairDark} />
              <circle cx="-10" cy="0.6" r="2" fill="#2A1A40" />
              <circle cx="-8.4" cy="-2" r="1.3" fill="#fff" />
              {/* right eye */}
              <ellipse cx="10" cy="-1" rx="4.6" ry="6" fill="#fff" stroke={OUT} strokeWidth="1.4" />
              <circle cx="10" cy="0" r="3.6" fill={s.hairDark} />
              <circle cx="10" cy="0.6" r="2" fill="#2A1A40" />
              <circle cx="11.6" cy="-2" r="1.3" fill="#fff" />
            </g>
          )}

          {/* blush */}
          <ellipse cx="-16" cy="9" rx="5" ry="3" fill="#F9A8D4" opacity="0.5" />
          <ellipse cx="16" cy="9" rx="5" ry="3" fill="#F9A8D4" opacity="0.5" />

          {/* mouth */}
          {!sleeping && (
            celebrating
              ? <path d="M -6 11 Q 0 18 6 11" stroke={OUT} strokeWidth="2" fill="#C44A74" />
              : <path d="M -4 12 Q 0 15 4 12" stroke={OUT} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          )}

          {/* ─── HAIR FRONT (fringe) ─── */}
          {hairFront(s)}

          {/* ─── ACCESSORY ─── */}
          {s.accessory === "glasses" && (
            <g stroke={OUT} strokeWidth="1.8" fill="none">
              <rect x="-17" y="-5" width="13" height="11" rx="4" fill="#fff" fillOpacity="0.18" />
              <rect x="4" y="-5" width="13" height="11" rx="4" fill="#fff" fillOpacity="0.18" />
              <line x1="-4" y1="0" x2="4" y2="0" />
            </g>
          )}
          {s.accessory === "headphones" && (
            <g>
              <path d="M -28 -2 A 28 28 0 0 1 28 -2" stroke={s.outfitDark} strokeWidth="4" fill="none" />
              <rect x="-32" y="-3" width="9" height="14" rx="4" fill={s.outfit} stroke={OUT} strokeWidth={SW} />
              <rect x="23" y="-3" width="9" height="14" rx="4" fill={s.outfit} stroke={OUT} strokeWidth={SW} />
            </g>
          )}
        </g>

        {/* sleeping ZzZ */}
        {sleeping && (
          <text x="22" y="-22" fontSize="11" fill={s.hairDark} className="char-bob" style={{ animationDelay: "0.5s" }}>zzZ</text>
        )}
      </g>
    </g>
  );
}

/* ─────────── HAIR ─────────── */
function hairBack(s: CharacterStyle) {
  switch (s.hairStyle) {
    case "long":
      return <path d="M -27 -4 Q -34 30 -24 46 L 24 46 Q 34 30 27 -4 Q 27 -32 0 -32 Q -27 -32 -27 -4 Z" fill={s.hair} stroke={OUT} strokeWidth={SW} />;
    case "twin":
      return (<>
        <ellipse cx="-26" cy="14" rx="9" ry="16" fill={s.hair} stroke={OUT} strokeWidth={SW} />
        <ellipse cx="26" cy="14" rx="9" ry="16" fill={s.hair} stroke={OUT} strokeWidth={SW} />
        <ellipse cx="0" cy="-6" rx="28" ry="24" fill={s.hair} stroke={OUT} strokeWidth={SW} />
      </>);
    case "pony":
      return (<>
        <path d="M 22 -6 Q 42 6 34 34 Q 30 40 24 36 Q 30 14 18 2 Z" fill={s.hair} stroke={OUT} strokeWidth={SW} />
        <ellipse cx="0" cy="-6" rx="28" ry="24" fill={s.hair} stroke={OUT} strokeWidth={SW} />
      </>);
    case "buns":
      return (<>
        <circle cx="-20" cy="-22" r="9" fill={s.hair} stroke={OUT} strokeWidth={SW} />
        <circle cx="20" cy="-22" r="9" fill={s.hair} stroke={OUT} strokeWidth={SW} />
        <ellipse cx="0" cy="-6" rx="28" ry="23" fill={s.hair} stroke={OUT} strokeWidth={SW} />
      </>);
    case "bob":
      return <path d="M -28 -2 Q -30 22 -22 28 L 22 28 Q 30 22 28 -2 Q 28 -30 0 -30 Q -28 -30 -28 -2 Z" fill={s.hair} stroke={OUT} strokeWidth={SW} />;
    case "spiky":
      return <path d="M -28 4 L -30 -14 L -18 -8 L -14 -24 L -4 -12 L 2 -28 L 10 -12 L 18 -24 L 22 -8 L 30 -14 L 28 6 Q 0 -22 -28 4 Z" fill={s.hair} stroke={OUT} strokeWidth={SW} />;
    default: // short
      return <ellipse cx="0" cy="-7" rx="28" ry="23" fill={s.hair} stroke={OUT} strokeWidth={SW} />;
  }
}

function hairFront(s: CharacterStyle) {
  return (
    <g>
      {/* fringe */}
      <path d="M -27 -6 Q -22 -26 0 -27 Q 22 -26 27 -6 Q 18 -18 8 -12 Q 2 -22 -4 -12 Q -16 -18 -27 -6 Z"
        fill={s.hair} stroke={OUT} strokeWidth={SW} />
      {/* highlight */}
      <path d="M -18 -16 Q -6 -24 8 -18" stroke={s.hairLight} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.85" />
    </g>
  );
}

/* ─────────── BODY ─────────── */
function body(s: CharacterStyle, pose: CharacterPose) {
  const seated = pose === "sitting" || pose === "typing";
  if (seated) {
    return (<>
      <path d="M -20 30 Q -22 56 -16 70 L 16 70 Q 22 56 20 30 Q 12 24 0 24 Q -12 24 -20 30 Z" fill={s.outfit} stroke={OUT} strokeWidth={SW} />
      <path d="M 6 28 Q 20 40 16 70 L 22 60 Q 22 38 14 28 Z" fill={s.outfitDark} opacity="0.5" />
      {/* collar */}
      <path d="M -8 26 L 0 34 L 8 26" stroke="#fff" strokeWidth="2" fill="none" opacity="0.7" />
    </>);
  }
  return (<>
    <path d="M -19 30 Q -21 60 -16 78 L 16 78 Q 21 60 19 30 Q 12 24 0 24 Q -12 24 -19 30 Z" fill={s.outfit} stroke={OUT} strokeWidth={SW} />
    <path d="M 6 28 Q 20 44 16 78 L 22 64 Q 22 40 14 28 Z" fill={s.outfitDark} opacity="0.5" />
    <path d="M -8 26 L 0 34 L 8 26" stroke="#fff" strokeWidth="2" fill="none" opacity="0.7" />
  </>);
}

/* ─────────── LIMBS ─────────── */
function limbs(s: CharacterStyle, pose: CharacterPose) {
  const arm = s.outfit;
  const hand = s.skin;

  const Hand = ({ x, y }: { x: number; y: number }) => (
    <circle cx={x} cy={y} r="4.5" fill={hand} stroke={OUT} strokeWidth={SW} />
  );

  switch (pose) {
    case "typing":
      return (<>
        <path d="M -16 36 Q -24 48 -14 58" fill="none" stroke={arm} strokeWidth="7" strokeLinecap="round" />
        <path d="M 16 36 Q 24 48 14 58" fill="none" stroke={arm} strokeWidth="7" strokeLinecap="round" />
        <Hand x={-14} y={60} /><Hand x={14} y={60} />
      </>);
    case "sitting":
      return (<>
        <path d="M -16 36 Q -22 52 -16 66" fill="none" stroke={arm} strokeWidth="7" strokeLinecap="round" />
        <path d="M 16 36 Q 22 52 16 66" fill="none" stroke={arm} strokeWidth="7" strokeLinecap="round" />
        <Hand x={-16} y={66} /><Hand x={16} y={66} />
      </>);
    case "talking":
      return (<>
        <path d="M -16 36 Q -26 30 -22 18" fill="none" stroke={arm} strokeWidth="7" strokeLinecap="round" />
        <path d="M 16 36 Q 24 50 22 64" fill="none" stroke={arm} strokeWidth="7" strokeLinecap="round" />
        <Hand x={-23} y={15} /><Hand x={22} y={66} />
        {legs(s)}
      </>);
    case "thinking":
      return (<>
        <path d="M -16 36 Q -22 24 -8 16" fill="none" stroke={arm} strokeWidth="7" strokeLinecap="round" />
        <Hand x={-6} y={14} />
        <path d="M 16 36 Q 22 52 16 66" fill="none" stroke={arm} strokeWidth="7" strokeLinecap="round" />
        <Hand x={16} y={66} />
        {legs(s)}
      </>);
    case "celebrating":
      return (<>
        <path d="M -16 34 Q -28 22 -22 6" fill="none" stroke={arm} strokeWidth="7" strokeLinecap="round" />
        <path d="M 16 34 Q 28 22 22 6" fill="none" stroke={arm} strokeWidth="7" strokeLinecap="round" />
        <Hand x={-23} y={3} /><Hand x={23} y={3} />
        <text x="-34" y="2" fontSize="11">✨</text>
        <text x="24" y="0" fontSize="10">⭐</text>
        {legs(s)}
      </>);
    case "coffee":
      return (<>
        <path d="M -16 36 Q -22 48 -12 54" fill="none" stroke={arm} strokeWidth="7" strokeLinecap="round" />
        <path d="M 16 36 Q 22 50 16 66" fill="none" stroke={arm} strokeWidth="7" strokeLinecap="round" />
        <Hand x={-12} y={56} /><Hand x={16} y={66} />
        {/* mug */}
        <rect x="-19" y="50" width="12" height="11" rx="2" fill="#fff" stroke={OUT} strokeWidth="1.6" />
        <path d="M -7 53 Q -3 53 -3 56 Q -3 59 -7 59" stroke={OUT} strokeWidth="1.4" fill="none" />
        <path d="M -15 48 q 2 -4 0 -7" stroke="#E0C0FF" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.7" />
        {legs(s)}
      </>);
    case "walking":
      return (<>
        <path d="M -16 36 Q -24 46 -20 58" fill="none" stroke={arm} strokeWidth="7" strokeLinecap="round" />
        <path d="M 16 36 Q 24 44 22 56" fill="none" stroke={arm} strokeWidth="7" strokeLinecap="round" />
        <Hand x={-20} y={60} /><Hand x={22} y={58} />
        {/* striding legs */}
        <path d="M -8 76 Q -16 92 -18 102" fill="none" stroke={s.outfitDark} strokeWidth="9" strokeLinecap="round" />
        <path d="M 8 76 Q 14 90 18 100" fill="none" stroke={s.outfitDark} strokeWidth="9" strokeLinecap="round" />
        <ellipse cx="-19" cy="103" rx="7" ry="3.5" fill="#3A2A52" />
        <ellipse cx="19" cy="101" rx="7" ry="3.5" fill="#3A2A52" />
      </>);
    default:
      return legs(s);
  }
}

function legs(s: CharacterStyle) {
  return (<>
    <path d="M -16 36 Q -22 52 -16 66" fill="none" stroke={s.outfit} strokeWidth="7" strokeLinecap="round" />
    <path d="M 16 36 Q 22 52 16 66" fill="none" stroke={s.outfit} strokeWidth="7" strokeLinecap="round" />
    <circle cx="-16" cy="66" r="4.5" fill={s.skin} stroke={OUT} strokeWidth={SW} />
    <circle cx="16" cy="66" r="4.5" fill={s.skin} stroke={OUT} strokeWidth={SW} />
    {/* legs */}
    <path d="M -9 76 Q -12 92 -11 102" fill="none" stroke={s.outfitDark} strokeWidth="9" strokeLinecap="round" />
    <path d="M 9 76 Q 12 92 11 102" fill="none" stroke={s.outfitDark} strokeWidth="9" strokeLinecap="round" />
    <ellipse cx="-12" cy="104" rx="7" ry="3.5" fill="#3A2A52" />
    <ellipse cx="12" cy="104" rx="7" ry="3.5" fill="#3A2A52" />
  </>);
}
