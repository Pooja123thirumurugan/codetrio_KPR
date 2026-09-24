import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowUpRight, Clock, UserCheck, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { RiskBadge } from '../common/Badge';

export const CrisisBanner: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, triggerPreBreachEscalation } = useApp();

  const ticket1048 = tickets.find((t) => t.id === 'TCK-1048');
  if (!ticket1048) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-50/95 via-white to-indigo-50/80 border border-rose-200 p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left Column: Critical Details */}
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase tracking-wide shadow-xs">
              <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
              CRITICAL PRE-BREACH ALERT
            </span>
            <span className="text-xs font-mono font-bold text-slate-800">#TCK-1048</span>
            <RiskBadge level={ticket1048.sla.riskLevel} />
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              Department: {ticket1048.department}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {ticket1048.subject}
          </h3>

          <p className="text-xs text-slate-700 leading-relaxed max-w-4xl">
            <strong className="text-rose-700">Predictive Breach Warning:</strong> Current queue pressure ({ticket1048.sla.queueDepthAtPrediction} tickets) and remaining SLA time ({ticket1048.sla.remainingMinutes} min) indicate an <strong className="underline text-rose-700">82% probability of breach</strong> before standard resolution.
          </p>

          {/* Metric Chips */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>SLA Remaining: <strong className="text-amber-700 font-bold">{ticket1048.sla.remainingMinutes} min</strong> ({ticket1048.sla.consumedPercentage}% consumed)</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Breach Probability: <strong className="text-rose-700 font-bold">82%</strong> (Trend: 72% → 76% → 82%)</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recommended Agent: <strong className="text-emerald-700 font-bold">Priya Sharma</strong> (42% capacity)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/tickets/${ticket1048.id}`)}
            icon={<Eye className="w-3.5 h-3.5 text-slate-600" />}
            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300 font-medium"
          >
            Inspect Ticket Details
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              triggerPreBreachEscalation(
                'TCK-1048',
                'Current queue pressure (24 tickets) and remaining SLA time (18 min) indicate high probability (82%) of breach before the ticket can be resolved.'
              )
            }
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            className="animate-subtle-pulse font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
          >
            Pre-Breach Escalate Now
          </Button>
        </div>
      </div>
    </div>
  );
};
