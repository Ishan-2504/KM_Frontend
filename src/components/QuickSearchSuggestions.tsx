import React from "react";

const SUGGESTIONS = [
  "Operational Due Diligence in IT",
  "Due Diligence Experts",
  "Commercial Due Diligence in Healthcare",
  "GenAI",
  "Supply Chain",
];

interface Props {
  onSuggestionClick: (query: string) => void;
  onRefresh: () => void;
}

export const QuickSearchSuggestions: React.FC<Props> = ({ onSuggestionClick, onRefresh }) => {
  return (
    <div className="suggestions-section">
      {/* Divider above suggestions — matches original's border-t border-gray-200 my-6 */}
      <div className="suggestions-divider" />

      <div className="suggestions-title">
        {/* Lightbulb icon — matches original */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Quick Search Suggestions
      </div>

      <div className="suggestions-list-wrapper">
        <div className="suggestions-list">
          {SUGGESTIONS.map((text) => (
            <button
              key={text}
              className="suggestion-pill"
              onClick={() => onSuggestionClick(text)}
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Divider below suggestions — matches original's border-t border-gray-200 my-6 */}
      <div className="suggestions-divider" />

      <div className="refresh-btn-wrap">
        <button className="refresh-btn" onClick={onRefresh} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh Search
        </button>
      </div>
    </div>
  );
};
