import { Undo2, X } from 'lucide-react';

const Snackbar = ({ snackbar, onClose }) => {
  if (!snackbar) return null;
  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="animate-fadein flex items-center gap-4 rounded-full bg-[#1B1B21] px-5 py-3 text-sm text-white shadow-2xl">
        <span>{snackbar.message}</span>
        {snackbar.onUndo ? (
          <button
            onClick={() => {
              snackbar.onUndo();
              onClose();
            }}
            className="flex items-center gap-1 rounded-full px-3 py-1 font-semibold text-[#AEC0FF] transition-colors hover:bg-white/10"
          >
            <Undo2 size={14} /> Undo
          </button>
        ) : null}
        <button
          onClick={onClose}
          className="rounded-full p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
