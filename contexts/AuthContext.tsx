'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '@/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        setUserProfile({ id: snap.id, ...snap.data() } as UserProfile);
      } else {
        setUserProfile(null);
      }
    } catch {
      setUserProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (firebaseUser) await loadProfile(firebaseUser.uid);
  };

  useEffect(() => {
    // Fallback: if Firebase takes too long, stop showing spinner
    const timeout = setTimeout(() => setLoading(false), 8000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeout);
      setFirebaseUser(user);
      if (user) {
        await loadProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => { clearTimeout(timeout); unsubscribe(); };
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, userProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
