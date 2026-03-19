export interface Collection {
  id: number;
  name: string;
  position: number;
  song_count: number;
  cover_title: string | null;
}

export interface Settings {
  cover_title: string;
  cover_subtitle: string;
  cover_credit: string;
}

export interface ChordMark {
  line: number;
  chord: string;
}

export interface Section {
  id: number;
  song_id: number;
  position: number;
  label: string | null;
  content: string;
  chords: ChordMark[];
}

export interface Song {
  id: number;
  position: number;
  title: string;
  credit: string | null;
  original: string | null;
  columns: 1 | 2 | 3;
  sections: Section[];
}
