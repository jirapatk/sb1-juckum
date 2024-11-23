export type NoteType = 'markdown' | 'richtext' | 'todo';

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Group {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  groupId?: string;
  createdAt: Date;
  updatedAt: Date;
  todos: TodoItem[];
  showTasks: boolean;
}

export interface NoteStore {
  notes: Note[];
  groups: Group[];
  activeNote: Note | null;
  view: 'dashboard' | 'notes';
  initialized: boolean;
  user: any;
  initialize: () => Promise<void>;
  addNote: (type: NoteType, groupId?: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addGroup: (name: string, color: string) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  moveNoteToGroup: (noteId: string, groupId: string | undefined) => void;
  setActiveNote: (note: Note | null) => void;
  setView: (view: 'dashboard' | 'notes') => void;
  setUser: (user: any) => void;
  updateTodo: (noteId: string, todoId: string, updates: Partial<TodoItem>) => void;
  uploadImage: (file: File) => Promise<string | null>;
}