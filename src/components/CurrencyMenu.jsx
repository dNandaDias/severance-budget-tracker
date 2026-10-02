import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { CURRENCIES, currencyLabel } from '../lib/currencies';

// A small custom menu instead of a native <select>: the browser draws a native list wherever
// and however large it likes, which on some systems lands far from the button.
const CurrencyMenu = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const selectedIndex = Math.max(0, CURRENCIES.findIndex((c) => c.code === value));

  const openMenu = () => {
    setActive(selectedIndex);
    setOpen(true);
  };
  const closeMenu = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };
  const choose = (code) => {
    closeMenu();
    onChange(code);
  };

  useEffect(() => {
    if (!open) return undefined;
    listRef.current?.focus();
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) closeMenu(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onButtonKeyDown = (event) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openMenu();
    }
  };

  const onListKeyDown = (event) => {
    const last = CURRENCIES.length - 1;
    if (event.key === 'ArrowDown') setActive((i) => Math.min(i + 1, last));
    else if (event.key === 'ArrowUp') setActive((i) => Math.max(i - 1, 0));
    else if (event.key === 'Home') setActive(0);
    else if (event.key === 'End') setActive(last);
    else if (event.key === 'Enter' || event.key === ' ') choose(CURRENCIES[active].code);
    else if (event.key === 'Escape') closeMenu();
    else if (event.key === 'Tab') closeMenu(false);
    else return;
    event.preventDefault();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={onButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency, ${value}`}
        className="flex h-9 items-center gap-2 rounded-full bg-white/10 pl-3.5 pr-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
      >
        {currencyLabel(value)}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open ? (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-label="Currency"
          aria-activedescendant={`currency-option-${CURRENCIES[active].code}`}
          onKeyDown={onListKeyDown}
          className="absolute left-0 top-full z-40 mt-2 max-h-80 w-56 overflow-y-auto rounded-2xl border border-black/5 bg-white p-1.5 text-[#1B1B21] shadow-xl outline-none sm:left-auto sm:right-0"
        >
          {CURRENCIES.map((c, index) => {
            const selected = c.code === value;
            return (
              <li
                key={c.code}
                id={`currency-option-${c.code}`}
                data-index={index}
                role="option"
                aria-selected={selected}
                onClick={() => choose(c.code)}
                onMouseEnter={() => setActive(index)}
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-1.5 text-sm ${
                  index === active ? 'bg-[#EEF1FF]' : ''
                }`}
              >
                <span className="w-16 shrink-0 font-medium">{currencyLabel(c.code)}</span>
                <span className="flex-1 truncate text-[#645F6C]">{c.name}</span>
                {selected ? <Check size={14} className="shrink-0 text-[#3255E4]" aria-hidden="true" /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};

export default CurrencyMenu;
