import { EyeIcon, EyeOffIcon } from './icons';

const TabNav = ({ tabs, activeTab, setActiveTab, hideAmounts, setHideAmounts }) => (
  <div className="border-b border-black/5 bg-white">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
      <div className="inline-flex rounded-full bg-[#F5F2FA] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ${
              activeTab === tab.id ? 'bg-white text-[#375DFB] shadow-sm' : 'text-[#46464F] hover:text-[#1B1B21]'
            }`}
          >
            <tab.icon size={17} />
            {tab.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => setHideAmounts((h) => !h)}
        className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#375DFB] shadow-sm transition-colors hover:bg-[#EEF1FF]"
        title={hideAmounts ? 'Show amounts' : 'Hide amounts'}
        aria-label={hideAmounts ? 'Show amounts' : 'Hide amounts'}
      >
        {hideAmounts ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
        {hideAmounts ? 'Show' : 'Hide'}
      </button>
    </div>
  </div>
);

export default TabNav;
