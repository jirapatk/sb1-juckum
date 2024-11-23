import React from 'react';
import { useStore } from '../store';
import { CheckSquare, Square, Calendar, AlertTriangle } from 'lucide-react';
import { TodoItem } from '../types';

export default function Dashboard() {
  const { notes, updateTodo } = useStore();
  const notesWithTodos = notes.filter((note) => note.todos?.length > 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckSquare className="text-blue-500" />
              Pending Tasks
            </h2>
            {notesWithTodos.map((note) => (
              <div key={note.id} className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">{note.title}</h3>
                <div className="space-y-2">
                  {note.todos?.filter((todo) => !todo.done).map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
                    >
                      <button
                        onClick={() =>
                          updateTodo(note.id, todo.id, { done: !todo.done })
                        }
                        className="flex-shrink-0"
                      >
                        {todo.done ? (
                          <CheckSquare className="text-green-500" />
                        ) : (
                          <Square className="text-gray-400" />
                        )}
                      </button>
                      <span className="flex-grow">{todo.text}</span>
                      {todo.dueDate && (
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar size={14} />
                          {todo.dueDate}
                        </span>
                      )}
                      <AlertTriangle
                        className={`flex-shrink-0 ${getPriorityColor(
                          todo.priority
                        )}`}
                        size={16}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckSquare className="text-green-500" />
              Completed Tasks
            </h2>
            {notesWithTodos.map((note) => (
              <div key={note.id} className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">{note.title}</h3>
                <div className="space-y-2">
                  {note.todos?.filter((todo) => todo.done).map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
                    >
                      <button
                        onClick={() =>
                          updateTodo(note.id, todo.id, { done: !todo.done })
                        }
                        className="flex-shrink-0"
                      >
                        <CheckSquare className="text-green-500" />
                      </button>
                      <span className="line-through text-gray-400">
                        {todo.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}