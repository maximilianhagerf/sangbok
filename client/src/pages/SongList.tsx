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
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Menu, Plus, Printer, Settings, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as api from '../api';
import CollectionSidebar from '../components/collections/CollectionSidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SangbokLogo from '../components/SangbokLogo';
import CoverSettingsPanel from '../components/settings/CoverSettingsPanel';
import BulkBar from '../components/songs/BulkBar';
import NewSongModal from '../components/songs/NewSongModal';
import SongRow from '../components/songs/SongRow';
import { useCollection } from '../hooks/useCollection';

export default function SongList() {
  const { t } = useTranslation();
  const {
    collections,
    activeCollectionId,
    songs,
    settings,
    loading,
    switchCollection,
    createCollection,
    renameCollection,
    deleteCollection,
    setSongs,
    setSettings,
  } = useCollection();

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const selecting = selected.size > 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleSwitchCollection(id: number) {
    switchCollection(id);
    setSelected(new Set());
    setShowSettings(false);
    setShowSidebar(false);
  }

  async function handleDeleteCollection(id: number) {
    try {
      await deleteCollection(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : t('collections.lastCollection'));
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
    if (!confirm(t('bulkBar.confirmDelete', { count: selected.size }))) return;
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
      <div className="flex items-center justify-center h-screen text-stone-400 text-sm">
        {t('songEdit.loading')}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      {/* ── Mobile sidebar backdrop ──────────────── */}
      {showSidebar && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop closes sidebar on tap
        // biome-ignore lint/a11y/noStaticElementInteractions: intentional backdrop dismiss
        <div
          className="fixed inset-0 z-30 bg-stone-900/40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 md:static md:w-60 md:z-auto shrink-0 border-r border-stone-200 bg-white flex flex-col px-3 py-6 gap-6 overflow-y-auto transition-transform md:transition-none ${
          showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between">
          <SangbokLogo />
          <button
            type="button"
            onClick={() => setShowSidebar(false)}
            className="md:hidden text-stone-400 hover:text-stone-700 p-1"
          >
            <X size={18} />
          </button>
        </div>

        {collections.length > 0 && (
          <CollectionSidebar
            collections={collections}
            activeId={activeCollectionId}
            onSwitch={handleSwitchCollection}
            onRename={renameCollection}
            onDelete={handleDeleteCollection}
            onCreate={createCollection}
          />
        )}
      </aside>

      {/* ── Main content ────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b border-stone-200 bg-white gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSidebar(true)}
              className="md:hidden text-stone-500 hover:text-stone-800 transition-colors"
            >
              <Menu size={20} />
            </button>
            <p className="text-sm text-stone-400 hidden md:block">
              {t('songList.songCount', { count: songs.length })}
            </p>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <a
              href={`/print?c=${activeCollectionId}`}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 text-sm text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">{t('nav.printView')}</span>
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
              className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">{t('songList.newSong')}</span>
            </button>
          </div>
        </header>

        {/* Song list */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6">
          {loading && activeCollectionId !== null ? (
            <div className="flex items-center justify-center py-16 text-stone-400 text-sm">
              {t('songEdit.loading')}
            </div>
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={songs.map((s) => s.id)} strategy={rectSortingStrategy}>
                  <div className="@container">
                    <div className="grid grid-cols-1 @6xl:grid-cols-2 gap-y-2 gap-x-8">
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
        </div>
      </main>

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

      {/* Cover settings modal */}
      {showSettings && activeCollectionId !== null && (
        <CoverSettingsPanel
          collectionId={activeCollectionId}
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
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
