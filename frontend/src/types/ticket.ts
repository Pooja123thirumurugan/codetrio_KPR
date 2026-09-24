export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PriorityLevel = 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';
export type TicketStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING' | 'ESCALATED' | 'RESOLVED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UserRole = 'ADMIN' | 'AGENT' | 'CUSTOMER';

export interface CreateTicketInput {
  customerName: string;
  customerEmail: string;
  companyName: string;
  tier: 'Enterprise' | 'Business' | 'Pro' | 'Free';
  category: TicketCategory;
  department: Department;
  priority: PriorityLevel;
  subject: string;
  description: string;
}

export type TicketCategory =
  | 'Payment Failure'
  | 'Login Issue'
  | 'Account Access'
  | 'Refund Request'
  | 'Technical Error'
  | 'Subscription Issue'
  | 'API Integration'
  | 'Data Sync'
  | 'Billing';

export type Department =
  | 'Payments'
  | 'Technical Support'
  | 'Billing'
  | 'Account Support'
  | 'Product Support';

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  company: string;
  tier: 'Enterprise' | 'Business' | 'Pro' | 'Free';
  avatar?: string;
}

export interface SLAMetrics {
  policyId: string;
  policyName: string;
  totalDurationMinutes: number;
  elapsedMinutes: number;
  remainingMinutes: number;
  consumedPercentage: number;
  deadlineIso: string;
  predictedBreachProbability: number; // 0 - 100
  riskLevel: RiskLevel;
  riskTrend: number[]; // e.g. [72, 76, 82]
  predictedBreachTimeIso: string;
  recommendedAction: string; // e.g. "PRE-BREACH ESCALATION"
  queueDepthAtPrediction: number;
}

export interface RoutingDecision {
  assignedAgentId?: string;
  assignedAgentName?: string;
  recommendedAgentId: string;
  recommendedAgentName: string;
  confidenceScore: number; // e.g. 96
  skillMatchScore: number; // e.g. 98
  agentCurrentCapacity: number; // percentage
  agentWorkloadRatio: string; // e.g. "3/7"
  historicalSlaRate: number; // percentage
  reasoning: string; // "Selected because the agent has the required payment-support skill, is currently at 42% capacity, and has strong SLA performance."
  routedAtIso: string;
}

export interface AIResponseDraft {
  category: TicketCategory;
  tone: 'Empathetic' | 'Technical' | 'Executive' | 'Urgent';
  subject: string;
  content: string;
  confidence: number;
  keyPointsCovered: string[];
  suggestedActionItems: string[];
}

export interface Ticket {
  id: string; // e.g. "TCK-1048"
  subject: string;
  description: string;
  customer: CustomerInfo;
  category: TicketCategory;
  department: Department;
  urgency: UrgencyLevel;
  priority: PriorityLevel;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  sla: SLAMetrics;
  routing: RoutingDecision;
  aiDraft?: AIResponseDraft;
  escalationStatus?: 'NONE' | 'PREVENTIVE_ESCALATED' | 'POST_BREACH_ESCALATED';
  escalationReason?: string;
  timeline: {
    timestamp: string;
    action: string;
    performedBy: string;
    details: string;
  }[];
}
