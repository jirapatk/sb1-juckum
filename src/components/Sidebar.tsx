import React, { useState } from 'react';
import { PlusCircle, FileText, CheckSquare, Type, LayoutDashboard, Menu, X, Trash2, FolderPlus } from 'lucide-react';
import { useStore } from '../store';
import { NoteType } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import NoteItem from './NoteItem';

interface GroupDropZoneProps {
  groupId: string | 'ungrouped';
  children: React.ReactNode;
}

function GroupDropZone({ groupId, children }: GroupDropZoneProps) {
  const { setNodeRef } = useDroppable({
    id: groupId,
  });

  return (
    <div ref={setNodeRef} className="min-h-[40px]">
      {children}
    </div>
  );
}

export default function Sidebar() {
  const { notes, groups, activeNote, addNote, addGroup, setActiveNote, view, setView, deleteGroup, moveNoteToGroup } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#3b82f6');
  const [draggedNote, setDraggedNote] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const noteTypes: { type: NoteType; icon: React.ReactNode; label: string }[] = [
    { type: 'markdown', icon: <FileText size={16} />, label: 'Markdown' },
    { type: 'richtext', icon: <Type size={16} />, label: 'Rich Text' },
    { type: 'todo', icon: <CheckSquare size={16} />, label: 'Todo List' },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedNote(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setDraggedNote(null);
    
    if (!over) return;

    const noteId = active.id as string;
    const targetGroupId = over.id as string;

    if (targetGroupId === 'ungrouped') {
      moveNoteToGroup(noteId, undefined);
    } else {
      moveNoteToGroup(noteId, targetGroupId);
    }
  };

  const handleDeleteGroup = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this group? Notes will be moved to ungrouped.')) {
      await deleteGroup(groupId);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim(), newGroupColor);
      setNewGroupName('');
      setNewGroupColor('#3b82f6');
      setShowGroupForm(false);
    }
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const getDraggedNote = () => {
    if (!draggedNote) return null;
    const note = notes.find(n => n.id === draggedNote);
    if (!note) return null;
    return (
      <NoteItem
        note={note}
        isActive={false}
        onSelect={() => {}}
      />
    );
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out z-40`}
      >
        <div className="p-4 space-y-2">
          <button
            onClick={() => {
              setView('dashboard');
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2 text-left rounded-lg flex items-center gap-2 ${
              view === 'dashboard'
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <div className="relative group">
            <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded shadow-sm flex items-center gap-2">
              <PlusCircle size={18} />
              New Note
            </button>
            <div className="hidden group-hover:block absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
              {noteTypes.map(({ type, icon, label }) => (
                <button
                  key={type}
                  onClick={() => {
                    addNote(type);
                    setView('notes');
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowGroupForm(true)}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded shadow-sm flex items-center gap-2"
          >
            <FolderPlus size={18} />
            New Group
          </button>
        </div>

        {showGroupForm && (
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleCreateGroup} className="space-y-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="color"
                value={newGroupColor}
                onChange={(e) => setNewGroupColor(e.target.value)}
                className="w-full h-8 p-1 border rounded-md"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowGroupForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-y-auto">
            <SortableContext items={notes.map(n => n.id)} strategy={verticalListSortingStrategy}>
              {groups.map((group) => (
                <div key={group.id} className="mb-4 group">
                  <div
                    className="px-4 py-2 font-medium text-sm flex justify-between items-center"
                    style={{ color: group.color }}
                  >
                    {group.name}
                    <button
                      onClick={(e) => handleDeleteGroup(group.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <GroupDropZone groupId={group.id}>
                    {notes
                      .filter((note) => note.groupId === group.id)
                      .map((note) => (
                        <NoteItem
                          key={note.id}
                          note={note}
                          isActive={activeNote?.id === note.id}
                          onSelect={() => {
                            setActiveNote(note);
                            setView('notes');
                            setIsOpen(false);
                          }}
                        />
                      ))}
                  </GroupDropZone>
                </div>
              ))}
              <div className="mb-4">
                <div className="px-4 py-2 font-medium text-sm text-gray-400">
                  Ungrouped
                </div>
                <GroupDropZone groupId="ungrouped">
                  {notes
                    .filter((note) => !note.groupId)
                    .map((note) => (
                      <NoteItem
                        key={note.id}
                        note={note}
                        isActive={activeNote?.id === note.id}
                        onSelect={() => {
                          setActiveNote(note);
                          setView('notes');
                          setIsOpen(false);
                        }}
                      />
                    ))}
                </GroupDropZone>
              </div>
            </SortableContext>
            <DragOverlay>
              {draggedNote ? getDraggedNote() : null}
            </DragOverlay>
          </div>
        </DndContext>
      </div>
    </>
  );
}