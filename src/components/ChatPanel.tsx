import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChatMessage, SearchResult } from "../types";

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  streaming: boolean;
  error: string | null;
  searchLoading: boolean;
  documentContext: SearchResult[];
  onSendMessage: (text: string) => void;
}

const MAX_CHARS = 500;

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  open,
  onClose,
  messages,
  streaming,
  error,
  searchLoading,
  documentContext,
  onSendMessage,
}) => {
  const [input, setInput] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasDocuments = documentContext.length > 0;
  const inputDisabled = streaming || searchLoading || !hasDocuments;

  useEffect(() => {
    // Optional-call the method: it is missing in jsdom and some embedded webviews.
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, streaming]);

  const suggestions = useMemo(() => {
    if (!documentContext.length) return [];

    const industries = new Set<string>();
    const solutions = new Set<string>();
    const types = new Set<string>();

    documentContext.forEach((doc) => {
      if (doc.industry) industries.add(doc.industry);
      if (doc.solution) solutions.add(doc.solution);
      if (doc.document_type) types.add(doc.document_type);
    });

    const items: string[] = [];
    if (industries.size > 0) {
      const ind = Array.from(industries).slice(0, 2).join(" and ");
      items.push(`What are the key themes in the ${ind} documents?`);
    }
    if (solutions.size > 0) {
      items.push(`Summarize the solutions mentioned across these documents`);
    }
    if (documentContext.length > 1) {
      items.push(`Compare the top documents by relevance`);
    }
    items.push(`What clients are referenced in these documents?`);

    return items.slice(0, 4);
  }, [documentContext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || inputDisabled) return;
    onSendMessage(input);
    setInput("");
  };

  const handleSuggestionClick = (text: string) => {
    if (inputDisabled) return;
    onSendMessage(text);
  };

  const placeholderText = searchLoading
    ? "Waiting for search results..."
    : !hasDocuments
    ? "Run a search to start chatting..."
    : "Ask about the documents in view...";

  return (
    <div className={`chat-panel ${open ? "chat-panel--open" : ""}`}>
      <div className="chat-panel__header">
        <div className="chat-panel__header-left">
          <svg
            className="chat-panel__sparkle"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
          </svg>
          <span className="chat-panel__title">Document AI Assistant</span>
        </div>
        <div className="chat-panel__header-actions">
          <button
            className="chat-panel__header-btn"
            onClick={onClose}
            title="Close"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            className="chat-panel__header-btn"
            onClick={onClose}
            title="Close"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="chat-panel__subtitle">
        Ask me about the documents in view
      </div>

      <div className="chat-panel__messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg chat-msg--${msg.role}`}>
            {msg.role === "system" ? (
              <div className="chat-msg__system">
                <span className="chat-msg__system-icon">✦</span>
                <div>
                  <span className="chat-msg__system-label">Document AI Assistant</span>
                  <span className="chat-msg__system-time">{formatTime(msg.timestamp)}</span>
                  <p className="chat-msg__system-text">{msg.content}</p>
                </div>
              </div>
            ) : msg.role === "user" ? (
              <div className="chat-msg__user">
                <p className="chat-msg__user-text">{msg.content}</p>
                <span className="chat-msg__time">{formatTime(msg.timestamp)}</span>
              </div>
            ) : (
              <div className="chat-msg__assistant">
                <span className="chat-msg__assistant-icon">✦</span>
                <div className="chat-msg__assistant-body">
                  <p className="chat-msg__assistant-text">
                    {msg.content}
                    {streaming &&
                      messages[messages.length - 1]?.id === msg.id && (
                        <span className="chat-msg__cursor">▌</span>
                      )}
                  </p>
                  <span className="chat-msg__time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {error && (
          <div className="chat-msg chat-msg--error">
            <p className="chat-msg__error-text">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {suggestions.length > 0 && hasDocuments && !streaming && (
        <div className="chat-panel__suggestions">
          <button
            className="chat-panel__suggestions-toggle"
            onClick={() => setSuggestionsOpen((v) => !v)}
            type="button"
          >
            <span>Try asking suggestions</span>
            <svg
              className={`chat-panel__suggestions-chevron ${
                suggestionsOpen ? "chat-panel__suggestions-chevron--open" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {suggestionsOpen && (
            <div className="chat-panel__suggestions-list">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="chat-panel__suggestion-chip"
                  onClick={() => handleSuggestionClick(s)}
                  type="button"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <form className="chat-panel__input-area" onSubmit={handleSubmit}>
        <div className="chat-panel__input-wrapper">
          <input
            type="text"
            className="chat-panel__input"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
            placeholder={placeholderText}
            disabled={inputDisabled}
            maxLength={MAX_CHARS}
          />
          <button
            type="submit"
            className="chat-panel__send-btn"
            disabled={inputDisabled || !input.trim() || input.length > MAX_CHARS}
            title="Send message"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <span className="chat-panel__char-count">
          {input.length} / {MAX_CHARS}
        </span>
      </form>
    </div>
  );
};
