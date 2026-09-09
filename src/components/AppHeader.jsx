import { Sun, Moon, ArrowLeftRight } from 'lucide-react';

const AppHeader = ({ icon: Icon, iconBg, title, subtitle, darkMode, setDarkMode, showSavedPing, onSwitchMode }) => (
  <div className="bg-[#2A1B3D] text-white">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: iconBg }}>
            <Icon size={22} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
            <p className="text-sm text-white/60">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 text-sm text-white/50 transition-opacity duration-500 ${
              showSavedPing ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Saved
          </div>
          {onSwitchMode ? (
            <button
              onClick={onSwitchMode}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 h-9 text-sm font-medium transition-colors hover:bg-white/20"
              title="Switch to the other mode"
              aria-label="Switch to the other mode"
            >
              <ArrowLeftRight size={15} />
              Switch mode
            </button>
          ) : null}
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default AppHeader;
