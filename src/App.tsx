import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Auth from './components/Auth';
import IngestForm from './components/IngestForm';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './components/AuthContext';
import { fetchRepos } from './api';

interface Conversation {
  id: string;
  title: string;
}

const Dashboard: React.FC = () => {
  const [repos, setRepos] = useState<string[]>([]);
  const [currentRepo, setCurrentRepo] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConv, setCurrentConv] = useState<string | null>(null);
  const [showIngest, setShowIngest] = useState(false);

  useEffect(() => {
    fetchRepos().then((res) => setRepos(res.data.repos || []));
  }, []);

  const addRepo = (name: string) => {
    setRepos((r) => [...r, name]);
    setCurrentRepo(name);
  };

  const startNewChat = () => {
    const id = Date.now().toString();
    setConversations((c) => [{ id, title: 'New Chat' }, ...c]);
    setCurrentConv(id);
    setCurrentRepo(null);
  };

  const updateTitle = (title: string) => {
    setConversations((c) => c.map((conv) => (conv.id === currentConv ? { ...conv, title } : conv)));
  };

  return (
    <div className="flex h-full bg-[#343541] text-gray-100">
      <Sidebar
        conversations={conversations}
        currentId={currentConv}
        onSelect={setCurrentConv}
        onNew={startNewChat}
        onIngest={() => setShowIngest(true)}
      />
      <div className="flex-1 relative">
        {currentConv ? (
          <Chat
            key={currentConv}
            repos={repos}
            repo={currentRepo}
            onRepoChange={setCurrentRepo}
            onTitle={updateTitle}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Start a new chat
          </div>
        )}
        {showIngest && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-[#202123] text-gray-100 p-6 rounded-lg w-96 shadow-lg space-y-4">
              <IngestForm
                onRepoAdded={(r) => {
                  addRepo(r);
                  setShowIngest(false);
                }}
              />
              <button
                className="w-full rounded-md bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm"
                onClick={() => setShowIngest(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Auth initialMode="login" />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/" replace /> : <Auth initialMode="signup" />}
      />
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
