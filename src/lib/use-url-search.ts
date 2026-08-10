"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useDebounce } from "@/lib/use-debounce";

export function useUrlSearchParam(param = "search") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramValue = searchParams.get(param) ?? "";

  const [value, setValue] = useState(paramValue);

  useEffect(() => {
    setValue(paramValue);
  }, [paramValue]);

  const setSearch = useCallback(
    (next: string) => {
      setValue(next);

      const params = new URLSearchParams(searchParams.toString());
      const trimmed = next.trim();

      if (trimmed) params.set(param, trimmed);
      else params.delete(param);

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [param, pathname, router, searchParams]
  );

  return {
    value,
    setSearch,
    query: paramValue.trim(),
  };
}

export function useDebouncedUrlSearchParam(param = "search", delay = 300) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramValue = searchParams.get(param) ?? "";

  const [value, setValue] = useState(paramValue);
  const debouncedValue = useDebounce(value, delay);

  useEffect(() => {
    setValue(paramValue);
  }, [paramValue]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = debouncedValue.trim();

    if (trimmed) params.set(param, trimmed);
    else params.delete(param);

    const qs = params.toString();
    const nextUrl = qs ? `${pathname}?${qs}` : pathname;
    const currentUrl = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [debouncedValue, param, pathname, router, searchParams]);

  return {
    value,
    setValue,
    query: debouncedValue.trim(),
  };
}

export function useUrlParam(param: string) {
  const searchParams = useSearchParams();

  return (searchParams.get(param) ?? "").trim();
}
