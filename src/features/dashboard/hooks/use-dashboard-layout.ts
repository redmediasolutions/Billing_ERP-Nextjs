"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/use-auth";

import {
  DEFAULT_DASHBOARD_MODULES,
} from "../lib/dashboard-modules";
import type { DashboardLayoutPrefs, DashboardModuleId } from "../types";

const STORAGE_VERSION = 1;
const STORAGE_PREFIX = "erp-dashboard-modules-v1";

function storageKey(uid: string) {
  return `${STORAGE_PREFIX}:${uid}`;
}

function parsePrefs(raw: string | null): DashboardModuleId[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DashboardLayoutPrefs | DashboardModuleId[];
    if (Array.isArray(parsed)) {
      return parsed
        .map((id) =>
          String(id) === "reminders" ? "renewals" : (id as DashboardModuleId)
        )
        .filter(isValidModule);
    }
    if (parsed?.version === STORAGE_VERSION && Array.isArray(parsed.modules)) {
      return parsed.modules
        .map((id) =>
          String(id) === "reminders" ? "renewals" : (id as DashboardModuleId)
        )
        .filter(isValidModule);
    }
  } catch {
    return null;
  }
  return null;
}

function isValidModule(value: unknown): value is DashboardModuleId {
  return (
    typeof value === "string" &&
    DEFAULT_DASHBOARD_MODULES.includes(value as DashboardModuleId)
  );
}

export function useDashboardLayout() {
  const { user } = useAuth();
  const [modules, setModules] = useState<DashboardModuleId[]>(
    DEFAULT_DASHBOARD_MODULES
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setModules(DEFAULT_DASHBOARD_MODULES);
      setReady(true);
      return;
    }

    const saved = parsePrefs(localStorage.getItem(storageKey(user.uid)));
    setModules(saved?.length ? saved : DEFAULT_DASHBOARD_MODULES);
    setReady(true);
  }, [user?.uid]);

  const enabled = useMemo(() => new Set(modules), [modules]);

  const persist = useCallback(
    (next: DashboardModuleId[]) => {
      const unique = DEFAULT_DASHBOARD_MODULES.filter((id) =>
        next.includes(id)
      );
      setModules(unique.length ? unique : DEFAULT_DASHBOARD_MODULES);

      if (!user?.uid) return;

      const payload: DashboardLayoutPrefs = {
        version: STORAGE_VERSION,
        modules: unique.length ? unique : DEFAULT_DASHBOARD_MODULES,
      };
      try {
        localStorage.setItem(storageKey(user.uid), JSON.stringify(payload));
      } catch {
        // ignore quota / private mode
      }
    },
    [user?.uid]
  );

  const reset = useCallback(() => {
    persist(DEFAULT_DASHBOARD_MODULES);
  }, [persist]);

  return {
    ready,
    modules,
    enabled,
    setModules: persist,
    reset,
  };
}
