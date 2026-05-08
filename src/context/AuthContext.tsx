import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        let userSnap = await getDoc(userRef);

        const isAdminEmail = user.email === 'pillkarthikeya63761241@gmail.com';

        if (!userSnap.exists()) {
          const newProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: isAdminEmail ? 'ADMIN' : 'USER',
            createdAt: serverTimestamp()
          };
          await setDoc(userRef, newProfile);
          setProfile({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: isAdminEmail ? 'ADMIN' : 'USER'
          });
        } else {
          const data = userSnap.data();
          // Auto-promote if email matches even if role was USER before
          if (isAdminEmail && data.role !== 'ADMIN') {
             await setDoc(userRef, { role: 'ADMIN' }, { merge: true });
             data.role = 'ADMIN';
          }
          setProfile({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: data.role
          });
        }
      } else {
        setProfile(null);
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = profile?.role === 'ADMIN';

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Prompt the user to select an account even if they are already logged in
    // This can sometimes help with session/cookie sync issues in iframes
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      console.log('Initiating Google Sign In...');
      const result = await signInWithPopup(auth, provider);
      console.log('Sign in successful:', result.user.email);
    } catch (error: any) {
      console.error('Detailed Google Sign In Error:', {
        code: error.code,
        message: error.message,
        customData: error.customData,
        email: error.customData?.email
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // 1. Clear local/session storage immediately
      localStorage.clear();
      sessionStorage.clear();
      
      // 2. Clear React state
      setUser(null);
      setProfile(null);
      
      // 3. Attempt Firebase sign out, but don't let it block the UI if it's slow/fails
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.error('Firebase sign out failed:', e);
      }

      // 4. Force a hard redirect to clear all internal buffers/states
      window.location.replace('/login');
    } catch (error) {
      console.error('Aggressive Sign Out Error:', error);
      // Last resort fallback
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signInWithGoogle, signOut }}>
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
