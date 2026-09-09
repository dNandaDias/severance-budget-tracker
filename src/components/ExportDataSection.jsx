import { useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import SectionCard from './SectionCard';
import ConfirmDialog from './ConfirmDialog';

// Shared by both trackers. "Start fresh" is the period-backup/reset flow from
// the mode-switching use case (e.g. severance ends, new job starts): download
// a full backup first, then clear this mode's data — never the other mode's.
const ExportDataSection = ({ onExportCSV, onExportJSON, onStartFresh, delay = 0 }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <SectionCard title="Export Data" icon={Download} delay={delay}>
      <p className="mb-4 text-sm text-[#79747E]">
        Download everything you've entered — income, expenses, and uploads — as a spreadsheet-friendly
        CSV or a raw JSON backup.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onExportCSV}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#C6C6D0] py-3 text-sm font-medium text-[#1B1B21] transition-colors hover:border-[#375DFB] hover:bg-[#EEF1FF]"
        >
          <Download size={16} /> Download CSV
        </button>
        <button
          onClick={onExportJSON}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#C6C6D0] py-3 text-sm font-medium text-[#1B1B21] transition-colors hover:border-[#375DFB] hover:bg-[#EEF1FF]"
        >
          <Download size={16} /> Download JSON
        </button>
      </div>

      <div className="mt-6 border-t border-black/5 pt-5">
        <p className="mb-3 text-sm text-[#79747E]">
          Finished this period, e.g. a severance runway ending or a new job starting? Download a full
          backup, then clear this data for a fresh start. The other mode is never affected.
        </p>
        <button
          onClick={() => setConfirmOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#B3261E]/30 py-3 text-sm font-medium text-[#B3261E] transition-colors hover:bg-[#FDEDEA]"
        >
          <RotateCcw size={16} /> Download backup &amp; start fresh
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Start a new period?"
        message="This downloads a CSV and JSON backup of everything currently entered here, then clears it so you can start fresh. Your backup file becomes the only full copy — but if you change your mind right after, the clear itself can still be undone from the confirmation that appears."
        confirmLabel="Download & start fresh"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onStartFresh();
        }}
      />
    </SectionCard>
  );
};

export default ExportDataSection;
