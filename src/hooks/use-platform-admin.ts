"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth } from "@/firebase/config";
import { isPlatformAdmin } from "@/lib/platform-admin";

export function usePlatformAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setReady(true);
    });
    return unsubscribe;
  }, []);

  return {
    ready,
    user,
    isPlatformAdmin: ready && isPlatformAdmin(user?.email),
  };
}
