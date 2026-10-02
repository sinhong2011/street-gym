// Shared by the page CSS and the Remotion compositions (which render to canvas/SVG and need literal values).
export const C = {
  paper: "#ebe5da",
  paperDeep: "#ddd5c6",
  ink: "#1c1915",
  inkSoft: "#5e574d",
  rule: "#c9bfae",
  signal: "#e5501b", // chalk-line orange
  signalSoft: "#f1a27f",
} as const;

export const FONT = {
  display: "'Big Shoulders Display', 'Noto Sans TC', sans-serif",
  serif: "'Noto Serif TC', serif",
  sans: "'Archivo', 'Noto Sans TC', sans-serif",
} as const;
