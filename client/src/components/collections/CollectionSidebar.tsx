import { Music, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Collection } from '../../types';

interface CollectionSidebarProps {
  collections: Collection[];
  activeId: number | null;
  onSwitch: (id: number) => void;
  onRename: (id: number, name: string) => void;
  onDelete: (id: number) => void;
  onCreate: (name: string) => void;
}

export default function CollectionSidebar({
  collections,
  activeId,
  onSwitch,
  onRename,
  onDelete,
  onCreate,
}: CollectionSidebarProps) {
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

  function startEdit(col: Collection, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(col.id);
    setEditingName(col.name);
  }

  function commitEdit(id: number) {
    if (editingName.trim()) onRename(id, editingName.trim());
    setEditingId(null);
    setEditingName('');
  }

  async function commitNew() {
    if (!newName.trim()) {
      setShowNewInput(false);
      setNewName('');
      return;
    }
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
    <nav className="flex flex-col gap-1.5 w-full">
      {collections.map((col) => {
        const isActive = activeId === col.id;
        const isEditing = editingId === col.id;

        return (
          // biome-ignore lint/a11y/useSemanticElements: div used instead of button to allow nested button children
          <div
            key={col.id}
            role="button"
            tabIndex={0}
            className={`group relative rounded-xl border transition-all w-full text-left cursor-pointer ${
              isActive
                ? 'bg-stone-800 border-stone-800 text-white'
                : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm'
            }`}
            onClick={() => !isEditing && onSwitch(col.id)}
            onKeyDown={(e) =>
              !isEditing && (e.key === 'Enter' || e.key === ' ') && onSwitch(col.id)
            }
          >
            <div className="px-4 py-3">
              {/* Name row */}
              {isEditing ? (
                <input
                  ref={editRef}
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => commitEdit(col.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit(col.id);
                    if (e.key === 'Escape') {
                      setEditingId(null);
                      setEditingName('');
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-sm font-medium bg-transparent border-b border-stone-400 outline-none pb-0.5 text-stone-800"
                />
              ) : (
                <p
                  className={`text-sm font-semibold leading-tight truncate ${
                    isActive ? 'text-white' : 'text-stone-800'
                  }`}
                >
                  {col.name}
                </p>
              )}

              {/* Cover title preview */}
              {col.cover_title && col.cover_title !== col.name && (
                <p
                  className={`text-xs mt-0.5 truncate ${
                    isActive ? 'text-stone-300' : 'text-stone-400'
                  }`}
                >
                  {col.cover_title}
                </p>
              )}

              {/* Song count */}
              <div className="flex items-center gap-1 mt-2 text-xs text-stone-400">
                <Music size={11} />
                <span>{t('songList.songCount', { count: col.song_count ?? 0 })}</span>
              </div>
            </div>

            {/* Action buttons — appear on hover */}
            {!isEditing && (
              <div
                className={`absolute top-2 right-2 hidden group-hover:flex items-center gap-0.5 rounded-lg px-1 py-0.5 ${
                  isActive ? 'bg-stone-700' : 'bg-white border border-stone-200 shadow-sm'
                }`}
              >
                <button
                  type="button"
                  title={t('collections.rename')}
                  onClick={(e) => startEdit(col, e)}
                  className={`p-1 rounded transition-colors ${
                    isActive
                      ? 'text-stone-400 hover:text-white'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <Pencil size={11} />
                </button>
                {collections.length > 1 && (
                  <button
                    type="button"
                    title={t('collections.delete')}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(t('collections.confirmDelete', { name: col.name }))) {
                        onDelete(col.id);
                      }
                    }}
                    className={`p-1 rounded transition-colors ${
                      isActive
                        ? 'text-stone-400 hover:text-rose-400'
                        : 'text-stone-400 hover:text-rose-500'
                    }`}
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* New collection */}
      {showNewInput ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3">
          <input
            ref={newRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={commitNew}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitNew();
              if (e.key === 'Escape') {
                setShowNewInput(false);
                setNewName('');
              }
            }}
            placeholder={t('collections.namePlaceholder')}
            disabled={creating}
            className="w-full text-sm bg-transparent outline-none text-stone-800 placeholder-stone-400 disabled:opacity-60"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNewInput(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-stone-200 text-stone-400 hover:text-stone-600 hover:border-stone-300 transition-colors text-sm w-full"
        >
          <Plus size={14} />
          {t('collections.new')}
        </button>
      )}
    </nav>
  );
}
