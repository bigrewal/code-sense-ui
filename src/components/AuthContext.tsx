import React, { createContext, useContext, useState } from 'react';
import { login as loginApi, signup as signupApi, createCheckout } from '../api';
import { loadStripe } from '@stripe/stripe-js';

const BYPASS = import.meta.env.VITE_BYPASS_AUTH === 'true';

console.log('BYPASS_AUTH:', BYPASS);

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // const [user, setUser] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(BYPASS ? { email: 'dev@local' } : null);

  const login = async (email: string, password: string) => {
    await loginApi(email, password);
    setUser({ email });
  };

  const signup = async (email: string, password: string) => {
    await signupApi(email, password);
    const stripeKey = import.meta.env.VITE_STRIPE_PK as string;
    if (stripeKey) {
      const stripe = await loadStripe(stripeKey);
      const session = await createCheckout();
      const sessionId = session.data.id;
      await stripe?.redirectToCheckout({ sessionId });
    }
    setUser({ email });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
