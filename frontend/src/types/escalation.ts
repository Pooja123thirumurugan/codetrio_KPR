import { RiskLevel } from './ticket';

export type EscalationType = 'PREVENTIVE' | 'POST_BREACH';
export type EscalationLevel = 'Tier 2 Escalation' | 'Tier 3 Specialist' | 'Engineering / DevOps' | 'Operations Lead' | 'Incident Commander';
export type EscalationStatus = 'PENDING_APPROVAL' | 'EXECUTED' | 'MITIGATED' | 'REVERTED';

export interface EscalationRecord {
  id: string; // e.g. "ESC-804"
  ticketId: string; // e.g. "TCK-1048"
  ticketSubject: string;
  type: EscalationType;
  level: EscalationLevel;
  riskProbability: number; // e.g. 82%
  slaRemainingMinutes: number; // e.g. 18 min
  trigger: string; // "Predicted breach probability exceeded 80% threshold while queue depth is elevated (24 tickets)"
  recommendedAction: string; // "Escalate now to Tier 2 Payments team"
  currentOwner: string;
  suggestedOwner: string;
  department: string;
  status: EscalationStatus;
  timestamp: string;
  notes?: string;
  expectedImpact: string; // e.g. "Reduces breach risk from 82% to 14% via dedicated specialist assignment"
}
