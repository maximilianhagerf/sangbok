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

interface SongBlockProps {
  song: Song;
  index: number;
}

// Compact: no page wrapper — songs flow and break naturally
export default function SongBlock({ song, index }: SongBlockProps) {
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
