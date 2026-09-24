import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskDistributionChart } from '../components/dashboard/RiskDistributionChart';
import { QueueLoadCard } from '../components/dashboard/QueueLoadCard';
import { AlertTriangle, Clock, ShieldAlert, ArrowUpRight, Filter, Eye } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { RiskBadge, PriorityBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const SLARisk: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, triggerPreBreachEscalation, slaRiskSummary } = useApp();

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');

  const filteredTickets = tickets
    .filter((t) => t.status !== 'RESOLVED')
    .filter((t) => (selectedDept ? t.department === selectedDept : true))
    .filter((t) => (selectedRisk ? t.sla.riskLevel === selectedRisk : true))
    .sort((a, b) => b.sla.predictedBreachProbability - a.sla.predictedBreachProbability);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Predictive SLA Risk Monitor</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 font-bold">
              {slaRiskSummary.criticalRiskCount} Critical Risks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time breach probability forecasting, queue velocity models, and proactive escalation triggers
          </p>
        </div>

        {/* Breach Prevention Metric Banner */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 shadow-xs rounded-xl px-4 py-2 text-xs text-slate-700">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <span>Preventive Escalations Today: <strong className="text-emerald-700 font-bold">{slaRiskSummary.preventiveEscalationsTriggeredToday}</strong></span>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <RiskDistributionChart />

      {/* Department Queue Pressure */}
      <QueueLoadCard />

      {/* Filterable High-Risk Watchlist */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="font-bold text-slate-900">SLA At-Risk Queue Ledger</span>
            </div>
          }
          subtitle="All active tickets ranked by predicted breach probability"
          action={
            <div className="flex items-center gap-3">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-600"
              >
                <option value="">All Departments</option>
                {['Payments', 'Technical Support', 'Billing', 'Account Support', 'Product Support'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-600"
              >
                <option value="">All Risk Tiers</option>
                {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          }
        />

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Ticket ID</th>
                <th className="py-3 px-4 font-semibold">Subject</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold text-center">Priority</th>
                <th className="py-3 px-4 font-semibold text-center">SLA Remaining</th>
                <th className="py-3 px-4 font-semibold text-center">Breach Prob.</th>
                <th className="py-3 px-4 font-semibold text-center">Risk Tier</th>
                <th className="py-3 px-4 font-semibold">Predicted Breach Time</th>
                <th className="py-3 px-4 font-semibold">Recommended Action</th>
                <th className="py-3 px-4 font-semibold text-right">Escalate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((ticket) => {
                const isCrit = ticket.sla.riskLevel === 'CRITICAL';

                return (
                  <tr
                    key={ticket.id}
                    className={`hover:bg-slate-50 transition-colors ${isCrit ? 'bg-rose-50/30' : ''}`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      <span
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="cursor-pointer hover:text-indigo-800 hover:underline"
                      >
                        #{ticket.id}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="font-semibold text-slate-900 truncate hover:text-indigo-600 cursor-pointer"
                      >
                        {ticket.subject}
                      </p>
                      <span className="text-[10px] text-slate-500">{ticket.customer.company}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-700">{ticket.department}</td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority} />
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap font-mono font-semibold">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className={ticket.sla.remainingMinutes <= 20 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                          {ticket.sla.remainingMinutes}m
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
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
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <RiskBadge level={ticket.sla.riskLevel} />
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                      {new Date(ticket.sla.predictedBreachTimeIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-semibold text-slate-800">
                        {ticket.sla.recommendedAction}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
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
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                          Pre-Escalated
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
