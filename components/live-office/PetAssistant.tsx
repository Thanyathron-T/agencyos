export default function PetAssistant() {
  return (
    <div className="glass rounded-3xl p-4 shadow-md shadow-chibi-primary/10 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-3 self-start">
        <span className="text-lg">🐱</span>
        <div>
          <h3 className="text-xs font-bold text-chibi-ink">ผู้ช่วยน้อย</h3>
          <p className="text-[10px] text-chibi-muted">Pet Assistant</p>
        </div>
      </div>

      {/* Cat SVG */}
      <div className="relative flex items-center justify-center mb-3">
        {/* Orbit sparkles */}
        <div className="absolute sparkle-orbit text-xs pointer-events-none opacity-70" style={{ animationDuration: "5s" }}>✨</div>
        <div className="absolute sparkle-orbit text-xs pointer-events-none opacity-50" style={{ animationDuration: "7s", animationDirection: "reverse" }}>🌸</div>

        <div className="pet-idle">
          <svg viewBox="0 0 80 80" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
            {/* Body */}
            <ellipse cx="40" cy="54" rx="18" ry="14" fill="#F5E6FF" />
            {/* Head */}
            <circle cx="40" cy="36" r="20" fill="#F5E6FF" />
            {/* Ears */}
            <polygon points="22,22 16,8 30,16" fill="#E9D5FF" />
            <polygon points="58,22 64,8 50,16" fill="#E9D5FF" />
            {/* Inner ears */}
            <polygon points="23,21 18,11 29,17" fill="#FFB7D5" opacity="0.6" />
            <polygon points="57,21 62,11 51,17" fill="#FFB7D5" opacity="0.6" />
            {/* Eyes */}
            <ellipse cx="33" cy="33" rx="4.5" ry="5" fill="white" />
            <circle  cx="33" cy="34" r="3" fill="#2D1B4E" />
            <circle  cx="34.2" cy="32.8" r="1.2" fill="white" />
            <ellipse cx="47" cy="33" rx="4.5" ry="5" fill="white" />
            <circle  cx="47" cy="34" r="3" fill="#2D1B4E" />
            <circle  cx="48.2" cy="32.8" r="1.2" fill="white" />
            {/* Blush */}
            <ellipse cx="26" cy="40" rx="6" ry="3.5" fill="#FFB7D5" opacity="0.4" />
            <ellipse cx="54" cy="40" rx="6" ry="3.5" fill="#FFB7D5" opacity="0.4" />
            {/* Nose */}
            <ellipse cx="40" cy="40" rx="2" ry="1.2" fill="#C084FC" />
            {/* Mouth */}
            <path d="M 36 42 Q 40 46 44 42" stroke="#8B6BAE" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            {/* Whiskers left */}
            <line x1="18" y1="39" x2="32" y2="41" stroke="#C4B5FD" strokeWidth="1" opacity="0.7" />
            <line x1="18" y1="43" x2="32" y2="43" stroke="#C4B5FD" strokeWidth="1" opacity="0.7" />
            {/* Whiskers right */}
            <line x1="62" y1="39" x2="48" y2="41" stroke="#C4B5FD" strokeWidth="1" opacity="0.7" />
            <line x1="62" y1="43" x2="48" y2="43" stroke="#C4B5FD" strokeWidth="1" opacity="0.7" />
            {/* Tail */}
            <path
              className="chibi-tail"
              d="M 55 62 Q 72 60 70 50 Q 68 42 60 46"
              stroke="#E9D5FF"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Collar */}
            <rect x="28" y="50" width="24" height="5" rx="2.5" fill="#B794F4" opacity="0.7" />
            <circle cx="40" cy="52.5" r="2" fill="#FFE29A" />
          </svg>
        </div>
      </div>

      {/* Speech bubble */}
      <div className="glass-soft rounded-2xl rounded-tl-sm px-3 py-2 text-center w-full">
        <p className="text-[11px] font-semibold text-chibi-ink">
          สวัสดีค่ะ! 🌸
        </p>
        <p className="text-[10px] text-chibi-muted mt-0.5">
          น้อง AI ทำงานดีมากวันนี้เลย~
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mt-3 w-full">
        {["☕ ชาร์จพลัง", "🎵 เปิดเพลง"].map((label) => (
          <button
            key={label}
            className="flex-1 text-[10px] font-medium py-1.5 rounded-xl bg-violet-100/60 text-violet-600 hover:bg-violet-100 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
