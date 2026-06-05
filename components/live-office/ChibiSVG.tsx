import type { OfficeStatus } from "@/lib/officeData";

interface ChibiSVGProps {
  hairColor: string;
  skinColor: string;
  isTyping?: boolean;
  status?: OfficeStatus;
  floatClass?: string;
  delayStyle?: React.CSSProperties;
}

/* Status → glow color hex */
const statusGlow: Record<string, string> = {
  working:    "#B794F4",
  reviewing:  "#FFE29A",
  publishing: "#A7F3D0",
  waiting:    "#C4B5FD",
  idle:       "#E5E7EB",
};

export default function ChibiSVG({
  hairColor,
  skinColor,
  isTyping = false,
  status = "idle",
  floatClass = "chibi-float",
  delayStyle,
}: ChibiSVGProps) {
  const glow = statusGlow[status] ?? "#E5E7EB";

  return (
    <div
      className={`relative inline-block select-none ${floatClass}`}
      style={delayStyle}
    >
      {/* Status glow ring */}
      <div
        className="absolute inset-0 rounded-full status-pulse"
        style={{
          background: `radial-gradient(circle, ${glow}55 0%, transparent 70%)`,
          transform: "scale(1.3)",
        }}
      />

      {/* Sparkle top-right (working only) */}
      {status === "working" && (
        <div
          className="absolute -top-1 -right-1 text-[10px] sparkle-orbit pointer-events-none"
          style={{ animationDuration: "4s" }}
        >
          ✨
        </div>
      )}

      <svg
        viewBox="0 0 48 54"
        width="52"
        height="58"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* ── Cat ears ── */}
        <polygon points="8,18 4,6 16,14" fill={hairColor} />
        <polygon points="40,18 44,6 32,14" fill={hairColor} />
        {/* inner ear */}
        <polygon points="9,17 6,9 15,14" fill="#FFB7D5" opacity="0.55" />
        <polygon points="39,17 42,9 33,14" fill="#FFB7D5" opacity="0.55" />

        {/* ── Hair blob ── */}
        <ellipse cx="24" cy="13" rx="15" ry="11" fill={hairColor} />

        {/* ── Head ── */}
        <ellipse cx="24" cy="28" rx="18" ry="17" fill={skinColor} />

        {/* ── Eyes (blink) ── */}
        <g className="chibi-eye">
          <ellipse cx="17" cy="25" rx="4" ry="4.5" fill="white" />
          <circle  cx="17" cy="26" r="2.6" fill="#2D1B4E" />
          <circle  cx="18.2" cy="24.8" r="1.1" fill="white" />
        </g>
        <g className="chibi-eye chibi-eye-r">
          <ellipse cx="31" cy="25" rx="4" ry="4.5" fill="white" />
          <circle  cx="31" cy="26" r="2.6" fill="#2D1B4E" />
          <circle  cx="32.2" cy="24.8" r="1.1" fill="white" />
        </g>

        {/* ── Blush ── */}
        <ellipse cx="11" cy="30" rx="5" ry="3"   fill="#FFB7D5" opacity="0.38" />
        <ellipse cx="37" cy="30" rx="5" ry="3"   fill="#FFB7D5" opacity="0.38" />

        {/* ── Mouth ── */}
        {isTyping ? (
          /* typing dots replace mouth */
          <>
            <circle cx="18" cy="33" r="1.8" fill="#B794F4" className="dot-1" />
            <circle cx="24" cy="33" r="1.8" fill="#B794F4" className="dot-2" />
            <circle cx="30" cy="33" r="1.8" fill="#B794F4" className="dot-3" />
          </>
        ) : (
          <path
            d="M 19 34 Q 24 38.5 29 34"
            stroke="#8B6BAE"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* ── Tiny body stub ── */}
        <ellipse cx="24" cy="46" rx="10" ry="7" fill={skinColor} opacity="0.5" />
      </svg>
    </div>
  );
}
