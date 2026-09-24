import React from 'react';
import {
  Ticket as TicketIcon,
  AlertTriangle,
  Flame,
  ShieldAlert,
  ArrowUpRight,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardContent } from '../common/Card';

export const KPICards: React.FC = () => {
  const { tickets, agents, escalations, slaRiskSummary } = useApp();

  const openTickets = tickets.filter((t) => t.status !== 'RESOLVED').length;
  const criticalTickets = tickets.filter((t) => t.priority === 'P1 - Critical').length;
  const atRiskTickets = tickets.filter((t) => t.sla.riskLevel === 'CRITICAL' || t.sla.riskLevel === 'HIGH').length;
  const availableAgents = agents.filter((a) => a.status === 'AVAILABLE').length;
  const totalAgents = agents.length;
  const avgUtilization = Math.round(
    agents.reduce((acc, a) => acc + a.utilizationPercentage, 0) / (agents.length || 1)
  );

  const preBreachEscalations = escalations.filter((e) => e.type === 'PREVENTIVE').length;

  const kpis = [
    {
      title: 'Open Tickets',
      value: openTickets,
      subtitle: `${tickets.length} total monitored`,
      icon: <TicketIcon className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-100',
      badge: '+4 in last hr',
      badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    },
    {
      title: 'Critical P1 Tickets',
      value: criticalTickets,
      subtitle: 'Immediate triage required',
      icon: <Flame className="w-5 h-5 text-rose-600 animate-pulse" />,
      color: 'bg-rose-50 border-rose-100',
      badge: 'Contract VIP',
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      title: 'At-Risk Tickets',
      value: atRiskTickets,
      subtitle: `${slaRiskSummary.imminentBreachesNext30Min} breach risk < 30m`,
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 border-amber-100',
      badge: 'High Probability',
      badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    {
      title: 'SLA Breach Risk',
      value: `${slaRiskSummary.overallBreachProbability}%`,
      subtitle: 'Queue probability curve',
      icon: <ShieldAlert className="w-5 h-5 text-cyan-600" />,
      color: 'bg-cyan-50 border-cyan-100',
      badge: 'Predictive v2.4',
      badgeColor: 'text-cyan-800 bg-cyan-50 border-cyan-200',
    },
    {
      title: 'Active Escalations',
      value: escalations.length,
      subtitle: `${preBreachEscalations} Pre-Breach prevented`,
      icon: <ArrowUpRight className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50 border-purple-100',
      badge: 'Preventive First',
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
    },
    {
      title: 'Available Agents',
      value: `${availableAgents}/${totalAgents}`,
      subtitle: `${avgUtilization}% avg capacity load`,
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-100',
      badge: 'Optimal Roster',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {kpis.map((kpi, idx) => (
        <Card key={idx} hoverable className="p-0 overflow-hidden bg-white border border-slate-200/90 shadow-xs">
          <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl border ${kpi.color}`}>
                {kpi.icon}
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${kpi.badgeColor}`}>
                {kpi.badge}
              </span>
            </div>

            <div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">{kpi.value}</div>
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mt-0.5 truncate">{kpi.title}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{kpi.subtitle}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
