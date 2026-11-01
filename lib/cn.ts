/** Joins class names, dropping the falsy ones. Safe on the server and the client. */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
