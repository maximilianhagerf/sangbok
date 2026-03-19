import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, GripVertical, Pencil, Printer, Trash2, X } from 'lucide-react'
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

// ─── New Song Modal ───────────────────────────────────────────────────────────

interface NewSongModalProps {
  onClose: () => void
  onCreate: (song: Song) => void
}

function NewSongModal({ onClose, onCreate }: NewSongModalProps) {
  const [title, setTitle] = useState('')
  const [credit, setCredit] = useState('')
  const [original, setOriginal] = useState('')
  const [columns, setColumns] = useState<1 | 2 | 3>(2)
  const [saving, setSaving] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      const song = await api.createSong({
        title: title.trim(),
        credit: credit.trim() || undefined,
        original: original.trim() || undefined,
        columns,
      })
      onCreate(song)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stone-100">
          <h2 className="font-['Cormorant_Garamond'] text-xl font-medium text-stone-800">
            New song
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Sommaren är kort"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition"
            />
          </div>

          {/* Credit */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Credit</label>
            <input
              type="text"
              value={credit}
              onChange={e => setCredit(e.target.value)}
              placeholder="e.g. Astrid Lindgren · Georg Riedel"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition placeholder-stone-300"
            />
          </div>

          {/* Original title */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Original title</label>
            <input
              type="text"
              value={original}
              onChange={e => setOriginal(e.target.value)}
              placeholder="e.g. A Whole New World"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition placeholder-stone-300"
            />
          </div>

          {/* Columns */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Print columns</label>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map(col => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColumns(col)}
                  className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${
                    columns === col
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'text-stone-600 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {col} col
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="flex-1 py-2 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating…' : 'Create song'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Song Row ─────────────────────────────────────────────────────────────────

interface SongRowProps {
  song: Song
  selected: boolean
  selecting: boolean
  onToggle: (id: number) => void
}

function SongRow({ song, selected, selecting, onToggle }: SongRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: song.id,
    disabled: selecting,
  })

  return (
    // Outer wrapper: owns the group hover + DnD ref
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="relative group flex items-center"
    >
      {/* Checkbox — floats to the left of the card, outside it */}
      <div className={`absolute -left-6 flex items-center justify-center transition-opacity ${
        selecting ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(song.id)}
          className="w-4 h-4 cursor-pointer accent-stone-800"
        />
      </div>

      {/* Song card */}
      <div
        onClick={() => selecting && onToggle(song.id)}
        className={`flex flex-1 items-center gap-3 px-4 py-3 bg-white border rounded-lg transition-colors ${
          selected
            ? 'border-stone-400 bg-stone-50'
            : 'border-stone-200 hover:border-stone-300'
        } ${selecting ? 'cursor-pointer' : ''}`}
      >
        {/* Drag handle — hidden while selecting */}
        {!selecting && (
          <button
            {...attributes}
            {...listeners}
            className="text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <GripVertical size={18} />
          </button>
        )}

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

        {!selecting && (
          <Link
            to={`/songs/${song.id}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-stone-700"
            aria-label="Edit song"
            onClick={e => e.stopPropagation()}
          >
            <Pencil size={15} />
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Bulk Action Bar ──────────────────────────────────────────────────────────

interface BulkBarProps {
  count: number
  total: number
  onSelectAll: () => void
  onClear: () => void
  onDelete: () => void
  deleting: boolean
}

function BulkBar({ count, total, onSelectAll, onClear, onDelete, deleting }: BulkBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 bg-stone-900 text-white rounded-2xl shadow-2xl shadow-stone-900/30 text-sm">
      <span className="text-stone-300 tabular-nums">
        <span className="text-white font-medium">{count}</span> selected
      </span>

      <div className="w-px h-4 bg-stone-700" />

      {count < total ? (
        <button
          onClick={onSelectAll}
          className="text-stone-300 hover:text-white transition-colors"
        >
          Select all
        </button>
      ) : (
        <button
          onClick={onClear}
          className="text-stone-300 hover:text-white transition-colors"
        >
          Deselect all
        </button>
      )}

      <div className="w-px h-4 bg-stone-700" />

      <button
        onClick={onDelete}
        disabled={deleting}
        className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
      >
        <Trash2 size={14} />
        {deleting ? 'Deleting…' : `Delete ${count}`}
      </button>

      <div className="w-px h-4 bg-stone-700" />

      <button onClick={onClear} className="text-stone-400 hover:text-white transition-colors">
        <X size={16} />
      </button>
    </div>
  )
}

// ─── SongList Page ────────────────────────────────────────────────────────────

export default function SongList() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const selecting = selected.size > 0

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

  function handleToggle(id: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} song${selected.size !== 1 ? 's' : ''}? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await Promise.all([...selected].map(id => api.deleteSong(id)))
      setSongs(prev => prev.filter(s => !selected.has(s.id)))
      setSelected(new Set())
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-stone-400 text-sm">Loading…</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-stone-800">Sångbok</h1>
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
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
          >
            <Plus size={14} /> New song
          </button>
        </div>
      </div>

      {/* List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={songs.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 pl-8">
            {songs.map(song => (
              <SongRow
                key={song.id}
                song={song}
                selected={selected.has(song.id)}
                selecting={selecting}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {songs.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <p className="text-sm">No songs yet.</p>
          <button onClick={() => setShowModal(true)} className="mt-2 text-sm underline hover:text-stone-600">
            Add the first one
          </button>
        </div>
      )}

      {/* Bulk action bar */}
      {selecting && (
        <BulkBar
          count={selected.size}
          total={songs.length}
          onSelectAll={() => setSelected(new Set(songs.map(s => s.id)))}
          onClear={() => setSelected(new Set())}
          onDelete={handleBulkDelete}
          deleting={deleting}
        />
      )}

      {/* New song modal */}
      {showModal && (
        <NewSongModal
          onClose={() => setShowModal(false)}
          onCreate={song => {
            setSongs(prev => [...prev, song])
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}
