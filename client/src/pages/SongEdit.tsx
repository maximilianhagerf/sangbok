import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as api from '../api';
import SectionList from '../components/SectionList';
import type { Song } from '../types';

export default function SongEdit() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api
      .getSong(Number(id))
      .then(setSong)
      .finally(() => setLoading(false));
  }, [id]);

  function scheduleMetaSave(patch: Partial<Song>) {
    if (!song) return;
    const updated = { ...song, ...patch };
    setSong(updated);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.updateSong(updated.id, patch);
    }, 600);
  }

  async function handleAddSection() {
    if (!song) return;
    const section = await api.createSection(song.id, { label: '', content: '' });
    setSong((s) => (s ? { ...s, sections: [...s.sections, section] } : s));
  }

  async function handleDelete() {
    if (!song) return;
    if (!confirm(t('songEdit.confirmDelete', { title: song.title }))) return;
    await api.deleteSong(song.id);
    navigate('/');
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-stone-400 text-sm">{t('songEdit.loading')}</div>
    );
  if (!song)
    return (
      <div className="flex items-center justify-center h-64 text-stone-400 text-sm">
        {t('songEdit.notFound')}
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft size={15} /> {t('nav.allSongs')}
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-rose-500 transition-colors"
        >
          <Trash2 size={14} /> {t('songEdit.deleteSong')}
        </button>
      </div>

      {/* Metadata */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 mb-6 space-y-4">
        <div>
          <label htmlFor="song-title" className="block text-xs font-medium text-stone-500 mb-1">
            {t('songForm.titleLabel')}
          </label>
          <input
            id="song-title"
            type="text"
            value={song.title}
            onChange={(e) => scheduleMetaSave({ title: e.target.value })}
            className="w-full text-xl font-['Cormorant_Garamond'] font-medium text-stone-800 border-b border-stone-200 pb-1 outline-none focus:border-stone-400 transition-colors bg-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="song-credit" className="block text-xs font-medium text-stone-500 mb-1">
              {t('songForm.creditLabel')}
            </label>
            <input
              id="song-credit"
              type="text"
              value={song.credit ?? ''}
              onChange={(e) => scheduleMetaSave({ credit: e.target.value || undefined })}
              placeholder={t('songForm.creditPlaceholder')}
              className="w-full text-sm text-stone-700 border-b border-stone-200 pb-1 outline-none focus:border-stone-400 bg-transparent placeholder-stone-300"
            />
          </div>
          <div>
            <label
              htmlFor="song-original"
              className="block text-xs font-medium text-stone-500 mb-1"
            >
              {t('songForm.originalLabel')}
            </label>
            <input
              id="song-original"
              type="text"
              value={song.original ?? ''}
              onChange={(e) => scheduleMetaSave({ original: e.target.value || undefined })}
              placeholder={t('songForm.originalPlaceholder')}
              className="w-full text-sm text-stone-700 border-b border-stone-200 pb-1 outline-none focus:border-stone-400 bg-transparent placeholder-stone-300"
            />
          </div>
        </div>

        <div>
          <p className="block text-xs font-medium text-stone-500 mb-2">{t('songForm.columnsLabel')}</p>
          <div className="flex gap-2" role="radiogroup" aria-label={t('songForm.columnsLabel')}>
            {([1, 2, 3] as const).map((col) => (
              <button
                type="button"
                key={col}
                onClick={() => scheduleMetaSave({ columns: col })}
                className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                  song.columns === col
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {col} col
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-stone-600">
          {t('songEdit.sections')} <span className="text-stone-400">({song.sections.length})</span>
        </h2>
        <button
          type="button"
          onClick={handleAddSection}
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 transition-colors"
        >
          <Plus size={14} /> {t('songEdit.addSection')}
        </button>
      </div>

      <SectionList
        songId={song.id}
        sections={song.sections}
        onChange={(sections) => setSong((s) => (s ? { ...s, sections } : s))}
      />

      {song.sections.length === 0 && (
        <div className="text-center py-8 border border-dashed border-stone-200 rounded-xl">
          <p className="text-sm text-stone-400 mb-2">{t('songEdit.noSections')}</p>
          <button
            type="button"
            onClick={handleAddSection}
            className="text-sm text-stone-500 underline hover:text-stone-700"
          >
            {t('songEdit.addFirstSection')}
          </button>
        </div>
      )}
    </div>
  );
}
