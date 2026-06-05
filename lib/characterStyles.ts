import type { CharacterStyle } from "@/components/characters/types";

/* Office-worker palette: dark business-casual outfits, natural+accent hair.
   Reads as cozy studio staff, not pastel mascots. Keyed by officeAgent id. */
const SKIN = "#F0CBB0";
const SKIN_SH = "#DCA98A";

function mk(hair: string, hairDark: string, hairLight: string, outfit: string, outfitDark: string, hairStyle: CharacterStyle["hairStyle"], accessory: CharacterStyle["accessory"]): CharacterStyle {
  return { hair, hairDark, hairLight, skin: SKIN, skinShade: SKIN_SH, outfit, outfitDark, hairStyle, accessory };
}

// dark outfit tones
const NAVY = "#2E3350", NAVY_D = "#20243C";
const CHAR = "#33303F", CHAR_D = "#24222E";
const PLUM = "#3A2E4A", PLUM_D = "#2A2036";
const TEAL = "#243F44", TEAL_D = "#182C30";

export const characterStyles: Record<string, CharacterStyle> = {
  // Marketing
  oa1: mk("#E58AB0", "#C0648C", "#F4B8D2", PLUM, PLUM_D, "long",  "none"),
  oa2: mk("#2E2A3A", "#1C1925", "#4A4458", NAVY, NAVY_D, "bob",   "glasses"),
  oa3: mk("#F48FB1", "#D46A90", "#FFC1D8", CHAR, CHAR_D, "twin",  "headphones"),
  oa4: mk("#5A4030", "#3E2A1E", "#7E5C44", NAVY, NAVY_D, "pony",  "none"),

  // Content
  oa5: mk("#C8C8D4", "#9C9CAC", "#E6E6EE", TEAL, TEAL_D, "bob",   "headphones"),
  oa6: mk("#3A3550", "#262238", "#5C5678", NAVY, NAVY_D, "short", "glasses"),
  oa7: mk("#E8C878", "#C0A050", "#F6E2A8", CHAR, CHAR_D, "buns",  "headphones"),

  // Design
  oa8: mk("#B488E0", "#8E60BE", "#D4BCF2", PLUM, PLUM_D, "long",  "glasses"),
  oa9: mk("#E58AC0", "#BE649C", "#F6BCE0", CHAR, CHAR_D, "spiky", "none"),

  // Ads
  oa10: mk("#5A4030", "#3E2A1E", "#7E5C44", NAVY, NAVY_D, "spiky", "none"),
  oa11: mk("#2E2A3A", "#1C1925", "#4A4458", CHAR, CHAR_D, "short", "glasses"),
  oa12: mk("#E8C878", "#C0A050", "#F6E2A8", NAVY, NAVY_D, "pony",  "none"),

  // Support
  oa13: mk("#C8C8D4", "#9C9CAC", "#E6E6EE", PLUM, PLUM_D, "long",  "headphones"),
  oa14: mk("#E58AB0", "#C0648C", "#F4B8D2", CHAR, CHAR_D, "buns",  "none"),

  // Operations
  oa15: mk("#2E2A3A", "#1C1925", "#4A4458", NAVY, NAVY_D, "short", "glasses"),
  oa16: mk("#3A3550", "#262238", "#5C5678", TEAL, TEAL_D, "bob",   "headphones"),
  oa17: mk("#5A4030", "#3E2A1E", "#7E5C44", NAVY, NAVY_D, "pony",  "none"),
};

export const fallbackStyle: CharacterStyle = mk("#3A3550", "#262238", "#5C5678", NAVY, NAVY_D, "short", "none");
