import { Department } from './ticket';

export type IncidentSeverity = 'SEV-1 Critical' | 'SEV-2 Major' | 'SEV-3 Moderate';
export type IncidentStatus = 'ACTIVE' | 'INVESTIGATING' | 'MITIGATING' | 'RESOLVED';

export interface IncidentAction {
  id: string;
  title: string;
  description: string;
  reason: string;
  expectedImpact: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'EXECUTED';
  badgeText: string;
}

export interface IncidentTimelineEvent {
  timestamp: string;
  title: string;
  description: string;
  author: string;
  type: 'ALERT' | 'AI_ACTION' | 'HUMAN_APPROVAL' | 'STATUS_CHANGE';
}

export interface Incident {
  id: string; // e.g. "INC-2026-09"
  title: string; // "Payment Support Queue Overload"
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedDepartment: Department;
  startedAt: string;
  queueDepth: number;
  atRiskTicketsCount: number;
  totalAffectedTickets: number;
  avgCapacityUtilization: number;
  predictedSLABreaches: number;
  preventedBreachesCount: number;
  summary: string;
  recommendedActions: IncidentAction[];
  timeline: IncidentTimelineEvent[];
}
