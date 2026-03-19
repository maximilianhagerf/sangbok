import { renderLyrics } from '../../lib/print/renderLyrics';
import type { CardData } from '../../lib/print/types';

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

interface SongCardProps {
  data: CardData;
}

export default function SongCard({ data }: SongCardProps) {
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
              {multi && (
                <span className="card-part">
                  {cardNum}/{totalCards}
                </span>
              )}
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
