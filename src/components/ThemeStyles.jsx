// Material 3 light/dark theme: base tokens, texture, and the dark-mode override
// rules that recolor every arbitrary-value Tailwind class used across both
// trackers. Shared verbatim by both modes — this is presentation, not data.
const ThemeStyles = () => (
  <style>{`
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fadein { animation: fadeInUp .35s cubic-bezier(0, 0, 0, 1); }
    @keyframes pulseSoft { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
    .animate-pulse-soft { animation: pulseSoft 1.8s ease-in-out infinite; }
    .recharts-tooltip-cursor { transition: x 200ms cubic-bezier(0.2, 0, 0, 1), width 200ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms cubic-bezier(0.2, 0, 0, 1); }
    h1, h2 { font-family: 'Fraunces', serif; }

    /* ── Material Design 3 Color Tokens ──────────────────────────── */
    :root {
      color-scheme: light dark;
      --md-surface: #F7F7FB;
      --md-on-surface: #1B1B21;
      --md-on-surface-var: #46464F;
      --md-outline: #79747E;
      --app-bar: #4527A0;
    }
    html.dark {
      --md-surface: #121016;
      --md-on-surface: #F0F0F5;
      --md-on-surface-var: #C7C7D1;
      --md-outline: #9C97A3;
      --app-bar: #2A1B3D;
    }

    /* Static fallback under the animated AmbientBackground (no WebGL, or before it paints). */
    body { background: linear-gradient(135deg, #CDBEF5 0%, #8AC9D8 55%, #9FE5CF 100%) fixed; }
    html.dark body { background: radial-gradient(70% 55% at 20% 70%, rgba(10, 92, 62, 0.6), transparent 70%), radial-gradient(55% 45% at 85% 10%, rgba(28, 74, 168, 0.45), transparent 70%), radial-gradient(40% 35% at 90% 95%, rgba(92, 44, 150, 0.4), transparent 70%), #0A0C16 fixed; }

    /* Glass surfaces: translucent, blurred, with a light edge. Opaque fallback if backdrop-filter is missing. */
    .glass-card, .glass-bar {
      background-color: rgba(255, 255, 255, 0.62);
      -webkit-backdrop-filter: blur(16px) saturate(1.5);
      backdrop-filter: blur(16px) saturate(1.5);
    }
    .glass-card { border: 1px solid rgba(255, 255, 255, 0.7); }
    .glass-bar { border-bottom: 1px solid rgba(255, 255, 255, 0.7); }
    html.dark .glass-card, html.dark .glass-bar { background-color: rgba(28, 26, 36, 0.62); }
    html.dark .glass-card { border-color: rgba(255, 255, 255, 0.09); }
    html.dark .glass-bar { border-bottom-color: rgba(255, 255, 255, 0.09); }
    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      .glass-card, .glass-bar { background-color: rgba(255, 255, 255, 0.94); }
      html.dark .glass-card, html.dark .glass-bar { background-color: rgba(28, 26, 36, 0.96); }
    }
    html.dark [class*="bg-white"] { background-color: #1C1A24 !important; }
    html.dark [class*="bg-[#F5F2FA]"] { background-color: #26222E !important; }
    html.dark [class*="bg-[#EEF1FF]"] { background-color: #20263A !important; }
    html.dark [class*="bg-[#E3E8FF]"] { background-color: #20263A !important; }
    html.dark [class*="bg-[#EFECF4]"] { background-color: #2A2632 !important; }
    html.dark [class*="bg-[#FDEDEA]"] { background-color: #3A1F1C !important; }
    html.dark [class*="bg-[#FFF6E5]"] { background-color: #3A2F14 !important; }
    html.dark [class*="bg-[#E7F6EC]"] { background-color: #16321F !important; }
    html.dark [class*="from-[#EEF1FF]"] { --tw-gradient-from: #20263A var(--tw-gradient-from-position) !important; }
    html.dark [class*="to-[#E3E8FF]"] { --tw-gradient-to: #161A28 var(--tw-gradient-to-position) !important; }
    html.dark [class*="from-[#E7F6EC]"] { --tw-gradient-from: #16321F var(--tw-gradient-from-position) !important; }
    html.dark [class*="to-[#D9F2E2]"] { --tw-gradient-to: #0F2417 var(--tw-gradient-to-position) !important; }
    html.dark [class*="from-[#FDEDEA]"] { --tw-gradient-from: #3A1F1C var(--tw-gradient-from-position) !important; }
    html.dark [class*="to-[#FBDEDB]"] { --tw-gradient-to: #2E1815 var(--tw-gradient-to-position) !important; }
    html.dark [class*="text-[#1B1B21]"] { color: #F0F0F5 !important; }
    html.dark [class*="text-[#46464F]"] { color: #C7C7D1 !important; }
    html.dark [class*="text-[#645F6C]"] { color: #9C97A3 !important; }
    html.dark [class*="text-[#B3261E]"] { color: #FF7A6E !important; }
    html.dark [class*="text-[#1E8E3E]"] { color: #4ADE80 !important; }
    html.dark [class*="text-[#5C1A14]"] { color: #FFD4CC !important; }
    html.dark [class*="text-[#0D3D1D]"] { color: #BEF5D0 !important; }
    html.dark [class*="text-[#B36B00]"] { color: #FFC069 !important; }
    html.dark [class*="text-[#5C4200]"] { color: #FFE8B3 !important; }
    html.dark [class*="text-[#1B2559]"] { color: #C7D2FF !important; }
    html.dark [class*="text-[#3255E4]"] { color: #7C93FF !important; }
    html.dark [class*="border-[#C6C6D0]"] { border-color: #3A3742 !important; }
    html.dark [class*="border-black/5"] { border-color: rgba(255,255,255,0.1) !important; }
    html.dark input, html.dark select { color: #F0F0F5; }
    html.dark input::placeholder { color: #6B6775; }
    html.dark .recharts-cartesian-axis-tick text { fill: #9C97A3 !important; }
    html.dark .recharts-cartesian-grid line { stroke: #2A2732 !important; }
    html.dark .recharts-legend-item-text { color: #C7C7D1 !important; }
  `}</style>
);

export default ThemeStyles;
