import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import * as api from '../api';
import LanguageSwitcher from '../components/LanguageSwitcher';
import CardSheet from '../components/print/CardSheet';
import Cover from '../components/print/Cover';
import PresetPanel from '../components/print/PresetPanel';
import SongBlock from '../components/print/SongBlock';
import SongPage from '../components/print/SongPage';
import StyleSwitcher from '../components/print/StyleSwitcher';
import { buildCardData } from '../lib/print/cardLayout';
import { BASE_CSS, STYLE_CSS } from '../lib/print/css';
import { PRESETS, presetCSS } from '../lib/print/presets';
import type { PrintStyle } from '../lib/print/types';
import type { Settings, Song } from '../types';

export default function PrintView() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const collectionId = Number(searchParams.get('c')) || 1;
  const [songs, setSongs] = useState<Song[]>([]);
  const [settings, setSettings] = useState<Settings>({
    cover_title: '',
    cover_subtitle: '',
    cover_credit: '',
  });
  const [loading, setLoading] = useState(true);
  const [printStyle, setPrintStyle] = useState<PrintStyle>('standard');
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];

  useEffect(() => {
    Promise.all([api.getSongs(collectionId), api.getSettings(collectionId)])
      .then(([s, cfg]) => {
        setSongs(s);
        setSettings(cfg);
      })
      .finally(() => setLoading(false));
  }, [collectionId]);

  if (loading)
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>{t('printView.loading')}</div>
    );

  // Build card data (songs split into fold-over credit cards, with continuation cards for long songs)
  const allCards = buildCardData(songs);
  const cardChunks = [];
  for (let i = 0; i < allCards.length; i += 4) cardChunks.push(allCards.slice(i, i + 4));

  return (
    <>
      <style>{presetCSS(preset) + BASE_CSS + STYLE_CSS[printStyle]}</style>

      <StyleSwitcher current={printStyle} onChange={setPrintStyle} />
      <PresetPanel current={presetId} onChange={setPresetId} />

      {printStyle === 'compact' ? (
        // Compact: single flowing sheet, no individual page wrappers
        <div className="compact-sheet">
          {songs.map((song, i) => (
            <SongBlock key={song.id} song={song} index={i} />
          ))}
        </div>
      ) : printStyle === 'cards' ? (
        // Cards: 4 per A4 sheet, fold-over credit card format
        cardChunks.map((chunk, ci) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: sheet index is stable
          <CardSheet key={ci} cards={chunk} />
        ))
      ) : (
        // Standard + Booklet: each song gets its own page
        <>
          <Cover songs={songs} style={printStyle} settings={settings} />
          {songs.map((song, i) => (
            <SongPage key={song.id} song={song} index={i} />
          ))}
        </>
      )}

      <div className="lang-switcher">
        <LanguageSwitcher />
      </div>
      <button type="button" className="print-btn" onClick={() => window.print()}>
        {t('printView.printBtn')}
      </button>
    </>
  );
}
