import React from "react";
import { FilterOptions, SearchFilters } from "../types";

interface Props {
  filters: SearchFilters;
  options: FilterOptions | null;
  onChange: (filters: SearchFilters) => void;
}

const UNIVERSAL_FIELDS: (keyof SearchFilters)[] = ["document_type", "year"];
const BIO_FIELDS: (keyof SearchFilters)[] = ["designation"];
const KL_FIELDS: (keyof SearchFilters)[] = [
  "industry",
  "sub_industry",
  "knowledge_type",
  "knowledge_sub_type",
  "solution",
  "client_name",
  "client_type",
];

const FIELD_LABELS: Record<string, string> = {
  document_type: "Content Type",
  designation: "Designation",
  industry: "Industry",
  sub_industry: "Sub Industry",
  knowledge_type: "Knowledge Type",
  knowledge_sub_type: "Knowledge Sub-Type",
  solution: "Solution",
  client_name: "Client Name",
  client_type: "Client Type",
  year: "Year",
};

const VALUE_LABELS: Record<string, string> = {
  bio: "Bio",
  knowledge_library: "Knowledge Library",
};

const ALL_FIELDS: (keyof SearchFilters)[] = [
  "document_type",
  "designation",
  "industry",
  "sub_industry",
  "knowledge_type",
  "knowledge_sub_type",
  "solution",
  "client_type",
  "year",
];

function getVisibleFields(
  docType: string | undefined,
  designation: string | undefined
): (keyof SearchFilters)[] {
  if (docType === "bio") return [...UNIVERSAL_FIELDS, ...BIO_FIELDS];
  if (docType === "knowledge_library") return [...UNIVERSAL_FIELDS, ...KL_FIELDS];
  // Designation is bio-specific — selecting it implies bio mode
  if (!docType && designation) return [...UNIVERSAL_FIELDS, ...BIO_FIELDS];
  return ALL_FIELDS;
}

export const FilterPanel: React.FC<Props> = ({ filters, options, onChange }) => {
  const visibleFields = getVisibleFields(filters.document_type, filters.designation);

  const handleChange = (field: keyof SearchFilters, value: string) => {
    const next: SearchFilters = { ...filters, [field]: value || undefined };

    if (field === "document_type" || field === "designation") {
      const nowVisible = getVisibleFields(next.document_type, next.designation);
      const allFilterKeys = Object.keys(next) as (keyof SearchFilters)[];
      for (const k of allFilterKeys) {
        if (!nowVisible.includes(k)) {
          delete next[k];
        }
      }
    }

    onChange(next);
  };

  const handleRemove = (field: keyof SearchFilters) => {
    const next: SearchFilters = { ...filters };
    delete next[field];
    if (field === "document_type") {
      // clear fields that are no longer visible
      for (const k of ALL_FIELDS) {
        if (k !== "document_type") delete next[k];
      }
    }
    onChange(next);
  };

  const activeEntries = ALL_FIELDS.filter((f) => filters[f]);

  return (
    <div className="filter-section">
      {activeEntries.length > 0 && (
        <div className="active-filters-bar">
          <span className="active-filters-label">Active filters:</span>
          {activeEntries.map((field) => {
            const raw = filters[field]!;
            const display = VALUE_LABELS[raw] ?? raw;
            return (
              <span key={field} className="active-filter-tag">
                <span className="active-filter-tag-label">{FIELD_LABELS[field]}:</span>
                <span>{display}</span>
                <button onClick={() => handleRemove(field)} aria-label={`Remove ${FIELD_LABELS[field]} filter`}>×</button>
              </span>
            );
          })}
          <button className="clear-all-btn" onClick={() => onChange({})}>Clear all</button>
        </div>
      )}
      <div className="filter-section-title">Filter Results</div>
      <div className="filter-grid">
        {visibleFields.map((field) => {
          const rawValues = options?.[field] || [];
          const selected = filters[field];
          const values =
            selected && !rawValues.includes(selected)
              ? [selected, ...rawValues]
              : rawValues;
          return (
            <div className="filter-dropdown" key={field}>
              <select
                value={selected || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                disabled={!options}
              >
                <option value="">{FIELD_LABELS[field] || field}</option>
                {values.map((v) => (
                  <option key={v} value={v}>
                    {VALUE_LABELS[v] ?? v}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};
