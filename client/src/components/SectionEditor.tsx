import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as api from '../api';
import type { Section } from '../types';

interface Props {
  section: Section;
  onUpdate: (updated: Section) => void;
  onDelete: (id: number) => void;
}

export default function SectionEditor({ section, onUpdate, onDelete }: Props) {
  const { t } = useTranslation();
  const [label, setLabel] = useState(section.label ?? '');
  const [content, setContent] = useState(section.content);
  const [chords, setChords] = useState(section.chords);
  const [chordsOpen, setChordsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  function scheduleSave(newLabel: string, newContent: string, newChords: typeof chords) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const updated = await api.updateSection(section.id, {
          label: newLabel || undefined,
          content: newContent,
          chords: newChords,
        });
        onUpdate(updated);
      } finally {
        setSaving(false);
      }
    }, 800);
  }

  function handleLabelChange(v: string) {
    setLabel(v);
    scheduleSave(v, content, chords);
  }

  function handleContentChange(v: string) {
    setContent(v);
    scheduleSave(label, v, chords);
  }

  function updateChord(lineIdx: number, chord: string) {
    const existing = chords.find((c) => c.line === lineIdx);
    const next = existing
      ? chords.map((c) => (c.line === lineIdx ? { ...c, chord } : c))
      : [...chords, { line: lineIdx, chord }].sort((a, b) => a.line - b.line);
    setChords(next);
    scheduleSave(label, content, next);
  }

  function removeChord(lineIdx: number) {
    const next = chords.filter((c) => c.line !== lineIdx);
    setChords(next);
    scheduleSave(label, content, next);
  }

  function addChord() {
    const usedLines = new Set(chords.map((c) => c.line));
    const lines = content.split('\n');
    const nextLine = lines.findIndex((_, i) => !usedLines.has(i));
    if (nextLine === -1) return;
    const next = [...chords, { line: nextLine, chord: '' }].sort((a, b) => a.line - b.line);
    setChords(next);
  }

  const lines = content.split('\n');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-stone-200 rounded-lg bg-white overflow-hidden"
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 border-b border-stone-200">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-stone-400 hover:text-stone-600 cursor-grab active:cursor-grabbing touch-none"
          aria-label={t('sectionEditor.dragToReorder')}
        >
          <GripVertical size={16} />
        </button>

        <input
          type="text"
          value={label}
          onChange={(e) => handleLabelChange(e.target.value)}
          placeholder={t('sectionEditor.labelPlaceholder')}
          className="flex-1 text-sm font-medium bg-transparent text-stone-700 placeholder-stone-400 outline-none min-w-0"
        />

        {saving && <span className="text-xs text-stone-400">{t('sectionEditor.saving')}</span>}

        <button
          type="button"
          onClick={() => onDelete(section.id)}
          className="text-stone-400 hover:text-rose-500 transition-colors"
          aria-label={t('sectionEditor.deleteSection')}
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Lyrics textarea */}
      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        rows={Math.max(3, lines.length + 1)}
        className="w-full px-4 py-3 text-sm font-['EB_Garamond',Georgia,serif] text-stone-800 resize-none outline-none leading-relaxed"
        placeholder={t('sectionEditor.lyricsPlaceholder')}
      />

      {/* Chords panel */}
      <div className="border-t border-stone-100">
        <button
          type="button"
          onClick={() => setChordsOpen((o) => !o)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs text-stone-500 hover:text-stone-700 transition-colors w-full text-left"
        >
          {chordsOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          {t('sectionEditor.chords')}{' '}
          {chords.length > 0 && <span className="ml-1 text-amber-600">({chords.length})</span>}
        </button>

        {chordsOpen && (
          <div className="px-4 pb-3 space-y-1.5">
            <div className="grid grid-cols-[1.5rem_1fr_2fr_1.5rem] gap-2 text-xs text-stone-500 font-medium mb-1">
              <span>{t('sectionEditor.chordLineNum')}</span>
              <span>{t('sectionEditor.chordLinePreview')}</span>
              <span>{t('sectionEditor.chordLabel')}</span>
              <span></span>
            </div>
            {chords.map(({ line, chord }) => (
              <div key={line} className="grid grid-cols-[1.5rem_1fr_2fr_1.5rem] gap-2 items-center">
                <span className="text-xs text-stone-400">{line + 1}</span>
                <span className="text-xs text-stone-600 truncate font-['EB_Garamond'] italic">
                  {lines[line] ?? '—'}
                </span>
                <input
                  type="text"
                  value={chord}
                  onChange={(e) => updateChord(line, e.target.value)}
                  className="text-xs border border-stone-200 rounded px-2 py-0.5 font-mono text-amber-700 outline-none focus:border-amber-400"
                  placeholder={t('sectionEditor.chordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => removeChord(line)}
                  className="text-stone-400 hover:text-rose-500"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addChord}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-amber-700 transition-colors mt-1"
            >
              <Plus size={12} /> {t('sectionEditor.addChord')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
