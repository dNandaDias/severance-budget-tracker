import { useContext } from 'react';
import { PrivacyContext } from './PrivacyContext';

const NumberField = ({ label, value, onChange, help, min }) => {
  const hide = useContext(PrivacyContext);
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#46464F]">{label}</label>
      <div className="flex items-center rounded-2xl border border-[#C6C6D0] bg-white px-4 py-3 transition-colors focus-within:border-[#375DFB] focus-within:ring-2 focus-within:ring-[#375DFB]/15">
        <span className="mr-2 text-[#79747E]">€</span>
        <input
          type="number"
          min={min}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`w-full bg-transparent text-right text-[15px] font-medium text-[#1B1B21] outline-none transition-all duration-200 ${
            hide ? 'blur-lg select-none' : ''
          }`}
        />
      </div>
      {help ? <p className="mt-1.5 text-xs text-[#79747E]">{help}</p> : null}
    </div>
  );
};

export default NumberField;
