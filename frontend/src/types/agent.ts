import { Department } from './ticket';

export type AgentStatus = 'AVAILABLE' | 'BUSY' | 'AT CAPACITY' | 'OFFLINE';
export type AgentTier = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Team Lead' | 'Escalation Specialist';

export interface Agent {
  id: string; // e.g. "AGT-01"
  name: string;
  email: string;
  avatar: string;
  department: Department;
  tier: AgentTier;
  status: AgentStatus;
  skills: string[];
  activeTickets: number;
  maxCapacity: number;
  utilizationPercentage: number; // e.g. 42
  avgResolutionTimeMinutes: number; // e.g. 24
  slaBreachRate: number; // e.g. 2.1%
  slaAdherenceRate: number; // e.g. 97.9%
  satisfactionScore: number; // 1.0 - 5.0, e.g. 4.9
  assignedTicketIds: string[];
  location: string;
  shift: 'Morning' | 'Evening' | 'Night' | '24/7 Overflow';
}
