import { useTranslation } from 'react-i18next';
import { PRESETS } from '../../lib/print/presets';

interface PresetPanelProps {
  current: string;
  onChange: (id: string) => void;
}

export default function PresetPanel({ current, onChange }: PresetPanelProps) {
  const { t } = useTranslation();
  return (
    <div className="preset-panel">
      {PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`preset-btn ${current === p.id ? 'active' : ''}`}
          onClick={() => onChange(p.id)}
        >
          <div className="preset-swatch">
            {p.swatch.map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </div>
          <div>
            <span className="preset-name">{t(`printView.presets.${p.id}`)}</span>
            <span className="preset-sub">{t(`printView.presets.${p.id}Sub`)}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
