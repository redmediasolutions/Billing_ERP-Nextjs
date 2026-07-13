"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase/config";

interface AuthState {
  user: User | null;

  isAdmin: boolean;

  loading: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      setIsAdmin(Boolean(firebaseUser));

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    isAdmin,
    loading,
  };
}