import { useCallback, useState } from "react";
import { SearchFilters, SearchHistoryEntry, SearchResult } from "../types";

const STORAGE_KEY = "bts_search_history";
const MAX_ENTRIES = 50;

function loadEntries(): SearchHistoryEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveEntries(entries: SearchHistoryEntry[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // sessionStorage quota exceeded — silently drop oldest entries
  }
}

export function useSearchHistory() {
  const [entries, setEntries] = useState<SearchHistoryEntry[]>(loadEntries);

  const addEntry = useCallback(
    (
      query: string,
      filters: SearchFilters,
      resultCount: number,
      cachedResults: SearchResult[]
    ) => {
      const entry: SearchHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        query,
        filters,
        resultCount,
        timestamp: Date.now(),
        cachedResults,
      };
      setEntries((prev) => {
        const next = [entry, ...prev].slice(0, MAX_ENTRIES);
        saveEntries(next);
        return next;
      });
    },
    []
  );

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveEntries(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return { entries, addEntry, removeEntry, clearHistory };
}
