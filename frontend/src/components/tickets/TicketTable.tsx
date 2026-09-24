import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { Ticket } from '../../types/ticket';
import { RiskBadge, PriorityBadge, StatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export const TicketTable: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  const navigate = useNavigate();
  const { triggerPreBreachEscalation } = useApp();

  if (tickets.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
        <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
        <h4 className="text-sm font-bold text-slate-800">No tickets match your filters</h4>
        <p className="text-xs text-slate-500">Try adjusting your search criteria or resetting filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4 font-bold">Ticket ID</th>
              <th className="py-3.5 px-4 font-bold">Subject</th>
              <th className="py-3.5 px-4 font-bold">Customer</th>
              <th className="py-3.5 px-4 font-bold">Category</th>
              <th className="py-3.5 px-4 font-bold">Department</th>
              <th className="py-3.5 px-4 font-bold text-center">Priority</th>
              <th className="py-3.5 px-4 font-bold text-center">Status</th>
              <th className="py-3.5 px-4 font-bold">Assigned Agent</th>
              <th className="py-3.5 px-4 font-bold text-center">SLA Status</th>
              <th className="py-3.5 px-4 font-bold text-center">Risk</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => {
              const isCrit = ticket.sla.riskLevel === 'CRITICAL';
              return (
                <tr
                  key={ticket.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isCrit ? 'bg-rose-50/30' : ''
                  }`}
                >
                  {/* Ticket ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                    <span
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="cursor-pointer hover:text-indigo-800 hover:underline"
                    >
                      #{ticket.id}
                    </span>
                  </td>

                  {/* Subject */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer truncate transition-colors"
                      title={ticket.subject}
                    >
                      {ticket.subject}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {ticket.description}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">{ticket.customer.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{ticket.customer.company}</div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
                      {ticket.category}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                    {ticket.department}
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <PriorityBadge priority={ticket.priority} />
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <StatusBadge status={ticket.status} />
                  </td>

                  {/* Assigned Agent */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="text-slate-800 font-semibold">{ticket.routing.assignedAgentName || 'Unassigned'}</div>
                    <div className="text-[10px] text-slate-500">
                      Match: <strong className="text-indigo-600 font-bold">{ticket.routing.skillMatchScore}%</strong>
                    </div>
                  </td>

                  {/* SLA Status Bar */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{ticket.sla.remainingMinutes}m</span>
                      </div>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full ${
                            isCrit
                              ? 'bg-rose-500'
                              : ticket.sla.consumedPercentage > 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, ticket.sla.consumedPercentage)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Risk Badge */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <RiskBadge level={ticket.sla.riskLevel} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                        title="View Details"
                        className="text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
                      />
                      {isCrit && ticket.escalationStatus !== 'PREVENTIVE_ESCALATED' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            triggerPreBreachEscalation(
                              ticket.id,
                              `High queue pressure (${ticket.sla.queueDepthAtPrediction} tickets) and remaining time (${ticket.sla.remainingMinutes} min) indicate ${ticket.sla.predictedBreachProbability}% breach probability.`
                            )
                          }
                          icon={<ArrowUpRight className="w-3 h-3" />}
                          title="Pre-Breach Escalate"
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                        >
                          Escalate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
