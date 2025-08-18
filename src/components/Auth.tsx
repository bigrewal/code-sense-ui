import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface AuthProps {
  initialMode: 'login' | 'signup';
}

const Auth: React.FC<AuthProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const switchMode = (m: 'login' | 'signup') => {
    setMode(m);
    navigate(m === 'login' ? '/login' : '/signup', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await login(email, password);
    } else {
      await signup(email, password);
    }
  };

  return (
    <div className="flex h-full">
      <div className="hidden md:flex flex-col justify-between flex-1 bg-yellow-50 p-8">
        <div className="text-xl font-semibold text-gray-800 flex items-center gap-1">
          <span>CodeSense</span>
          <span className="text-orange-500">●</span>
        </div>
        <div className="text-3xl font-bold text-gray-800 max-w-md">
          Understand any codebase instantly
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <h2 className="text-2xl font-semibold text-center">Get started</h2>
          <div className="flex rounded-md overflow-hidden border">
            <button
              className={`flex-1 py-2 ${
                mode === 'login' ? 'bg-gray-900 text-white' : 'bg-white'
              }`}
              type="button"
              onClick={() => switchMode('login')}
            >
              Log in
            </button>
            <button
              className={`flex-1 py-2 ${
                mode === 'signup' ? 'bg-gray-900 text-white' : 'bg-white'
              }`}
              type="button"
              onClick={() => switchMode('signup')}
            >
              Sign up
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full border rounded p-2"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full border rounded p-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-blue-600 text-white p-2 rounded">
              {mode === 'login' ? 'Log in' : 'Sign up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
