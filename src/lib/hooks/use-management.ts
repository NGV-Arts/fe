"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/utils/api-error";

export function useResource<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);
  const reload = useCallback(async () => {
    const id = ++request.current;
    setLoading(true);
    setError(null);
    try {
      const result = await loader();
      if (id === request.current) setData(result);
      return result;
    } catch (error) {
      if (id === request.current)
        setError(
          getApiErrorMessage(error, "Unable to load data. Please try again."),
        );
      return null;
    } finally {
      if (id === request.current) setLoading(false);
    }
  }, [loader]);
  useEffect(() => {
    void reload();
    const version = request;
    return () => {
      version.current++;
    };
  }, [reload]);
  return { data, loading, error, reload };
}
export function useMutation() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const clear = () => {
    setError(null);
    setSuccess(null);
  };
  const run = async (action: () => Promise<void>, message: string) => {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    clear();
    try {
      await action();
      setSuccess(message);
      return true;
    } catch (error) {
      setError(getApiErrorMessage(error));
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return { busy, error, success, run, clear };
}
export function useDebouncedSearch(value: string) {
  const [query, setQuery] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setQuery(value.trim().toLowerCase()), 300);
    return () => clearTimeout(timer);
  }, [value]);
  return query;
}
