import type { Section, Song } from '../../types';
import type { CardData } from './types';

// Height of a section in "line units" at the card's font size (0.54rem, lh 1.5).
// This mirrors the CSS greedy column-fill with break-inside:avoid.
//
// We estimate visual rows per line using character count rather than just counting
// newlines — wider display fonts (e.g. Playfair Display) wrap sooner than narrow
// ones (EB Garamond), so a lyric line like "[Jasmin:] Så mycket vi har kvar att se"
// takes 2 visual rows in Playfair but 1 in EB Garamond. Using a conservative
// chars-per-line threshold catches the worst case across all presets.
const CHARS_PER_COL_LINE = 28; // ~37.8mm column at 0.54rem, conservative for wide fonts

export function sectionHeight(sec: Section): number {
  const lines = sec.content ? sec.content.split('\n') : [];
  const hasChords = sec.chords.length > 0;
  const lyricRows = lines.reduce(
    (sum, line) => sum + Math.max(1, Math.ceil(line.trim().length / CHARS_PER_COL_LINE)),
    0,
  );
  return (sec.label ? 0.7 : 0) + lyricRows + (hasChords ? lyricRows * 0.7 : 0) + 0.4;
}

// Simulate CSS multi-column fill with break-inside:avoid.
// Returns the sections that fit in ≤ maxCols columns of colHeight, and the rest.
export function splitByColumns(
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

export function buildCardData(songs: Song[]): CardData[] {
  const result: CardData[] = [];

  for (let songIndex = 0; songIndex < songs.length; songIndex++) {
    const song = songs[songIndex];
    let remaining = [...song.sections];

    if (remaining.length === 0) {
      result.push({
        song,
        cardNum: 1,
        totalCards: 1,
        frontSections: [],
        backSections: [],
        songIndex,
      });
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
        song,
        cardNum: ci + 1,
        totalCards: cards.length,
        frontSections: cards[ci].front,
        backSections: cards[ci].back,
        songIndex,
      });
    }
  }

  return result;
}
