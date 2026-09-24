import React from 'react';
import { ShieldAlert, TrendingUp, AlertTriangle, Clock, Users, ArrowUpRight } from 'lucide-react';
import { SLAMetrics } from '../../types/ticket';
import { Card, CardHeader, CardContent } from '../common/Card';
import { RiskBadge } from '../common/Badge';
import { Button } from '../common/Button';

interface BreachPredictorCardProps {
  sla: SLAMetrics;
  agentCapacity: number;
  onEscalate?: () => void;
  escalated?: boolean;
}

export const BreachPredictorCard: React.FC<BreachPredictorCardProps> = ({
  sla,
  agentCapacity,
  onEscalate,
  escalated = false,
}) => {
  const isCritical = sla.predictedBreachProbability >= 80;

  return (
    <Card className={`border ${isCritical ? 'border-rose-300 bg-gradient-to-br from-white via-rose-50/30 to-white shadow-xs' : 'border-slate-200 bg-white'}`}>
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <ShieldAlert className={`w-4 h-4 ${isCritical ? 'text-rose-600' : 'text-amber-600'}`} />
            <span>Predictive SLA Breach Intelligence</span>
          </div>
        }
        subtitle="Forecasting failure risk prior to actual SLA deadline breach"
        action={<RiskBadge level={sla.riskLevel} />}
      />

      <CardContent className="space-y-4">
        {/* Probability and Trend Hero */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
              Predicted Breach Risk
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-3xl font-extrabold font-mono tracking-tight ${
                  isCritical ? 'text-rose-600' : 'text-amber-600'
                }`}
              >
                {sla.predictedBreachProbability}%
              </span>
              <span className="text-xs text-rose-700 font-medium">high breach certainty</span>
            </div>
          </div>

          {/* Risk Progression Trend */}
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              Risk Progression
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-mono text-xs">
              {sla.riskTrend.map((val, idx) => (
                <React.Fragment key={idx}>
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold ${
                      idx === sla.riskTrend.length - 1
                        ? 'bg-rose-100 text-rose-700 border border-rose-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {val}%
                  </span>
                  {idx < sla.riskTrend.length - 1 && <span className="text-slate-400">→</span>}
                </React.Fragment>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Accelerating risk curve</span>
          </div>
        </div>

        {/* 4 Multi-Factor Model Signals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1 text-slate-500 text-[11px] mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Remaining SLA</span>
            </div>
            <span className="text-sm font-bold text-slate-900 font-mono">{sla.remainingMinutes} min</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">{sla.consumedPercentage}% consumed</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1 text-slate-500 text-[11px] mb-1">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>Current Queue Depth</span>
            </div>
            <span className="text-sm font-bold text-slate-900 font-mono">{sla.queueDepthAtPrediction} tickets</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">Heavy queue friction</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1 text-slate-500 text-[11px] mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
              <span>Agent Load</span>
            </div>
            <span className="text-sm font-bold text-slate-900 font-mono">{agentCapacity}% load</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Balanced capacity</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1 text-slate-500 text-[11px] mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Est. Breach Time</span>
            </div>
            <span className="text-sm font-bold text-rose-600 font-mono">
              {new Date(sla.predictedBreachTimeIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] text-rose-600 block mt-0.5">Before SLA deadline!</span>
          </div>
        </div>

        {/* Predictive Core Concept Callout */}
        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-800">
              Recommended Intervention: <span className="text-indigo-700 font-bold">{sla.recommendedAction}</span>
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              The AI model detected rising breach probability <strong>BEFORE</strong> the SLA deadline, triggering early intervention protocols.
            </p>
          </div>

          {onEscalate && !escalated && (
            <Button
              variant="danger"
              size="sm"
              onClick={onEscalate}
              icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              className="shrink-0"
            >
              Pre-Breach Escalate
            </Button>
          )}

          {escalated && (
            <span className="text-xs px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold shrink-0">
              Escalation Active
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
