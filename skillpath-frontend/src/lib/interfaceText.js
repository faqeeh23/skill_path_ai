/** Presentation cleanup for older saved learning records. Storage stays unchanged. */
export function interfaceText(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/\[simulation\]\s*/gi, "")
    .replace(/\b(?:demo|simulated|simulation|mock)\b\s*/gi, "")
    .replace(/\bfrontend demonstration\b/gi, "")
    .replace(/ {2,}/g, " ")
    .trim();
}
