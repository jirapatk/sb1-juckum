import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { useStore } from './store';

function App() {
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

export default App;