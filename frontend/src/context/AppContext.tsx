import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ticket, TicketStatus, RiskLevel, UserRole, CreateTicketInput, CustomerInfo } from '../types/ticket';
import { Agent } from '../types/agent';
import { EscalationRecord } from '../types/escalation';
import { Incident } from '../types/incident';
import { SLARiskSummary, DepartmentSLAPressure } from '../types/sla';
import { demoAdapter } from '../services/demoAdapter';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

interface AppContextType {
  tickets: Ticket[];
  agents: Agent[];
  escalations: EscalationRecord[];
  incidents: Incident[];
  slaRiskSummary: SLARiskSummary;
  departmentPressure: DepartmentSLAPressure[];
  toasts: ToastMessage[];
  loading: boolean;
  selectedTicket: Ticket | null;
  setSelectedTicket: (ticket: Ticket | null) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isRaiseTicketModalOpen: boolean;
  setIsRaiseTicketModalOpen: (open: boolean) => void;
  activeAgentPersona: Agent | undefined;
  activeCustomerPersona: CustomerInfo;
  createTicket: (input: CreateTicketInput) => Promise<Ticket>;
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  triggerPreBreachEscalation: (ticketId: string, reason: string) => Promise<void>;
  approveEscalation: (escalationId: string) => Promise<void>;
  approveIncidentAction: (incidentId: string, actionId: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  updateAgentStatus: (agentId: string, status: Agent['status']) => Promise<void>;
  runDemoScenario: (scenarioNumber: number) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [slaRiskSummary, setSlaRiskSummary] = useState<SLARiskSummary>({
    totalMonitoredTickets: 50,
    criticalRiskCount: 6,
    highRiskCount: 11,
    mediumRiskCount: 15,
    lowRiskCount: 18,
    overallBreachProbability: 28.5,
    averageRemainingMinutes: 68,
    imminentBreachesNext30Min: 4,
    preventiveEscalationsTriggeredToday: 9,
    slaComplianceRateToday: 98.4,
  });
  const [departmentPressure, setDepartmentPressure] = useState<DepartmentSLAPressure[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [isRaiseTicketModalOpen, setIsRaiseTicketModalOpen] = useState<boolean>(false);

  // Default active personas
  const activeAgentPersona = agents.find((a) => a.name.includes('Priya')) || agents[0];
  const activeCustomerPersona: CustomerInfo = {
    id: 'CUST-001',
    name: 'Sarah Jenkins',
    email: 'sarah.j@acmecorp.com',
    company: 'Acme Corp',
    tier: 'Enterprise',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  };

  const addToast = (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = {
      ...toast,
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    setTimeout(() => {
      removeToast(id);
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [tList, aList, eList, iList, sSummary, dPressure] = await Promise.all([
        demoAdapter.getTickets(),
        demoAdapter.getAgents(),
        demoAdapter.getEscalations(),
        demoAdapter.getIncidents(),
        demoAdapter.getSLARiskSummary(),
        demoAdapter.getDepartmentPressure(),
      ]);

      setTickets(tList);
      setAgents(aList);
      setEscalations(eList);
      setIncidents(iList);
      setSlaRiskSummary(sSummary);
      setDepartmentPressure(dPressure);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const triggerPreBreachEscalation = async (ticketId: string, reason: string) => {
    try {
      const res = await demoAdapter.triggerPreBreachEscalation(ticketId, reason);
      await refreshData();
      addToast({
        type: 'warning',
        title: 'Preventive Escalation Dispatched',
        message: `Ticket #${ticketId} escalated prior to SLA breach. Assigned to Tier 2 specialist.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Escalation Failed',
        message: err.message || 'Could not escalate ticket',
      });
    }
  };

  const approveEscalation = async (escalationId: string) => {
    try {
      await demoAdapter.approveEscalation(escalationId);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Escalation Approved',
        message: `Action on ${escalationId} approved by Human Operator. Special routing applied.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message,
      });
    }
  };

  const approveIncidentAction = async (incidentId: string, actionId: string) => {
    try {
      await demoAdapter.approveIncidentAction(incidentId, actionId);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Incident Action Authorized',
        message: 'Action approved by Human Operator. Safeguard mitigations activated.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Authorization Failed',
        message: err.message,
      });
    }
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    try {
      await demoAdapter.updateTicketStatus(ticketId, status);
      await refreshData();
      addToast({
        type: 'info',
        title: 'Ticket Updated',
        message: `Ticket #${ticketId} status changed to ${status}`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message,
      });
    }
  };

  const updateAgentStatus = async (agentId: string, status: Agent['status']) => {
    try {
      await demoAdapter.updateAgentStatus(agentId, status);
      await refreshData();
      addToast({
        type: 'info',
        title: 'Agent Status Changed',
        message: `Agent ${agentId} is now ${status}`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Status Update Failed',
        message: err.message,
      });
    }
  };

  const createTicket = async (input: CreateTicketInput): Promise<Ticket> => {
    try {
      const newTicket = await demoAdapter.createTicket(input);
      await refreshData();
      addToast({
        type: 'success',
        title: `Ticket #${newTicket.id} Auto-Routed`,
        message: `Assigned to ${newTicket.routing.assignedAgentName} with ${newTicket.sla.totalDurationMinutes}m SLA guarantee.`,
      });
      return newTicket;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Ticket Creation Failed',
        message: err.message,
      });
      throw err;
    }
  };

  // Demo Scenarios as required by Section 19 of prompt:
  // 1. Normal Operations
  // 2. Critical Ticket Arrives (TCK-1048)
  // 3. SLA Risk Increasing (72% -> 76% -> 82%)
  // 4. Preventive Escalation Triggered
  // 5. Queue Overload
  // 6. Agent Failure
  // 7. Recovery
  const runDemoScenario = (scenarioNumber: number) => {
    switch (scenarioNumber) {
      case 1: // Normal Operations
        demoAdapter.resetDemoState();
        refreshData();
        addToast({
          type: 'info',
          title: 'Demo: Normal Operations',
          message: 'System running with steady traffic. All SLA policies within compliant parameters.',
        });
        break;

      case 2: // Inject Critical Ticket
        const criticalTicket: Ticket = {
          id: 'TCK-1048',
          subject: 'Payment failure during checkout on enterprise tier gateway',
          description: 'Multiple users in the APAC region are encountering error code ERR_GATEWAY_TIMEOUT (504) when processing Visa 3D-Secure 2.0 transactions.',
          customer: {
            id: 'CUST-891',
            name: 'Elena Rostova (CTO)',
            email: 'elena@novacommerce.io',
            company: 'NovaCommerce Enterprise',
            tier: 'Enterprise',
          },
          category: 'Payment Failure',
          department: 'Payments',
          urgency: 'CRITICAL',
          priority: 'P1 - Critical',
          status: 'IN_PROGRESS',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sla: {
            policyId: 'SLA-PAY-CRIT',
            policyName: 'Payments Tier-1 Critical Checkout',
            totalDurationMinutes: 120,
            elapsedMinutes: 80,
            remainingMinutes: 40,
            consumedPercentage: 66,
            deadlineIso: new Date(Date.now() + 40 * 60000).toISOString(),
            predictedBreachProbability: 72,
            riskLevel: 'HIGH',
            riskTrend: [60, 68, 72],
            predictedBreachTimeIso: new Date(Date.now() + 32 * 60000).toISOString(),
            recommendedAction: 'Monitor Progress',
            queueDepthAtPrediction: 24,
          },
          routing: {
            assignedAgentId: 'AGT-01',
            assignedAgentName: 'Agent Priya Sharma',
            recommendedAgentId: 'AGT-01',
            recommendedAgentName: 'Agent Priya Sharma',
            confidenceScore: 96,
            skillMatchScore: 98,
            agentCurrentCapacity: 42,
            agentWorkloadRatio: '3/7',
            historicalSlaRate: 98.8,
            reasoning: 'Selected because the agent has the required payment-support skill, is currently at 42% capacity, and has strong historical SLA performance.',
            routedAtIso: new Date().toISOString(),
          },
          timeline: [
            { timestamp: 'Just now', action: 'Injected via Demo Mode', performedBy: 'Evaluator', details: 'Critical ticket injected into live queue' },
          ],
        };
        demoAdapter.injectCriticalTicket(criticalTicket);
        refreshData();
        addToast({
          type: 'warning',
          title: 'Critical Ticket Injected: TCK-1048',
          message: 'P1 payment failure entered Payments queue. SLA Countdown started: 40m remaining.',
        });
        break;

      case 3: // SLA Risk Increasing
        setTickets((prev) =>
          prev.map((t) => {
            if (t.id === 'TCK-1048') {
              return {
                ...t,
                sla: {
                  ...t.sla,
                  elapsedMinutes: 102,
                  remainingMinutes: 18,
                  consumedPercentage: 91,
                  predictedBreachProbability: 82,
                  riskLevel: 'CRITICAL',
                  riskTrend: [72, 76, 82],
                  recommendedAction: 'PRE-BREACH ESCALATION',
                },
              };
            }
            return t;
          })
        );
        addToast({
          type: 'error',
          title: 'Breach Risk Escalation: TCK-1048',
          message: 'Breach probability increased to 82% (18m remaining). Recommended: ESCALATE NOW.',
        });
        break;

      case 4: // Preventive Escalation Triggered
        triggerPreBreachEscalation(
          'TCK-1048',
          'Current queue pressure (24 tickets) and remaining SLA time (18 min) indicate high probability (82%) of breach before the ticket can be resolved.'
        );
        break;

      case 5: // Queue Overload
        setTickets((prev) => [
          ...prev,
          {
            id: 'TCK-SURGE-01',
            subject: 'Surge: Gateway latency spike impact on cart checkout',
            description: 'Automated burst ticket during simulated queue overload.',
            customer: { id: 'CUST-S1', name: 'Mark Wood', email: 'mwood@surge.io', company: 'Surge Commerce', tier: 'Enterprise' },
            category: 'Payment Failure',
            department: 'Payments',
            urgency: 'CRITICAL',
            priority: 'P1 - Critical',
            status: 'NEW',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sla: {
              policyId: 'SLA-PAY-CRIT',
              policyName: 'Payments Tier-1 Critical Checkout',
              totalDurationMinutes: 60,
              elapsedMinutes: 30,
              remainingMinutes: 30,
              consumedPercentage: 50,
              deadlineIso: new Date(Date.now() + 30 * 60000).toISOString(),
              predictedBreachProbability: 79,
              riskLevel: 'HIGH',
              riskTrend: [60, 71, 79],
              predictedBreachTimeIso: new Date(Date.now() + 25 * 60000).toISOString(),
              recommendedAction: 'PRE-BREACH ESCALATION',
              queueDepthAtPrediction: 38,
            },
            routing: {
              recommendedAgentId: 'AGT-05',
              recommendedAgentName: 'Sarah Al-Mansoor',
              confidenceScore: 92,
              skillMatchScore: 94,
              agentCurrentCapacity: 75,
              agentWorkloadRatio: '5/6',
              historicalSlaRate: 98.5,
              reasoning: 'Reassigned to Sarah Al-Mansoor as overflow receiver.',
              routedAtIso: new Date().toISOString(),
            },
            timeline: [{ timestamp: 'Just now', action: 'Queue Surge', performedBy: 'Demo Simulator', details: 'Surge injection' }],
          },
        ]);
        setSlaRiskSummary((prev) => ({
          ...prev,
          criticalRiskCount: prev.criticalRiskCount + 3,
          overallBreachProbability: 64.2,
          imminentBreachesNext30Min: 7,
        }));
        addToast({
          type: 'error',
          title: 'Demo: Queue Overload Triggered',
          message: 'Queue depth increased past threshold. SRE and Operations alerts fired.',
        });
        break;

      case 6: // Agent Failure
        setAgents((prev) =>
          prev.map((a) => (a.id === 'AGT-04' ? { ...a, status: 'OFFLINE' } : a))
        );
        addToast({
          type: 'warning',
          title: 'Demo: Agent Failure Injected',
          message: 'Agent David Chen went OFFLINE. 8 active tickets flagged for automatic reassignment.',
        });
        break;

      case 7: // Recovery
        demoAdapter.resetDemoState();
        refreshData();
        addToast({
          type: 'success',
          title: 'Demo: Recovery Complete',
          message: 'Workload normalized, overflow capacity deactivated, SLA risks returned to baseline (<20%).',
        });
        break;

      default:
        break;
    }
  };

  const resetAllData = () => {
    demoAdapter.resetDemoState();
    refreshData();
    addToast({
      type: 'info',
      title: 'Data Reset',
      message: 'Restored original demo state and realistic dataset.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        tickets,
        agents,
        escalations,
        incidents,
        slaRiskSummary,
        departmentPressure,
        toasts,
        loading,
        selectedTicket,
        setSelectedTicket,
        addToast,
        removeToast,
        triggerPreBreachEscalation,
        approveEscalation,
        approveIncidentAction,
        updateTicketStatus,
        updateAgentStatus,
        runDemoScenario,
        resetAllData,
        currentRole,
        setCurrentRole,
        isRaiseTicketModalOpen,
        setIsRaiseTicketModalOpen,
        activeAgentPersona,
        activeCustomerPersona,
        createTicket,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
