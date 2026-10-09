import React from "react";
import { SearchPhase } from "../hooks/useSSESearch";
import { SearchResult } from "../types";
import { ResultTable } from "./ResultTable";
import { SearchProgress } from "./SearchProgress";

interface Props {
  results: SearchResult[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  totalResults: number | null;
  totalRelevant: number | null;
  elapsedSeconds: number | null;
  hasMore: boolean;
  endMessage: string | null;
  onLoadMore: () => void;
  searchPhase: SearchPhase;
}

export const ResultList: React.FC<Props> = ({
  results,
  loading,
  loadingMore,
  error,
  totalResults,
  totalRelevant,
  elapsedSeconds,
  hasMore,
  endMessage,
  onLoadMore,
  searchPhase,
}) => {
  return (
    <div className="result-list">
      {error && <div className="error-banner">{error}</div>}

      {loading && results.length === 0 && (
        <SearchProgress phase={searchPhase} resultCount={results.length} />
      )}

      {results.length === 0 && !loading && totalResults === null && (
        <div className="empty-state">
          <p>Enter a query or apply filters to search the knowledge base.</p>
        </div>
      )}

      {results.length === 0 && !loading && totalResults === 0 && (
        <div className="empty-state">
          <p>No results found. Try broadening your search or adjusting filters.</p>
        </div>
      )}

      {results.length > 0 && <ResultTable results={results} />}

      {loading && results.length > 0 && (
        <div className="loading-more">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      )}

      {loadingMore && (
        <div className="loading-more">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      )}

      {!loading && !loadingMore && hasMore && results.length > 0 && (
        <div className="show-more-container">
          <button className="show-more-btn" onClick={onLoadMore}>
            Show More Results
          </button>
        </div>
      )}

      {!loading && !loadingMore && !hasMore && endMessage && results.length > 0 && (
        <div className="end-of-results">
          <p>{endMessage}</p>
        </div>
      )}
    </div>
  );
};
