import React, { useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStore } from '../store';
import { Trash2, CheckSquare, ChevronDown, ChevronUp, Image } from 'lucide-react';
import TodoList from './TodoList';

export default function Editor() {
  const { activeNote, updateNote, deleteNote, uploadImage } = useStore();
  const richtextRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeNote) return;

    try {
      const url = await uploadImage(file);
      if (url) {
        if (activeNote.type === 'markdown') {
          const imageMarkdown = `\n![${file.name}](${url})\n`;
          const newContent = activeNote.content + imageMarkdown;
          updateNote(activeNote.id, { content: newContent });
        } else if (activeNote.type === 'richtext' && richtextRef.current) {
          const img = document.createElement('img');
          img.src = url;
          img.alt = file.name;
          img.style.maxWidth = '100%';
          
          // Create a new range at the end of the content
          const range = document.createRange();
          range.selectNodeContents(richtextRef.current);
          range.collapse(false);
          
          // Insert image and new lines
          const br = document.createElement('br');
          range.insertNode(br.cloneNode());
          range.insertNode(img);
          range.insertNode(br.cloneNode());
          
          // Update content
          updateNote(activeNote.id, { content: richtextRef.current.innerHTML });
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  }, [activeNote, uploadImage, updateNote]);

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select or create a note to get started</p>
      </div>
    );
  }

  const renderEditor = () => {
    switch (activeNote.type) {
      case 'markdown':
        return (
          <div className="h-full p-4 grid grid-cols-2 gap-4">
            <div className="relative">
              <textarea
                value={activeNote.content}
                onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                className="h-full w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your markdown here..."
              />
              <label className="absolute bottom-4 right-4 cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Image className="w-6 h-6 text-gray-500 hover:text-blue-500" />
              </label>
            </div>
            <div className="prose max-w-none h-full p-4 border rounded-lg overflow-auto bg-white">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {activeNote.content}
              </ReactMarkdown>
            </div>
          </div>
        );
      case 'richtext':
        return (
          <div className="relative h-full">
            <div
              ref={richtextRef}
              contentEditable
              className="prose max-w-none h-full p-4 border rounded-lg focus:outline-none bg-white"
              onBlur={(e) =>
                updateNote(activeNote.id, { content: e.currentTarget.innerHTML })
              }
              dangerouslySetInnerHTML={{ __html: activeNote.content }}
            />
            <label className="absolute bottom-4 right-4 cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Image className="w-6 h-6 text-gray-500 hover:text-blue-500" />
            </label>
          </div>
        );
      case 'todo':
        return <TodoList noteId={activeNote.id} />;
      default:
        return null;
    }
  };

  const toggleTasks = () => {
    updateNote(activeNote.id, { showTasks: !activeNote.showTasks });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(activeNote.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
        <div className="flex-1">
          <input
            type="text"
            value={activeNote.title}
            onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
            className="text-2xl font-bold bg-transparent border-none focus:outline-none w-full"
            placeholder="Untitled"
          />
        </div>
        <div className="flex items-center gap-2">
          {activeNote.type !== 'todo' && (
            <button
              onClick={toggleTasks}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            >
              <CheckSquare size={20} />
              Tasks
              {activeNote.showTasks ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {activeNote.type !== 'todo' && activeNote.showTasks && (
          <div className="border-b border-gray-200 bg-white">
            <TodoList noteId={activeNote.id} />
          </div>
        )}
        {renderEditor()}
      </div>
    </div>
  );
}