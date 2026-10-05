/** Static sample data. Shape mirrors what the backend will return later. */
export const contracts = [
  { id: 'c1', name: 'Northbridge SaaS Master Agreement', type: 'SaaS Subscription', reviewedOn: '2026-10-02', high: 4, moderate: 6, status: 'Needs Negotiation' },
  { id: 'c2', name: 'Halvorsen Logistics Services Agreement', type: 'Services Agreement', reviewedOn: '2026-09-29', high: 2, moderate: 5, status: 'In Review' },
  { id: 'c3', name: 'Meridian Software Development Contract', type: 'Development / IP', reviewedOn: '2026-09-24', high: 3, moderate: 4, status: 'Needs Negotiation' },
  { id: 'c4', name: 'Calloway Mutual NDA', type: 'Non-Disclosure Agreement', reviewedOn: '2026-09-18', high: 0, moderate: 2, status: 'Cleared' },
  { id: 'c5', name: 'Brightwell Data Processing Addendum', type: 'DPA', reviewedOn: '2026-09-11', high: 1, moderate: 3, status: 'In Review' },
];

export const keyIssues = [
  { id: 'i1', title: 'Unlimited Liability', count: 3, severity: 'high', note: 'No cap on supplier damages or on our exposure.' },
  { id: 'i2', title: 'One-sided Indemnity', count: 4, severity: 'high', note: 'Indemnity runs from one party only.' },
  { id: 'i3', title: 'Customer-only Termination Right', count: 2, severity: 'moderate', note: 'One party may exit for convenience; the other may not.' },
  { id: 'i4', title: 'Broad IP Assignment', count: 2, severity: 'high', note: 'Assigns pre-existing and background IP.' },
  { id: 'i5', title: 'Missing Data Protection Clause', count: 3, severity: 'moderate', note: 'No processing terms despite personal data use.' },
];

export const clauses = [
  {
    id: 'cl1', contractId: 'c1', title: 'Limitation of Liability', section: '12.3', risk: 'high',
    oneSided: true, incomplete: false,
    text: 'Provider shall have no liability to Customer for any indirect, incidental or consequential damages. Customer\'s liability to Provider for any claim arising under this Agreement shall not be limited in amount.',
    issue: 'The cap protects only the Provider. The Customer carries uncapped exposure while Provider excludes consequential loss entirely.',
    negotiation: 'Seek a mutual cap, typically 12 months of fees, with carve-outs for confidentiality breach, data breach and wilful misconduct.',
    revision: 'Each party\'s total aggregate liability under this Agreement shall not exceed the fees paid or payable in the twelve (12) months preceding the claim, except for liability arising from gross negligence, wilful misconduct or breach of Section 9 (Confidentiality).',
  },
  {
    id: 'cl2', contractId: 'c1', title: 'Indemnification', section: '13.1', risk: 'high',
    oneSided: true, incomplete: true,
    text: 'Customer shall indemnify, defend and hold harmless Provider from any and all claims, losses and expenses arising out of Customer\'s use of the Services.',
    issue: 'Indemnity is unilateral and has no procedure for notice, control of defence or settlement. Provider gives no IP infringement indemnity.',
    negotiation: 'Request a reciprocal indemnity, including a Provider indemnity for third-party IP claims, and add a notice and defence-control procedure.',
    revision: 'Each party shall indemnify the other against third-party claims arising from its breach of this Agreement or, in Provider\'s case, from allegations that the Services infringe intellectual property rights. The indemnified party shall give prompt written notice and reasonable cooperation.',
  },
  {
    id: 'cl3', contractId: 'c1', title: 'Termination for Convenience', section: '17.2', risk: 'moderate',
    oneSided: true, incomplete: false,
    text: 'Provider may terminate this Agreement at any time on thirty (30) days\' written notice. Customer may terminate only for material breach that remains uncured after sixty (60) days.',
    issue: 'Provider can exit freely while Customer is locked in, creating continuity risk for a business-critical service.',
    negotiation: 'Ask for mutual convenience rights or, at minimum, a longer notice period for Provider plus transition assistance and a pro-rata refund.',
    revision: 'Either party may terminate for convenience on ninety (90) days\' written notice. On termination Provider shall provide up to ninety (90) days of transition assistance and refund prepaid fees for the unused period.',
  },
  {
    id: 'cl4', contractId: 'c3', title: 'Intellectual Property Assignment', section: '8.1', risk: 'high',
    oneSided: true, incomplete: false,
    text: 'All work product, inventions, tools, methodologies and know-how conceived or used by Developer in connection with the Services, whether before or during the term, are hereby assigned to Client.',
    issue: 'The language reaches Developer\'s pre-existing and background IP, not just deliverables created for the Client.',
    negotiation: 'Limit assignment to bespoke deliverables on full payment and keep background IP with each party, with a licence for embedded materials.',
    revision: 'Developer assigns to Client the Deliverables created specifically for Client under this Agreement upon payment in full. Each party retains its Background IP; Developer grants Client a perpetual, non-exclusive licence to use embedded Background IP as part of the Deliverables.',
  },
  {
    id: 'cl5', contractId: 'c2', title: 'Payment Terms', section: '5.4', risk: 'moderate',
    oneSided: false, incomplete: true,
    text: 'Invoices are payable within a reasonable time after receipt. Late payments may incur interest.',
    issue: 'No fixed payment period, no interest rate and no process for disputed invoices, leaving the clause hard to enforce.',
    negotiation: 'Fix net-30 terms, state the late interest rate and add a good-faith dispute window.',
    revision: 'Undisputed invoices are payable within thirty (30) days of receipt. Late amounts accrue interest at 1% per month. A party disputing an invoice shall notify the other within fifteen (15) days and pay the undisputed portion.',
  },
  {
    id: 'cl6', contractId: 'c1', title: 'Data Protection', section: 'Not present', risk: 'missing',
    oneSided: false, incomplete: true,
    text: '',
    issue: 'The Agreement involves personal data of Customer\'s employees and end users but contains no data processing, security, breach notification or sub-processor terms.',
    negotiation: 'Require a data protection clause or an attached Data Processing Addendum before signature.',
    revision: 'Provider shall process Personal Data only on Customer\'s documented instructions, maintain appropriate security measures, notify Customer of any Personal Data breach without undue delay and within 72 hours, and not engage sub-processors without prior written authorisation.',
  },
];
