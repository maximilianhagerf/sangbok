import { useEffect, useState } from 'react'
import type { Song, Section } from '../types'
import * as api from '../api'

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X',
               'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX',
               'XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII','XXIX','XXX',
               'XXXI','XXXII','XXXIII','XXXIV','XXXV','XXXVI','XXXVII','XXXVIII','XXXIX','XL']

function renderLyrics(section: Section): JSX.Element {
  if (section.chords.length === 0) {
    const lines = section.content.split('\n')
    return (
      <p>
        {lines.map((line, i) => (
          <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
        ))}
      </p>
    )
  }

  // Interleave chords with lyric lines
  const lines = section.content.split('\n')
  const chordMap = new Map(section.chords.map(c => [c.line, c.chord]))
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {chordMap.has(i) && <span className="chord">{chordMap.get(i)}</span>}
          <span>{line}</span>
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  )
}

function SongPage({ song, index }: { song: Song; index: number }) {
  const colClass = song.columns === 1 ? 'lyrics single' : song.columns === 3 ? 'lyrics three' : 'lyrics'
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
        {song.sections.map(sec => (
          <div key={sec.id} className="section">
            {sec.label && <p className="section-label">{sec.label}</p>}
            {renderLyrics(sec)}
          </div>
        ))}
      </div>

      <div className="page-foot">
        <div className="page-foot-line"></div>
        <span className="page-foot-num">{index + 1}</span>
        <div className="page-foot-line"></div>
      </div>
    </div>
  )
}

export default function PrintView() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getSongs().then(setSongs).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>Loading…</div>

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

        :root {
          --cream: #F8F5EF; --ink: #1E1B18; --ink-soft: #4A4540;
          --gold: #A8845A; --gold-lt: #C9A97A; --rule: #D8CFC4;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { background: #E8E4DC; font-size: 16px; }
        body { font-family: 'EB Garamond', Georgia, serif; color: var(--ink); background: #E8E4DC; padding: 2rem 1rem; }

        .page { width: 210mm; min-height: 297mm; background: var(--cream); margin: 0 auto 3rem;
          padding: 20mm 20mm 18mm; position: relative; box-shadow: 0 4px 40px rgba(0,0,0,.12); }

        .song-header { margin-bottom: 6mm; }
        .song-number { font-family: 'Cormorant Garamond'; font-size: 0.65rem; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--gold); margin-bottom: 1mm; }
        .song-title { font-family: 'Cormorant Garamond'; font-size: 1.85rem; font-weight: 300;
          letter-spacing: -0.01em; line-height: 1.1; color: var(--ink); }
        .song-meta { display: flex; align-items: center; gap: 0.5rem; margin-top: 2mm; }
        .song-credit { font-size: 0.7rem; letter-spacing: 0.06em; color: var(--ink-soft); text-transform: uppercase; }
        .song-dot { color: var(--rule); font-size: 0.7rem; }
        .song-original { font-size: 0.68rem; letter-spacing: 0.1em; color: var(--gold); text-transform: uppercase; }
        .song-divider { border: none; border-top: 1px solid var(--rule); margin: 6mm 0; }

        .lyrics { columns: 2; column-gap: 8mm; column-rule: 1px solid var(--rule); }
        .lyrics.single { columns: 1; }
        .lyrics.three { columns: 3; column-gap: 6mm; }
        .section { break-inside: avoid; margin-bottom: 4mm; font-size: 0.82rem; line-height: 1.7; }
        .section-label { font-size: 0.62rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 1.5mm; }
        .chord { font-family: 'EB Garamond', Georgia, serif; font-size: 0.6rem; letter-spacing: 0.08em;
          color: var(--gold-lt); display: block; margin-bottom: 0.1rem; }

        .page-foot { position: absolute; bottom: 10mm; left: 20mm; right: 20mm;
          display: flex; align-items: center; gap: 3mm; }
        .page-foot-line { flex: 1; height: 0.5px; background: var(--rule); }
        .page-foot-num { font-size: 0.6rem; letter-spacing: 0.12em; color: var(--rule); }

        .print-btn { position: fixed; bottom: 2rem; right: 2rem; background: #1E1B18; color: #F8F5EF;
          border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 0.875rem;
          cursor: pointer; font-family: sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,.2); z-index: 100; }
        .print-btn:hover { background: #333; }

        @page { size: A4; margin: 0; }
        @media print {
          html, body { background: none; padding: 0; }
          .page { margin: 0; padding: 20mm 20mm 18mm; box-shadow: none; page-break-after: always; min-height: 297mm; }
          .page:last-child { page-break-after: auto; }
          .print-btn { display: none; }
        }
      `}</style>

      {/* Cover */}
      <div className="page cover" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <p style={{ fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6mm' }}>
          En samling sånger
        </p>
        <div style={{ width: '40mm', height: '0.5px', background: 'var(--rule)', marginBottom: '8mm' }}></div>
        <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '4.5rem', fontWeight: 300, lineHeight: 1.05, color: 'var(--ink)', marginBottom: '6mm' }}>
          Våra<br /><em>Sånger</em>
        </h1>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: '8mm' }}>
          Disney &amp; Camp Glöd 2025
        </p>
        <div style={{ width: '40mm', height: '0.5px', background: 'var(--rule)', marginBottom: '10mm' }}></div>
        <ul style={{ columns: 2, columnGap: '8mm', listStyle: 'none', textAlign: 'left', fontSize: '0.72rem', lineHeight: '1.85', color: 'var(--ink-soft)' }}>
          {songs.map(s => <li key={s.id}>{s.title}</li>)}
        </ul>
      </div>

      {songs.map((song, i) => (
        <SongPage key={song.id} song={song} index={i} />
      ))}

      <button className="print-btn" onClick={() => window.print()}>
        Print / Save PDF
      </button>
    </>
  )
}
