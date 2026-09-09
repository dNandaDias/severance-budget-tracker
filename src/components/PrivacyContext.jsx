import React, { useContext } from 'react';
import { fmtEUR } from '../lib/format';
import { tooltipStyle } from '../lib/chartTheme';

export const PrivacyContext = React.createContext(false);

export const Amount = ({ value, digits = 0, className = '' }) => {
  const hide = useContext(PrivacyContext);
  return (
    <span className={`${hide ? 'blur-lg select-none' : ''} transition-all duration-200 ${className}`}>
      {fmtEUR(value, digits)}
    </span>
  );
};

export const ChartTooltip = ({ active, payload, label }) => {
  const hide = useContext(PrivacyContext);
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={tooltipStyle} className="bg-white px-4 py-3">
      <p className="mb-1 text-xs font-medium text-[#79747E]">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2 text-sm font-semibold" style={{ color: entry.color }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: entry.color }} />
          {entry.name}: {hide ? '•••••' : fmtEUR(entry.value)}
        </p>
      ))}
    </div>
  );
};
