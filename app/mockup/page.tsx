/* STATIC mockup — reference image as scene art + LIVE interactive overlay.
   Proves the "image + overlay" approach before touching LiveOffice. */

/* demo live bubbles positioned as % of the image (placed on workers that
   have no baked bubble, so the overlay is visibly distinct) */
const bubbles = [
  { x: 30, y: 47, text: "กำลังไล่ฟีดหาไอเดีย 🚀", delay: "0s" },
  { x: 86, y: 50, text: "ส่งงานแล้วค่ะ ✅", delay: "1.2s" },
];

/* demo clickable hotspots (rings) over characters */
const hotspots = [
  { x: 30, y: 56 },
  { x: 86, y: 58 },
  { x: 46, y: 42 },
];

export default function MockupPage() {
  return (
    <div className="-m-8 min-h-screen flex items-center justify-center p-4"
      style={{ background: "radial-gradient(120% 90% at 50% 30%, #14102C 0%, #0C0820 60%, #070414 100%)" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .pf{font-family:'Press Start 2P',monospace;}
        .th{font-family:'Noto Sans Thai',sans-serif;}
        @keyframes pop{0%,100%{opacity:0;transform:transl(-50%,4px) scale(.9)}10%,80%{opacity:1;transform:translate(-50%,0) scale(1)}}
        @keyframes ringpulse{0%,100%{opacity:.35;transform:translate(-50%,-50%) scale(1)}50%{opacity:.85;transform:translate(-50%,-50%) scale(1.12)}}
        @keyframes livedot{0%,100%{opacity:1}50%{opacity:.3}}
        .ov-bubble{animation:pop 5s ease-in-out infinite;}
        .ov-ring{animation:ringpulse 2.2s ease-in-out infinite;}
      `}</style>

      <div className="relative w-full" style={{ maxWidth: 1180, aspectRatio: "1402 / 1122" }}>
        {/* scene art */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/reference/office-scene.png" alt="Live Office"
          className="absolute inset-0 w-full h-full object-contain rounded-xl"
          style={{ imageRendering: "pixelated" }} />

        {/* ── LIVE overlay layer ── */}
        {/* live pulse chip (top-right, over baked clock area is fine) */}
        <div className="absolute" style={{ left: "2%", top: "3%" }}>
          <div className="th flex items-center gap-1.5 px-2 py-1 rounded-md"
            style={{ background: "rgba(20,14,40,0.85)", border: "1px solid rgba(110,231,183,0.5)" }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ animation: "livedot 1.4s ease-in-out infinite" }} />
            <span className="text-[10px] text-emerald-300 font-bold">LIVE OVERLAY</span>
          </div>
        </div>

        {/* clickable hotspots */}
        {hotspots.map((h, i) => (
          <div key={i} className="ov-ring absolute rounded-full pointer-events-none"
            style={{ left: `${h.x}%`, top: `${h.y}%`, width: 44, height: 22,
              border: "2px dashed rgba(200,168,240,0.9)", boxShadow: "0 0 12px rgba(180,111,255,0.5)" }} />
        ))}

        {/* live speech bubbles */}
        {bubbles.map((b, i) => (
          <div key={i} className="ov-bubble th absolute z-20" style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: b.delay }}>
            <div className="relative">
              <div className="px-2.5 py-1.5 text-[11px] font-bold text-[#1A1228] whitespace-nowrap rounded-lg"
                style={{ background: "#FCF3D8", border: "2px solid #C9A24B", boxShadow: "0 3px 0 rgba(0,0,0,0.3)" }}>
                {b.text}
              </div>
              <div className="absolute left-3 -bottom-[6px] w-0 h-0"
                style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "7px solid #FCF3D8" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
