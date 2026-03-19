import type { PrintStyle } from './types';

export const BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--font-body); color: var(--ink); }
  .song-dot { color: var(--rule); }
  .song-original { letter-spacing: 0.1em; color: var(--gold); text-transform: uppercase; }
  .section-label { letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); }
  .chord { font-family: var(--font-body); letter-spacing: 0.08em; color: var(--gold-lt); display: block; }

  /* ── Screen UI (hidden on print) ── */
  .style-switcher { position: fixed; top: 1.5rem; left: 50%; transform: translateX(-50%);
    display: flex; gap: 0.5rem; background: rgba(20,18,16,0.92); backdrop-filter: blur(8px);
    padding: 0.5rem; border-radius: 14px; z-index: 100; box-shadow: 0 4px 24px rgba(0,0,0,.3); }
  .style-btn { padding: 0.5rem 1rem; border-radius: 10px; border: none; cursor: pointer;
    font-family: sans-serif; transition: all .15s; display: flex; flex-direction: column; align-items: center; gap: 1px; }
  .style-btn .btn-label { font-size: 0.8rem; font-weight: 500; }
  .style-btn .btn-sub { font-size: 0.6rem; opacity: 0.7; white-space: nowrap; }
  .style-btn:not(.active) { background: transparent; color: rgba(248,245,239,.6); }
  .style-btn:not(.active):hover { background: rgba(248,245,239,.1); color: #F8F5EF; }
  .style-btn.active { background: #F8F5EF; color: #1E1B18; }

  .preset-panel { position: fixed; left: 1.5rem; top: 50%; transform: translateY(-50%);
    display: flex; flex-direction: column; gap: 0.25rem;
    background: rgba(20,18,16,0.92); backdrop-filter: blur(8px);
    padding: 0.5rem; border-radius: 14px; z-index: 100; box-shadow: 0 4px 24px rgba(0,0,0,.3); }
  .preset-btn { display: flex; align-items: center; gap: 0.55rem; padding: 0.45rem 0.65rem;
    border-radius: 10px; border: none; cursor: pointer; background: transparent;
    text-align: left; transition: all .15s; color: rgba(248,245,239,.6); }
  .preset-btn:hover { background: rgba(248,245,239,.1); color: #F8F5EF; }
  .preset-btn.active { background: rgba(248,245,239,.14); color: #F8F5EF; }
  .preset-swatch { display: flex; flex-direction: column; gap: 2px; flex-shrink: 0; }
  .preset-swatch span { display: block; width: 14px; height: 5px; border-radius: 2px; }
  .preset-name { display: block; font-size: 0.75rem; font-weight: 500; font-family: sans-serif; line-height: 1.2; }
  .preset-sub { display: block; font-size: 0.55rem; opacity: 0.6; font-family: sans-serif; }

  .print-btn { position: fixed; bottom: 2rem; right: 2rem; background: #1E1B18; color: #F8F5EF;
    border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 0.875rem;
    cursor: pointer; font-family: sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,.2); z-index: 100; }
  .print-btn:hover { background: #333; }

  .lang-switcher { position: fixed; top: 1.5rem; right: 2rem; z-index: 100;
    display: flex; gap: 0.375rem; align-items: center;
    background: #1E1B18; backdrop-filter: blur(8px);
    padding: 0.375rem 0.5rem; border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
  .lang-switcher button { all: unset; cursor: pointer; font-family: sans-serif;
    font-size: 0.8rem; font-weight: 600; letter-spacing: 0.05em;
    padding: 0.4rem 0.75rem; border-radius: 7px; transition: all 0.15s ease;
    color: rgba(255,255,255,0.45); }
  .lang-switcher button:hover { color: #F8F5EF; background: rgba(255,255,255,0.1); }
  .lang-switcher button[data-active] { background: rgba(255,255,255,0.15); color: #F8F5EF; }
  @media print { .style-switcher, .preset-panel, .print-btn, .lang-switcher { display: none !important; } }
`;

export const STANDARD_CSS = `
  html { background: var(--bg-outer); font-size: 16px; }
  body { background: var(--bg-outer); padding: 5rem 1rem 2rem; }
  .page { width: 210mm; min-height: 297mm; background: var(--cream); margin: 0 auto 3rem;
    padding: 20mm 20mm 18mm; position: relative; box-shadow: 0 4px 40px rgba(0,0,0,.12); }
  .song-header { margin-bottom: 6mm; }
  .song-number { font-family: var(--font-head); font-size: 0.65rem; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 1mm; }
  .song-title { font-family: var(--font-head); font-size: 1.85rem; font-weight: 300;
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

export const COMPACT_CSS = `
  html { background: var(--bg-outer); font-size: 16px; }
  body { background: var(--bg-outer); padding: 5rem 1rem 2rem; }
  .compact-sheet { width: 210mm; background: var(--cream); margin: 0 auto 3rem;
    padding: 12mm 14mm 10mm; box-shadow: 0 4px 40px rgba(0,0,0,.12); }
  .song-block { break-inside: avoid; padding-bottom: 4mm; margin-bottom: 4mm;
    border-bottom: 0.5px solid var(--rule); }
  .song-block:last-child { border-bottom: none; margin-bottom: 0; }
  .song-header-inline { display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2mm; }
  .song-number { font-family: var(--font-head); font-size: 0.6rem; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--gold); }
  .song-title { font-family: var(--font-head); font-size: 1.05rem; font-weight: 500;
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

export const BOOKLET_CSS = `
  html { background: var(--bg-outer); font-size: 15px; }
  body { background: var(--bg-outer); padding: 5rem 1rem 2rem; }
  .page { width: 148mm; min-height: 210mm; background: var(--cream); margin: 0 auto 2.5rem;
    padding: 14mm 14mm 12mm; position: relative; box-shadow: 0 4px 32px rgba(0,0,0,.14); }
  .song-header { margin-bottom: 4mm; }
  .song-number { font-family: var(--font-head); font-size: 0.58rem; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 0.8mm; }
  .song-title { font-family: var(--font-head); font-size: 1.45rem; font-weight: 300;
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

export const CARDS_CSS = `
  html { background: var(--bg-outer); font-size: 16px; }
  body { background: var(--bg-outer); padding: 5rem 1rem 2rem; }

  /* ── Sheet: 2×2 grid on A4 ── */
  .card-sheet {
    width: 210mm; background: var(--bg-outer); margin: 0 auto 3rem;
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
    font-family: var(--font-head); font-size: 0.4rem;
    letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); flex-shrink: 0;
  }
  .card-title {
    font-family: var(--font-head); font-size: 0.72rem; font-weight: 500;
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

export const STYLE_CSS: Record<PrintStyle, string> = {
  standard: STANDARD_CSS,
  compact: COMPACT_CSS,
  booklet: BOOKLET_CSS,
  cards: CARDS_CSS,
};
