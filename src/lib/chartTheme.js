export const tooltipStyle = {
  borderRadius: 16,
  border: '1px solid #E1E1EA',
  boxShadow: '0 8px 24px rgba(27,27,33,0.10)',
  fontSize: 13,
};

// Fixed across light/dark themes on purpose: these are fill colours that always sit
// behind solid white text/icons, so they need to hold ≥4.5:1 contrast against white
// regardless of theme, not just look good against whatever the page background is.
// `text` defaults to white for saturated fills. "success" is the one light,
// literal-brand-colour fill (#55D6A7, unmodified) — it pairs with dark ink
// text instead, since white-on-mint fails contrast (only ~1.8:1) while
// dark-on-mint is excellent (~9.4:1).
export const STAT_TONES = {
  primary: { fill: '#375DFB', text: '#FFFFFF' },
  success: { fill: '#55D6A7', text: '#0D3D1D' },
  accent: { fill: '#7C4DFF', text: '#FFFFFF' },
  warn: { fill: '#B3261E', text: '#FFFFFF' },
};

export const COLORS = ['#375DFB', '#7C4DFF', '#00ACC1', '#F4A300', '#FF6F61', '#43A047', '#8D6E63', '#5C6BC0'];
