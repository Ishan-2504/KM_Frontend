import React from "react";

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  loading: boolean;
}

export const SearchBar: React.FC<Props> = ({ query, onQueryChange, onSearch, loading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="search-section">
      <div className="search-section-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Search Expertise
      </div>
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <svg className="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search for expertise, industries, or documents..."
          />
        </div>
        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="search-btn-spinner" />
              Searching...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </>
          )}
        </button>
      </form>
    </div>
  );
};
