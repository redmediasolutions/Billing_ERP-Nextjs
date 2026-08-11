"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/firebase/config";

/**
 * Clears React Query cache whenever the signed-in Firebase user changes.
 * Prevents Tenant A data from leaking into Tenant B's session after logout/login.
 */
export function AuthQueryGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    let previousUid: string | null | undefined;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const nextUid = user?.uid ?? null;

      // Only clear when leaving a real session (logout or account switch).
      // Avoid wiping cache on the initial null→user restore race.
      if (previousUid && previousUid !== nextUid) {
        queryClient.clear();
      }

      previousUid = nextUid;
    });

    return unsubscribe;
  }, [queryClient]);

  return <>{children}</>;
}
