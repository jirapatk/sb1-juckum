import { create } from 'zustand';
import { Note, NoteStore, NoteType, TodoItem, Group } from './types';
import { syncNotes, fetchNotes, syncGroups, fetchGroups, supabase, uploadImage as uploadImageToStorage, deleteGroup as deleteGroupFromDb } from './supabase';

export const useStore = create<NoteStore>((set, get) => ({
  notes: [],
  groups: [],
  activeNote: null,
  view: 'dashboard',
  user: null,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    const [notes, groups] = await Promise.all([fetchNotes(), fetchGroups()]);
    set({ notes, groups, initialized: true });

    const notesSubscription = supabase
      .channel('notes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, 
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (payload.new?.user_id === user?.id || payload.old?.user_id === user?.id) {
            const notes = await fetchNotes();
            set({ notes });
          }
      })
      .subscribe();

    const groupsSubscription = supabase
      .channel('groups_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (payload.new?.user_id === user?.id || payload.old?.user_id === user?.id) {
            const groups = await fetchGroups();
            set({ groups });
          }
      })
      .subscribe();

    return () => {
      notesSubscription.unsubscribe();
      groupsSubscription.unsubscribe();
    };
  },

  uploadImage: async (file: File) => {
    try {
      const url = await uploadImageToStorage(file);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  },

  addNote: (type: NoteType, groupId?: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      groupId,
      title: 'Untitled',
      content: '',
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
      todos: [],
      showTasks: false,
    };
    set((state) => {
      const newNotes = [newNote, ...state.notes];
      syncNotes(newNotes);
      return {
        notes: newNotes,
        activeNote: newNote,
      };
    });
  },

  updateNote: (id: string, updates: Partial<Note>) => {
    set((state) => {
      const newNotes = state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      );
      syncNotes(newNotes);
      return {
        notes: newNotes,
        activeNote:
          state.activeNote?.id === id
            ? { ...state.activeNote, ...updates, updatedAt: new Date() }
            : state.activeNote,
      };
    });
  },

  deleteNote: (id: string) => {
    set((state) => {
      const newNotes = state.notes.filter((note) => note.id !== id);
      syncNotes(newNotes);
      return {
        notes: newNotes,
        activeNote: state.activeNote?.id === id ? null : state.activeNote,
      };
    });
  },

  addGroup: (name: string, color: string) => {
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name,
      color,
      createdAt: new Date(),
    };
    set((state) => {
      const newGroups = [...state.groups, newGroup];
      syncGroups(newGroups);
      return { groups: newGroups };
    });
  },

  updateGroup: (id: string, updates: Partial<Group>) => {
    set((state) => {
      const newGroups = state.groups.map((group) =>
        group.id === id ? { ...group, ...updates } : group
      );
      syncGroups(newGroups);
      return { groups: newGroups };
    });
  },

  deleteGroup: async (id: string) => {
    await deleteGroupFromDb(id);
    set((state) => {
      const newGroups = state.groups.filter((group) => group.id !== id);
      const newNotes = state.notes.map((note) =>
        note.groupId === id ? { ...note, groupId: undefined } : note
      );
      return { groups: newGroups, notes: newNotes };
    });
  },

  moveNoteToGroup: (noteId: string, groupId: string | undefined) => {
    set((state) => {
      const newNotes = state.notes.map((note) =>
        note.id === noteId ? { ...note, groupId } : note
      );
      syncNotes(newNotes);
      return { notes: newNotes };
    });
  },

  setActiveNote: (note) => set({ activeNote: note }),
  setView: (view) => set({ view }),
  setUser: (user) => set({ user }),

  updateTodo: (noteId: string, todoId: string, updates: Partial<TodoItem>) => {
    set((state) => {
      const newNotes = state.notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              todos: note.todos.map((todo) =>
                todo.id === todoId ? { ...todo, ...updates } : todo
              ),
            }
          : note
      );
      syncNotes(newNotes);
      return { notes: newNotes };
    });
  },
}));