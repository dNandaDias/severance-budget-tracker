import { Wallet2, PiggyBank, ArrowRight } from 'lucide-react';
import ThemeStyles from './ThemeStyles';

const MODES = [
  {
    id: 'generic',
    icon: Wallet2,
    title: 'Usual Budget',
    description:
      'Everyday income and expenses, categorized, with clear monthly and spending-by-category breakdowns. For ongoing, month-to-month budgeting.',
    fill: '#375DFB',
  },
  {
    id: 'severance',
    icon: PiggyBank,
    title: 'Severance / Career Transition',
    description:
      'A severance payout draining over time, alongside income and expenses, with a runway projection — for tracking a fixed career-transition period.',
    fill: '#55D6A7',
    fillText: '#0D3D1D',
  },
];

const ModePicker = ({ onSelect }) => (
  <div className="min-h-screen bg-[#F7F7FB] text-[#1B1B21] bg-texture">
    <ThemeStyles />

    <div className="bg-[#2A1B3D] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Budget Tracker</h1>
        <p className="mt-1 text-sm text-white/60">Choose how you want to track your money</p>
      </div>
    </div>

    <div className="mx-auto max-w-5xl p-4 py-10 sm:p-6 sm:py-14">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className="group flex flex-col overflow-hidden rounded-[28px] border border-black/5 bg-white text-left shadow-sm transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex h-32 items-center justify-center" style={{ background: mode.fill }}>
              <mode.icon size={40} style={{ color: mode.fillText || '#FFFFFF' }} />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h2 className="text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
                {mode.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#46464F]">{mode.description}</p>
              <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-[#375DFB]">
                Choose
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-[#79747E]">
        Each mode keeps its own separate data — switching later never overwrites the other.
      </p>
    </div>
  </div>
);

export default ModePicker;
