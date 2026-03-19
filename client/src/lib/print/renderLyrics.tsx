import type { ReactElement } from 'react';
import type { Section } from '../../types';

export function renderLyrics(section: Section): ReactElement {
  const lines = section.content.split('\n');
  if (section.chords.length === 0) {
    return (
      <p>
        {lines.map((line, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: lyric line index is the stable identity
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
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
