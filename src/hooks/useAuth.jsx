import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const authValue = useProvideAuth();
  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setRole(data.role || 'guest');
      } else {
        const fallback = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          role: 'guest',
        };
        await setDoc(userRef, fallback);
        setRole('guest');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(userRef);
    const data = snap.data();
    setRole(data?.role || 'guest');
    setUser(cred.user);
    return { user: cred.user, role: data?.role || 'guest' };
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const userRef = doc(db, 'users', cred.user.uid);
    let snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        id: cred.user.uid,
        name: cred.user.displayName || '',
        email: cred.user.email || '',
        role: 'guest',
      });
      snap = await getDoc(userRef);
    }
    const roleFromDoc = snap.data()?.role || 'guest';
    setUser(cred.user);
    setRole(roleFromDoc);
    return { user: cred.user, role: roleFromDoc };
  };

  const register = async ({ name, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, 'users', cred.user.uid);
    const userDoc = {
      id: cred.user.uid,
      name,
      email,
      role: 'guest',
    };
    await setDoc(userRef, userDoc);
    setUser(cred.user);
    setRole('guest');
    return { user: cred.user, role: 'guest' };
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  return {
    user,
    role,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
  };
}

