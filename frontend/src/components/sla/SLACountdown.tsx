import React from 'react';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { SLAMetrics } from '../../types/ticket';

export const SLACountdown: React.FC<{ sla: SLAMetrics }> = ({ sla }) => {
  const isImminent = sla.remainingMinutes <= 20;
  const isHighRisk = sla.predictedBreachProbability >= 75;

  return (
    <div
      className={`p-4 rounded-xl border flex flex-col gap-3 ${
        isImminent
          ? 'bg-rose-50/80 border-rose-300 shadow-xs'
          : isHighRisk
          ? 'bg-amber-50/80 border-amber-300'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-500" />
          SLA Countdown & Budget
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
            isImminent ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse' : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {sla.remainingMinutes > 0 ? `${sla.remainingMinutes}m remaining` : 'BREACHED'}
        </span>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Consumed: <strong className="text-slate-800">{sla.consumedPercentage}%</strong></span>
          <span>Window: <strong className="text-slate-800">{sla.totalDurationMinutes} min</strong></span>
        </div>
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              sla.consumedPercentage >= 85
                ? 'bg-rose-500'
                : sla.consumedPercentage >= 70
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, sla.consumedPercentage)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
        <div>
          <span className="text-slate-500 text-[10px] block">SLA Policy</span>
          <span className="text-slate-800 font-semibold truncate block">{sla.policyName}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Calculated Deadline</span>
          <span className="text-slate-800 font-mono font-semibold block">
            {new Date(sla.deadlineIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
