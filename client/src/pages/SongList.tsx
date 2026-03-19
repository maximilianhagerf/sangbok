import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Plus, Printer, Settings, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as api from '../api';
import LanguageSwitcher from '../components/LanguageSwitcher';
import type { Collection, Settings as AppSettings, Song } from '../types';

// ─── New Song Modal ───────────────────────────────────────────────────────────

interface NewSongModalProps {
  collectionId: number;
  onClose: () => void;
  onCreate: (song: Song) => void;
}

function NewSongModal({ collectionId, onClose, onCreate }: NewSongModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [credit, setCredit] = useState('');
  const [original, setOriginal] = useState('');
  const [columns, setColumns] = useState<1 | 2 | 3>(2);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const song = await api.createSong(collectionId, {
        title: title.trim(),
        credit: credit.trim() || undefined,
        original: original.trim() || undefined,
        columns,
      });
      onCreate(song);
    } finally {
      setSaving(false);
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismisses modal on click, keyboard handled by Escape listener
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape key handled via window keydown listener in useEffect
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stone-100">
          <h2 className="font-['Cormorant_Garamond'] text-xl font-medium text-stone-800">
            {t('songModal.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="modal-title"
              className="block text-xs font-medium text-stone-500 mb-1.5"
            >
              {t('songForm.titleLabel')} <span className="text-rose-400">*</span>
            </label>
            <input
              id="modal-title"
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('songForm.titlePlaceholder')}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-800 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition"
            />
          </div>

          {/* Credit */}
          <div>
            <label
              htmlFor="modal-credit"
              className="block text-xs font-medium text-stone-500 mb-1.5"
            >
              {t('songForm.creditLabel')}
            </label>
            <input
              id="modal-credit"
              type="text"
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              placeholder={t('songForm.creditPlaceholder')}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition placeholder-stone-300"
            />
          </div>

          {/* Original title */}
          <div>
            <label
              htmlFor="modal-original"
              className="block text-xs font-medium text-stone-500 mb-1.5"
            >
              {t('songForm.originalLabel')}
            </label>
            <input
              id="modal-original"
              type="text"
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder={t('songForm.originalPlaceholder')}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition placeholder-stone-300"
            />
          </div>

          {/* Columns */}
          <div>
            <p className="block text-xs font-medium text-stone-500 mb-1.5">{t('songForm.columnsLabel')}</p>
            <div className="flex gap-2" role="radiogroup" aria-label={t('songForm.columnsLabel')}>
              {([1, 2, 3] as const).map((col) => (
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
              {t('songModal.cancel')}
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="flex-1 py-2 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? t('songModal.creating') : t('songModal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Collection Switcher ──────────────────────────────────────────────────────

interface CollectionSwitcherProps {
  collections: Collection[];
  activeId: number | null;
  onSwitch: (id: number) => void;
  onRename: (id: number, name: string) => void;
  onDelete: (id: number) => void;
  onCreate: (name: string) => void;
}

function CollectionSwitcher({
  collections,
  activeId,
  onSwitch,
  onRename,
  onDelete,
  onCreate,
}: CollectionSwitcherProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);
  const newRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId !== null) editRef.current?.focus();
  }, [editingId]);

  useEffect(() => {
    if (showNewInput) newRef.current?.focus();
  }, [showNewInput]);

  function startEdit(col: Collection) {
    setEditingId(col.id);
    setEditingName(col.name);
  }

  function commitEdit(id: number) {
    if (editingName.trim()) onRename(id, editingName.trim());
    setEditingId(null);
    setEditingName('');
  }

  async function commitNew() {
    if (!newName.trim()) { setShowNewInput(false); setNewName(''); return; }
    setCreating(true);
    try {
      await onCreate(newName.trim());
    } finally {
      setCreating(false);
      setShowNewInput(false);
      setNewName('');
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      {collections.map((col) => (
        <div key={col.id} className="relative group/pill flex items-center">
          {editingId === col.id ? (
            <input
              ref={editRef}
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => commitEdit(col.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitEdit(col.id);
                if (e.key === 'Escape') { setEditingId(null); setEditingName(''); }
              }}
              className="px-3 py-1 text-sm border border-stone-400 rounded-full outline-none focus:ring-2 focus:ring-stone-200 bg-white text-stone-800 w-36"
            />
          ) : (
            <button
              type="button"
              onClick={() => onSwitch(col.id)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                activeId === col.id
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'text-stone-600 border-stone-200 hover:border-stone-400 bg-white'
              }`}
            >
              {col.name}
            </button>
          )}

          {/* Hover actions */}
          {editingId !== col.id && (
            <div className="absolute -top-1 -right-1 hidden group-hover/pill:flex items-center gap-0.5 bg-white border border-stone-200 rounded-full shadow-sm px-1 py-0.5 z-10">
              <button
                type="button"
                title={t('collections.rename')}
                onClick={() => startEdit(col)}
                className="text-stone-400 hover:text-stone-700 transition-colors p-0.5"
              >
                <Pencil size={11} />
              </button>
              {collections.length > 1 && (
                <button
                  type="button"
                  title={t('collections.delete')}
                  onClick={() => {
                    if (confirm(t('collections.confirmDelete', { name: col.name }))) {
                      onDelete(col.id);
                    }
                  }}
                  className="text-stone-400 hover:text-rose-500 transition-colors p-0.5"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* New collection */}
      {showNewInput ? (
        <input
          ref={newRef}
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={commitNew}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitNew();
            if (e.key === 'Escape') { setShowNewInput(false); setNewName(''); }
          }}
          placeholder={t('collections.namePlaceholder')}
          disabled={creating}
          className="px-3 py-1 text-sm border border-stone-400 rounded-full outline-none focus:ring-2 focus:ring-stone-200 bg-white text-stone-800 w-44 placeholder-stone-300 disabled:opacity-60"
        />
      ) : (
        <button
          type="button"
          title={t('collections.new')}
          onClick={() => setShowNewInput(true)}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-stone-200 text-stone-400 hover:text-stone-700 hover:border-stone-400 transition-colors bg-white"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Song Row ─────────────────────────────────────────────────────────────────

interface SongRowProps {
  song: Song;
  selected: boolean;
  selecting: boolean;
  onToggle: (id: number) => void;
}

function SongRow({ song, selected, selecting, onToggle }: SongRowProps) {
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

// ─── Bulk Action Bar ──────────────────────────────────────────────────────────

interface BulkBarProps {
  count: number;
  total: number;
  onSelectAll: () => void;
  onClear: () => void;
  onDelete: () => void;
  deleting: boolean;
}

function BulkBar({ count, total, onSelectAll, onClear, onDelete, deleting }: BulkBarProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 bg-stone-900 text-white rounded-2xl shadow-2xl shadow-stone-900/30 text-sm">
      <span className="text-stone-300 tabular-nums">
        <span className="text-white font-medium">{count}</span> {t('bulkBar.selected')}
      </span>

      <div className="w-px h-4 bg-stone-700" />

      {count < total ? (
        <button
          type="button"
          onClick={onSelectAll}
          className="text-stone-300 hover:text-white transition-colors"
        >
          {t('bulkBar.selectAll')}
        </button>
      ) : (
        <button
          type="button"
          onClick={onClear}
          className="text-stone-300 hover:text-white transition-colors"
        >
          {t('bulkBar.deselectAll')}
        </button>
      )}

      <div className="w-px h-4 bg-stone-700" />

      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
      >
        <Trash2 size={14} />
        {deleting ? t('bulkBar.deleting') : t('bulkBar.delete', { count })}
      </button>

      <div className="w-px h-4 bg-stone-700" />

      <button
        type="button"
        onClick={onClear}
        className="text-stone-400 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}


// ─── SongList Page ────────────────────────────────────────────────────────────

export default function SongList() {
  const { t } = useTranslation();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    cover_title: '',
    cover_subtitle: '',
    cover_credit: '',
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Collections
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<number | null>(() => {
    const stored = localStorage.getItem('sangbok_collection');
    return stored ? Number(stored) : null;
  });

  const selecting = selected.size > 0;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Load collections on mount, then select appropriate one
  useEffect(() => {
    api.getCollections().then((cols) => {
      setCollections(cols);
      if (cols.length === 0) return;
      const stored = localStorage.getItem('sangbok_collection');
      const storedId = stored ? Number(stored) : null;
      const match = storedId ? cols.find((c) => c.id === storedId) : null;
      const id = match ? match.id : cols[0].id;
      setActiveCollectionId(id);
      localStorage.setItem('sangbok_collection', String(id));
    });
  }, []);

  // Reload songs and settings when activeCollectionId changes
  useEffect(() => {
    if (activeCollectionId === null) return;
    setLoading(true);
    Promise.all([
      api.getSongs(activeCollectionId),
      api.getSettings(activeCollectionId),
    ])
      .then(([s, cfg]) => {
        setSongs(s);
        setSettings(cfg);
      })
      .finally(() => setLoading(false));
  }, [activeCollectionId]);

  function switchCollection(id: number) {
    setActiveCollectionId(id);
    localStorage.setItem('sangbok_collection', String(id));
    setSelected(new Set());
    setShowSettings(false);
  }

  async function handleRenameCollection(id: number, name: string) {
    const updated = await api.updateCollection(id, name);
    setCollections((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  async function handleDeleteCollection(id: number) {
    try {
      await api.deleteCollection(id);
      const remaining = collections.filter((c) => c.id !== id);
      setCollections(remaining);
      if (activeCollectionId === id && remaining.length > 0) {
        switchCollection(remaining[0].id);
      }
    } catch (err: any) {
      alert(err.message ?? t('collections.lastCollection'));
    }
  }

  async function handleCreateCollection(name: string) {
    const col = await api.createCollection(name);
    setCollections((prev) => [...prev, col]);
    switchCollection(col.id);
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (activeCollectionId === null) return;
    setSettingsSaving(true);
    try {
      const saved = await api.updateSettings(activeCollectionId, settings);
      setSettings(saved);
      setShowSettings(false);
    } finally {
      setSettingsSaving(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = songs.findIndex((s) => s.id === active.id);
    const newIndex = songs.findIndex((s) => s.id === over.id);
    const next = arrayMove(songs, oldIndex, newIndex).map((s, i) => ({ ...s, position: i + 1 }));
    setSongs(next);
    await api.reorderSongs(next.map((s) => s.id));
  }

  function handleToggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    if (
      !confirm(t('bulkBar.confirmDelete', { count: selected.size }))
    )
      return;
    setDeleting(true);
    try {
      await Promise.all([...selected].map((id) => api.deleteSong(id)));
      setSongs((prev) => prev.filter((s) => !selected.has(s.id)));
      setSelected(new Set());
    } finally {
      setDeleting(false);
    }
  }

  if (loading && activeCollectionId === null) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400 text-sm">{t('songEdit.loading')}</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-stone-800">
            {t('songList.heading')}
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">{t('songList.songCount', { count: songs.length })}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={'/print?c=' + activeCollectionId}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
            rel="noopener"
          >
            <Printer size={14} /> {t('nav.printView')}
          </a>
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'}`}
            title={t('coverSettings.title')}
          >
            <Settings size={16} />
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
          >
            <Plus size={14} /> {t('songList.newSong')}
          </button>
        </div>
      </div>

      {/* Collection switcher */}
      {collections.length > 0 && (
        <CollectionSwitcher
          collections={collections}
          activeId={activeCollectionId}
          onSwitch={switchCollection}
          onRename={handleRenameCollection}
          onDelete={handleDeleteCollection}
          onCreate={handleCreateCollection}
        />
      )}

      {/* Cover settings panel */}
      {showSettings && (
        <form
          onSubmit={handleSaveSettings}
          className="mb-6 p-4 border border-stone-200 rounded-xl bg-stone-50 space-y-3"
        >
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{t('coverSettings.title')}</p>
          <div>
            <label className="block text-xs text-stone-500 mb-1">
              {t('coverSettings.coverTitle')} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={settings.cover_title}
              onChange={(e) => setSettings((s) => ({ ...s, cover_title: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
              placeholder={t('coverSettings.coverTitlePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">{t('coverSettings.coverSubtitle')}</label>
            <input
              type="text"
              value={settings.cover_subtitle}
              onChange={(e) => setSettings((s) => ({ ...s, cover_subtitle: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
              placeholder={t('coverSettings.coverSubtitlePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">{t('coverSettings.coverCredit')}</label>
            <input
              type="text"
              value={settings.cover_credit}
              onChange={(e) => setSettings((s) => ({ ...s, cover_credit: e.target.value }))}
              className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
              placeholder={t('coverSettings.coverCreditPlaceholder')}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={settingsSaving}
              className="px-3 py-1.5 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50 transition-colors"
            >
              {settingsSaving ? t('coverSettings.saving') : t('coverSettings.save')}
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              {t('songModal.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Loading indicator when switching collections */}
      {loading && activeCollectionId !== null && (
        <div className="flex items-center justify-center py-8 text-stone-400 text-sm">{t('songEdit.loading')}</div>
      )}

      {/* List */}
      {!loading && (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={songs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 pl-8">
                {songs.map((song) => (
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
              <p className="text-sm">{t('songList.noSongs')}</p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="mt-2 text-sm underline hover:text-stone-600"
              >
                {t('songList.addFirst')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Bulk action bar */}
      {selecting && (
        <BulkBar
          count={selected.size}
          total={songs.length}
          onSelectAll={() => setSelected(new Set(songs.map((s) => s.id)))}
          onClear={() => setSelected(new Set())}
          onDelete={handleBulkDelete}
          deleting={deleting}
        />
      )}

      {/* New song modal */}
      {showModal && activeCollectionId !== null && (
        <NewSongModal
          collectionId={activeCollectionId}
          onClose={() => setShowModal(false)}
          onCreate={(song) => {
            setSongs((prev) => [...prev, song]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
