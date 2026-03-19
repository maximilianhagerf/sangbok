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
    disabled: selecting,
  });

  return (
    // Outer wrapper: owns the group hover + DnD ref
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="relative group flex items-center"
    >
      {/* Checkbox — floats to the left of the card, outside it */}
      <div
        className={`absolute -left-6 flex items-center justify-center transition-opacity ${
          selecting ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(song.id)}
          className="w-4 h-4 cursor-pointer accent-stone-800"
        />
      </div>

      {/* Song card */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: role="button" is set when selecting; onClick is a no-op otherwise */}
      <div
        role={selecting ? 'button' : undefined}
        tabIndex={selecting ? 0 : undefined}
        onClick={() => selecting && onToggle(song.id)}
        onKeyDown={(e) => selecting && (e.key === 'Enter' || e.key === ' ') && onToggle(song.id)}
        className={`flex flex-1 items-center gap-3 px-4 py-3 bg-white border rounded-lg transition-colors ${
          selected ? 'border-stone-400 bg-stone-50' : 'border-stone-200 hover:border-stone-300'
        } ${selecting ? 'cursor-pointer' : ''}`}
      >
        {/* Drag handle — hidden while selecting */}
        {!selecting && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing touch-none shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={18} />
          </button>
        )}

        <span className="text-xs text-stone-400 font-mono w-6 text-right shrink-0">
          {song.position}
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-['Cormorant_Garamond',Georgia,serif] text-base font-medium text-stone-800 leading-tight truncate">
            {song.title}
          </p>
          {(song.credit || song.original) && (
            <p className="text-xs text-stone-400 truncate mt-0.5">
              {[song.credit, song.original && `(${song.original})`].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        <span className="text-xs text-stone-300 shrink-0">
          {song.sections.length} section{song.sections.length !== 1 ? 's' : ''}
        </span>

        {!selecting && (
          <Link
            to={`/songs/${song.id}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-stone-700"
            aria-label="Edit song"
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil size={15} />
          </Link>
        )}
      </div>
    </div>
  );
}
