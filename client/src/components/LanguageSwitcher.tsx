import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'sv', label: 'SV' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div className="flex items-center gap-1 text-xs">
      {LANGS.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => i18n.changeLanguage(lang.code)}
          data-active={i18n.language === lang.code || undefined}
          className={`px-2 py-1 rounded transition-colors ${
            i18n.language === lang.code
              ? 'bg-stone-800 text-white'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
