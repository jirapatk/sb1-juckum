'use client';

import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Editor from './Editor';
import Dashboard from './Dashboard';
import Auth from './Auth';
import { useStore } from '../store';

export default function App() {
  const { view, initialize, user } = useStore();

  useEffect(() => {
    if (user) {
      initialize();
    }
  }, [initialize, user]);

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 relative">
        {view === 'dashboard' ? <Dashboard /> : <Editor />}
      </main>
    </div>
  );
}