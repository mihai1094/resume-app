/**
 * IDE Theme variants for the Technical template
 * Each theme provides a complete color palette inspired by popular code editors
 */

export interface IDETheme {
  id: string;
  name: string;
  /** Short description for tooltip */
  description: string;
  colors: {
    /** Main background */
    bg: string;
    /** Sidebar/panel background */
    sidebar: string;
    /** Hover/selection background */
    hover: string;
    /** Border color */
    border: string;
    /** Primary text */
    text: string;
    /** Muted/secondary text */
    textMuted: string;
    /** Keywords (const, let, function, etc.) */
    keyword: string;
    /** Function names */
    function: string;
    /** Strings */
    string: string;
    /** Variables */
    variable: string;
    /** Comments */
    comment: string;
    /** Types/classes */
    type: string;
    /** Numbers */
    number: string;
  };
}

export const IDE_THEMES: IDETheme[] = [
  {
    id: "vscode-dark",
    name: "VS Code Dark+",
    description: "The default Visual Studio Code dark theme",
    colors: {
      bg: "#1e1e1e",
      sidebar: "#252526",
      hover: "#2a2d2e",
      border: "#3c3c3c",
      text: "#d4d4d4",
      textMuted: "#808080",
      keyword: "#569cd6",
      function: "#dcdcaa",
      string: "#ce9178",
      variable: "#9cdcfe",
      comment: "#6a9955",
      type: "#4ec9b0",
      number: "#b5cea8",
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    description: "A dark theme with vibrant purple accents",
    colors: {
      bg: "#282a36",
      sidebar: "#21222c",
      hover: "#44475a",
      border: "#44475a",
      text: "#f8f8f2",
      textMuted: "#6272a4",
      keyword: "#ff79c6",
      function: "#50fa7b",
      string: "#f1fa8c",
      variable: "#bd93f9",
      comment: "#6272a4",
      type: "#8be9fd",
      number: "#bd93f9",
    },
  },
  {
    id: "one-dark",
    name: "One Dark",
    description: "Atom's iconic One Dark theme",
    colors: {
      bg: "#282c34",
      sidebar: "#21252b",
      hover: "#2c313a",
      border: "#3e4451",
      text: "#abb2bf",
      textMuted: "#5c6370",
      keyword: "#c678dd",
      function: "#61afef",
      string: "#98c379",
      variable: "#e06c75",
      comment: "#5c6370",
      type: "#e5c07b",
      number: "#d19a66",
    },
  },
  {
    id: "monokai",
    name: "Monokai",
    description: "The legendary Sublime Text theme",
    colors: {
      bg: "#272822",
      sidebar: "#1e1f1c",
      hover: "#3e3d32",
      border: "#49483e",
      text: "#f8f8f2",
      textMuted: "#75715e",
      keyword: "#f92672",
      function: "#a6e22e",
      string: "#e6db74",
      variable: "#66d9ef",
      comment: "#75715e",
      type: "#66d9ef",
      number: "#ae81ff",
    },
  },
  {
    id: "nord",
    name: "Nord",
    description: "Arctic, north-bluish color palette",
    colors: {
      bg: "#2e3440",
      sidebar: "#292e39",
      hover: "#3b4252",
      border: "#4c566a",
      text: "#eceff4",
      textMuted: "#616e88",
      keyword: "#81a1c1",
      function: "#88c0d0",
      string: "#a3be8c",
      variable: "#d8dee9",
      comment: "#616e88",
      type: "#8fbcbb",
      number: "#b48ead",
    },
  },
  {
    id: "github-dark",
    name: "GitHub Dark",
    description: "GitHub's dark mode color scheme",
    colors: {
      bg: "#0d1117",
      sidebar: "#161b22",
      hover: "#21262d",
      border: "#30363d",
      text: "#c9d1d9",
      textMuted: "#8b949e",
      keyword: "#ff7b72",
      function: "#d2a8ff",
      string: "#a5d6ff",
      variable: "#79c0ff",
      comment: "#8b949e",
      type: "#7ee787",
      number: "#79c0ff",
    },
  },
];

export type IDEThemeId = (typeof IDE_THEMES)[number]["id"];

export const DEFAULT_IDE_THEME = IDE_THEMES[0]; // VS Code Dark+

/**
 * Get an IDE theme by ID
 */
export function getIDETheme(id: string): IDETheme {
  return IDE_THEMES.find((t) => t.id === id) ?? DEFAULT_IDE_THEME;
}

/**
 * Convert IDE theme to ColorPalette format for compatibility
 * Uses keyword as primary and function as secondary
 */
export function ideThemeToColorPalette(theme: IDETheme) {
  return {
    id: theme.id,
    name: theme.name,
    primary: theme.colors.keyword,
    secondary: theme.colors.function,
  };
}
