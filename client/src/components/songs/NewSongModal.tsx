import { X } from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as api from '../../api';
import type { Song } from '../../types';

interface NewSongModalProps {
  collectionId: number;
  onClose: () => void;
  onCreate: (song: Song) => void;
}

export default function NewSongModal({ collectionId, onClose, onCreate }: NewSongModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [credit, setCredit] = useState('');
  const [original, setOriginal] = useState('');
  const [columns, setColumns] = useState<1 | 2 | 3>(2);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const [, formAction, isPending] = useActionState(async () => {
    if (!title.trim()) return;
    const song = await api.createSong(collectionId, {
      title: title.trim(),
      credit: credit.trim() || undefined,
      original: original.trim() || undefined,
      columns,
    });
    onCreate(song);
  }, null);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismisses modal on click, keyboard handled by Escape listener
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape key handled via window keydown listener in useEffect
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stone-100">
          <h2 className="font-['Cormorant_Garamond'] text-xl font-medium text-stone-800">
            {t('songModal.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form action={formAction} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="modal-title"
              className="block text-xs font-medium text-stone-500 mb-1.5"
            >
              {t('songForm.titleLabel')} <span className="text-rose-400">*</span>
            </label>
            <input
              id="modal-title"
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('songForm.titlePlaceholder')}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition"
            />
          </div>

          {/* Credit */}
          <div>
            <label
              htmlFor="modal-credit"
              className="block text-xs font-medium text-stone-500 mb-1.5"
            >
              {t('songForm.creditLabel')}
            </label>
            <input
              id="modal-credit"
              type="text"
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              placeholder={t('songForm.creditPlaceholder')}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition placeholder-stone-300"
            />
          </div>

          {/* Original title */}
          <div>
            <label
              htmlFor="modal-original"
              className="block text-xs font-medium text-stone-500 mb-1.5"
            >
              {t('songForm.originalLabel')}
            </label>
            <input
              id="modal-original"
              type="text"
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder={t('songForm.originalPlaceholder')}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition placeholder-stone-300"
            />
          </div>

          {/* Columns */}
          <div>
            <p className="block text-xs font-medium text-stone-500 mb-1.5">
              {t('songForm.columnsLabel')}
            </p>
            <div className="flex gap-2" role="radiogroup" aria-label={t('songForm.columnsLabel')}>
              {([1, 2, 3] as const).map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColumns(col)}
                  className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${
                    columns === col
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {col} col
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
            >
              {t('songModal.cancel')}
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isPending}
              className="flex-1 py-2 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? t('songModal.creating') : t('songModal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
