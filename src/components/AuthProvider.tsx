import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: 'user' | 'ambassador' | 'scholar' | 'admin';
  reputation: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isScholar: boolean;
  isAmbassador: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isScholar: false,
  isAmbassador: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setProfile({ uid: user.uid, ...doc.data() } as UserProfile);
      } else {
        // Fallback or initialization logic could go here
        setProfile(null);
      }
      setLoading(false);
    }, (error: any) => {
      console.warn("Error fetching user profile (likely quota exceeded):", error?.message);
      setProfile(null);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  const isAdmin = profile?.role === 'admin';
  const isScholar = profile?.role === 'scholar' || isAdmin;
  const isAmbassador = profile?.role === 'ambassador' || isScholar;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isScholar, isAmbassador }}>
      {children}
    </AuthContext.Provider>
  );
};
