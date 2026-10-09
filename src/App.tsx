import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { ChatPanel } from "./components/ChatPanel";
import { FilterPanel } from "./components/FilterPanel";
import { QuickSearchSuggestions } from "./components/QuickSearchSuggestions";
import { ResultList } from "./components/ResultList";
import { SearchBar } from "./components/SearchBar";
import { SearchHistory } from "./components/SearchHistory";
import { useChat } from "./hooks/useChat";
import { useSearchHistory } from "./hooks/useSearchHistory";
import { useSSESearch } from "./hooks/useSSESearch";
import { fetchFilters } from "./services/api";
import {
  FilterOptions,
  SearchFilters,
  SearchHistoryEntry,
  SearchResult,
} from "./types";

const App: React.FC = () => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const [cachedView, setCachedView] = useState<{
    results: SearchResult[];
    totalResults: number;
  } | null>(null);

  const {
    results, loading, loadingMore, error,
    totalResults, totalRelevant, elapsedSeconds,
    hasMore, endMessage, searchPhase, search, loadMore,
  } = useSSESearch();
  const { entries, addEntry, removeEntry, clearHistory } = useSearchHistory();
  const {
    messages: chatMessages,
    streaming: chatStreaming,
    error: chatError,
    documentContext,
    setDocumentContext,
    sendMessage: sendChatMessage,
  } = useChat();
  const lastSearchQueryRef = useRef("");
  const lastSearchFiltersRef = useRef<SearchFilters>({});
  const pendingHistoryRef = useRef(false);
  const lastContextResultsRef = useRef<SearchResult[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchFilters({ document_type: filters.document_type }, controller.signal)
      .then(setFilterOptions)
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to load filter options:", err);
        }
      });
    return () => controller.abort();
  }, [filters.document_type]);

  useEffect(() => {
    if (pendingHistoryRef.current && !loading && totalResults !== null) {
      addEntry(
        lastSearchQueryRef.current,
        lastSearchFiltersRef.current,
        totalResults,
        results
      );
      pendingHistoryRef.current = false;
    }
    if (!loading && results.length > 0 && results !== lastContextResultsRef.current) {
      lastContextResultsRef.current = results;
      setDocumentContext(results);
    }
  }, [loading, totalResults, addEntry, results, setDocumentContext]);

  const handleSearch = useCallback(
    (q: string) => {
      setCachedView(null);
      lastSearchQueryRef.current = q;
      lastSearchFiltersRef.current = { ...filters };

      const cleanFilters: SearchFilters = {};
      for (const [k, v] of Object.entries(filters)) {
        if (v) (cleanFilters as any)[k] = v;
      }

      const hasQuery = q.trim().length > 0;
      const hasFilters = Object.keys(cleanFilters).length > 0;

      if (!hasQuery && !hasFilters) return;

      pendingHistoryRef.current = true;
      search({
        query: q,
        filters: hasFilters ? cleanFilters : undefined,
      });
    },
    [filters, search]
  );

  const handleRefresh = useCallback(() => {
    setQuery("");
    setFilters({});
    setCachedView(null);
  }, []);

  const handleHistorySelect = useCallback(
    (entry: SearchHistoryEntry) => {
      setQuery(entry.query);
      setFilters(entry.filters);
      setHistoryOpen(false);

      setCachedView({
        results: entry.cachedResults,
        totalResults: entry.resultCount,
      });
      setDocumentContext(entry.cachedResults);
    },
    [setDocumentContext]
  );

  const displayResults = cachedView ? cachedView.results : results;
  const displayTotal = cachedView ? cachedView.totalResults : totalResults;
  const displayTotalRelevant = cachedView ? null : totalRelevant;
  const displayElapsed = cachedView ? null : elapsedSeconds;
  const displayLoading = cachedView ? false : loading;
  const displayLoadingMore = cachedView ? false : loadingMore;
  const displayError = cachedView ? null : error;
  const displayHasMore = cachedView ? false : hasMore;
  const displayEndMessage = cachedView ? null : endMessage;
  const displaySearchPhase = cachedView ? "idle" as const : searchPhase;
  const hasResultsToShow =
    displayResults.length > 0 || displayTotal !== null || displayLoading;

  return (
    <div className="app">
      <div className="header-outer">
        <header className="app-header">
          <div className="beta-badge">
            <span>BETA</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="header-logo-wrap">
            <img src={process.env.PUBLIC_URL + "/A_M.png"} alt="logo" className="header-logo" />
          </div>
          <div className="header-text">
            <h1>Knowledge Search</h1>
            <p className="app-subtitle">
              Search and analyze Knowledge Content and Bios
            </p>
          </div>
        </header>
      </div>

      <div className="action-bar">
        <button
          className="action-btn action-btn-history"
          onClick={() => setHistoryOpen(true)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Search History
        </button>

        <button
          className="action-btn action-btn-upload"
          onClick={() =>
            window.open(
              "https://apps.powerapps.com/play/e/e37605ef-1954-ed84-9955-2c2994868801/a/6642b425-fb80-4c9d-aa39-2a9319c61ab2?paSBU=BTS#",
              "_blank"
            )
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload New Document
        </button>
      </div>

      <main className="main-content">
        <div className="content-card">
          <FilterPanel
            filters={filters}
            options={filterOptions}
            onChange={setFilters}
          />
        </div>

        <div className="content-card">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onSearch={handleSearch}
            loading={displayLoading}
          />

          <QuickSearchSuggestions
            onSuggestionClick={setQuery}
            onRefresh={handleRefresh}
          />
        </div>
      </main>

      {hasResultsToShow && (
        <div className="results-wrapper">
          <ResultList
            results={displayResults}
            loading={displayLoading}
            loadingMore={displayLoadingMore}
            error={displayError}
            totalResults={displayTotal}
            totalRelevant={displayTotalRelevant}
            elapsedSeconds={displayElapsed}
            hasMore={displayHasMore}
            endMessage={displayEndMessage}
            onLoadMore={loadMore}
            searchPhase={displaySearchPhase}
          />
        </div>
      )}

      {!chatOpen && (
        <button
          className="ai-assistant-btn"
          type="button"
          onClick={() => setChatOpen(true)}
        >
          <div className="ai-btn-icon-wrap">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="ai-btn-pulse" />
          </div>
          Document AI Assistant
        </button>
      )}

      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        streaming={chatStreaming}
        error={chatError}
        searchLoading={displayLoading}
        documentContext={documentContext.current}
        onSendMessage={sendChatMessage}
      />

      {historyOpen && (
        <SearchHistory
          entries={entries}
          onSelect={handleHistorySelect}
          onRemove={removeEntry}
          onClear={clearHistory}
          onClose={() => setHistoryOpen(false)}
        />
      )}

      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>Need Help?</span>
          <span className="app-footer-sep">•</span>
          <span>Contact BTS Support:</span>
          <a href="mailto:KMBTSIndia@alvarezandmarsal.com" className="app-footer-link">
            KMBTSIndia@alvarezandmarsal.com
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
