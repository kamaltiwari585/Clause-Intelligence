import { ROLES, CATEGORIES, RISK_TYPES } from './taxonomy.js';

export const CHECKLIST = {
  buyer: ['Limitation of Liability', 'Indemnification', 'Warranties', 'Service Levels / Service Credits', 'Termination', 'Data Protection', 'Insurance', 'Confidentiality', 'Intellectual Property', 'Governing Law and Jurisdiction', 'Dispute Resolution', 'Force Majeure'],
  provider: ['Limitation of Liability', 'Payment Terms', 'Termination', 'Intellectual Property', 'Indemnification', 'Insurance', 'Confidentiality', 'Force Majeure', 'Governing Law and Jurisdiction', 'Dispute Resolution'],
};

const FOCUS = {
  buyer: ['excessive obligations or liability exposure for the Client', 'unfavourable payment terms', 'weak vendor warranties', 'inadequate indemnity protection', 'unlimited or inappropriate vendor liability caps and exclusions', 'weak termination rights', 'unfavourable renewal / lock-in provisions', 'data, privacy and security risks for the Client', 'missing protections that should favour the Client'],
  provider: ['excessive obligations for the Service Provider', 'unlimited liability exposure', 'broad indemnities', 'unfavourable payment terms', 'excessive warranties', 'unreasonable SLA / service credits', 'one-sided termination rights', 'excessive penalties', 'IP ownership provisions that are too broad', 'unreasonable confidentiality / non-solicitation restrictions', 'unlimited audit / compliance obligations', 'missing protections that should favour the Service Provider'],
};

export const SYSTEM_PROMPT = `You are a careful contract review assistant supporting a lawyer. You analyse contracts from the perspective of ONE selected party. You never simply call a clause "good" or "bad": you work out who it favours and judge it only relative to the selected party. You never invent contract text.
Rules:
- "text" must be copied EXACTLY from the excerpt, word for word.
- Only report clauses actually present in the excerpt.
- Respond with a single JSON object and nothing else.`;

export function buildPrompt({ chunk, role, index, total }) {
  const r = ROLES[role];
  return `Review this contract from the perspective of the ${r.label.toUpperCase()} (the "selected party"). Excerpt ${index + 1} of ${total}.

For each notable clause decide: (1) who benefits, (2) who bears the obligation, (3) who bears the financial/legal risk, (4) is it market-standard, (5) is it one-sided, (6) is it favourable or unfavourable to the selected party, (7) what should the selected party negotiate.
CRITICAL: a clause that favours the selected party is "favourable" and must NOT be flagged as a risk. Example: "Client may terminate at any time on 7 days' notice" is favourable to a Buyer/Client but a HIGH risk for a Service Provider.
Look especially for: ${FOCUS[role].join('; ')}.

Return JSON:
{
  "overview": string (1-2 sentence summary of the contract and its main exposure for the selected party),
  "contractType": string, "parties": [string],
  "findings": [{
    "title": string, "section": string (as written, or "Unnumbered"),
    "category": one of ${JSON.stringify(CATEGORIES)},
    "riskType": one of ${JSON.stringify(RISK_TYPES)},
    "stance": "favourable"|"unfavourable"|"neutral" (relative to the selected party),
    "severity": "critical"|"high"|"medium"|"low" if unfavourable, otherwise "none",
    "favours": "Buyer"|"Service Provider"|"Neutral",
    "oneSided": boolean, "marketStandard": boolean,
    "whoBenefits": string, "whoBearsRisk": string,
    "text": string (exact quote),
    "shortSummary": string (one sentence), "explanation": string (analysis for the selected party),
    "whyUnfavourable": string ("" if not unfavourable), "recommendation": string (what to negotiate),
    "suggestedLanguage": string (proposed replacement wording, "" if favourable)
  }],
  "missingProtections": [{ "title": string, "category": one of the categories, "riskType": string, "severity": "critical"|"high"|"medium"|"low", "explanation": string, "recommendation": string, "suggestedLanguage": string }]
}
For "missingProtections", check ONLY this checklist and list items absent from this excerpt: ${CHECKLIST[role].join('; ')}.

CONTRACT EXCERPT:
"""
${chunk}
"""`;
}
