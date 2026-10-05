export const CHECKLIST = [
  'Limitation of Liability', 'Indemnification', 'Termination', 'Confidentiality',
  'Intellectual Property', 'Data Protection', 'Payment Terms', 'Governing Law and Jurisdiction',
  'Dispute Resolution', 'Force Majeure', 'Warranties', 'Service Levels / Performance',
];

export const SYSTEM_PROMPT = `You are a careful contract review assistant supporting a lawyer. You identify provisions that are unfavourable, one-sided, incomplete or risky for the party you are told to protect. You never invent contract text.
Rules:
- "text" must be copied EXACTLY from the contract excerpt, word for word.
- Only report clauses that are actually present in the excerpt.
- Respond with a single JSON object and nothing else.`;

export function buildPrompt({ chunk, perspective, index, total }) {
  return `Review for: ${perspective}. Excerpt ${index + 1} of ${total}.

Return JSON of this shape:
{
  "clauses": [{ "title": string, "section": string (number as written, or "Unnumbered"), "risk": "high"|"moderate"|"low",
    "oneSided": boolean, "incomplete": boolean, "text": string (exact quote),
    "issue": string, "negotiation": string, "revision": string (suggested replacement wording) }],
  "missingClauses": [{ "title": string, "issue": string, "revision": string }]
}
Only list clauses that raise a concern. For "missingClauses", check ONLY this checklist and list items absent from this excerpt: ${CHECKLIST.join('; ')}.

CONTRACT EXCERPT:
"""
${chunk}
"""`;
}
