import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Song } from '../../types';

interface SongRowProps {
  song: Song;
  selected: boolean;
  selecting: boolean;
  onToggle: (id: number) => void;
}

export default function SongRow({ song, selected, selecting, onToggle }: SongRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: song.id,
  });

  const credit = [song.credit, song.original && `(${song.original})`].filter(Boolean).join(' · ');

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="group"
    >
      {/* Song card */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: role="button" is set when selecting */}
      <div
        role={selecting ? 'button' : undefined}
        tabIndex={selecting ? 0 : undefined}
        onClick={() => selecting && onToggle(song.id)}
        onKeyDown={(e) => selecting && (e.key === 'Enter' || e.key === ' ') && onToggle(song.id)}
        className={`flex flex-1 items-center gap-3 px-4 py-3 bg-white border rounded-lg transition-colors ${
          selected ? 'border-stone-400 bg-stone-50' : 'border-stone-200 hover:border-stone-300'
        } ${selecting ? 'cursor-pointer' : ''}`}
      >
        {/* Checkbox — always visible inside card */}
        <label
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className="shrink-0 cursor-pointer"
          aria-label="Select song"
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggle(song.id)}
            className="sr-only"
          />
          <span
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected ? 'bg-stone-800 border-stone-800' : 'border-stone-300 hover:border-stone-400'
            }`}
          >
            {selected && (
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
                <path
                  d="M1 3L3 5L7 1"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </label>

        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing touch-none shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={18} />
        </button>

        <span className="text-xs text-stone-400 font-mono w-5 text-right shrink-0">
          {song.position}
        </span>

        {/* Title + credit — always two lines for uniform card height */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-baseline gap-2 min-w-0">
            <p className="font-['Cormorant_Garamond',Georgia,serif] text-base font-medium text-stone-800 leading-tight truncate">
              {song.title}
            </p>
            <span className="text-xs text-stone-300 shrink-0 whitespace-nowrap">
              {song.sections.length} section{song.sections.length !== 1 ? 's' : ''}
            </span>
          </div>
          {/* Always rendered — keeps card height uniform across rows */}
          <p className="text-xs text-stone-400 truncate mt-0.5 h-4 leading-4">{credit}</p>
        </div>

        <Link
          to={`/songs/${song.id}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-stone-700 shrink-0"
          aria-label="Edit song"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil size={15} />
        </Link>
      </div>
    </div>
  );
}
