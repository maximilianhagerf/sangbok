import { useEffect, useState } from 'react';
import * as api from '../api';
import type { Section, Song } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type PrintStyle = 'standard' | 'compact' | 'booklet' | 'cards';

const STYLE_LABELS: Record<PrintStyle, { label: string; sub: string }> = {
  standard: { label: 'Standard',   sub: 'A4 · en sång per sida' },
  compact:  { label: 'Kompakt',    sub: 'A4 · flera sånger per sida' },
  booklet:  { label: 'Fickhäfte',  sub: 'A5 · vik & häfta' },
  cards:    { label: 'Kort',       sub: 'A4 · kreditkortstorlek · vik & laminera' },
};

const ROMAN = [
  'I','II','III','IV','V','VI','VII','VIII','IX','X',
  'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX',
  'XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII','XXIX','XXX',
  'XXXI','XXXII','XXXIII','XXXIV','XXXV','XXXVI','XXXVII','XXXVIII','XXXIX','XL',
];

// ─── Shared lyric renderer ────────────────────────────────────────────────────

function renderLyrics(section: Section): JSX.Element {
  const lines = section.content.split('\n');
  if (section.chords.length === 0) {
    return (
      <p>
        {lines.map((line, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: lyric line index is the stable identity
          <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
        ))}
      </p>
    );
  }
  const chordMap = new Map(section.chords.map((c) => [c.line, c.chord]));
  return (
    <>
      {lines.map((line, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: lyric line index is the stable identity
        <span key={i}>
          {chordMap.has(i) && <span className="chord">{chordMap.get(i)}</span>}
          <span>{line}</span>
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

// ─── Song renderers ───────────────────────────────────────────────────────────

function SongPage({ song, index }: { song: Song; index: number }) {
  const colClass =
    song.columns === 1 ? 'lyrics single' : song.columns === 3 ? 'lyrics three' : 'lyrics';
  return (
    <div className="page">
      <div className="song-header">
        <p className="song-number">{ROMAN[index] ?? String(index + 1)}</p>
        <h2 className="song-title">{song.title}</h2>
        {(song.credit || song.original) && (
          <div className="song-meta">
            {song.credit && <span className="song-credit">{song.credit}</span>}
            {song.credit && song.original && <span className="song-dot">·</span>}
            {song.original && <span className="song-original">{song.original}</span>}
          </div>
        )}
      </div>
      <div className={colClass}>
        {song.sections.map((sec) => (
          <div key={sec.id} className="section">
            {sec.label && <p className="section-label">{sec.label}</p>}
            {renderLyrics(sec)}
          </div>
        ))}
      </div>
      <div className="page-foot">
        <div className="page-foot-line" />
        <span className="page-foot-num">{index + 1}</span>
        <div className="page-foot-line" />
      </div>
    </div>
  );
}

// Compact: no page wrapper — songs flow and break naturally
function SongBlock({ song, index }: { song: Song; index: number }) {
  return (
    <div className="song-block">
      <div className="song-header">
        <div className="song-header-inline">
          <span className="song-number">{ROMAN[index] ?? String(index + 1)}</span>
          <h2 className="song-title">{song.title}</h2>
          {song.credit && <span className="song-credit">{song.credit}</span>}
        </div>
      </div>
      <div className="lyrics">
        {song.sections.map((sec) => (
          <div key={sec.id} className="section">
            {sec.label && <p className="section-label">{sec.label}</p>}
            {renderLyrics(sec)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Card split algorithm ─────────────────────────────────────────────────────

interface CardData {
  song: Song;
  cardNum: number;
  totalCards: number;
  frontSections: Section[];
  backSections: Section[];
  songIndex: number;
}

// Height of a section in "line units" at the card's font size (0.54rem, lh 1.5).
// This mirrors the CSS greedy column-fill with break-inside:avoid:
// sections pile into the current column until one doesn't fit, then move to the next.
function sectionHeight(sec: Section): number {
  const lyricLines = sec.content ? sec.content.split('\n').length : 0;
  const hasChords = sec.chords.length > 0;
  return (sec.label ? 0.7 : 0) + lyricLines + (hasChords ? lyricLines * 0.7 : 0) + 0.4;
}

// Simulate CSS multi-column fill with break-inside:avoid.
// Returns the sections that fit in ≤ maxCols columns of colHeight, and the rest.
function splitByColumns(
  sections: Section[],
  colHeight: number,
  maxCols: number,
): { fits: Section[]; rest: Section[] } {
  let col = 0;
  let colFill = 0;

  for (let i = 0; i < sections.length; i++) {
    const h = sectionHeight(sections[i]);
    // Section doesn't fit in current column (and col is non-empty) → advance
    if (colFill > 0 && colFill + h > colHeight) {
      col++;
      colFill = 0;
    }
    // Would need a (maxCols+1)th column → stop (always let at least 1 section through)
    if (col >= maxCols && i > 0) {
      return { fits: sections.slice(0, i), rest: sections.slice(i) };
    }
    colFill += h;
  }
  return { fits: sections, rest: [] };
}

// Column height in line units:
// Front: 54mm total − 4.5mm padding − ~9mm header ≈ 40.5mm ÷ 3.43mm/line ≈ 11.8 → 11
// Back:  54mm total − 4.5mm padding            ≈ 49.5mm ÷ 3.43mm/line ≈ 14.4 → 14
const FRONT_COL_H = 11;
const BACK_COL_H = 14;

function buildCardData(songs: Song[]): CardData[] {
  const result: CardData[] = [];

  for (let songIndex = 0; songIndex < songs.length; songIndex++) {
    const song = songs[songIndex];
    let remaining = [...song.sections];

    if (remaining.length === 0) {
      result.push({ song, cardNum: 1, totalCards: 1, frontSections: [], backSections: [], songIndex });
      continue;
    }

    const cards: { front: Section[]; back: Section[] }[] = [];
    while (remaining.length > 0) {
      const { fits: front, rest: afterFront } = splitByColumns(remaining, FRONT_COL_H, 2);
      const { fits: back, rest: afterBack } = splitByColumns(afterFront, BACK_COL_H, 2);
      cards.push({ front, back });
      remaining = afterBack;
    }

    for (let ci = 0; ci < cards.length; ci++) {
      result.push({
        song, cardNum: ci + 1, totalCards: cards.length,
        frontSections: cards[ci].front, backSections: cards[ci].back,
        songIndex,
      });
    }
  }

  return result;
}

// ─── Card components ──────────────────────────────────────────────────────────

function SongCard({ data }: { data: CardData }) {
  const { song, cardNum, totalCards, frontSections, backSections, songIndex } = data;
  const isFirst = cardNum === 1;
  const multi = totalCards > 1;

  return (
    <div className="card-wrap">
      <div className="card">
        {/* Front — header + first batch of lyrics */}
        <div className="card-front">
          <div className="card-header">
            <div className="card-header-row">
              {isFirst && (
                <span className="card-num">{ROMAN[songIndex] ?? String(songIndex + 1)}</span>
              )}
              <h2 className="card-title">{song.title}</h2>
              {multi && <span className="card-part">{cardNum}/{totalCards}</span>}
            </div>
            {isFirst && (song.credit || song.original) && (
              <p className="card-sub">
                {song.credit}
                {song.credit && song.original && ' · '}
                {song.original}
              </p>
            )}
          </div>
          <div className="card-lyrics">
            {frontSections.map((sec) => (
              <div key={sec.id} className="section">
                {sec.label && <p className="section-label">{sec.label}</p>}
                {renderLyrics(sec)}
              </div>
            ))}
          </div>
        </div>

        {/* Back — second batch of lyrics, readable by flipping the laminated card */}
        <div className="card-back">
          {backSections.map((sec) => (
            <div key={sec.id} className="section">
              {sec.label && <p className="section-label">{sec.label}</p>}
              {renderLyrics(sec)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardSheet({ cards }: { cards: CardData[] }) {
  return (
    <div className="card-sheet">
      {cards.map((data, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: slot index within sheet is stable
        <SongCard key={i} data={data} />
      ))}
    </div>
  );
}

// ─── CSS per style ────────────────────────────────────────────────────────────

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  :root {
    --cream: #F8F5EF; --ink: #1E1B18; --ink-soft: #4A4540;
    --gold: #A8845A; --gold-lt: #C9A97A; --rule: #D8CFC4;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'EB Garamond', Georgia, serif; color: var(--ink); }
  .song-dot { color: var(--rule); }
  .song-original { letter-spacing: 0.1em; color: var(--gold); text-transform: uppercase; }
  .section-label { letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); }
  .chord { font-family: 'EB Garamond', Georgia, serif; letter-spacing: 0.08em;
    color: var(--gold-lt); display: block; }
  .style-switcher { position: fixed; top: 1.5rem; left: 50%; transform: translateX(-50%);
    display: flex; gap: 0.5rem; background: rgba(30,27,24,0.92); backdrop-filter: blur(8px);
    padding: 0.5rem; border-radius: 14px; z-index: 100; box-shadow: 0 4px 24px rgba(0,0,0,.3); }
  .style-btn { padding: 0.5rem 1rem; border-radius: 10px; border: none; cursor: pointer;
    font-family: 'Geist', sans-serif; transition: all .15s; display: flex; flex-direction: column; align-items: center; gap: 1px; }
  .style-btn .btn-label { font-size: 0.8rem; font-weight: 500; }
  .style-btn .btn-sub { font-size: 0.6rem; opacity: 0.7; white-space: nowrap; }
  .style-btn:not(.active) { background: transparent; color: rgba(248,245,239,.6); }
  .style-btn:not(.active):hover { background: rgba(248,245,239,.1); color: #F8F5EF; }
  .style-btn.active { background: #F8F5EF; color: #1E1B18; }
  .print-btn { position: fixed; bottom: 2rem; right: 2rem; background: #1E1B18; color: #F8F5EF;
    border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 0.875rem;
    cursor: pointer; font-family: sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,.2); z-index: 100; }
  .print-btn:hover { background: #333; }
  @media print { .style-switcher, .print-btn { display: none !important; } }
`;

const STANDARD_CSS = `
  html { background: #E8E4DC; font-size: 16px; }
  body { background: #E8E4DC; padding: 5rem 1rem 2rem; }
  .page { width: 210mm; min-height: 297mm; background: var(--cream); margin: 0 auto 3rem;
    padding: 20mm 20mm 18mm; position: relative; box-shadow: 0 4px 40px rgba(0,0,0,.12); }
  .song-header { margin-bottom: 6mm; }
  .song-number { font-family: 'Cormorant Garamond'; font-size: 0.65rem; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 1mm; }
  .song-title { font-family: 'Cormorant Garamond'; font-size: 1.85rem; font-weight: 300;
    letter-spacing: -0.01em; line-height: 1.1; color: var(--ink); }
  .song-meta { display: flex; align-items: center; gap: 0.5rem; margin-top: 2mm; }
  .song-credit { font-size: 0.7rem; letter-spacing: 0.06em; color: var(--ink-soft); text-transform: uppercase; }
  .song-dot { font-size: 0.7rem; }
  .song-original { font-size: 0.68rem; }
  .lyrics { columns: 2; column-gap: 8mm; column-rule: 1px solid var(--rule); }
  .lyrics.single { columns: 1; }
  .lyrics.three { columns: 3; column-gap: 6mm; }
  .section { break-inside: avoid; margin-bottom: 4mm; font-size: 0.82rem; line-height: 1.7; }
  .section-label { font-size: 0.62rem; margin-bottom: 1.5mm; }
  .chord { font-size: 0.6rem; margin-bottom: 0.1rem; }
  .page-foot { position: absolute; bottom: 10mm; left: 20mm; right: 20mm;
    display: flex; align-items: center; gap: 3mm; }
  .page-foot-line { flex: 1; height: 0.5px; background: var(--rule); }
  .page-foot-num { font-size: 0.6rem; letter-spacing: 0.12em; color: var(--rule); }
  @page { size: A4; margin: 0; }
  @media print {
    html, body { background: none; padding: 0; }
    .page { margin: 0; padding: 20mm 20mm 18mm; box-shadow: none;
      page-break-after: always; break-after: page; min-height: 297mm; }
    .page:last-child { page-break-after: auto; break-after: auto; }
  }
`;

const COMPACT_CSS = `
  html { background: #E8E4DC; font-size: 16px; }
  body { background: #E8E4DC; padding: 5rem 1rem 2rem; }
  .compact-sheet { width: 210mm; background: var(--cream); margin: 0 auto 3rem;
    padding: 12mm 14mm 10mm; box-shadow: 0 4px 40px rgba(0,0,0,.12); }
  .song-block { break-inside: avoid; padding-bottom: 4mm; margin-bottom: 4mm;
    border-bottom: 0.5px solid var(--rule); }
  .song-block:last-child { border-bottom: none; margin-bottom: 0; }
  .song-header-inline { display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2mm; }
  .song-number { font-family: 'Cormorant Garamond'; font-size: 0.6rem; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--gold); }
  .song-title { font-family: 'Cormorant Garamond'; font-size: 1.05rem; font-weight: 500;
    line-height: 1.2; color: var(--ink); }
  .song-credit { font-size: 0.6rem; letter-spacing: 0.05em; color: var(--ink-soft);
    text-transform: uppercase; margin-left: auto; }
  .lyrics { columns: 3; column-gap: 5mm; column-rule: 0.5px solid var(--rule); }
  .section { break-inside: avoid; margin-bottom: 2.5mm; font-size: 0.7rem; line-height: 1.55; }
  .section-label { font-size: 0.55rem; margin-bottom: 1mm; }
  .chord { font-size: 0.52rem; margin-bottom: 0.05rem; }
  @page { size: A4; margin: 12mm 14mm 10mm; }
  @media print {
    html, body { background: none; padding: 0; }
    .compact-sheet { margin: 0; padding: 0; box-shadow: none; width: auto; }
    .song-block { break-inside: avoid; }
  }
`;

const BOOKLET_CSS = `
  html { background: #D4CFC8; font-size: 15px; }
  body { background: #D4CFC8; padding: 5rem 1rem 2rem; }
  .page { width: 148mm; min-height: 210mm; background: var(--cream); margin: 0 auto 2.5rem;
    padding: 14mm 14mm 12mm; position: relative; box-shadow: 0 4px 32px rgba(0,0,0,.14); }
  .song-header { margin-bottom: 4mm; }
  .song-number { font-family: 'Cormorant Garamond'; font-size: 0.58rem; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 0.8mm; }
  .song-title { font-family: 'Cormorant Garamond'; font-size: 1.45rem; font-weight: 300;
    letter-spacing: -0.01em; line-height: 1.1; color: var(--ink); }
  .song-meta { display: flex; align-items: center; gap: 0.4rem; margin-top: 1.5mm; flex-wrap: wrap; }
  .song-credit { font-size: 0.62rem; letter-spacing: 0.05em; color: var(--ink-soft); text-transform: uppercase; }
  .song-dot { font-size: 0.62rem; }
  .song-original { font-size: 0.6rem; }
  .lyrics { columns: 1; }
  .lyrics.two { columns: 2; column-gap: 6mm; column-rule: 0.5px solid var(--rule); }
  .section { break-inside: avoid; margin-bottom: 3mm; font-size: 0.74rem; line-height: 1.65; }
  .section-label { font-size: 0.56rem; margin-bottom: 1mm; }
  .chord { font-size: 0.54rem; margin-bottom: 0.08rem; }
  .page-foot { position: absolute; bottom: 6mm; left: 14mm; right: 14mm;
    display: flex; align-items: center; gap: 2mm; }
  .page-foot-line { flex: 1; height: 0.5px; background: var(--rule); }
  .page-foot-num { font-size: 0.52rem; letter-spacing: 0.12em; color: var(--rule); }
  @page { size: A5; margin: 0; }
  @media print {
    html, body { background: none; padding: 0; }
    .page { margin: 0; padding: 14mm 14mm 12mm; box-shadow: none;
      page-break-after: always; break-after: page; min-height: 210mm; width: 148mm; }
    .page:last-child { page-break-after: auto; break-after: auto; }
  }
`;

const CARDS_CSS = `
  html { background: #C0BCB5; font-size: 16px; }
  body { background: #C0BCB5; padding: 5rem 1rem 2rem; }

  /* ── Sheet: 2×2 grid on A4 ── */
  .card-sheet {
    width: 210mm; background: #E8E4DC; margin: 0 auto 3rem;
    padding: 10mm; display: grid;
    grid-template-columns: repeat(2, 85.6mm);
    column-gap: 18.8mm; row-gap: 10mm;
    justify-content: center; align-content: start;
    box-shadow: 0 4px 40px rgba(0,0,0,.12);
  }

  /* ── Card wrap ── */
  .card-wrap { position: relative; width: 85.6mm; height: 108mm; }

  /* ── Card: just a positioned container, no visual style ── */
  .card { position: absolute; inset: 0; }

  /* ── Front half: 0–54mm, all four corners rounded ──
     Explicit height on .card-lyrics prevents CSS columns from overflowing to a
     phantom 3rd column when break-inside:avoid causes a section to skip columns. */
  .card-front {
    position: absolute; top: 0; left: 0; right: 0; height: 54mm;
    background: var(--cream); border-radius: 3.5mm; overflow: hidden;
    padding: 2.5mm 3.5mm 2mm;
  }
  .card-header {
    margin-bottom: 1mm; padding-bottom: 1mm;
    border-bottom: 0.5px solid var(--rule);
  }
  .card-header-row { display: flex; align-items: baseline; gap: 1.5mm; }
  .card-num {
    font-family: 'Cormorant Garamond'; font-size: 0.4rem;
    letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); flex-shrink: 0;
  }
  .card-title {
    font-family: 'Cormorant Garamond'; font-size: 0.72rem; font-weight: 500;
    line-height: 1.2; color: var(--ink);
  }
  .card-part { font-size: 0.38rem; color: var(--ink-soft); margin-left: auto; flex-shrink: 0; }
  .card-sub {
    font-size: 0.38rem; letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--ink-soft); margin-top: 0.5mm;
  }
  .card-lyrics {
    column-count: 2; column-gap: 3mm; overflow: hidden;
    height: 40mm;
  }

  /* ── Back half: 54–108mm, all four corners rounded, touching the front ── */
  .card-back {
    position: absolute; top: 54mm; left: 0; right: 0; height: 54mm;
    background: var(--cream); border-radius: 3.5mm; overflow: hidden;
    padding: 2.5mm 3.5mm;
    column-count: 2; column-gap: 3mm;
  }

  /* ── Sections (shared by both halves) ── */
  .section { break-inside: avoid; margin-bottom: 1.5mm; font-size: 0.54rem; line-height: 1.5; }
  .section-label { font-size: 0.44rem; margin-bottom: 0.5mm; }
  .chord { font-size: 0.42rem; margin-bottom: 0.05rem; }

  @page { size: A4; margin: 0; }
  @media print {
    html, body { background: none; padding: 0; }
    .card-sheet {
      margin: 0; box-shadow: none;
      page-break-after: always; break-after: page;
    }
    .card-sheet:last-child { page-break-after: auto; break-after: auto; }
    .card-front, .card-back { border: 0.4px solid rgba(0,0,0,0.15); }
  }
`;

const STYLE_CSS: Record<PrintStyle, string> = {
  standard: STANDARD_CSS,
  compact: COMPACT_CSS,
  booklet: BOOKLET_CSS,
  cards: CARDS_CSS,
};

// ─── Style switcher UI ────────────────────────────────────────────────────────

function StyleSwitcher({
  current,
  onChange,
}: {
  current: PrintStyle;
  onChange: (s: PrintStyle) => void;
}) {
  return (
    <div className="style-switcher">
      {(Object.keys(STYLE_LABELS) as PrintStyle[]).map((s) => (
        <button
          key={s}
          type="button"
          className={`style-btn ${current === s ? 'active' : ''}`}
          onClick={() => onChange(s)}
        >
          <span className="btn-label">{STYLE_LABELS[s].label}</span>
          <span className="btn-sub">{STYLE_LABELS[s].sub}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Cover ────────────────────────────────────────────────────────────────────

function Cover({ songs, style }: { songs: Song[]; style: PrintStyle }) {
  const isBooklet = style === 'booklet';
  return (
    <div
      className="page cover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: isBooklet ? '0.58rem' : '0.68rem', letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--gold)', marginBottom: isBooklet ? '4mm' : '6mm' }}>
        En samling sånger
      </p>
      <div style={{ width: '30mm', height: '0.5px', background: 'var(--rule)',
        marginBottom: isBooklet ? '5mm' : '8mm' }} />
      <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: isBooklet ? '3rem' : '4.5rem',
        fontWeight: 300, lineHeight: 1.05, color: 'var(--ink)',
        marginBottom: isBooklet ? '4mm' : '6mm' }}>
        Våra<br /><em>Sånger</em>
      </h1>
      <p style={{ fontSize: isBooklet ? '0.62rem' : '0.72rem', letterSpacing: '0.18em',
        textTransform: 'uppercase', color: 'var(--ink-soft)',
        marginBottom: isBooklet ? '5mm' : '8mm' }}>
        Disney &amp; Camp Glöd 2025
      </p>
      <div style={{ width: '30mm', height: '0.5px', background: 'var(--rule)',
        marginBottom: isBooklet ? '6mm' : '10mm' }} />
      <ul style={{ columns: isBooklet ? 1 : 2, columnGap: '6mm', listStyle: 'none',
        textAlign: 'left', fontSize: isBooklet ? '0.64rem' : '0.72rem',
        lineHeight: '1.8', color: 'var(--ink-soft)' }}>
        {songs.map((s) => <li key={s.id}>{s.title}</li>)}
      </ul>
    </div>
  );
}

// ─── PrintView ────────────────────────────────────────────────────────────────

export default function PrintView() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [printStyle, setPrintStyle] = useState<PrintStyle>('standard');

  useEffect(() => {
    api.getSongs().then(setSongs).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>Loading…</div>;

  // Build card data (songs split into fold-over credit cards, with continuation cards for long songs)
  const allCards = buildCardData(songs);
  const cardChunks: CardData[][] = [];
  for (let i = 0; i < allCards.length; i += 4) cardChunks.push(allCards.slice(i, i + 4));

  return (
    <>
      <style>{BASE_CSS + STYLE_CSS[printStyle]}</style>

      <StyleSwitcher current={printStyle} onChange={setPrintStyle} />

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
          <Cover songs={songs} style={printStyle} />
          {songs.map((song, i) => (
            <SongPage key={song.id} song={song} index={i} />
          ))}
        </>
      )}

      <button type="button" className="print-btn" onClick={() => window.print()}>
        Print / Save PDF
      </button>
    </>
  );
}
