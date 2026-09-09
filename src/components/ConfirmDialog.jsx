import { createPortal } from 'react-dom';

// Every destructive action confirms first and is visually distinct
// (design-principles.md §7) — this is the one shared confirm surface for
// anything in either tracker that clears or overwrites data.
//
// Rendered via a portal straight into <body>: SectionCard applies a
// Tailwind translate-y transform once it scrolls into view, and any
// non-none `transform` on an ancestor turns it into a containing block for
// `position: fixed` descendants — without the portal this dialog's backdrop
// gets trapped inside whichever card it was opened from instead of covering
// the page.
const ConfirmDialog = ({ open, title, message, confirmLabel, onConfirm, onCancel }) => {
  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold text-[#1B1B21]"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#46464F]">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-[#46464F] transition-colors hover:bg-[#F5F2FA]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-[#B3261E] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#961F18]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
