
export const colors = {
  // Backgrounds
  bg:        "#050d1a",       // page background
  bgMid:     "#0a1628",       // card / section background
  bgLight:   "#0f2040",       // elevated surface
  bgHover:   "#122448",       // hover surface

  // Borders
  border:    "#1a3050",       // default border
  borderHi:  "#2a4870",       // highlighted border

  // Brand accents
  amber:     "#f5a623",       // primary accent
  amberDim:  "#c47d0e",       // amber hover
  amberGlow: "#f5a62322",     // amber glow/fill

  teal:      "#1ddba8",       // secondary accent
  tealDim:   "#0fa87d",
  tealGlow:  "#1ddba820",

  violet:    "#a78bfa",       // tertiary accent
  violetGlow:"#a78bfa18",

  // Text
  white:     "#eaf2ff",
  text:      "#c8daf0",
  textDim:   "#6b8aaa",
  textFaint: "#3a5070",

  // Semantic
  success:   "#1ddba8",
  warning:   "#f5a623",
  danger:    "#f87171",
};

export const radii = {
  sm: "2px",
  md: "4px",
  lg: "8px",
};

export const transitions = {
  fast:   "all 0.15s ease",
  normal: "all 0.25s ease",
  slow:   "all 0.4s ease",
};

export const fonts = {
  display: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
  mono:    "'Fira Mono', 'Courier New', monospace",
};

export const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fira+Mono:wght@400;500&display=swap');`;

// Base CSS reset + global styles to inject once at the app root
export const globalStyles = `
  ${fontImport}

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: ${colors.bg};
    color: ${colors.text};
    font-family: ${fonts.display};
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${colors.bgMid}; }
  ::-webkit-scrollbar-thumb { background: ${colors.amber}; border-radius: 2px; }

  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; }

  /* ── Keyframes ─────────────────────────────────────────── */

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes scanline {
    0%   { transform: translateY(-40px); opacity: 0.6; }
    80%  { opacity: 0.3; }
    100% { transform: translateY(100vh); opacity: 0; }
  }

  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.35; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes gridFade {
    from { opacity: 0; }
    to   { opacity: 0.06; }
  }

  @keyframes borderGlow {
    0%, 100% { box-shadow: 0 0 0 0 ${colors.amber}00; }
    50%       { box-shadow: 0 0 16px 2px ${colors.amber}22; }
  }

  @keyframes countUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;