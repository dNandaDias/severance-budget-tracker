import { useContext, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Edit2, Layers, Plus, Trash2 } from 'lucide-react';
import SectionCard from './SectionCard';
import { PrivacyContext, Amount } from './PrivacyContext';

const DistributedExpensesSection = ({
  items, setItems, editingExpense, setEditingExpense, updateItem, onAdd, onRemove, months, delay,
}) => {
  const hide = useContext(PrivacyContext);
  const [open, setOpen] = useState(items.length > 0);
  return (
    <SectionCard
      title="Spread-out Expenses"
      icon={Layers}
      delay={delay}
      actions={
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-[#375DFB] transition-colors hover:bg-[#EEF1FF]"
        >
          {open ? 'Hide' : 'Show'} {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      }
    >
      <p className="mb-4 text-sm text-[#79747E]">
        A big cost split evenly across several months — e.g. €3,000 of dental work spread over 6 months.
      </p>
      {open && (
        <>
          <div className="space-y-2">
            {items.length === 0 && (
              <p className="rounded-2xl bg-[#F5F2FA] px-4 py-6 text-center text-sm text-[#79747E]">
                No spread-out expenses yet.
              </p>
            )}
            {items.map((item) => {
              const isEditing = editingExpense.type === 'distributed' && editingExpense.id === item.id;
              return (
                <div
                  key={item.id}
                  className={`flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3 transition-colors ${
                    isEditing ? 'bg-[#EEF1FF] ring-1 ring-[#375DFB]/30' : 'hover:bg-[#F5F2FA]'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <input
                        autoFocus
                        value={item.name}
                        onChange={(e) => updateItem(items, setItems, item.id, 'name', e.target.value)}
                        placeholder="Expense name"
                        className="min-w-[9rem] flex-1 rounded-xl border border-[#C6C6D0] bg-white px-3 py-2 text-sm outline-none focus:border-[#375DFB]"
                      />
                      <div className="flex items-center rounded-xl border border-[#C6C6D0] bg-white px-2 py-2">
                        <span className="mr-1 text-xs text-[#79747E]">€</span>
                        <input
                          type="number"
                          value={item.totalAmount}
                          onChange={(e) => updateItem(items, setItems, item.id, 'totalAmount', parseFloat(e.target.value) || 0)}
                          className={`w-20 bg-transparent text-right text-sm outline-none ${hide ? 'blur-lg select-none' : ''}`}
                        />
                      </div>
                      <div className="flex items-center gap-1 rounded-xl border border-[#C6C6D0] bg-white px-2 py-2">
                        <input
                          type="number"
                          min={1}
                          value={item.months}
                          onChange={(e) => updateItem(items, setItems, item.id, 'months', parseFloat(e.target.value) || 1)}
                          className="w-12 bg-transparent text-right text-sm outline-none"
                        />
                        <span className="text-xs text-[#79747E]">mo</span>
                      </div>
                      <select
                        value={item.startMonth}
                        onChange={(e) => updateItem(items, setItems, item.id, 'startMonth', e.target.value)}
                        className="rounded-xl border border-[#C6C6D0] bg-white px-2 py-2 text-sm outline-none focus:border-[#375DFB]"
                      >
                        {months.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setEditingExpense({ type: null, id: null })}
                        className="rounded-full bg-[#375DFB] p-2 text-white transition-transform hover:scale-105"
                        title="Save"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#1B1B21]">
                        {item.name || 'Untitled expense'}
                      </span>
                      <span className="rounded-full bg-[#F5F2FA] px-2.5 py-1 text-xs font-medium text-[#46464F]">
                        <Amount value={item.totalAmount} /> over {item.months}mo from {item.startMonth}
                      </span>
                      <span className="text-sm font-semibold text-[#1B1B21]"><Amount value={item.monthlyAmount} digits={2} />/mo</span>
                      <button
                        onClick={() => setEditingExpense({ type: 'distributed', id: item.id })}
                        className="rounded-full p-2 text-[#79747E] transition-colors hover:bg-[#E3E8FF] hover:text-[#375DFB]"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onRemove(items, setItems, item.id, item.name)}
                        className="rounded-full p-2 text-[#79747E] transition-colors hover:bg-[#FDEDEA] hover:text-[#B3261E]"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={onAdd}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#C6C6D0] py-3 text-sm font-medium text-[#375DFB] transition-colors hover:border-[#375DFB] hover:bg-[#EEF1FF]"
          >
            <Plus size={16} /> Add spread-out expense
          </button>
        </>
      )}
    </SectionCard>
  );
};

export default DistributedExpensesSection;
