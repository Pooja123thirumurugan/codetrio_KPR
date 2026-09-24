import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Clock, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardContent } from '../common/Card';
import { RiskBadge, PriorityBadge } from '../common/Badge';
import { Button } from '../common/Button';

export const LiveSLARiskQueue: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, triggerPreBreachEscalation } = useApp();

  // Sort by highest breach probability and remaining minutes ascending
  const atRiskTickets = [...tickets]
    .filter((t) => t.status !== 'RESOLVED')
    .sort((a, b) => b.sla.predictedBreachProbability - a.sla.predictedBreachProbability)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-slate-900 font-bold">LIVE SLA RISK QUEUE</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
              Real-time predictive breach prioritization
            </span>
          </div>
        }
        subtitle="Ranked by predictive breach probability before SLA deadline expiration"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/sla-risk')}
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
          >
            View All ({tickets.length})
          </Button>
        }
      />

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4 font-semibold">Ticket ID</th>
              <th className="py-3 px-4 font-semibold">Subject</th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th className="py-3 px-4 font-semibold">Priority</th>
              <th className="py-3 px-4 font-semibold">Assigned Agent</th>
              <th className="py-3 px-4 font-semibold text-center">SLA Remaining</th>
              <th className="py-3 px-4 font-semibold text-center">Breach Prob.</th>
              <th className="py-3 px-4 font-semibold text-center">Risk Level</th>
              <th className="py-3 px-4 font-semibold">Recommended Action</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {atRiskTickets.map((ticket) => {
              const isCrit = ticket.sla.riskLevel === 'CRITICAL';
              return (
                <tr
                  key={ticket.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isCrit ? 'bg-rose-50/40' : ''
                  }`}
                >
                  {/* Ticket ID */}
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                    <span
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="cursor-pointer hover:text-indigo-800 hover:underline"
                    >
                      #{ticket.id}
                    </span>
                  </td>

                  {/* Subject */}
                  <td className="py-3 px-4 max-w-xs">
                    <p
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="font-medium text-slate-900 truncate hover:text-indigo-600 cursor-pointer"
                    >
                      {ticket.subject}
                    </p>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {ticket.customer.company} • {ticket.customer.tier}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                      {ticket.category}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <PriorityBadge priority={ticket.priority} />
                  </td>

                  {/* Assigned Agent */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold border border-slate-200">
                        {ticket.routing.assignedAgentName
                          ? ticket.routing.assignedAgentName.split(' ').map((n) => n[0]).join('').slice(0, 2)
                          : 'UA'}
                      </div>
                      <span className="text-slate-800 truncate max-w-[110px] font-medium">
                        {ticket.routing.assignedAgentName || 'Unassigned'}
                      </span>
                    </div>
                  </td>

                  {/* SLA Remaining */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 font-mono font-semibold text-slate-800">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className={ticket.sla.remainingMinutes <= 20 ? 'text-rose-600 font-bold' : ''}>
                        {ticket.sla.remainingMinutes} min
                      </span>
                    </div>
                    <div className="w-16 bg-slate-100 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          ticket.sla.consumedPercentage > 80
                            ? 'bg-rose-500'
                            : ticket.sla.consumedPercentage > 60
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, ticket.sla.consumedPercentage)}%` }}
                      />
                    </div>
                  </td>

                  {/* Breach Probability */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center">
                      <span
                        className={`font-mono font-extrabold text-sm ${
                          ticket.sla.predictedBreachProbability >= 80
                            ? 'text-rose-600'
                            : ticket.sla.predictedBreachProbability >= 65
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {ticket.sla.predictedBreachProbability}%
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {ticket.sla.riskTrend.join('→')}%
                      </span>
                    </div>
                  </td>

                  {/* Risk Level */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <RiskBadge level={ticket.sla.riskLevel} />
                  </td>

                  {/* Recommended Action */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        ticket.sla.recommendedAction.includes('ESCALAT')
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {ticket.sla.recommendedAction.includes('ESCALAT') && (
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                      )}
                      {ticket.sla.recommendedAction}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                        title="View details"
                      >
                        Details
                      </Button>

                      {ticket.escalationStatus !== 'PREVENTIVE_ESCALATED' ? (
                        <Button
                          variant={isCrit ? 'danger' : 'secondary'}
                          size="sm"
                          onClick={() =>
                            triggerPreBreachEscalation(
                              ticket.id,
                              `Predicted breach probability ${ticket.sla.predictedBreachProbability}% exceeded policy threshold.`
                            )
                          }
                          icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                        >
                          Escalate
                        </Button>
                      ) : (
                        <span className="text-[10px] px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                          Escalated
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
