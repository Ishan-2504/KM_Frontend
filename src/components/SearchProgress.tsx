import React, { useEffect, useState } from "react";
import { SearchPhase } from "../hooks/useSSESearch";

interface Props {
  phase: SearchPhase;
  resultCount: number;
}

const PIPELINE_MESSAGES = [
  "Expanding your query...",
  "Analyzing intent and filters...",
  "Searching the knowledge base...",
  "Ranking and scoring results...",
  "Almost there...",
];

const CYCLE_MS = 1200;

export const SearchProgress: React.FC<Props> = ({ phase, resultCount }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (phase !== "connecting" && phase !== "searching") return;
    setMessageIndex(0);
    const interval = setInterval(() => {
      setMessageIndex((prev) =>
        prev < PIPELINE_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, CYCLE_MS);
    return () => clearInterval(interval);
  }, [phase]);

  if (phase === "streaming") {
    return (
      <div className="search-progress">
        <div className="search-progress-icon streaming">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div className="search-progress-message" key="streaming">
          Streaming results... <span className="search-progress-count">{resultCount} found</span>
        </div>
        <div className="search-progress-bar">
          <div className="search-progress-bar-fill" />
        </div>
      </div>
    );
  }

  return (
    <div className="search-progress">
      <div className="search-progress-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="search-progress-message" key={messageIndex}>
        {PIPELINE_MESSAGES[messageIndex]}
      </div>
      <div className="search-progress-steps">
        {PIPELINE_MESSAGES.map((_, i) => (
          <div
            key={i}
            className={`search-progress-step${i <= messageIndex ? " active" : ""}`}
          />
        ))}
      </div>
      <div className="search-progress-bar">
        <div className="search-progress-bar-fill" />
      </div>
    </div>
  );
};
