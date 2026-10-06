export const norm = (s) => String(s).replace(/\s+/g, ' ').trim().toLowerCase();

/** 1-based page number containing a quote, or null (DOCX/TXT have no pages). */
export function findPage(normalizedPages, quote) {
  if (!normalizedPages || !quote) return null;
  const q = norm(quote);
  for (const probe of [q, q.slice(0, 80)]) {
    const i = normalizedPages.findIndex((p) => p.includes(probe));
    if (i >= 0) return i + 1;
  }
  return null;
}
