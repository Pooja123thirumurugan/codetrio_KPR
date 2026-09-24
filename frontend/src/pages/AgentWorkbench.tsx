import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';

export const AgentWorkbench: React.FC = () => {
  const { tickets, agents, activeAgentPersona, updateTicketStatus, addToast } = useApp();
  const navigate = useNavigate();

  // Find Priya Sharma or active agent
  const agent = agents.find((a) => a.name.includes('Priya')) || activeAgentPersona || agents[0];

  // Tickets assigned to this agent
  const myAssignedTickets = tickets.filter(
    (t) =>
      t.routing.assignedAgentId === agent?.id ||
      t.routing.assignedAgentName?.toLowerCase().includes('priya') ||
      t.routing.recommendedAgentName?.toLowerCase().includes('priya')
  );

  const urgentTicket = myAssignedTickets.find((t) => t.sla.riskLevel === 'CRITICAL') || myAssignedTickets[0];

  const handleQuickResolve = async (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation();
    await updateTicketStatus(ticketId, 'RESOLVED');
    addToast({
      type: 'success',
      title: 'Ticket Marked Resolved',
      message: `Ticket #${ticketId} was successfully resolved by Priya Sharma.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Agent Profile & Workload Header */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-emerald-50/80 via-white to-indigo-50/80 border border-emerald-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={agent?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces'}
                alt={agent?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-300" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{agent?.name}</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-xs">
                  {agent?.tier}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {agent?.department}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Specialized in Payment Gateways, Double-Charge Mitigations, and Stripe 3D-Secure Protocol
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-left">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 min-w-32 shadow-xs">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Active Workload</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                {myAssignedTickets.length} / {agent?.maxCapacity || 12}
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.round((myAssignedTickets.length / (agent?.maxCapacity || 12)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 min-w-32 shadow-xs">
              <div className="text-[10px] text-slate-500 uppercase font-bold">SLA Compliance</div>
              <div className="text-xl font-extrabold text-emerald-600 mt-0.5">{agent?.slaAdherenceRate}%</div>
              <div className="text-[9px] text-slate-500 mt-1">Zero breaches (30 days)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Critical Ticket Focus (TCK-1048) */}
      {urgentTicket && (
        <div className="p-6 rounded-3xl bg-rose-50/90 border border-rose-200/90 shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-800 flex items-center gap-1.5 shadow-xs">
                  <Flame className="w-4 h-4 text-rose-600 animate-bounce" />
                  PRE-BREACH PREVENTIVE ESCALATION ACTIVE
                </span>
                <span className="text-xs font-mono font-bold text-slate-800">{urgentTicket.id}</span>
                <PriorityBadge priority={urgentTicket.priority} />
              </div>

              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{urgentTicket.subject}</h2>
              <p className="text-xs text-slate-600 max-w-2xl">{urgentTicket.description}</p>

              <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
                <span className="text-slate-600">
                  Customer: <strong className="text-slate-900">{urgentTicket.customer.name} ({urgentTicket.customer.company})</strong>
                </span>
                <span className="text-rose-700 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {urgentTicket.sla.remainingMinutes} Minutes Left (82% Breach Risk)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(`/tickets/${urgentTicket.id}`)}
                icon={<Sparkles className="w-4 h-4" />}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
              >
                Launch AI Copilot Draft
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* My Work Queue */}
      <Card>
        <CardHeader
          title={`Priya's Active Tickets (${myAssignedTickets.length})`}
          subtitle="Tickets routed to you based on payment domain skills, low queue pressure, and SLA compliance"
        />
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {myAssignedTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/tickets/${t.id}`)}
                className="p-5 hover:bg-slate-50/80 cursor-pointer transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-indigo-600 group-hover:text-indigo-800">
                      {t.id}
                    </span>
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                      {t.customer.company}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {t.subject}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-1">{t.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">SLA Window</div>
                    <div className="text-xs font-mono font-bold text-emerald-700">{t.sla.remainingMinutes}m left</div>
                    <div className="text-[10px] text-slate-500 font-medium">Risk: {t.sla.predictedBreachProbability}%</div>
                  </div>

                  {t.status !== 'RESOLVED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleQuickResolve(e, t.id)}
                      icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      className="border-slate-200 hover:bg-emerald-50 text-slate-700"
                    >
                      Resolve
                    </Button>
                  )}

                  <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
