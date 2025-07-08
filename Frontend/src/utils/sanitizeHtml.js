import DOMPurify from "dompurify";

export function sanitizeHtml(dirty) {
  return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
}

export function sanitizeText(text) {
  if (typeof text !== "string") return text;
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

export function sanitizeUserInput(input) {
  if (typeof input === "string") {
    return sanitizeText(input);
  }
  if (typeof input === "object" && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeUserInput(value);
    }
    return sanitized;
  }
  return input;
}
