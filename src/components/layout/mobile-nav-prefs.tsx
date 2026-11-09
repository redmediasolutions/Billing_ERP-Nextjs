"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/firebase/config";
import { useAuth } from "@/hooks/use-auth";
import { usePlatformAdmin } from "@/hooks/use-platform-admin";
import { useIsClinicTenant } from "@/features/clinic/hooks/use-clinic";

import { haptic } from "./haptics";
import {
  DEFAULT_FAVORITE_HREFS,
  capFavorites,
  navModulesFor,
  normalizeFavorites,
  toggleFavorite,
  type NavModule,
} from "./nav-modules";

const STORAGE_PREFIX = "erp-mobile-nav-v1";

type MobileNavPrefs = {
  modules: NavModule[];
  favorites: string[];
  ready: boolean;
  toggleFavorite: (href: string) => void;
  replaceFavorite: (index: number, href: string) => void;
};

const MobileNavContext = createContext<MobileNavPrefs | null>(null);

function storageKey(uid: string) {
  return `${STORAGE_PREFIX}:${uid}`;
}

function readLocal(uid: string): unknown {
  try {
    const raw = localStorage.getItem(storageKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { mobileNav?: unknown };
    return parsed?.mobileNav ?? parsed;
  } catch {
    return null;
  }
}

function writeLocal(uid: string, mobileNav: string[]) {
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify({ mobileNav }));
  } catch {
    // Private mode or a full disk should not block the bar.
  }
}

export function MobileNavPrefsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { isPlatformAdmin } = usePlatformAdmin();
  const { isClinic } = useIsClinicTenant();
  const modules = useMemo(
    () => navModulesFor(isPlatformAdmin, isClinic),
    [isPlatformAdmin, isClinic]
  );
  const allowed = useMemo(() => modules.map((item) => item.href), [modules]);
  const allowedKey = allowed.join("|");

  const [favorites, setFavorites] = useState<string[]>(DEFAULT_FAVORITE_HREFS);
  const [ready, setReady] = useState(false);
  const dirtyRef = useRef(false);
  const writeTimer = useRef<number | null>(null);
  const uidRef = useRef(user?.uid);
  uidRef.current = user?.uid;

  const queueRemoteWrite = useCallback((next: string[]) => {
    const uid = uidRef.current;
    if (!uid) return;

    writeLocal(uid, next);
    if (writeTimer.current) window.clearTimeout(writeTimer.current);
    writeTimer.current = window.setTimeout(() => {
      void setDoc(
        doc(db, "userPreferences", uid),
        {
          mobileNav: next,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch(() => {
        // Local cache already has the latest choice.
      });
    }, 400);
  }, []);

  useEffect(() => {
    let cancelled = false;
    dirtyRef.current = false;
    setReady(false);

    const uid = user?.uid;
    const allowedList = allowedKey ? allowedKey.split("|") : [];

    async function load() {
      const fallback = normalizeFavorites(null, allowedList);

      if (!uid) {
        if (!cancelled) {
          setFavorites(fallback);
          setReady(true);
        }
        return;
      }

      const stored = readLocal(uid);
      const local =
        stored == null
          ? normalizeFavorites(null, allowedList)
          : capFavorites(stored, allowedList);
      if (!cancelled) setFavorites(local);

      try {
        const snap = await getDoc(doc(db, "userPreferences", uid));
        if (cancelled || dirtyRef.current) return;

        if (snap.exists() && Array.isArray(snap.data()?.mobileNav)) {
          const remote = capFavorites(snap.data()?.mobileNav, allowedList);
          setFavorites(remote);
          writeLocal(uid, remote);
        }
      } catch {
        // Firestore rules or offline: the per-user browser cache still applies.
      }

      if (!cancelled) setReady(true);
    }

    void load();

    return () => {
      cancelled = true;
      if (writeTimer.current) window.clearTimeout(writeTimer.current);
    };
  }, [user?.uid, allowedKey]);

  const toggle = useCallback(
    (href: string) => {
      setFavorites((current) => {
        const next = toggleFavorite(current, href, allowed);
        const unchanged =
          next.length === current.length &&
          next.every((item, index) => item === current[index]);
        if (unchanged) return current;

        dirtyRef.current = true;
        queueRemoteWrite(next);
        haptic("success");
        return next;
      });
    },
    [allowed, queueRemoteWrite]
  );

  const replaceFavorite = useCallback(
    (index: number, href: string) => {
      if (!allowed.includes(href) || index < 0 || index > 3) return;

      setFavorites((current) => {
        const next = [...normalizeFavorites(current, allowed)];
        const existing = next.indexOf(href);
        if (existing === index) return current;

        if (existing >= 0) {
          const displaced = next[index];
          next[existing] = displaced;
          next[index] = href;
        } else {
          next[index] = href;
        }

        dirtyRef.current = true;
        queueRemoteWrite(next);
        return next;
      });
      haptic("impact");
    },
    [allowed, queueRemoteWrite]
  );

  const value = useMemo(
    () => ({
      modules,
      favorites: capFavorites(favorites, allowed),
      ready,
      toggleFavorite: toggle,
      replaceFavorite,
    }),
    [allowed, favorites, modules, ready, replaceFavorite, toggle]
  );

  return (
    <MobileNavContext.Provider value={value}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNavPrefs() {
  const value = useContext(MobileNavContext);
  if (!value) {
    throw new Error("useMobileNavPrefs must be used inside MobileNavPrefsProvider");
  }
  return value;
}
