"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  // true while we're still checking (on first load, or right after login)
  // - use this to show a spinner instead of flashing "not logged in" content
  loading: boolean;
}

// This hook listens to Firebase's auth state ONE time per app (mount it once
// high up, e.g. in the dashboard layout) and re-checks the "isAdmin" flag in
// Firestore whenever the logged-in user changes.
//
// Why check "isAdmin" here too, and not just in the login form?
// Because someone could still have a valid Firebase session (e.g. an old
// cookie/token) even if they're not an admin - this hook is what protects
// the dashboard routes directly, not just the login screen.
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Change "users" to your actual collection name if it's different
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      setIsAdmin(userSnap.exists() && userSnap.data().isAdmin === true);
      setLoading(false);
    });

    // cleanup: stop listening when the component using this hook unmounts
    return () => unsubscribe();
  }, []);

  return { user, isAdmin, loading };
}
