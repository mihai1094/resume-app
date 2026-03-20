import type { TemplateCustomization } from "@/components/resume/template-customizer";

export interface StylePack {
  name: string;
  description: string;
  customization: Omit<TemplateCustomization, "ideThemeId">;
}

export const STYLE_PACKS: StylePack[] = [
  {
    name: "Midnight Professional",
    description: "Navy + gold, elegant serif",
    customization: {
      primaryColor: "#1e293b",
      secondaryColor: "#b8860b",
      accentColor: "#f1c40f",
      fontFamily: "serif",
      fontSize: 14,
      lineSpacing: 1.5,
      sectionSpacing: 16,
    },
  },
  {
    name: "Nordic Clean",
    description: "Cool blue, warm pop, modern sans",
    customization: {
      primaryColor: "#2D4059",
      secondaryColor: "#EA5455",
      accentColor: "#F07B3F",
      fontFamily: "sans",
      fontSize: 14,
      lineSpacing: 1.5,
      sectionSpacing: 16,
    },
  },
  {
    name: "Warm Executive",
    description: "Terracotta + neutral, refined serif",
    customization: {
      primaryColor: "#B84A2A",
      secondaryColor: "#2D3436",
      accentColor: "#F5EDE3",
      fontFamily: "serif",
      fontSize: 14,
      lineSpacing: 1.6,
      sectionSpacing: 18,
    },
  },
  {
    name: "Tech Minimal",
    description: "Slate + sky, mono, tight spacing",
    customization: {
      primaryColor: "#334155",
      secondaryColor: "#0ea5e9",
      accentColor: "#38bdf8",
      fontFamily: "mono",
      fontSize: 13,
      lineSpacing: 1.4,
      sectionSpacing: 12,
    },
  },
  {
    name: "Forest Estate",
    description: "Deep green + warm earth tones",
    customization: {
      primaryColor: "#1B4332",
      secondaryColor: "#D4A373",
      accentColor: "#FEFAE0",
      fontFamily: "serif",
      fontSize: 14,
      lineSpacing: 1.5,
      sectionSpacing: 16,
    },
  },
  {
    name: "Wine & Gold",
    description: "Rich burgundy, gold accents",
    customization: {
      primaryColor: "#4A0E0E",
      secondaryColor: "#C9A84C",
      accentColor: "#F5F0E8",
      fontFamily: "sans",
      fontSize: 14,
      lineSpacing: 1.5,
      sectionSpacing: 16,
    },
  },
];
