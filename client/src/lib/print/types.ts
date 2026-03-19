import type { Section, Song } from '../../types';

export type PrintStyle = 'standard' | 'compact' | 'booklet' | 'cards';

export interface Preset {
  id: string;
  name: string;
  sub: string;
  fontsUrl: string;
  vars: Record<string, string>;
  swatch: [string, string, string];
}

export interface CardData {
  song: Song;
  cardNum: number;
  totalCards: number;
  frontSections: Section[];
  backSections: Section[];
  songIndex: number;
}

export const STYLE_KEYS: Record<PrintStyle, { label: string; sub: string }> = {
  standard: { label: 'printView.styles.standard', sub: 'printView.styles.standardSub' },
  compact: { label: 'printView.styles.compact', sub: 'printView.styles.compactSub' },
  booklet: { label: 'printView.styles.booklet', sub: 'printView.styles.bookletSub' },
  cards: { label: 'printView.styles.cards', sub: 'printView.styles.cardsSub' },
};
