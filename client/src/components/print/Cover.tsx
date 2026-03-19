import type { PrintStyle } from '../../lib/print/types';
import type { Settings, Song } from '../../types';

interface CoverProps {
  songs: Song[];
  style: PrintStyle;
  settings: Settings;
}

export default function Cover({ songs, style, settings }: CoverProps) {
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
      {settings.cover_subtitle && (
        <p
          style={{
            fontSize: isBooklet ? '0.58rem' : '0.68rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: isBooklet ? '4mm' : '6mm',
          }}
        >
          {settings.cover_subtitle}
        </p>
      )}
      <div
        style={{
          width: '30mm',
          height: '0.5px',
          background: 'var(--rule)',
          marginBottom: isBooklet ? '5mm' : '8mm',
        }}
      />
      <h1
        style={{
          fontFamily: 'var(--font-head)',
          fontSize: isBooklet ? '3rem' : '4.5rem',
          fontWeight: 300,
          lineHeight: 1.05,
          color: 'var(--ink)',
          marginBottom: isBooklet ? '4mm' : '6mm',
        }}
      >
        {settings.cover_title}
      </h1>
      {settings.cover_credit && (
        <p
          style={{
            fontSize: isBooklet ? '0.62rem' : '0.72rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ink-soft)',
            marginBottom: isBooklet ? '5mm' : '8mm',
          }}
        >
          {settings.cover_credit}
        </p>
      )}
      <div
        style={{
          width: '30mm',
          height: '0.5px',
          background: 'var(--rule)',
          marginBottom: isBooklet ? '6mm' : '10mm',
        }}
      />
      <ul
        style={{
          columns: isBooklet ? 1 : 2,
          columnGap: '6mm',
          listStyle: 'none',
          textAlign: 'left',
          fontSize: isBooklet ? '0.64rem' : '0.72rem',
          lineHeight: '1.8',
          color: 'var(--ink-soft)',
        }}
      >
        {songs.map((s) => (
          <li key={s.id}>{s.title}</li>
        ))}
      </ul>
    </div>
  );
}
