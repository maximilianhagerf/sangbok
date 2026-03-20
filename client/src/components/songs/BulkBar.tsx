import { Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BulkBarProps {
  count: number;
  total: number;
  onSelectAll: () => void;
  onClear: () => void;
  onDelete: () => void;
  deleting: boolean;
}

export default function BulkBar({
  count,
  total,
  onSelectAll,
  onClear,
  onDelete,
  deleting,
}: BulkBarProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 bg-stone-900 text-white rounded-2xl shadow-2xl shadow-stone-900/30 text-sm max-w-[calc(100vw-2rem)]">
      <span className="text-stone-300 tabular-nums">
        <span className="text-white font-medium">{count}</span> {t('bulkBar.selected')}
      </span>

      <div className="w-px h-4 bg-stone-700" />

      {count < total ? (
        <button
          type="button"
          onClick={onSelectAll}
          className="text-stone-300 hover:text-white transition-colors"
        >
          {t('bulkBar.selectAll')}
        </button>
      ) : (
        <button
          type="button"
          onClick={onClear}
          className="text-stone-300 hover:text-white transition-colors"
        >
          {t('bulkBar.deselectAll')}
        </button>
      )}

      <div className="w-px h-4 bg-stone-700" />

      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
      >
        <Trash2 size={14} />
        {deleting ? t('bulkBar.deleting') : t('bulkBar.delete', { count })}
      </button>

      <div className="w-px h-4 bg-stone-700" />

      <button
        type="button"
        onClick={onClear}
        className="text-stone-400 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
