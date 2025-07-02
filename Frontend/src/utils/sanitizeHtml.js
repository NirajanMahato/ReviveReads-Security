import DOMPurify from "dompurify";

export function sanitizeHtml(dirty) {
  return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
}
