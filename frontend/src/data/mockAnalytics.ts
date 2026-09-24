export interface CategoryMetric {
  name: string;
  count: number;
  breachRiskAvg: number;
  slaAdherence: number;
}

export interface DepartmentMetric {
  department: string;
  totalTickets: number;
  openTickets: number;
  avgResolutionMinutes: number;
  slaCompliance: number;
  preventedBreaches: number;
}

export interface ComplianceTrendPoint {
  date: string;
  withGuardianAI: number;
  legacyWithoutAI: number;
  breachPreventionRate: number;
}

export const mockCategoryMetrics: CategoryMetric[] = [
  { name: 'Payment Failure', count: 18, breachRiskAvg: 74, slaAdherence: 98.2 },
  { name: 'Technical Error', count: 24, breachRiskAvg: 68, slaAdherence: 95.8 },
  { name: 'API Integration', count: 14, breachRiskAvg: 52, slaAdherence: 97.4 },
  { name: 'Login & SSO', count: 12, breachRiskAvg: 41, slaAdherence: 99.1 },
  { name: 'Billing & Invoice', count: 16, breachRiskAvg: 32, slaAdherence: 98.7 },
  { name: 'Account Access', count: 9, breachRiskAvg: 28, slaAdherence: 99.4 },
  { name: 'Product Support', count: 7, breachRiskAvg: 14, slaAdherence: 99.8 },
];

export const mockDepartmentMetrics: DepartmentMetric[] = [
  { department: 'Payments', totalTickets: 28, openTickets: 11, avgResolutionMinutes: 24, slaCompliance: 98.2, preventedBreaches: 18 },
  { department: 'Technical Support', totalTickets: 42, openTickets: 18, avgResolutionMinutes: 38, slaCompliance: 95.5, preventedBreaches: 29 },
  { department: 'Billing', totalTickets: 19, openTickets: 6, avgResolutionMinutes: 22, slaCompliance: 98.9, preventedBreaches: 11 },
  { department: 'Account Support', totalTickets: 14, openTickets: 4, avgResolutionMinutes: 18, slaCompliance: 99.2, preventedBreaches: 7 },
  { department: 'Product Support', totalTickets: 11, openTickets: 3, avgResolutionMinutes: 20, slaCompliance: 99.5, preventedBreaches: 4 },
];

export const mockComplianceTrend: ComplianceTrendPoint[] = [
  { date: 'Mon', withGuardianAI: 98.9, legacyWithoutAI: 89.2, breachPreventionRate: 94.2 },
  { date: 'Tue', withGuardianAI: 99.1, legacyWithoutAI: 88.5, breachPreventionRate: 95.8 },
  { date: 'Wed', withGuardianAI: 98.4, legacyWithoutAI: 87.1, breachPreventionRate: 93.4 },
  { date: 'Thu', withGuardianAI: 98.8, legacyWithoutAI: 89.0, breachPreventionRate: 96.1 },
  { date: 'Fri', withGuardianAI: 98.2, legacyWithoutAI: 86.4, breachPreventionRate: 92.8 },
  { date: 'Sat', withGuardianAI: 99.4, legacyWithoutAI: 91.2, breachPreventionRate: 97.5 },
  { date: 'Sun (Today)', withGuardianAI: 98.6, legacyWithoutAI: 87.8, breachPreventionRate: 95.0 },
];

export const mockHourlyBreachRiskCurve = [
  { hour: '06:00', predictedBreachProbability: 12, activeQueue: 14, escalations: 0 },
  { hour: '07:00', predictedBreachProbability: 18, activeQueue: 18, escalations: 1 },
  { hour: '08:00', predictedBreachProbability: 34, activeQueue: 26, escalations: 2 },
  { hour: '09:00', predictedBreachProbability: 58, activeQueue: 35, escalations: 4 },
  { hour: '10:00', predictedBreachProbability: 76, activeQueue: 41, escalations: 6 },
  { hour: '11:00', predictedBreachProbability: 82, activeQueue: 42, escalations: 8 },
  { hour: '12:00 (Est)', predictedBreachProbability: 64, activeQueue: 34, escalations: 5 },
  { hour: '13:00 (Est)', predictedBreachProbability: 42, activeQueue: 28, escalations: 2 },
  { hour: '14:00 (Est)', predictedBreachProbability: 25, activeQueue: 22, escalations: 1 },
];
