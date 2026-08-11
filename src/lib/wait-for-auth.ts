import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/firebase/config";

let authReady: Promise<User | null> | null = null;

/**
 * Wait until Firebase finishes restoring the persisted session.
 * `auth.currentUser` is often null for a moment after navigation/remount
 * even when the user is still signed in.
 */
export function waitForAuthUser(): Promise<User | null> {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  if (!authReady) {
    authReady = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        authReady = null;
        resolve(user);
      });
    });
  }

  return authReady;
}
