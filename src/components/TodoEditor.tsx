import React from 'react';
import { CheckSquare, Square, Calendar, AlertTriangle, Plus } from 'lucide-react';
import { useStore } from '../store';
import { TodoItem } from '../types';

export default function TodoEditor({ noteId }: { noteId: string }) {
  const { notes, updateNote } = useStore();
  const note = notes.find((n) => n.id === noteId);
  const todos = note?.todos || [];

  const addTodo = () => {
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text: 'New task',
      done: false,
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
    };
    updateNote(noteId, { todos: [...todos, newTodo] });
  };

  const updateTodo = (todoId: string, updates: Partial<TodoItem>) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === todoId ? { ...todo, ...updates } : todo
    );
    updateNote(noteId, { todos: updatedTodos });
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <button
              onClick={() => updateTodo(todo.id, { done: !todo.done })}
              className="flex-shrink-0"
            >
              {todo.done ? (
                <CheckSquare className="text-green-500" />
              ) : (
                <Square className="text-gray-400" />
              )}
            </button>
            <input
              type="text"
              value={todo.text}
              onChange={(e) => updateTodo(todo.id, { text: e.target.value })}
              className={`flex-grow bg-transparent focus:outline-none ${
                todo.done ? 'line-through text-gray-400' : ''
              }`}
            />
            <input
              type="date"
              value={todo.dueDate}
              onChange={(e) => updateTodo(todo.id, { dueDate: e.target.value })}
              className="flex-shrink-0 bg-transparent border rounded px-2 py-1"
            />
            <select
              value={todo.priority}
              onChange={(e) =>
                updateTodo(todo.id, {
                  priority: e.target.value as TodoItem['priority'],
                })
              }
              className="flex-shrink-0 bg-transparent border rounded px-2 py-1"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        ))}
      </div>
      <button
        onClick={addTodo}
        className="mt-4 flex items-center gap-2 text-blue-500 hover:text-blue-600"
      >
        <Plus size={20} />
        Add Task
      </button>
    </div>
  );
}