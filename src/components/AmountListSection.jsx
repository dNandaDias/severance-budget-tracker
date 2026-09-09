import { useContext } from 'react';
import { CheckCircle2, Edit2, Plus, Trash2 } from 'lucide-react';
import SectionCard from './SectionCard';
import CategorySelect from './CategorySelect';
import { PrivacyContext, Amount } from './PrivacyContext';

const AmountListSection = ({
  title, icon: Icon, items, setItems, editingExpense, setEditingExpense,
  updateItem, onAdd, onRemove, total, addLabel, emptyText, delay, categories, onAddCategory,
}) => {
  const hide = useContext(PrivacyContext);
  return (
  <SectionCard
    title={title}
    icon={Icon}
    delay={delay}
    actions={
      <span className="rounded-full bg-[#EFECF4] px-3 py-1 text-sm font-semibold text-[#375DFB]">
        <Amount value={total} />
        <span className="ml-1 font-normal text-[#79747E]">/mo</span>
      </span>
    }
  >
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="rounded-2xl bg-[#F5F2FA] px-4 py-6 text-center text-sm text-[#79747E]">{emptyText}</p>
      )}
      {items.map((item) => {
        const isEditing = editingExpense.type === 'current' && editingExpense.id === item.id;
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
                  onKeyDown={(e) => e.key === 'Enter' && setEditingExpense({ type: null, id: null })}
                  placeholder="Expense name"
                  className="min-w-[9rem] flex-1 rounded-xl border border-[#C6C6D0] bg-white px-3 py-2 text-sm outline-none focus:border-[#375DFB]"
                />
                <CategorySelect
                  value={item.category}
                  onChange={(v) => updateItem(items, setItems, item.id, 'category', v)}
                  categories={categories}
                  onAddCategory={onAddCategory}
                />
                <div className="flex items-center rounded-xl border border-[#C6C6D0] bg-white px-2 py-2">
                  <span className="mr-1 text-xs text-[#79747E]">€</span>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateItem(items, setItems, item.id, 'amount', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingExpense({ type: null, id: null })}
                    className={`w-20 bg-transparent text-right text-sm outline-none ${hide ? 'blur-lg select-none' : ''}`}
                  />
                </div>
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
                  {item.category || 'Miscellaneous'}
                </span>
                <span className="text-sm font-semibold text-[#1B1B21]"><Amount value={item.amount} /></span>
                <button
                  onClick={() => setEditingExpense({ type: 'current', id: item.id })}
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
      <Plus size={16} /> {addLabel}
    </button>
  </SectionCard>
  );
};

export default AmountListSection;
