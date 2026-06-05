# Character sprite assets

Phase 1 renders characters as layered SVG via `components/characters/ChibiSprite.tsx`.

To upgrade to painted PNG sprites later **without touching layout**:

1. Drop transparent PNGs here named by agent id, e.g. `oa1.png`, `oa2.png` … `oa17.png`.
   - Recommended: ~240×300px, character centred horizontally, feet near the bottom.
2. Switch the render mode to `"png"` where `CharacterRenderer` is used
   (e.g. pass `mode="png"` from the scene), or flip the default in
   `components/characters/CharacterRenderer.tsx`.

The adapter keeps the same on-screen placement (`cx`, `headCy`, `scale`),
so swapping art does not require any scene/layout changes.
