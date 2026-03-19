import { renderLyrics } from '../../lib/print/renderLyrics';
import type { Song } from '../../types';

const ROMAN = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV',
  'XVI',
  'XVII',
  'XVIII',
  'XIX',
  'XX',
  'XXI',
  'XXII',
  'XXIII',
  'XXIV',
  'XXV',
  'XXVI',
  'XXVII',
  'XXVIII',
  'XXIX',
  'XXX',
  'XXXI',
  'XXXII',
  'XXXIII',
  'XXXIV',
  'XXXV',
  'XXXVI',
  'XXXVII',
  'XXXVIII',
  'XXXIX',
  'XL',
];

interface SongPageProps {
  song: Song;
  index: number;
}

export default function SongPage({ song, index }: SongPageProps) {
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
