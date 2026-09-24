import { Department, PriorityLevel, RiskLevel } from './ticket';

export interface SLAPolicy {
  id: string;
  name: string;
  department: Department;
  priority: PriorityLevel;
  firstResponseMinutes: number;
  resolutionMinutes: number;
  preventiveAlertThresholdPercent: number; // e.g. 75% breach risk triggers preventive action
  autoEscalationEnabled: boolean;
  businessHoursOnly: boolean;
  targetComplianceRate: number; // e.g. 98%
}

export interface SLARiskSummary {
  totalMonitoredTickets: number;
  criticalRiskCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  overallBreachProbability: number;
  averageRemainingMinutes: number;
  imminentBreachesNext30Min: number;
  preventiveEscalationsTriggeredToday: number;
  slaComplianceRateToday: number;
}

export interface DepartmentSLAPressure {
  department: Department;
  activeTickets: number;
  queueDepth: number;
  avgCapacityUtilization: number;
  highRiskTicketsCount: number;
  predictedBreachesCount: number;
  status: 'OPTIMAL' | 'ELEVATED' | 'CRITICAL';
}
