import { CHECKLIST } from '../prompts.js';
import { ROLES } from '../taxonomy.js';

/**
 * Deterministic, AI-free, ROLE-AWARE checks. Each rule works out which party the clause burdens,
 * then judges it relative to the selected role: burdens me = unfavourable, burdens them = favourable.
 */
const MUTUAL = /each party|either party|both parties|mutual|reciprocal/i;
const NAME = { buyer: 'Buyer', provider: 'Service Provider' };
const other = (p) => (p === 'buyer' ? 'provider' : 'buyer');

const mentions = (s) => [
  ...[...s.matchAll(/\b(client|customer|buyer|purchaser)\b/gi)].map((m) => [m.index, 'buyer']),
  ...[...s.matchAll(/\b(service provider|provider|supplier|vendor|contractor|consultant|developer)\b/gi)].map((m) => [m.index, 'provider']),
].sort((a, b) => a[0] - b[0]);
const firstParty = (s) => mentions(s)[0]?.[1] ?? null;
const lastParty = (s) => mentions(s).at(-1)?.[1] ?? null;
const days = (s) => { const d = s.match(/(\d+)\s*(?:\(\d+\)\s*)?days?/i); return d ? Number(d[1]) : null; };

const CAP = 'Each party\'s total aggregate liability under this Agreement shall not exceed the fees paid or payable in the twelve (12) months preceding the claim, except for gross negligence, wilful misconduct or breach of confidentiality.';

const RULES = [
  { title: 'Unlimited Liability', category: 'Liability', riskType: 'Financial',
    match: (t) => (/(unlimited|uncapped)\s+liab|liab\w*[^.]{0,80}(shall not be limited|is unlimited|without (any )?limit)|no (cap|limit) on (the )?liab/i.test(t) ? { hurt: firstParty(t) ?? 'both', severity: 'critical' } : null),
    text: (w) => [`Liability is uncapped for the ${w}.`, `The clause exposes the ${w} to potentially unlimited financial liability.`, 'Seek a mutual liability cap linked to fees paid or payable under the agreement, with carve-outs for wilful misconduct.', CAP] },
  { title: 'Vendor Liability Exclusion', category: 'Liability', riskType: 'Financial',
    match: (t) => (/(provider|supplier|vendor|contractor)[^.]{0,60}(shall have no liability|shall not be liable|excludes? (all )?liability)/i.test(t) && !MUTUAL.test(t) ? { hurt: 'buyer', severity: 'high', oneSided: true } : null),
    text: (w) => [`Vendor liability is excluded for the ${w}'s losses.`, `The ${w} may have no recourse if the vendor's performance causes loss.`, 'Seek a balanced liability regime: a mutual cap with a higher or uncapped limit for data breach, confidentiality and wilful misconduct.', CAP] },
  { title: 'Indemnity', category: 'Indemnity', riskType: 'Financial',
    match: (t) => {
      if (!/shall indemnif|agrees to indemnif|will indemnif|hold harmless/i.test(t)) return null;
      if (MUTUAL.test(t)) return { hurt: null };
      const hurt = firstParty(t);
      return hurt ? { hurt, severity: /any and all|all claims|all losses/i.test(t) ? 'high' : 'medium', oneSided: true, incomplete: !/notice|defen[cs]e|settle/i.test(t) } : null;
    },
    text: (w) => [`${w} gives a one-sided indemnity.`, `The ${w} alone bears the cost of third-party claims, with no reciprocal protection or defence procedure.`, 'Request a mutual indemnity (including IP infringement cover from the Service Provider) and add notice, defence-control and settlement procedures.', 'Each party shall indemnify the other against third-party claims arising from its breach of this Agreement. The indemnified party shall give prompt written notice and reasonable cooperation, and the indemnifying party shall control the defence.'] },
  { title: 'Termination for Convenience', category: 'Termination', riskType: 'Commercial',
    match: (t) => {
      const m = t.match(/\bmay terminate\b[^.]{0,120}(at any time|for convenience|without cause)/i);
      if (!m) return null;
      if (MUTUAL.test(t)) return { hurt: null };
      const holder = lastParty(t.slice(0, m.index));
      if (!holder) return null;
      const d = days(t); const hurt = other(holder);
      return { hurt, days: d, oneSided: true, severity: hurt === 'provider' && d !== null && d <= 14 ? 'high' : 'medium' };
    },
    text: (w, c) => [`${NAME[other(c.hurt)]} may terminate without cause${c.days ? ` on only ${c.days} days' notice` : ''}.`,
      `The ${w} has no matching right and could lose ${w === 'Service Provider' ? 'the contract and expected revenue' : 'service continuity'} at short notice.`,
      w === 'Service Provider' ? 'Request a longer notice period or a minimum commitment period, plus payment for work done and wind-down costs.' : 'Seek mutual termination rights, or a longer provider notice period with transition assistance.',
      w === 'Service Provider' ? 'Client may terminate for convenience on not less than ninety (90) days\' written notice and shall pay all fees for Services performed to the termination date plus reasonable wind-down costs.' : 'Either party may terminate for convenience on ninety (90) days\' written notice. On termination the Service Provider shall provide transition assistance and refund prepaid fees for the unused period.'] },
  { title: 'Broad IP Assignment', category: 'Intellectual Property', riskType: 'Legal',
    match: (t) => (/assign/i.test(t) && /intellectual property|work product|inventions|know-how/i.test(t) && /any and all|all (right|title)|whether before|prior to|pre-existing|background/i.test(t) ? { hurt: 'provider', severity: 'high', oneSided: true } : null),
    text: (w) => [`${w}'s pre-existing IP may be assigned away.`, `The wording can reach background IP, not just deliverables created for this contract, so the ${w} could lose tools it reuses elsewhere.`, 'Limit assignment to bespoke deliverables on full payment; each party keeps its background IP, with a licence for embedded materials.', 'Service Provider assigns to Client the Deliverables created specifically under this Agreement upon payment in full. Each party retains its Background IP; Service Provider grants Client a perpetual, non-exclusive licence to use embedded Background IP as part of the Deliverables.'] },
  { title: 'Automatic Renewal', category: 'Renewal', riskType: 'Commercial',
    match: (t) => { if (!/automatically renew|auto-?renew/i.test(t)) return null; const notice = /\d+\)?\s*days?'?\s*(prior )?(written )?notice|notice of non-?renewal/i.test(t); return { hurt: 'buyer', severity: notice ? 'medium' : 'high', incomplete: !notice }; },
    text: (w) => [`The contract renews automatically against the ${w}.`, `The ${w} can be locked into another term if the opt-out window is missed.`, 'Require a reminder before renewal and a clear non-renewal notice period of at least 60 days.', 'This Agreement renews for successive twelve (12) month terms unless either party gives sixty (60) days\' written notice of non-renewal. Supplier shall remind Client in writing at least ninety (90) days before renewal.'] },
  { title: 'Unilateral Amendment', category: 'Miscellaneous', riskType: 'Legal',
    match: (t) => { const m = t.match(/(may|reserves the right to)\s+(amend|modify|change|update|revise)[^.]{0,80}(at any time|sole discretion|without (prior )?notice)/i); const h = m && lastParty(t.slice(0, m.index)); return h ? { hurt: other(h), severity: 'medium', oneSided: true } : null; },
    text: (w) => [`The counterparty can change the terms unilaterally.`, `The ${w} could be bound by changes it never agreed to.`, 'Require written agreement for changes, or advance notice and a right to terminate if a change is unacceptable.', 'No amendment to this Agreement is effective unless in writing and signed by both parties.'] },
  { title: 'Payment Terms', category: 'Payment', riskType: 'Financial',
    match: (t) => {
      if (/(reasonable time|promptly)[^.]{0,60}(pay|invoice)|invoice[^.]{0,80}reasonable time/i.test(t)) return { hurt: 'provider', severity: 'medium', incomplete: true, variant: 'vague' };
      const m = t.match(/(?:payable|pay|payment)[^.]{0,80}within\s+(\d+)\s*(?:\(\d+\)\s*)?days?|within\s+(\d+)\s*(?:\(\d+\)\s*)?days?[^.]{0,60}(?:invoice|payment|pay)/i);
      const n = m && Number(m[1] || m[2]);
      if (!n) return null;
      return n <= 10 ? { hurt: 'buyer', severity: 'medium', variant: 'short', days: n } : n >= 60 ? { hurt: 'provider', severity: 'medium', variant: 'long', days: n } : null;
    },
    text: (w, c) => c.variant === 'short'
      ? [`Payment is due within only ${c.days} days.`, `A very short payment window strains the ${w}'s cash flow and leaves little time to check invoices.`, 'Negotiate net-30 terms and an invoice dispute window.', 'Undisputed invoices are payable within thirty (30) days of receipt. A party disputing an invoice shall notify the other within fifteen (15) days and pay the undisputed portion.']
      : [c.variant === 'long' ? `Payment is not due for ${c.days} days.` : 'Payment timing is vague.', `${c.variant === 'long' ? 'A long payment period delays' : 'With no fixed period, rate or dispute process, it is hard to enforce and delays'} the ${w}'s cash.`, 'Fix net-30 terms, state a late-payment interest rate and add a good-faith dispute window.', 'Undisputed invoices are payable within thirty (30) days of receipt. Late amounts accrue interest at 1% per month. A party disputing an invoice shall notify the other within fifteen (15) days and pay the undisputed portion.'] },
  { title: 'Warranties', category: 'Warranty', riskType: 'Legal',
    match: (t) => (/warrants?\b[^.]{0,120}(error-free|uninterrupted|free (from|of) (defects|errors)|fit for (any|all) purpose)/i.test(t) ? { hurt: 'provider', severity: 'medium', variant: 'broad' }
      : /\bas is\b|disclaims? (all|any) (implied )?warrant/i.test(t) ? { hurt: 'buyer', severity: 'medium', variant: 'asis' } : null),
    text: (w, c) => c.variant === 'broad'
      ? ['Warranties are broader than any supplier can safely give.', `Absolute promises (error-free, uninterrupted) expose the ${w} to breach claims for ordinary defects.`, 'Narrow the warranty to conformity with the specification, with a defined remedy (re-performance or refund).', 'Service Provider warrants that the Services will materially conform to the Specification for ninety (90) days. Its sole obligation for breach is to re-perform or refund the affected fees.']
      : ['Vendor warranties are disclaimed.', `The ${w} has no assurance of quality and limited remedy for defective delivery.`, 'Require express warranties of conformity, skill and care, and non-infringement.', 'Service Provider warrants that the Services will conform to the Specification, be performed with reasonable skill and care, and not infringe third-party intellectual property rights.'] },
  { title: 'Service Credits and Penalties', category: 'SLA / Service Credits', riskType: 'Financial',
    match: (t) => (/service credits?|liquidated damages|penalt(y|ies)/i.test(t) ? { hurt: 'provider', severity: 'medium', oneSided: true } : null),
    text: (w) => [`Service credits or penalties fall on the ${w}.`, `Uncapped or automatic credits can erode the ${w}'s margin, particularly if credits are not an exclusive remedy.`, 'Cap total credits (e.g. 10-15% of monthly fees), make credits the sole remedy for SLA misses, and exclude agreed downtime.', 'Service credits shall not exceed ten percent (10%) of the monthly fees for the affected Services and are the Client\'s sole and exclusive remedy for a failure to meet service levels.'] },
  { title: 'Restrictive Covenant', category: 'Non-Solicitation', riskType: 'Legal',
    match: (t) => { if (!/shall not[^.]{0,60}(solicit|compete)/i.test(t)) return null; const hurt = firstParty(t); return hurt ? { hurt, severity: 'medium', oneSided: true, compete: /compet/i.test(t) } : null; },
    text: (w) => [`A non-solicit or non-compete restricts the ${w}.`, `Broad or long restrictions can limit the ${w}'s ability to hire or win other business.`, 'Limit scope, geography and duration (no more than 12 months), and make it mutual.', 'Neither party shall, during the term and for twelve (12) months after, directly solicit the other party\'s personnel who worked on the Services, except through general advertising.'] },
  { title: 'Audit Rights', category: 'Audit Rights', riskType: 'Compliance',
    match: (t) => (/audit/i.test(t) && /at any time|without notice|unlimited|upon request/i.test(t) ? { hurt: 'provider', severity: 'medium', oneSided: true } : null),
    text: (w) => [`Audit rights are broad and open-ended.`, `Unlimited audits create cost and disruption for the ${w} and may expose other customers' data.`, 'Limit audits to once a year on reasonable notice, during business hours, at the requester\'s cost, subject to confidentiality.', 'Client may audit Service Provider\'s relevant records once in any twelve (12) month period on thirty (30) days\' written notice, during business hours, at Client\'s cost and subject to confidentiality obligations.'] },
];

const PRESENCE = {
  'Limitation of Liability': /limitation of liability|liability cap|aggregate liability|limit(s|ed)?\s+[^.]{0,40}liab/i,
  'Indemnification': /indemnif/i, 'Termination': /terminat/i, 'Confidentiality': /confidential/i,
  'Intellectual Property': /intellectual property|ownership of/i, 'Data Protection': /personal data|data protection|gdpr|privacy/i,
  'Payment Terms': /payment|invoice|\bfees?\b/i, 'Governing Law and Jurisdiction': /governing law|governed by the laws|jurisdiction/i,
  'Dispute Resolution': /arbitrat|mediation|dispute resolution/i, 'Force Majeure': /force majeure/i, 'Warranties': /warrant/i,
  'Service Levels / Service Credits': /service level|\bSLA\b|uptime|service credit/i, 'Insurance': /insurance/i,
};
const MISS = {
  'Limitation of Liability': ['Liability', 'Financial', 'high', CAP],
  'Indemnification': ['Indemnity', 'Financial', 'high', 'Each party shall indemnify the other against third-party claims arising from its breach of this Agreement; Service Provider shall also indemnify Client against claims that the Services infringe third-party intellectual property rights.'],
  'Warranties': ['Warranty', 'Commercial', 'medium', 'Service Provider warrants that the Services will conform to the Specification and be performed with reasonable skill and care.'],
  'Service Levels / Service Credits': ['SLA / Service Credits', 'Operational', 'medium', 'Service Provider shall meet the service levels in Schedule [X]; service credits apply as Client\'s sole remedy for failure to do so.'],
  'Termination': ['Termination', 'Commercial', 'high', 'Either party may terminate for material breach not cured within thirty (30) days of written notice, and Service Provider shall provide reasonable transition assistance on termination.'],
  'Data Protection': ['Data Protection / Privacy', 'Compliance', 'high', 'Service Provider shall process Personal Data only on Client\'s documented instructions, maintain appropriate security measures, notify Client of a breach without undue delay and within 72 hours, and not engage sub-processors without prior written authorisation.'],
  'Insurance': ['Insurance', 'Financial', 'low', 'Service Provider shall maintain professional indemnity and cyber insurance of at least [amount] throughout the term and provide evidence on request.'],
  'Confidentiality': ['Confidentiality', 'Legal', 'medium', 'Each party shall keep the other\'s Confidential Information secret, use it only for this Agreement, and return or destroy it on request.'],
  'Intellectual Property': ['Intellectual Property', 'Legal', 'medium', 'Each party retains its pre-existing IP. Deliverables created specifically for Client vest in Client on payment in full, with a licence to embedded Background IP.'],
  'Governing Law and Jurisdiction': ['Governing Law', 'Legal', 'medium', 'This Agreement is governed by the laws of [jurisdiction], and the courts of [location] have exclusive jurisdiction.'],
  'Dispute Resolution': ['Dispute Resolution', 'Legal', 'low', 'The parties shall first escalate disputes to senior management for thirty (30) days, then refer them to mediation before commencing proceedings.'],
  'Force Majeure': ['Force Majeure', 'Operational', 'low', 'Neither party is liable for delay caused by events beyond its reasonable control, provided it notifies the other promptly and uses reasonable efforts to resume performance.'],
  'Payment Terms': ['Payment', 'Financial', 'high', 'Undisputed invoices are payable within thirty (30) days of receipt. Late amounts accrue interest at 1% per month. Service Provider may suspend Services for undisputed overdue amounts after fourteen (14) days\' notice.'],
};

function missingItem(title, role) {
  const [category, riskType, severity, suggestedLanguage] = MISS[title];
  const w = ROLES[role].short;
  return { title, category, riskType, severity, suggestedLanguage,
    explanation: `No ${title} clause was found. Without it, the ${w} lacks an express protection it would normally expect.`,
    recommendation: `Add a ${title} clause that protects the ${w}.` };
}

function toUnits(text) {
  const units = []; let section = 'Unnumbered';
  for (const para of text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)) {
    for (const part of para.length > 1200 ? para.split(/(?<=[.;:])\s+(?=[A-Z0-9(])/) : [para]) {
      const m = part.match(/^(?:section\s+)?(\d+(?:\.\d+)*)[.)]?\s/i);
      if (m) section = m[1]; // short headings like "12.3 Liability" still set the section
      if (part.length > 30) units.push({ text: part.slice(0, 700), section });
    }
  }
  return units;
}

function build(rule, ctx, unit, role) {
  const w = NAME[role];
  const stance = !ctx.hurt ? 'neutral' : ctx.hurt === 'both' || ctx.hurt === role ? 'unfavourable' : 'favourable';
  const common = {
    title: rule.title, section: unit.section, category: rule.category === 'Non-Solicitation' && ctx.compete ? 'Non-Compete' : rule.category,
    riskType: rule.riskType, stance, text: unit.text, oneSided: Boolean(ctx.oneSided), marketStandard: false,
    favours: ctx.hurt === 'both' || !ctx.hurt ? 'Neutral' : NAME[other(ctx.hurt)],
    whoBenefits: ctx.hurt === 'both' || !ctx.hurt ? 'Neither party in particular' : NAME[other(ctx.hurt)],
    whoBearsRisk: ctx.hurt === 'both' ? 'Both parties' : ctx.hurt ? NAME[ctx.hurt] : 'Shared by both parties',
  };
  if (stance === 'unfavourable') {
    const [shortSummary, why, recommendation, suggestedLanguage] = rule.text(w, ctx);
    return { ...common, severity: ctx.severity ?? 'medium', shortSummary, explanation: why, whyUnfavourable: why, recommendation, suggestedLanguage };
  }
  const fav = stance === 'favourable';
  return { ...common, severity: 'none', shortSummary: fav ? `Favourable to the ${w}.` : 'Balanced provision that applies to both parties.',
    explanation: fav ? `${rule.title} places the burden on the ${NAME[ctx.hurt]}, so it favours the ${w}. It is not a risk for the ${w}.` : `${rule.title} applies to both parties on similar terms, so it is neutral.`,
    whyUnfavourable: '', recommendation: fav ? 'No change needed. Expect pushback and avoid conceding it without something in return.' : 'No action needed.', suggestedLanguage: '' };
}

const TYPES = [[/software development|development (agreement|contract)/i, 'Software Development Agreement'], [/saas|software as a service|subscription/i, 'SaaS Subscription Agreement'], [/non-?disclosure|confidentiality agreement/i, 'Non-Disclosure Agreement'], [/data processing/i, 'Data Processing Agreement'], [/master services|services agreement|statement of work/i, 'Services Agreement'], [/licen[cs]e agreement/i, 'Licence Agreement'], [/supply|purchase agreement/i, 'Supply Agreement']];
const detectType = (t) => TYPES.find(([re]) => re.test(t.slice(0, 3000)))?.[1] ?? '';
function detectParties(t) {
  const m = t.slice(0, 3000).match(/between\s+(.{3,80}?)\s+(?:\([^)]*\)\s*)?and\s+(.{3,80}?)(?:\s*\(|,|\.|\n)/is);
  return m ? [m[1].trim(), m[2].trim()] : [];
}

export function analyzeWithRules(text, role) {
  const seen = new Set(); const findings = [];
  for (const unit of toUnits(text)) {
    for (const rule of RULES) {
      const key = `${rule.title}|${unit.section}`;
      if (seen.has(key)) continue;
      const ctx = rule.match(unit.text);
      if (!ctx) continue;
      seen.add(key);
      findings.push(build(rule, ctx, unit, role));
    }
  }
  const missing = CHECKLIST[role].filter((t) => PRESENCE[t] && !PRESENCE[t].test(text)).map((t) => missingItem(t, role));
  return { findings, missing, warnings: [], overview: '', contractType: detectType(text), parties: detectParties(text) };
}
