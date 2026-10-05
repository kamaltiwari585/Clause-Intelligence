import { CHECKLIST } from '../prompts.js';

/**
 * Deterministic, AI-free contract checks. Same output shape as the LLM path.
 * Findings quote the contract verbatim, so they pass the same verification.
 */
const has = (re) => (p) => re.test(p);
const MUTUAL = /each party|either party|both parties|mutual|reciprocal/i;

const RULES = [
  { title: 'Unlimited Liability', risk: 'high', oneSided: false, incomplete: false,
    match: has(/(unlimited|uncapped)\s+liab|liab\w*[^.]{0,80}(shall not be limited|is unlimited|without (any )?limit)|no (cap|limit) on (the )?liab/i),
    issue: 'Liability is described as unlimited or uncapped, exposing a party to losses far beyond the contract value.',
    negotiation: 'Seek a mutual cap tied to fees paid in the last 12 months, with carve-outs for confidentiality breach and wilful misconduct.',
    revision: 'Each party\'s total aggregate liability under this Agreement shall not exceed the fees paid or payable in the twelve (12) months preceding the claim, except for gross negligence, wilful misconduct or breach of confidentiality.' },
  { title: 'One-sided Indemnity', risk: 'high', oneSided: true,
    match: (p) => /indemnif/i.test(p) && /shall indemnif|agrees to indemnif|hold harmless/i.test(p) && !MUTUAL.test(p),
    incomplete: (p) => !/notice|defen[cs]e|settle/i.test(p),
    issue: 'The indemnity obligation runs from one party only, with no reciprocal protection.',
    negotiation: 'Request a mutual indemnity, plus a procedure for notice, control of the defence and settlement.',
    revision: 'Each party shall indemnify the other against third-party claims arising from its breach of this Agreement. The indemnified party shall give prompt written notice and reasonable cooperation, and the indemnifying party shall control the defence.' },
  { title: 'Unilateral Termination Right', risk: 'moderate', oneSided: true, incomplete: false,
    match: (p) => /may terminate[^.]{0,100}(at any time|for convenience|without cause)/i.test(p) && !MUTUAL.test(p),
    issue: 'One party may exit without cause while the other is locked in.',
    negotiation: 'Ask for mutual termination for convenience, or a longer notice period plus transition assistance and a pro-rata refund.',
    revision: 'Either party may terminate for convenience on ninety (90) days\' written notice. On termination the supplier shall provide reasonable transition assistance and refund prepaid fees for the unused period.' },
  { title: 'Broad IP Assignment', risk: 'high', oneSided: true, incomplete: false,
    match: (p) => /assign/i.test(p) && /intellectual property|work product|inventions|know-how/i.test(p) && /any and all|all (right|title)|whether before|prior to|pre-existing|background/i.test(p),
    issue: 'The assignment may reach pre-existing or background IP, not just deliverables created for this contract.',
    negotiation: 'Limit assignment to bespoke deliverables on full payment; each party keeps its background IP, with a licence for embedded materials.',
    revision: 'Supplier assigns to Customer the Deliverables created specifically under this Agreement upon payment in full. Each party retains its Background IP; Supplier grants Customer a perpetual, non-exclusive licence to use embedded Background IP as part of the Deliverables.' },
  { title: 'Automatic Renewal', risk: 'moderate', oneSided: true,
    match: has(/automatically renew|auto-?renew/i),
    incomplete: (p) => !/\b\d+\)?\s*days?'?\s*(prior )?(written )?notice|notice of non-?renewal/i.test(p),
    issue: 'The contract renews automatically, and the opt-out window may be short or unclear.',
    negotiation: 'Require a reminder before renewal and a clear non-renewal notice period of at least 60 days.',
    revision: 'This Agreement renews for successive twelve (12) month terms unless either party gives sixty (60) days\' written notice of non-renewal. Supplier shall remind Customer in writing at least ninety (90) days before renewal.' },
  { title: 'Unilateral Amendment', risk: 'moderate', oneSided: true, incomplete: false,
    match: has(/(may|reserves the right to)\s+(amend|modify|change|update|revise)[^.]{0,80}(at any time|sole discretion|without (prior )?notice)/i),
    issue: 'One party can change the terms without the other\'s agreement.',
    negotiation: 'Require written agreement for changes, or at least advance notice and a right to terminate if a change is unacceptable.',
    revision: 'No amendment to this Agreement is effective unless in writing and signed by both parties.' },
  { title: 'Vague Payment Terms', risk: 'moderate', oneSided: false,
    match: has(/(reasonable time|promptly)[^.]{0,60}(pay|invoice)|invoice[^.]{0,80}reasonable time/i),
    incomplete: () => true,
    issue: 'No fixed payment period, late-payment rate or invoice dispute process, which makes the clause hard to enforce.',
    negotiation: 'Fix net-30 terms, state the late interest rate and add a good-faith dispute window.',
    revision: 'Undisputed invoices are payable within thirty (30) days of receipt. A party disputing an invoice shall notify the other within fifteen (15) days and pay the undisputed portion.' },
];

const PRESENCE = {
  'Limitation of Liability': /limitation of liability|liability cap|aggregate liability|limit(s|ed)?\s+[^.]{0,40}liab/i,
  'Indemnification': /indemnif/i, 'Termination': /terminat/i, 'Confidentiality': /confidential/i,
  'Intellectual Property': /intellectual property|ownership of/i,
  'Data Protection': /personal data|data protection|gdpr|privacy/i,
  'Payment Terms': /payment|invoice|\bfees?\b/i,
  'Governing Law and Jurisdiction': /governing law|governed by the laws|jurisdiction/i,
  'Dispute Resolution': /arbitrat|mediation|dispute resolution/i,
  'Force Majeure': /force majeure/i, 'Warranties': /warrant/i,
  'Service Levels / Performance': /service level|\bSLA\b|uptime/i,
};

const TEMPLATES = {
  'Limitation of Liability': ['No cap on liability is stated.', 'Each party\'s aggregate liability shall not exceed the fees paid or payable in the preceding twelve (12) months, except for gross negligence, wilful misconduct or breach of confidentiality.'],
  'Data Protection': ['No data protection terms were found, which matters if personal data is processed.', 'The processor shall process Personal Data only on documented instructions, maintain appropriate security measures, notify the controller of a breach without undue delay and within 72 hours, and not engage sub-processors without prior written authorisation.'],
  'Termination': ['No termination provisions were found.', 'Either party may terminate for material breach not cured within thirty (30) days of written notice.'],
  'Confidentiality': ['No confidentiality obligations were found.', 'Each party shall keep the other\'s Confidential Information secret, use it only for this Agreement, and return or destroy it on request.'],
  'Governing Law and Jurisdiction': ['No governing law or forum is specified, which creates uncertainty in a dispute.', 'This Agreement is governed by the laws of [jurisdiction], and the courts of [location] have exclusive jurisdiction.'],
  'Force Majeure': ['No force majeure clause was found.', 'Neither party is liable for delay caused by events beyond its reasonable control, provided it notifies the other promptly and uses reasonable efforts to resume performance.'],
};

/** Split into reviewable units, carrying the latest section number. Long walls of text are split into sentences. */
function toUnits(text) {
  const units = []; let section = 'Unnumbered';
  for (const para of text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)) {
    const parts = para.length > 1200 ? para.split(/(?<=[.;:])\s+(?=[A-Z0-9(])/) : [para];
    for (const part of parts) {
      const m = part.match(/^(?:section\s+)?(\d+(?:\.\d+)*)[.)]?\s/i);
      if (m) section = m[1]; // short headings like "12.3 Liability" still set the section
      if (part.length > 30) units.push({ text: part.slice(0, 700), section });
    }
  }
  return units;
}

export function analyzeWithRules(text) {
  const seen = new Set(); const clauses = [];
  for (const unit of toUnits(text)) {
    for (const r of RULES) {
      const key = `${r.title}|${unit.section}`;
      if (seen.has(key) || !r.match(unit.text)) continue;
      seen.add(key);
      clauses.push({
        title: r.title, section: unit.section, risk: r.risk, oneSided: r.oneSided,
        incomplete: typeof r.incomplete === 'function' ? r.incomplete(unit.text) : r.incomplete,
        text: unit.text, issue: r.issue, negotiation: r.negotiation, revision: r.revision,
      });
    }
  }
  const missing = CHECKLIST.filter((t) => PRESENCE[t] && !PRESENCE[t].test(text)).map((title) => {
    const [issue, revision] = TEMPLATES[title] ?? [`No ${title} clause was found.`, `Add a ${title} clause suited to this agreement; have counsel draft the final wording.`];
    return { title, issue, revision };
  });
  return { clauses, missing, warnings: [] };
}
