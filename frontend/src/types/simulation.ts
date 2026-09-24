export type SimulationPreset =
  | 'Normal Load'
  | 'Ticket Spike'
  | 'Agent Failure'
  | 'Queue Overload'
  | 'SLA Policy Tightening'
  | 'Critical Ticket Surge';

export interface SimulationParams {
  preset: SimulationPreset;
  ticketArrivalRatePerHour: number; // e.g. 45
  agentAvailabilityPercent: number; // e.g. 70
  queueDepth: number; // e.g. 28
  slaDurationModifierMinutes: number; // e.g. 0 (standard) or -15 (tighter)
  autoEscalationAggressiveness: 'Conservative' | 'Balanced' | 'Aggressive';
}

export interface SimulationTimelinePoint {
  timeOffset: string; // "+15m", "+30m", "+45m", "+60m", "+90m", "+120m"
  baselineQueue: number;
  simulatedQueue: number;
  baselineBreachRisk: number;
  simulatedBreachRisk: number;
  baselineUtilization: number;
  simulatedUtilization: number;
}

export interface SimulationResult {
  presetName: string;
  projectedQueuePeak: number;
  predictedBreachRiskPercent: number;
  atRiskTicketsCount: number;
  projectedBreachesWithoutIntervention: number;
  projectedBreachesWithGuardianAI: number;
  capacityUtilizationPercent: number;
  availableAgentsCount: number;
  requiredAgentsCount: number;
  agentDeficit: number;
  recommendedActions: {
    action: string;
    impact: string;
    urgency: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  }[];
  timeline: SimulationTimelinePoint[];
}

export interface DigitalTwinState {
  current: {
    queueDepth: number;
    atRiskTickets: number;
    avgUtilization: number;
    predictedBreaches: number;
    activeAgents: number;
    avgWaitMinutes: number;
  };
  simulatedFuture: {
    queueDepth: number;
    atRiskTickets: number;
    avgUtilization: number;
    predictedBreaches: number;
    activeAgents: number;
    avgWaitMinutes: number;
  };
  optimizedRecommendation: {
    queueDepth: number;
    atRiskTickets: number;
    avgUtilization: number;
    predictedBreaches: number;
    activeAgents: number;
    avgWaitMinutes: number;
    changesSummary: string[];
  };
}
