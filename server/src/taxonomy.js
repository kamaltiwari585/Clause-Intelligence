/** Shared vocabulary for findings. Keep in sync with the prompt and the UI labels. */
export const CATEGORIES = ['High Financial Risk', 'High Legal Risk', 'Liability', 'Indemnity', 'Payment', 'Termination', 'Renewal', 'SLA / Service Credits', 'Warranty', 'Intellectual Property', 'Confidentiality', 'Data Protection / Privacy', 'Non-Compete', 'Non-Solicitation', 'Insurance', 'Audit Rights', 'Compliance', 'Dispute Resolution', 'Governing Law', 'Force Majeure', 'Miscellaneous'];
export const RISK_TYPES = ['Financial', 'Legal', 'Operational', 'Commercial', 'Compliance'];
export const STANCES = ['favourable', 'unfavourable', 'neutral'];
export const SEVERITIES = ['critical', 'high', 'medium', 'low'];
export const WEIGHT = { critical: 25, high: 15, medium: 7, low: 2, none: 0 };
export const PARTY_NAMES = ['Buyer', 'Service Provider', 'Neutral'];
export const ROLES = {
  buyer: { label: 'Buyer / Client', short: 'Buyer', other: 'Service Provider' },
  provider: { label: 'Service Provider / Vendor', short: 'Service Provider', other: 'Buyer' },
};
