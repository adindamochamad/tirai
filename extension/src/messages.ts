export type ContentRequest =
  | { type: "count" }
  | { type: "clear" };

export type ContentResponse = { count: number } | { ok: true };

export function isContentRequest(value: unknown): value is ContentRequest {
  if (!value || typeof value !== "object") return false;
  const type = (value as { type?: unknown }).type;
  return type === "count" || type === "clear";
}
