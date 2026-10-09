import React from "react";
import { SearchFilters, SearchHistoryEntry } from "../types";

interface Props {
  entries: SearchHistoryEntry[];
  onSelect: (entry: SearchHistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function summarizeFilters(filters: SearchFilters): string {
  const parts: string[] = [];
  if (filters.document_type) parts.push(filters.document_type);
  if (filters.designation) parts.push(filters.designation);
  if (filters.industry) parts.push(filters.industry);
  if (filters.solution) parts.push(filters.solution);
  if (filters.year) parts.push(filters.year);
  if (filters.knowledge_type) parts.push(filters.knowledge_type);
  if (filters.client_type) parts.push(filters.client_type);
  if (filters.sub_industry) parts.push(filters.sub_industry);
  if (filters.knowledge_sub_type) parts.push(filters.knowledge_sub_type);
  return parts.length > 0 ? parts.join(" \u00b7 ") : "";
}

export const SearchHistory: React.FC<Props> = ({
  entries,
  onSelect,
  onRemove,
  onClear,
  onClose,
}) => {
  return (
    <>
      <div className="history-overlay" onClick={onClose} />
      <div className="history-panel">
        <div className="history-panel-header">
          <h2>Search History</h2>
          <div className="history-panel-actions">
            {entries.length > 0 && (
              <button className="history-clear-btn" onClick={onClear}>
                Clear All
              </button>
            )}
            <button className="history-close-btn" onClick={onClose}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="history-panel-body">
          {entries.length === 0 ? (
            <div className="history-empty">
              No search history yet. Your searches will appear here.
            </div>
          ) : (
            entries.map((entry) => {
              const filterSummary = summarizeFilters(entry.filters);
              return (
                <div
                  key={entry.id}
                  className="history-entry"
                  onClick={() => onSelect(entry)}
                >
                  <div className="history-entry-query">
                    {entry.query || "(filter-only search)"}
                  </div>
                  {filterSummary && (
                    <div className="history-entry-filters">{filterSummary}</div>
                  )}
                  <div className="history-entry-meta">
                    <span>
                      {entry.resultCount} result
                      {entry.resultCount !== 1 ? "s" : ""} &middot;{" "}
                      {formatTimestamp(entry.timestamp)}
                    </span>
                    <button
                      className="history-entry-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(entry.id);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
