import { Wallet2, PiggyBank, ArrowRight, ChevronDown } from 'lucide-react';
import ThemeStyles from './ThemeStyles';
import { useCurrency } from './CurrencyContext';
import { CURRENCIES, currencyLabel } from '../lib/currencies';

const MODES = [
  {
    id: 'generic',
    icon: Wallet2,
    title: 'Usual Budget',
    description:
      'Everyday income and expenses, categorised, with clear monthly and spending-by-category breakdowns. For ongoing, month-to-month budgeting.',
    fill: '#375DFB',
  },
  {
    id: 'severance',
    icon: PiggyBank,
    title: 'Severance / Career Transition',
    description:
      'A severance payout draining over time, alongside income and expenses, with a runway projection, for tracking a fixed career-transition period.',
    fill: '#55D6A7',
    fillText: '#0D3D1D',
  },
];

const ModePicker = ({ onSelect }) => {
  const { currency, setCurrency } = useCurrency();
  return (
  <div className="min-h-screen text-[#1B1B21]">
    <ThemeStyles />

    <div className="bg-[color:var(--app-bar)] text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-between gap-4 px-4 py-10 sm:px-6">
        <div>
          <h1 className="text-[2.1rem] font-semibold leading-tight tracking-tight sm:text-[2.7rem]">Budget Tracker</h1>
          <p className="mt-1 text-sm text-white/75">Choose how you want to track your money</p>
        </div>
        <label className="relative mt-1.5">
          <span className="sr-only">Currency</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            title="Currency"
            className="h-9 cursor-pointer appearance-none rounded-full bg-white/10 pl-3.5 pr-8 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} style={{ color: '#1B1B21', background: '#FFFFFF' }}>
                {currencyLabel(c.code)}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
        </label>
      </div>
    </div>

    <div className="mx-auto max-w-5xl p-4 py-10 sm:p-6 sm:py-14">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className="group flex flex-col glass-card overflow-hidden rounded-[28px] text-left shadow-sm transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex h-32 items-center justify-center" style={{ background: mode.fill }}>
              <mode.icon size={40} style={{ color: mode.fillText || '#FFFFFF' }} />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h2 className="text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
                {mode.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#46464F]">{mode.description}</p>
              <span className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-[#3255E4]">
                Choose
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-[#46464F]">
        Each mode keeps its own separate data: switching later never overwrites the other.
      </p>
    </div>
  </div>
  );
};

export default ModePicker;
