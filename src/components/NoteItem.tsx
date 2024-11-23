import React from 'react';
import { FileText, Type, CheckSquare } from 'lucide-react';
import { Note } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  onSelect: () => void;
}

export default function NoteItem({ note, isActive, onSelect }: NoteItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: note.id,
    data: {
      type: 'note',
      note,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`w-full p-3 text-left hover:bg-gray-100 cursor-pointer ${
        isActive ? 'bg-gray-100' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        {note.type === 'markdown' && <FileText size={16} />}
        {note.type === 'richtext' && <Type size={16} />}
        {note.type === 'todo' && <CheckSquare size={16} />}
        <h3 className="font-medium text-gray-900 truncate">
          {note.title || 'Untitled'}
        </h3>
      </div>
      {note.type === 'todo' && note.todos && (
        <div className="mt-1 text-sm text-gray-500">
          {note.todos.filter((todo) => !todo.done).length} pending tasks
        </div>
      )}
      <p className="text-xs text-gray-400 mt-1">
        {new Date(note.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}