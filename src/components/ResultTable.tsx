import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SearchResult } from "../types";

type ResultCategory = "bio" | "knowledge" | "mixed";

interface Props {
  results: SearchResult[];
}

function detectCategory(results: SearchResult[]): ResultCategory {
  const types = new Set(results.map((r) => r.document_type));
  if (types.size === 1 && types.has("bio")) return "bio";
  if (types.size === 1 && types.has("knowledge_library")) return "knowledge";
  return "mixed";
}

function formatDocType(docType: string): string {
  if (docType === "bio") return "Bio";
  if (docType === "knowledge_library") return "Knowledge Library";
  return docType;
}

/* ── Keyword tags (matches original's comma-split Taggings rendering) ── */
function KeywordTags({ raw }: { raw: unknown }) {
  if (!raw || String(raw).trim() === "") {
    return <span className="km-not-specified">Not Specified</span>;
  }
  const tags = String(raw).split(",").map((k) => k.trim()).filter(Boolean);
  return (
    <div className="km-keywords">
      {tags.map((tag) => (
        <span key={tag} className="km-keyword-tag">{tag}</span>
      ))}
    </div>
  );
}

/* ── Expandable summary (matches original's 120-char "more/less" toggle) ── */
const ExpandableSummary: React.FC<{ text: string }> = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text || text === "-") return <span>-</span>;
  if (text.length <= 120) return <span>{text}</span>;
  return (
    <span>
      {expanded ? text : text.substring(0, 120).trim() + "..."}
      <button
        className="km-read-more"
        onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
        type="button"
      >
        {expanded ? " less" : " more"}
      </button>
    </span>
  );
};

/* ── Modal Component ── */

interface ModalProps {
  results: SearchResult[];
  onClose: () => void;
}

const KnowMoreModal: React.FC<ModalProps> = ({ results, onClose }) => {
  const allBios = results.every((r) => r.document_type === "bio");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="km-modal-overlay" onClick={onClose}>
      <div
        className="km-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Document details"
      >
        <div className="km-modal-header">
          <div className="km-modal-header-left">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="km-modal-header-icon"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <h3>
              Document Details
              <span className="km-modal-count">
                {results.length} document{results.length !== 1 ? "s" : ""}
              </span>
            </h3>
          </div>
          <button
            className="km-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
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

        <div className="km-modal-body">
          <div className="km-table-scroll">
            <table className="km-table">
              <thead>
                <tr>
                  <th className="km-th">Document Type</th>
                  <th className="km-th km-th-name">Document Name</th>
                  <th className="km-th">Year</th>
                  {!allBios && <th className="km-th">Industry</th>}
                  <th className="km-th">Keywords</th>
                  <th className="km-th km-th-summary">Summary</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <tr
                    className="km-tr"
                    key={`${result.document_name}-${idx}`}
                  >
                    <td className="km-td km-td-doctype">
                      {formatDocType(result.document_type)}
                    </td>
                    <td className="km-td km-td-name">
                      {result.link ? (
                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="km-doc-link"
                        >
                          {result.document_name}
                        </a>
                      ) : (
                        result.document_name
                      )}
                    </td>
                    <td className="km-td km-td-year">
                      {result.year || "-"}
                    </td>
                    {!allBios && (
                      <td className="km-td">{result.industry || "-"}</td>
                    )}
                    <td className="km-td km-td-tags">
                      <KeywordTags raw={result.taggings} />
                    </td>
                    <td className="km-td km-td-summary">
                      <ExpandableSummary text={result.summary || ""} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main Table ── */

export const ResultTable: React.FC<Props> = ({ results }) => {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [docTypeFilter, setDocTypeFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);

  const category = useMemo(() => detectCategory(results), [results]);

  const filteredResults = useMemo(() => {
    if (docTypeFilter === "all") return results;
    return results.filter((r) => r.document_type === docTypeFilter);
  }, [results, docTypeFilter]);

  const allSelected =
    filteredResults.length > 0 &&
    filteredResults.every((_, idx) => selected.has(idx));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredResults.map((_, idx) => idx)));
    }
  };

  const toggleSelect = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const middleColHeader =
    category === "bio"
      ? "Designation"
      : category === "knowledge"
        ? "Knowledge Type"
        : "Content Type";

  const getMiddleColValue = (result: SearchResult): string => {
    if (category === "bio") return result.designation || "-";
    if (category === "knowledge") return result.knowledge_type || "-";
    return formatDocType(result.document_type);
  };

  const hasMultipleTypes =
    new Set(results.map((r) => r.document_type)).size > 1;

  const modalResults = useMemo(() => {
    if (selected.size === 0) return filteredResults;
    return filteredResults.filter((_, idx) => selected.has(idx));
  }, [filteredResults, selected]);

  const handleOpenModal = useCallback(() => setModalOpen(true), []);
  const handleCloseModal = useCallback(() => setModalOpen(false), []);

  if (filteredResults.length === 0) return null;

  return (
    <div className="results-table-wrapper">
      <div className="results-table-header-bar">
        <svg
          className="results-table-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <div>
          <h3 className="results-table-title">Search Results</h3>
          <p className="results-table-subtitle">
            Found {filteredResults.length} matching profile
            {filteredResults.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="results-table-toolbar">
        <label className="rt-checkbox-label">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="rt-checkbox"
          />
          <span className="rt-checkbox-custom" />
          Select All
        </label>
      </div>

      <div className="results-table-scroll">
        <table className="results-table">
          <thead>
            <tr>
              <th className="rt-th-check" />
              <th className="rt-th-name">
                <div className="rt-th-name-inner">
                  <span>Document Name</span>
                  {hasMultipleTypes && (
                    <div className="doc-filter-dropdown">
                      <select
                        value={docTypeFilter}
                        onChange={(e) => setDocTypeFilter(e.target.value)}
                      >
                        <option value="all">All Documents</option>
                        <option value="bio">Bios</option>
                        <option value="knowledge_library">
                          Knowledge Library
                        </option>
                      </select>
                    </div>
                  )}
                </div>
              </th>
              <th className="rt-th-middle">{middleColHeader}</th>
              <th className="rt-th-summary">Summary</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result, idx) => (
              <tr className="rt-row" key={`${result.document_name}-${idx}`}>
                <td className="rt-td-check">
                  <label className="rt-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selected.has(idx)}
                      onChange={() => toggleSelect(idx)}
                      className="rt-checkbox"
                    />
                    <span className="rt-checkbox-custom" />
                  </label>
                </td>
                <td className="rt-td-name">
                  {result.link ? (
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rt-doc-link"
                    >
                      {result.document_name}
                    </a>
                  ) : (
                    <span className="rt-doc-name">
                      {result.document_name}
                    </span>
                  )}
                </td>
                <td className="rt-td-middle">{getMiddleColValue(result)}</td>
                <td className="rt-td-summary">{result.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rt-explore-more-container">
        <button className="rt-explore-more-btn" onClick={handleOpenModal}>
          Explore More →
          {selected.size > 0 && (
            <span className="rt-know-more-badge">{selected.size}</span>
          )}
        </button>
      </div>

      {modalOpen && (
        <KnowMoreModal results={modalResults} onClose={handleCloseModal} />
      )}
    </div>
  );
};
