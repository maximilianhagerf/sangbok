import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, GripVertical, Pencil, Printer } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Song } from '../types'
import * as api from '../api'

function SongRow({ song }: { song: Song }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: song.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-3 px-4 py-3 bg-white border border-stone-200 rounded-lg group hover:border-stone-300 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
      >
        <GripVertical size={18} />
      </button>

      <span className="text-xs text-stone-400 font-mono w-6 text-right flex-shrink-0">
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

      <span className="text-xs text-stone-300 flex-shrink-0">
        {song.sections.length} section{song.sections.length !== 1 ? 's' : ''}
      </span>

      <Link
        to={`/songs/${song.id}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-stone-700"
        aria-label="Edit song"
      >
        <Pencil size={15} />
      </Link>
    </div>
  )
}

export default function SongList() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    api.getSongs().then(setSongs).finally(() => setLoading(false))
  }, [])

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = songs.findIndex(s => s.id === active.id)
    const newIndex = songs.findIndex(s => s.id === over.id)
    const next = arrayMove(songs, oldIndex, newIndex).map((s, i) => ({ ...s, position: i + 1 }))
    setSongs(next)
    await api.reorderSongs(next.map(s => s.id))
  }

  async function handleCreate() {
    const song = await api.createSong({ title: 'Ny sång', columns: 2 })
    setSongs(prev => [...prev, song])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400 text-sm">
        Loading…
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-stone-800">
            Sångbok
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">{songs.length} sånger</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/print"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <Printer size={14} /> Print view
          </a>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
          >
            <Plus size={14} /> New song
          </button>
        </div>
      </div>

      {/* Drag-and-drop list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={songs.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {songs.map(song => (
              <SongRow key={song.id} song={song} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {songs.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <p className="text-sm">No songs yet.</p>
          <button onClick={handleCreate} className="mt-2 text-sm underline hover:text-stone-600">
            Add the first one
          </button>
        </div>
      )}
    </div>
  )
}
