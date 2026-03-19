import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Collection } from '../../types';

interface CollectionSwitcherProps {
  collections: Collection[];
  activeId: number | null;
  onSwitch: (id: number) => void;
  onRename: (id: number, name: string) => void;
  onDelete: (id: number) => void;
  onCreate: (name: string) => void;
}

export default function CollectionSwitcher({
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
                if (e.key === 'Escape') {
                  setEditingId(null);
                  setEditingName('');
                }
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
            if (e.key === 'Escape') {
              setShowNewInput(false);
              setNewName('');
            }
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
