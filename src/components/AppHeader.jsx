import { Sun, Moon, ArrowLeftRight } from 'lucide-react';

const AppHeader = ({ icon: Icon, title, subtitle, darkMode, setDarkMode, showSavedPing, onSwitchMode }) => (
  <div className="bg-[color:var(--app-bar)] text-white">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Icon size={38} strokeWidth={1.5} className="mt-1 shrink-0" aria-hidden="true" />
          <div>
            <h1 className="text-[1.8rem] font-semibold leading-tight tracking-tight sm:text-[2.2rem]">{title}</h1>
            <p className="text-sm text-white/75">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`flex items-center gap-1.5 text-sm text-white/70 transition-opacity duration-500 ${
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
