import React from 'react';
import { ShieldAlert, Users, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { SimulationResult } from '../../types/simulation';
import { Card, CardHeader, CardContent } from '../common/Card';

export const SimulationResults: React.FC<{ result: SimulationResult }> = ({ result }) => {
  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Peak Queue */}
        <Card className="p-4 border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Projected Queue Peak</span>
            <TrendingUp className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {result.projectedQueuePeak} tickets
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Expected peak within 45 minutes
          </div>
        </Card>

        {/* Predicted Breach Risk */}
        <Card className="p-4 border-rose-200 bg-rose-50/50 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Predicted Breach Risk</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 font-mono mt-1">
            {result.predictedBreachRiskPercent}%
          </div>
          <div className="text-[10px] text-rose-700 font-medium mt-1">
            {result.atRiskTicketsCount} tickets facing imminent breach
          </div>
        </Card>

        {/* Capacity Utilization */}
        <Card className="p-4 border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Capacity Utilization</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 font-mono mt-1">
            {result.capacityUtilizationPercent}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {result.capacityUtilizationPercent >= 90 ? 'Staffing crisis point' : 'Sustainable load'}
          </div>
        </Card>

        {/* Required Agents vs Deficit */}
        <Card className="p-4 border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Required Agents</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono mt-1">
            {result.requiredAgentsCount} agents
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Available: {result.availableAgentsCount} (Deficit: {result.agentDeficit})
          </div>
        </Card>
      </div>

      {/* AI Comparison: Without Intervention vs With Guardian AI */}
      <Card className="border-indigo-100 bg-white shadow-xs">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-900">SLA Impact Comparison: Legacy Routing vs SLA Guardian AI</span>
            </div>
          }
          subtitle="Quantifying projected SLA breaches saved by predictive early intervention"
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Without Intervention */}
            <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-rose-800 font-bold uppercase tracking-wider">Without Guardian AI (Legacy)</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 font-bold">
                  Unmitigated Risk
                </span>
              </div>
              <div className="text-3xl font-extrabold text-rose-600 font-mono">
                {result.projectedBreachesWithoutIntervention} Breaches
              </div>
              <p className="text-xs text-rose-900/80 leading-relaxed">
                Tickets escalate only after breach deadlines pass, causing contractual penalties, customer churn, and emergency overtime.
              </p>
            </div>

            {/* With Guardian AI */}
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-800 font-bold uppercase tracking-wider">With SLA Guardian AI</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold">
                  Predictive Defense
                </span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 font-mono">
                {result.projectedBreachesWithGuardianAI} Breaches
              </div>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                Pre-breach escalation and automated capacity rebalancing eliminate up to 90% of breaches before contracts are violated.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Mitigations */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-900">Recommended Scenario Mitigations</span>
            </div>
          }
          subtitle="AI-calculated operational steps to prevent predicted queue breakdown"
        />
        <CardContent className="space-y-3">
          {result.recommendedActions.map((rec, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                  {rec.action}
                </p>
                <p className="text-slate-600 pl-5">{rec.impact}</p>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  rec.urgency === 'CRITICAL'
                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                    : 'bg-amber-100 text-amber-700 border border-amber-300'
                }`}
              >
                {rec.urgency}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
