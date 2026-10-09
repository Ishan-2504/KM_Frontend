import { useCallback, useRef, useState } from "react";
import { sendChatMessage } from "../services/api";
import { ChatMessage, RankedDocument, SearchResult } from "../types";

let nextId = 1;
function uid(): string {
  return `msg-${Date.now()}-${nextId++}`;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const documentContextRef = useRef<SearchResult[]>([]);
  const documentNamesRef = useRef<string[]>([]);
  const rankedListRef = useRef<RankedDocument[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const hasContextRef = useRef(false);

  const setDocumentContext = useCallback(
    (results: SearchResult[]) => {
      documentContextRef.current = results;
      documentNamesRef.current = results.map((r) => r.document_name);
      rankedListRef.current = results.map((r) => ({
        rank: r.rank,
        document_name: r.document_name,
        document_type: r.document_type || "",
        summary: r.summary || "",
      }));

      const text =
        results.length > 0
          ? !hasContextRef.current
            ? `I've analyzed ${results.length} documents. Ask me anything about them!`
            : `New search completed. I've now analyzed ${results.length} new documents. Ask me anything about them!`
          : "No documents found. Please refine your search.";

      hasContextRef.current = true;

      const sysMsg: ChatMessage = {
        id: uid(),
        role: "system",
        content: text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, sysMsg]);
      setError(null);
    },
    []
  );

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || documentNamesRef.current.length === 0) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    const assistantMsg: ChatMessage = {
      id: uid(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreaming(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const allMessages = await new Promise<ChatMessage[]>((resolve) => {
        setMessages((prev) => {
          resolve(prev);
          return prev;
        });
      });

      const response = await sendChatMessage(
        allMessages,
        documentNamesRef.current,
        rankedListRef.current,
        controller.signal
      );

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.token) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.id === assistantMsg.id) {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + data.token,
                  };
                }
                return updated;
              });
            } else if (data.error) {
              setError("Something went wrong. Please try again.");
            }
          } catch {
            // skip malformed JSON lines
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("Something went wrong. Please try again.");
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantMsg.id)
        );
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, []);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    messages,
    streaming,
    error,
    documentContext: documentContextRef,
    setDocumentContext,
    sendMessage,
    cancelStream,
  };
}
