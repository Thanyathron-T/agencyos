export type CharacterPose =
  | "sitting"      // seated, hands on desk
  | "typing"       // seated, typing
  | "talking"      // standing, gesturing
  | "walking"      // mid-stride
  | "thinking"     // hand to chin
  | "sleeping"     // dozing
  | "celebrating"  // arms up
  | "coffee";      // holding a mug

export type HairStyle = "twin" | "bob" | "short" | "pony" | "spiky" | "long" | "buns";
export type Accessory = "none" | "headphones" | "glasses";

export interface CharacterStyle {
  hair: string;
  hairDark: string;
  hairLight: string;
  skin: string;
  skinShade: string;
  outfit: string;
  outfitDark: string;
  hairStyle: HairStyle;
  accessory: Accessory;
}

/** Render mode — Phase 1 is "svg"; later "png" can be added without touching layout. */
export type RenderMode = "svg" | "png";
