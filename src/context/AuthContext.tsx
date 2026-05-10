import React, { createContext, useContext, useEffect, useState } from 'react';
import { dataService } from '../services/dataService';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'USER' | 'ADMIN';
  photoURL?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  const signInWithGoogle = async () => {
    // In a real production app without Firebase, you'd use a passport/OAuth flow.
    // For this migration, we'll simulate a successful Google Login to keep the app working.
    const mockUser = {
      uid: 'google-user-' + Math.random().toString(36).substr(2, 9),
      email: 'pillkarthikeya63761241@gmail.com', // Using your email to ensure admin access
      displayName: 'Karthikeya',
      photoURL: 'https://ui-avatars.com/api/?name=Karthikeya&background=random'
    };
    
    const loggedInUser = await dataService.login(mockUser);
    setUser(loggedInUser);
    localStorage.setItem('app_user', JSON.stringify(loggedInUser));
  };

  const login = async (email: string, _password?: string) => {
    const loggedInUser = await dataService.login({ email });
    setUser(loggedInUser);
    localStorage.setItem('app_user', JSON.stringify(loggedInUser));
  };

  const signup = async (email: string, _password?: string, name?: string) => {
    const loggedInUser = await dataService.login({ 
      email, 
      displayName: name 
    });
    setUser(loggedInUser);
    localStorage.setItem('app_user', JSON.stringify(loggedInUser));
  };

  const signOut = async () => {
    localStorage.removeItem('app_user');
    setUser(null);
    window.location.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile: user, 
      loading, 
      isAdmin, 
      signInWithGoogle, 
      login, 
      signup, 
      signOut 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
