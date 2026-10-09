import { useCallback, useRef, useState } from "react";
import { fetchMoreResults, getSearchSSEUrl } from "../services/api";
import { SearchRequest, SearchResult } from "../types";

export type SearchPhase =
  | "idle"
  | "connecting"
  | "searching"
  | "streaming"
  | "done";

interface SSESearchState {
  results: SearchResult[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  totalResults: number | null;
  totalRelevant: number | null;
  elapsedSeconds: number | null;
  sessionId: string | null;
  hasMore: boolean;
  currentPage: number;
  endMessage: string | null;
  searchPhase: SearchPhase;
}

export function useSSESearch() {
  const [state, setState] = useState<SSESearchState>({
    results: [],
    loading: false,
    loadingMore: false,
    error: null,
    totalResults: null,
    totalRelevant: null,
    elapsedSeconds: null,
    sessionId: null,
    hasMore: false,
    currentPage: 1,
    endMessage: null,
    searchPhase: "idle",
  });

  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (request: SearchRequest) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({
      results: [],
      loading: true,
      loadingMore: false,
      error: null,
      totalResults: null,
      totalRelevant: null,
      elapsedSeconds: null,
      sessionId: null,
      hasMore: false,
      currentPage: 1,
      endMessage: null,
      searchPhase: "connecting",
    });

    try {
      const res = await fetch(getSearchSSEUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Search failed: ${res.statusText}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";
      let seenFirstResult = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            currentEvent = line.slice(6).trim();
            if (currentEvent === "start") {
              setState((prev) => ({ ...prev, searchPhase: "searching" }));
            }
            continue;
          }

          if (line.startsWith("data:")) {
            const rawData = line.slice(5).trim();
            if (!rawData) continue;

            try {
              const parsed = JSON.parse(rawData);

              if (currentEvent === "done" || (parsed.total !== undefined && parsed.elapsed_seconds !== undefined)) {
                setState((prev) => ({
                  ...prev,
                  loading: false,
                  totalResults: parsed.total,
                  totalRelevant: parsed.total_relevant ?? null,
                  elapsedSeconds: parsed.elapsed_seconds,
                  sessionId: parsed.session_id ?? null,
                  hasMore: parsed.has_more ?? false,
                  currentPage: 1,
                  searchPhase: "done",
                }));
              } else if (parsed.document_name !== undefined) {
                if (!seenFirstResult) {
                  seenFirstResult = true;
                  setState((prev) => ({
                    ...prev,
                    results: [...prev.results, parsed as SearchResult],
                    searchPhase: "streaming",
                  }));
                } else {
                  setState((prev) => ({
                    ...prev,
                    results: [...prev.results, parsed as SearchResult],
                  }));
                }
              }
            } catch {
              // skip malformed data lines
            }

            currentEvent = "";
          }
        }
      }

      setState((prev) => ({ ...prev, loading: false, searchPhase: prev.searchPhase === "done" ? "done" : "idle" }));
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        loading: false,
        searchPhase: "idle",
        error: err.message || "Search failed",
      }));
    }
  }, []);

  const loadMore = useCallback(async () => {
    const { sessionId, currentPage, hasMore, loadingMore } = state;
    if (!sessionId || !hasMore || loadingMore) return;

    const nextPage = currentPage + 1;
    setState((prev) => ({ ...prev, loadingMore: true, endMessage: null }));

    try {
      const resp = await fetchMoreResults(sessionId, nextPage);

      if (resp.message && resp.results.length === 0) {
        setState((prev) => ({
          ...prev,
          loadingMore: false,
          hasMore: false,
          endMessage: resp.message || "No more relevant documents found.",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        results: [...prev.results, ...resp.results],
        loadingMore: false,
        hasMore: resp.has_more,
        currentPage: nextPage,
        totalResults: (prev.totalResults ?? 0) + resp.results.length,
        endMessage: resp.has_more ? null : "No more relevant documents found.",
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loadingMore: false,
        error: err.message || "Failed to load more results",
      }));
    }
  }, [state]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, loading: false, searchPhase: "idle" }));
  }, []);

  return { ...state, search, loadMore, cancel };
}
