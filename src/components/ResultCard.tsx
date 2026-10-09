import React from "react";
import { SearchResult } from "../types";

interface Props {
  result: SearchResult;
}

export const ResultCard: React.FC<Props> = ({ result }) => {
  const tags: string[] = [];
  if (result.document_type) tags.push(result.document_type === "bio" ? "Bio" : "Knowledge Library");
  if (result.designation) tags.push(result.designation);
  if (result.knowledge_type) tags.push(result.knowledge_type);
  if (result.industry) tags.push(result.industry);
  if (result.solution) tags.push(result.solution);
  if (result.year) tags.push(result.year);

  return (
    <div className="result-card">
      <div className="result-header">
        <span className="result-rank">#{result.rank}</span>
        <h4 className="result-title">{result.document_name}</h4>
        {(result.relevance_pct ?? result.similarity_score) !== null && (
          <span className="result-score">
            {result.relevance_pct !== null && result.relevance_pct !== undefined
              ? `${result.relevance_pct.toFixed(1)}% match`
              : result.similarity_score !== null
                ? `${(result.similarity_score * 100).toFixed(1)}% match`
                : ""}
          </span>
        )}
      </div>

      <p className="result-summary">{result.summary}</p>

      <div className="result-tags">
        {tags.map((tag, i) => (
          <span key={i} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="result-meta">
        {result.client_name && (
          <span className="meta-item">Client: {result.client_name}</span>
        )}
        {result.client_type && (
          <span className="meta-item">Type: {result.client_type}</span>
        )}
        {result.sub_industry && (
          <span className="meta-item">Sub-Industry: {result.sub_industry}</span>
        )}
      </div>

      {result.link && (
        <a
          href={result.link}
          target="_blank"
          rel="noopener noreferrer"
          className="result-link"
        >
          Open in SharePoint
        </a>
      )}
    </div>
  );
};
