import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as api from '../../api';
import type { Settings } from '../../types';

interface CoverSettingsPanelProps {
  collectionId: number;
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

export default function CoverSettingsPanel({
  collectionId,
  settings: initialSettings,
  onSave,
  onClose,
}: CoverSettingsPanelProps) {
  const { t } = useTranslation();
  const [localSettings, setLocalSettings] = useState<Settings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await api.updateSettings(collectionId, localSettings);
      onSave(saved);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismisses modal on click, keyboard handled by Escape listener
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape key handled via window keydown listener in useEffect
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stone-100">
          <h2 className="font-['Cormorant_Garamond'] text-xl font-medium text-stone-800">
            {t('coverSettings.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="cs-title" className="block text-xs font-medium text-stone-500 mb-1.5">
              {t('coverSettings.coverTitle')} <span className="text-rose-400">*</span>
            </label>
            <input
              id="cs-title"
              ref={titleRef}
              type="text"
              required
              value={localSettings.cover_title}
              onChange={(e) => setLocalSettings((s) => ({ ...s, cover_title: e.target.value }))}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition"
              placeholder={t('coverSettings.coverTitlePlaceholder')}
            />
          </div>
          <div>
            <label
              htmlFor="cs-subtitle"
              className="block text-xs font-medium text-stone-500 mb-1.5"
            >
              {t('coverSettings.coverSubtitle')}
            </label>
            <input
              id="cs-subtitle"
              type="text"
              value={localSettings.cover_subtitle}
              onChange={(e) => setLocalSettings((s) => ({ ...s, cover_subtitle: e.target.value }))}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition"
              placeholder={t('coverSettings.coverSubtitlePlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="cs-credit" className="block text-xs font-medium text-stone-500 mb-1.5">
              {t('coverSettings.coverCredit')}
            </label>
            <input
              id="cs-credit"
              type="text"
              value={localSettings.cover_credit}
              onChange={(e) => setLocalSettings((s) => ({ ...s, cover_credit: e.target.value }))}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition"
              placeholder={t('coverSettings.coverCreditPlaceholder')}
            />
          </div>
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
              disabled={!localSettings.cover_title.trim() || saving}
              className="flex-1 py-2 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? t('coverSettings.saving') : t('coverSettings.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
