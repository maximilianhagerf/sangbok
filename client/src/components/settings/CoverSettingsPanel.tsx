import { useActionState, useState } from 'react';
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

  const [, formAction, isPending] = useActionState(async () => {
    const saved = await api.updateSettings(collectionId, localSettings);
    onSave(saved);
    onClose();
  }, null);

  return (
    <form
      action={formAction}
      className="mb-6 p-4 border border-stone-200 rounded-xl bg-stone-50 space-y-3"
    >
      <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
        {t('coverSettings.title')}
      </p>
      <div>
        <label htmlFor="cs-title" className="block text-xs text-stone-500 mb-1">
          {t('coverSettings.coverTitle')} <span className="text-red-400">*</span>
        </label>
        <input
          id="cs-title"
          type="text"
          required
          value={localSettings.cover_title}
          onChange={(e) => setLocalSettings((s) => ({ ...s, cover_title: e.target.value }))}
          className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
          placeholder={t('coverSettings.coverTitlePlaceholder')}
        />
      </div>
      <div>
        <label htmlFor="cs-subtitle" className="block text-xs text-stone-500 mb-1">
          {t('coverSettings.coverSubtitle')}
        </label>
        <input
          id="cs-subtitle"
          type="text"
          value={localSettings.cover_subtitle}
          onChange={(e) => setLocalSettings((s) => ({ ...s, cover_subtitle: e.target.value }))}
          className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
          placeholder={t('coverSettings.coverSubtitlePlaceholder')}
        />
      </div>
      <div>
        <label htmlFor="cs-credit" className="block text-xs text-stone-500 mb-1">
          {t('coverSettings.coverCredit')}
        </label>
        <input
          id="cs-credit"
          type="text"
          value={localSettings.cover_credit}
          onChange={(e) => setLocalSettings((s) => ({ ...s, cover_credit: e.target.value }))}
          className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
          placeholder={t('coverSettings.coverCreditPlaceholder')}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1.5 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? t('coverSettings.saving') : t('coverSettings.save')}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
        >
          {t('songModal.cancel')}
        </button>
      </div>
    </form>
  );
}
