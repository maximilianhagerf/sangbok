import { useTranslation } from 'react-i18next';
import { type PrintStyle, STYLE_KEYS } from '../../lib/print/types';

interface StyleSwitcherProps {
  current: PrintStyle;
  onChange: (s: PrintStyle) => void;
}

export default function StyleSwitcher({ current, onChange }: StyleSwitcherProps) {
  const { t } = useTranslation();
  return (
    <div className="style-switcher">
      {(Object.keys(STYLE_KEYS) as PrintStyle[]).map((s) => (
        <button
          key={s}
          type="button"
          className={`style-btn ${current === s ? 'active' : ''}`}
          onClick={() => onChange(s)}
        >
          <span className="btn-label">{t(STYLE_KEYS[s].label)}</span>
          <span className="btn-sub">{t(STYLE_KEYS[s].sub)}</span>
        </button>
      ))}
    </div>
  );
}
