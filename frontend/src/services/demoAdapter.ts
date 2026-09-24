import { Ticket, TicketStatus, RiskLevel, CreateTicketInput } from '../types/ticket';
import { Agent } from '../types/agent';
import { SLAPolicy, SLARiskSummary, DepartmentSLAPressure } from '../types/sla';
import { EscalationRecord } from '../types/escalation';
import { Incident } from '../types/incident';
import { SimulationPreset, SimulationResult, DigitalTwinState } from '../types/simulation';
import { mockTickets } from '../data/mockTickets';
import { mockAgents } from '../data/mockAgents';
import { mockSLAPolicies, mockSLARiskSummary, mockDepartmentPressure } from '../data/mockSLA';
import { mockEscalations } from '../data/mockEscalations';
import { mockIncidents } from '../data/mockIncidents';
import { simulationPresets, mockDigitalTwinState } from '../data/mockSimulation';

/**
 * Service interface for SLA Guardian AI API client.
 * Phase 1 uses LocalDemoAdapter.
 * Phase 3 will implement RemoteRestApiAdapter implementing this same interface.
 */
export interface ISLAGuardianService {
  getTickets(): Promise<Ticket[]>;
  getTicketById(id: string): Promise<Ticket | undefined>;
  createTicket(input: CreateTicketInput): Promise<Ticket>;
  updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket>;
  triggerPreBreachEscalation(ticketId: string, reason: string): Promise<{ success: boolean; escalation: EscalationRecord }>;
  
  getAgents(): Promise<Agent[]>;
  getAgentById(id: string): Promise<Agent | undefined>;
  updateAgentStatus(agentId: string, status: Agent['status']): Promise<Agent>;

  getSLAPolicies(): Promise<SLAPolicy[]>;
  getSLARiskSummary(): Promise<SLARiskSummary>;
  getDepartmentPressure(): Promise<DepartmentSLAPressure[]>;

  getEscalations(): Promise<EscalationRecord[]>;
  approveEscalation(escalationId: string): Promise<EscalationRecord>;

  getIncidents(): Promise<Incident[]>;
  approveIncidentAction(incidentId: string, actionId: string): Promise<Incident>;

  runSimulation(preset: SimulationPreset, customRate?: number, customAvailability?: number): Promise<SimulationResult>;
  getDigitalTwin(): Promise<DigitalTwinState>;
  optimizeDigitalTwinScenario(): Promise<DigitalTwinState>;

  generateCopilotResponse(ticket: Ticket, tone?: string): Promise<{
    subject: string;
    content: string;
    confidence: number;
    tone: string;
    reasoning: string;
  }>;
}

class LocalDemoAdapter implements ISLAGuardianService {
  private tickets: Ticket[] = [...mockTickets];
  private agents: Agent[] = [...mockAgents];
  private escalations: EscalationRecord[] = [...mockEscalations];
  private incidents: Incident[] = JSON.parse(JSON.stringify(mockIncidents));
  private digitalTwin: DigitalTwinState = JSON.parse(JSON.stringify(mockDigitalTwinState));

  async getTickets(): Promise<Ticket[]> {
    return Promise.resolve([...this.tickets]);
  }

  async getTicketById(id: string): Promise<Ticket | undefined> {
    const ticket = this.tickets.find((t) => t.id.toLowerCase() === id.toLowerCase());
    return Promise.resolve(ticket ? { ...ticket } : undefined);
  }

  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    const nextNumber = this.tickets.length + 1001;
    const newId = `TCK-${nextNumber}`;

    // Dynamic SLA duration based on priority & tier
    let slaMinutes = 240; // default 4 hours
    if (input.priority === 'P1 - Critical') {
      slaMinutes = input.tier === 'Enterprise' ? 60 : 120;
    } else if (input.priority === 'P2 - High') {
      slaMinutes = input.tier === 'Enterprise' ? 120 : 240;
    } else if (input.priority === 'P3 - Medium') {
      slaMinutes = 480;
    } else {
      slaMinutes = 1440;
    }

    const now = new Date();
    const deadline = new Date(now.getTime() + slaMinutes * 60 * 1000);

    // Dynamic agent matching based on department/category & capacity
    const eligibleAgents = this.agents.filter(
      (a) => a.status === 'AVAILABLE' && a.activeTickets < a.maxCapacity
    );

    let matchedAgent = eligibleAgents.find(
      (a) => a.department === input.department || (input.category === 'Payment Failure' && a.skills.some((s) => s.toLowerCase().includes('payment')))
    );
    if (!matchedAgent) {
      matchedAgent = eligibleAgents[0] || this.agents[0];
    }

    const initialRisk = input.priority === 'P1 - Critical' ? 32 : 12;
    const riskLevel: RiskLevel = initialRisk > 70 ? 'CRITICAL' : initialRisk > 50 ? 'HIGH' : initialRisk > 25 ? 'MEDIUM' : 'LOW';

    const newTicket: Ticket = {
      id: newId,
      subject: input.subject,
      description: input.description,
      customer: {
        id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
        name: input.customerName,
        email: input.customerEmail,
        company: input.companyName,
        tier: input.tier,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces`,
      },
      category: input.category,
      department: input.department,
      urgency: input.priority === 'P1 - Critical' ? 'CRITICAL' : input.priority === 'P2 - High' ? 'HIGH' : 'MEDIUM',
      priority: input.priority,
      status: 'ASSIGNED',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      sla: {
        policyId: `POL-${input.department.substring(0, 3).toUpperCase()}`,
        policyName: `${input.tier} SLA - ${input.priority}`,
        totalDurationMinutes: slaMinutes,
        elapsedMinutes: 0,
        remainingMinutes: slaMinutes,
        consumedPercentage: 0,
        deadlineIso: deadline.toISOString(),
        predictedBreachProbability: initialRisk,
        riskLevel: riskLevel,
        riskTrend: [initialRisk],
        predictedBreachTimeIso: new Date(deadline.getTime() - 15 * 60 * 1000).toISOString(),
        recommendedAction: 'Standard monitoring',
        queueDepthAtPrediction: 3,
      },
      routing: {
        assignedAgentId: matchedAgent.id,
        assignedAgentName: matchedAgent.name,
        recommendedAgentId: matchedAgent.id,
        recommendedAgentName: matchedAgent.name,
        confidenceScore: 94,
        skillMatchScore: 96,
        agentCurrentCapacity: Math.round((matchedAgent.activeTickets / matchedAgent.maxCapacity) * 100),
        agentWorkloadRatio: `${matchedAgent.activeTickets}/${matchedAgent.maxCapacity}`,
        historicalSlaRate: matchedAgent.slaAdherenceRate,
        reasoning: `Auto-routed to ${matchedAgent.name} based on domain specialization in ${input.department}, lowest queue contention (${Math.round((matchedAgent.activeTickets / matchedAgent.maxCapacity) * 100)}% load), and ${matchedAgent.slaAdherenceRate}% historical SLA rate.`,
        routedAtIso: now.toISOString(),
      },
      timeline: [
        {
          timestamp: 'Just now',
          action: 'Ticket Created & Ingested',
          performedBy: `${input.customerName} (${input.companyName})`,
          details: 'Submitted via Customer Support Portal',
        },
        {
          timestamp: 'Just now',
          action: 'AI Triage & Skill-Aware Routing',
          performedBy: 'SLA Guardian AI',
          details: `Assigned to ${matchedAgent.name} (${matchedAgent.tier}). Guaranteed SLA: ${slaMinutes} mins.`,
        },
      ],
    };

    // Increment agent active tickets
    matchedAgent.activeTickets += 1;
    this.tickets = [newTicket, ...this.tickets];

    return Promise.resolve(newTicket);
  }

  async updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
    const idx = this.tickets.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) throw new Error(`Ticket ${id} not found`);
    this.tickets[idx] = {
      ...this.tickets[idx],
      status,
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          timestamp: 'Just now',
          action: `Status changed to ${status}`,
          performedBy: 'Operations Agent',
          details: `Manual status transition performed in Command Center`,
        },
        ...this.tickets[idx].timeline,
      ],
    };
    return Promise.resolve(this.tickets[idx]);
  }

  async triggerPreBreachEscalation(ticketId: string, reason: string): Promise<{ success: boolean; escalation: EscalationRecord }> {
    const ticket = this.tickets.find((t) => t.id.toLowerCase() === ticketId.toLowerCase());
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);

    const newEscalation: EscalationRecord = {
      id: `ESC-${Math.floor(805 + Math.random() * 100)}`,
      ticketId: ticket.id,
      ticketSubject: ticket.subject,
      type: 'PREVENTIVE',
      level: 'Tier 2 Escalation',
      riskProbability: ticket.sla.predictedBreachProbability,
      slaRemainingMinutes: ticket.sla.remainingMinutes,
      trigger: reason || 'Manual pre-breach escalation triggered from Command Center',
      recommendedAction: 'Assigned to Tier 2 specialist for immediate intervention',
      currentOwner: ticket.routing.assignedAgentName || 'Unassigned',
      suggestedOwner: 'Kenji Takahashi (Operations Lead)',
      department: ticket.department,
      status: 'EXECUTED',
      timestamp: new Date().toISOString(),
      expectedImpact: 'Reduces predicted breach risk by >60% via priority queueing',
    };

    this.escalations = [newEscalation, ...this.escalations];

    // Update ticket state
    ticket.escalationStatus = 'PREVENTIVE_ESCALATED';
    ticket.escalationReason = reason;
    ticket.timeline.unshift({
      timestamp: 'Just now',
      action: 'Pre-Breach Escalation Dispatched',
      performedBy: 'SLA Guardian AI',
      details: `Preventive escalation record ${newEscalation.id} created`,
    });

    return Promise.resolve({ success: true, escalation: newEscalation });
  }

  async getAgents(): Promise<Agent[]> {
    return Promise.resolve([...this.agents]);
  }

  async getAgentById(id: string): Promise<Agent | undefined> {
    const agent = this.agents.find((a) => a.id.toLowerCase() === id.toLowerCase());
    return Promise.resolve(agent ? { ...agent } : undefined);
  }

  async updateAgentStatus(agentId: string, status: Agent['status']): Promise<Agent> {
    const idx = this.agents.findIndex((a) => a.id.toLowerCase() === agentId.toLowerCase());
    if (idx === -1) throw new Error(`Agent ${agentId} not found`);
    this.agents[idx] = { ...this.agents[idx], status };
    return Promise.resolve(this.agents[idx]);
  }

  async getSLAPolicies(): Promise<SLAPolicy[]> {
    return Promise.resolve([...mockSLAPolicies]);
  }

  async getSLARiskSummary(): Promise<SLARiskSummary> {
    return Promise.resolve({ ...mockSLARiskSummary });
  }

  async getDepartmentPressure(): Promise<DepartmentSLAPressure[]> {
    return Promise.resolve([...mockDepartmentPressure]);
  }

  async getEscalations(): Promise<EscalationRecord[]> {
    return Promise.resolve([...this.escalations]);
  }

  async approveEscalation(escalationId: string): Promise<EscalationRecord> {
    const idx = this.escalations.findIndex((e) => e.id === escalationId);
    if (idx === -1) throw new Error(`Escalation ${escalationId} not found`);
    this.escalations[idx] = {
      ...this.escalations[idx],
      status: 'EXECUTED',
      notes: 'Approved by Human Operator via Command Center.',
    };
    return Promise.resolve(this.escalations[idx]);
  }

  async getIncidents(): Promise<Incident[]> {
    return Promise.resolve([...this.incidents]);
  }

  async approveIncidentAction(incidentId: string, actionId: string): Promise<Incident> {
    const inc = this.incidents.find((i) => i.id === incidentId);
    if (!inc) throw new Error(`Incident ${incidentId} not found`);

    const act = inc.recommendedActions.find((a) => a.id === actionId);
    if (act) {
      act.status = 'APPROVED';
      inc.timeline.unshift({
        timestamp: 'Just now',
        title: `Action Approved: ${act.title}`,
        description: `Operator authorized: ${act.description}`,
        author: 'Command Center Lead',
        type: 'HUMAN_APPROVAL',
      });
      if (act.id === 'ACT-01') {
        inc.queueDepth = Math.max(14, inc.queueDepth - 6);
        inc.avgCapacityUtilization = 68;
      }
    }
    return Promise.resolve({ ...inc });
  }

  async runSimulation(preset: SimulationPreset, customRate?: number, customAvailability?: number): Promise<SimulationResult> {
    const base = simulationPresets[preset] || simulationPresets['Normal Load'];
    const res = JSON.parse(JSON.stringify(base)) as SimulationResult;

    if (customRate !== undefined || customAvailability !== undefined) {
      const rateMod = (customRate ?? 45) / 45;
      const availMod = 100 / (customAvailability ?? 70);
      res.predictedBreachRiskPercent = Math.min(99, Math.round(res.predictedBreachRiskPercent * (rateMod * 0.5 + availMod * 0.5)));
      res.projectedQueuePeak = Math.round(res.projectedQueuePeak * rateMod);
      res.atRiskTicketsCount = Math.round(res.atRiskTicketsCount * rateMod);
    }

    return Promise.resolve(res);
  }

  async getDigitalTwin(): Promise<DigitalTwinState> {
    return Promise.resolve(JSON.parse(JSON.stringify(this.digitalTwin)));
  }

  async optimizeDigitalTwinScenario(): Promise<DigitalTwinState> {
    this.digitalTwin.simulatedFuture = { ...this.digitalTwin.optimizedRecommendation };
    return Promise.resolve(JSON.parse(JSON.stringify(this.digitalTwin)));
  }

  async generateCopilotResponse(ticket: Ticket, tone = 'Empathetic'): Promise<{
    subject: string;
    content: string;
    confidence: number;
    tone: string;
    reasoning: string;
  }> {
    const responsesByCategory: Record<string, { subject: string; content: string; reasoning: string }> = {
      'Payment Failure': {
        subject: `Update on checkout incident regarding ${ticket.subject}`,
        content: `Hello ${ticket.customer.name},\n\nWe understand that your team is encountering checkout errors with code ERR_GATEWAY_TIMEOUT. Our Payments Engineering group has traced this to an upstream 3DS2 card network verification delay and has rerouted your traffic to our redundant clearing gateway.\n\nWe have triggered an internal Pre-Breach Priority protocol to ensure your transactions clear smoothly within the next 15 minutes. We are actively monitoring your transaction completion rate.`,
        reasoning: 'Detected Category: Payment Failure with critical revenue impact. Recommended immediate empathy, confirmation of traffic reroute, and explicit pre-breach SLA priority commitment.',
      },
      'Technical Error': {
        subject: `Investigation Protocol: ${ticket.subject}`,
        content: `Hi ${ticket.customer.name},\n\nOur infrastructure monitoring telemetry has flagged the error pattern described in your ticket. Our technical reliability engineers have isolated the root bottleneck and applied defensive circuit-breaking.\n\nWe will update you within 20 minutes with our verified remediation metrics.`,
        reasoning: 'Detected Category: Technical Error. Tone adjusted to technical precision with diagnostic telemetry reference.',
      },
      'Account Access': {
        subject: `Security Verification & Access Recovery for ${ticket.customer.company}`,
        content: `Hello ${ticket.customer.name},\n\nWe have received your urgent access recovery request. To safeguard your enterprise workspace, our identity team has initialized our out-of-band credential verification protocol. Please review the authentication prompt delivered to your registered administrator contact.`,
        reasoning: 'Detected Category: Account Access & Identity. Emphasizes enterprise security compliance while expediting identity unlock.',
      },
      default: {
        subject: `Support update regarding ticket #${ticket.id}`,
        content: `Hello ${ticket.customer.name},\n\nThank you for reaching out to SLA Guardian AI Support. Our team has received your ticket and classified it with priority ${ticket.priority}. Your assigned specialist is actively reviewing the request and will follow up with actionable next steps shortly.`,
        reasoning: 'Standard AI acknowledgement tailored to customer tier and category requirements.',
      },
    };

    const template = responsesByCategory[ticket.category] || responsesByCategory.default;
    return Promise.resolve({
      subject: template.subject,
      content: template.content,
      confidence: 96,
      tone,
      reasoning: template.reasoning,
    });
  }

  // Demo state mutator for presentation flows
  injectCriticalTicket(criticalTicket: Ticket) {
    this.tickets.unshift(criticalTicket);
  }

  resetDemoState() {
    this.tickets = [...mockTickets];
    this.agents = [...mockAgents];
    this.escalations = [...mockEscalations];
    this.incidents = JSON.parse(JSON.stringify(mockIncidents));
    this.digitalTwin = JSON.parse(JSON.stringify(mockDigitalTwinState));
  }
}

export const localAdapter = new LocalDemoAdapter();

import { realApiAdapter } from './api';

class UnifiedServiceAdapter implements ISLAGuardianService {
  private local = localAdapter;
  private remote = realApiAdapter;
  private isOnline = false;

  constructor() {
    this.checkHealth();
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const res = await this.remote.checkSystemStatus();
      this.isOnline = res.isOnline;
      return this.isOnline;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  async getTickets(): Promise<Ticket[]> {
    try {
      const tickets = await this.remote.getTickets();
      this.isOnline = true;
      return tickets;
    } catch (err) {
      this.isOnline = false;
      return this.local.getTickets();
    }
  }

  async getTicketById(id: string): Promise<Ticket | undefined> {
    try {
      const ticket = await this.remote.getTicketById(id);
      if (ticket) return ticket;
      return this.local.getTicketById(id);
    } catch {
      return this.local.getTicketById(id);
    }
  }

  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    try {
      const res = await this.remote.createTicket(input);
      this.isOnline = true;
      return res;
    } catch {
      return this.local.createTicket(input);
    }
  }

  async updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
    try {
      return await this.remote.updateTicketStatus(id, status);
    } catch {
      return this.local.updateTicketStatus(id, status);
    }
  }

  async triggerPreBreachEscalation(ticketId: string, reason: string): Promise<{ success: boolean; escalation: EscalationRecord }> {
    try {
      return await this.remote.triggerPreBreachEscalation(ticketId, reason);
    } catch {
      return this.local.triggerPreBreachEscalation(ticketId, reason);
    }
  }

  async getAgents(): Promise<Agent[]> {
    try {
      const agents = await this.remote.getAgents();
      this.isOnline = true;
      return agents;
    } catch {
      return this.local.getAgents();
    }
  }

  async getAgentById(id: string): Promise<Agent | undefined> {
    try {
      const agent = await this.remote.getAgentById(id);
      if (agent) return agent;
      return this.local.getAgentById(id);
    } catch {
      return this.local.getAgentById(id);
    }
  }

  async updateAgentStatus(agentId: string, status: Agent['status']): Promise<Agent> {
    try {
      return await this.remote.updateAgentStatus(agentId, status);
    } catch {
      return this.local.updateAgentStatus(agentId, status);
    }
  }

  async getSLAPolicies(): Promise<SLAPolicy[]> {
    try {
      return await this.remote.getSLAPolicies();
    } catch {
      return this.local.getSLAPolicies();
    }
  }

  async getSLARiskSummary(): Promise<SLARiskSummary> {
    try {
      return await this.remote.getSLARiskSummary();
    } catch {
      return this.local.getSLARiskSummary();
    }
  }

  async getDepartmentPressure(): Promise<DepartmentSLAPressure[]> {
    try {
      return await this.remote.getDepartmentPressure();
    } catch {
      return this.local.getDepartmentPressure();
    }
  }

  async getEscalations(): Promise<EscalationRecord[]> {
    try {
      return await this.remote.getEscalations();
    } catch {
      return this.local.getEscalations();
    }
  }

  async approveEscalation(escalationId: string): Promise<EscalationRecord> {
    try {
      return await this.remote.approveEscalation(escalationId);
    } catch {
      return this.local.approveEscalation(escalationId);
    }
  }

  async getIncidents(): Promise<Incident[]> {
    try {
      return await this.remote.getIncidents();
    } catch {
      return this.local.getIncidents();
    }
  }

  async approveIncidentAction(incidentId: string, actionId: string): Promise<Incident> {
    try {
      return await this.remote.approveIncidentAction(incidentId, actionId);
    } catch {
      return this.local.approveIncidentAction(incidentId, actionId);
    }
  }

  async runSimulation(preset: SimulationPreset, customRate?: number, customAvailability?: number): Promise<SimulationResult> {
    try {
      return await this.remote.runSimulation(preset, customRate, customAvailability);
    } catch {
      return this.local.runSimulation(preset, customRate, customAvailability);
    }
  }

  async getDigitalTwin(): Promise<DigitalTwinState> {
    try {
      return await this.remote.getDigitalTwin();
    } catch {
      return this.local.getDigitalTwin();
    }
  }

  async optimizeDigitalTwinScenario(): Promise<DigitalTwinState> {
    try {
      return await this.remote.optimizeDigitalTwinScenario();
    } catch {
      return this.local.optimizeDigitalTwinScenario();
    }
  }

  async generateCopilotResponse(ticket: Ticket, tone?: string): Promise<{
    subject: string;
    content: string;
    confidence: number;
    tone: string;
    reasoning: string;
  }> {
    try {
      return await this.remote.generateCopilotResponse(ticket, tone);
    } catch {
      return this.local.generateCopilotResponse(ticket, tone);
    }
  }

  injectCriticalTicket(criticalTicket: Ticket) {
    this.local.injectCriticalTicket(criticalTicket);
  }

  resetDemoState() {
    this.local.resetDemoState();
  }
}

export const demoAdapter = new UnifiedServiceAdapter();

