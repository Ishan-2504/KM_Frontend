import { ChatMessage, FilterOptions, RankedDocument, SearchFilters, SearchMoreResponse } from "../types";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
export async function fetchFilters(
  activeFilters?: SearchFilters,
  signal?: AbortSignal,
): Promise<FilterOptions> {
  const hasActive =
    activeFilters && Object.values(activeFilters).some((v) => v);

  const res = hasActive
    ? await fetch(`${API_URL}/api/filters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeFilters),
        signal,
      })
    : await fetch(`${API_URL}/api/filters`, { signal });

  if (!res.ok) throw new Error(`Failed to fetch filters: ${res.statusText}`);
  return res.json();
}

export async function healthCheck(): Promise<{ status: string; document_count: number }> {
  const res = await fetch(`${API_URL}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export function getSearchSSEUrl(): string {
  return `${API_URL}/api/search`;
}

export async function fetchMoreResults(
  sessionId: string,
  page: number
): Promise<SearchMoreResponse> {
  const res = await fetch(`${API_URL}/api/search/more`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, page }),
  });
  if (!res.ok) throw new Error(`Failed to fetch more results: ${res.statusText}`);
  return res.json();
}

export async function sendChatMessage(
  messages: ChatMessage[],
  documentNames: string[],
  rankedList: RankedDocument[],
  signal?: AbortSignal
): Promise<Response> {
  const payload = {
    messages: messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content })),
    document_names: documentNames,
    ranked_list: rankedList,
  };

  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) throw new Error(`Chat request failed: ${res.statusText}`);
  return res;
}
