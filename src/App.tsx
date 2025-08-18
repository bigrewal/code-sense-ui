import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import IngestForm from './components/IngestForm';
import Chat from './components/Chat';
import RepoSelector from './components/RepoSelector';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Repo } from './types';
import { fetchRepos } from './api';

const Dashboard: React.FC = () => {
  const [repos, setRepos] = useState<string[]>([]);
  const [currentRepo, setCurrentRepo] = useState<string | null>(null);

  useEffect(() => {
    fetchRepos().then((res) => setRepos(res.data.repos || []));
  }, []);

  const addRepo = (name: string) => {
    setRepos((r) => [...r, name]);
    setCurrentRepo(name);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex justify-between items-center border-b">
        <RepoSelector
          repos={repos}
          current={currentRepo}
          onSelect={setCurrentRepo}
          onNewChat={() => setCurrentRepo(null)}
        />
      </div>
      <div className="p-4 border-b">
        <IngestForm onRepoAdded={addRepo} />
      </div>
      <div className="flex-1">
        <Chat />
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
    <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
    <Route path="/signup" element={<Signup />} />
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
