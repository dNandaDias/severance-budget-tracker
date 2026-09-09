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
    }
    html.dark {
      --md-surface: #121016;
      --md-on-surface: #F0F0F5;
      --md-on-surface-var: #C7C7D1;
      --md-outline: #9C97A3;
    }

    .bg-texture {
      background-image: radial-gradient(circle at 1px 1px, rgba(27,27,33,0.05) 1px, transparent 0);
      background-size: 22px 22px;
    }
    html.dark .bg-texture {
      background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0);
    }

    html.dark body { background: #121016; }
    html.dark [class*="bg-[#F7F7FB]"] { background-color: #121016 !important; }
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
    html.dark [class*="text-[#79747E]"] { color: #9C97A3 !important; }
    html.dark [class*="text-[#B3261E]"] { color: #FF7A6E !important; }
    html.dark [class*="text-[#1E8E3E]"] { color: #4ADE80 !important; }
    html.dark [class*="text-[#5C1A14]"] { color: #FFD4CC !important; }
    html.dark [class*="text-[#0D3D1D]"] { color: #BEF5D0 !important; }
    html.dark [class*="text-[#B36B00]"] { color: #FFC069 !important; }
    html.dark [class*="text-[#5C4200]"] { color: #FFE8B3 !important; }
    html.dark [class*="text-[#1B2559]"] { color: #C7D2FF !important; }
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
