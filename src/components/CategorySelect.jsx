import { useState } from 'react';

const CategorySelect = ({ value, onChange, categories, onAddCategory, className = '' }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  if (adding) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const added = onAddCategory(draft);
            if (added) onChange(added);
            setAdding(false);
            setDraft('');
          } else if (e.key === 'Escape') {
            setAdding(false);
            setDraft('');
          }
        }}
        onBlur={() => {
          setAdding(false);
          setDraft('');
        }}
        placeholder="New category name"
        className={`rounded-xl border border-[#C6C6D0] bg-white px-2 py-2 text-sm outline-none focus:border-[#375DFB] ${className}`}
      />
    );
  }

  return (
    <select
      value={value || 'Miscellaneous'}
      onChange={(e) => (e.target.value === '__add__' ? setAdding(true) : onChange(e.target.value))}
      className={`rounded-xl border border-[#C6C6D0] bg-white px-2 py-2 text-sm outline-none focus:border-[#375DFB] ${className}`}
    >
      {categories.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
      <option value="__add__">+ Add category…</option>
    </select>
  );
};

export default CategorySelect;
