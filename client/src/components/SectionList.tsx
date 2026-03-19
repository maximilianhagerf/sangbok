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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import * as api from '../api';
import type { Section } from '../types';
import SectionEditor from './SectionEditor';

interface Props {
  songId: number;
  sections: Section[];
  onChange: (sections: Section[]) => void;
}

export default function SectionList({ songId, sections, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const next = arrayMove(sections, oldIndex, newIndex);
    onChange(next);
    await api.reorderSections(
      songId,
      next.map((s) => s.id),
    );
  }

  function handleUpdate(updated: Section) {
    onChange(sections.map((s) => (s.id === updated.id ? updated : s)));
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this section?')) return;
    await api.deleteSection(id);
    onChange(sections.filter((s) => s.id !== id));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {sections.map((section) => (
            <SectionEditor
              key={section.id}
              section={section}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
