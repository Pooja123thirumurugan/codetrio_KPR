import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../common/Card';
import { mockHourlyBreachRiskCurve } from '../../data/mockAnalytics';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, TrendingUp } from 'lucide-react';

export const RiskDistributionChart: React.FC = () => {
  const { slaRiskSummary, departmentPressure } = useApp();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 2-Column: Hourly Predictive Breach Risk vs Active Queue Curve */}
      <Card className="lg:col-span-2 border-slate-200">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
              <span>Predictive SLA Breach Risk & Queue Pressure Trend</span>
            </div>
          }
          subtitle="Real-time projection showing breach probability escalation before SLA expiry"
        />
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockHourlyBreachRiskCurve} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="queueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)',
                    fontSize: '12px',
                    color: '#0f172a',
                  }}
                  itemStyle={{ color: '#334155' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                <Area
                  type="monotone"
                  dataKey="predictedBreachProbability"
                  name="Breach Probability (%)"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#riskGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="activeQueue"
                  name="Active Queue Depth"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#queueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 1-Column: Risk Tier Breakdown */}
      <Card className="border-slate-200">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>SLA Risk Tier Distribution</span>
            </div>
          }
          subtitle={`${slaRiskSummary.totalMonitoredTickets} tickets monitored under active SLAs`}
        />
        <CardContent className="space-y-4">
          {/* Critical Risk Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-rose-600 font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                Critical Risk (≥80%)
              </span>
              <span className="font-mono text-slate-800 font-bold">{slaRiskSummary.criticalRiskCount} tickets</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${(slaRiskSummary.criticalRiskCount / slaRiskSummary.totalMonitoredTickets) * 100}%` }}
              />
            </div>
          </div>

          {/* High Risk Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                High Risk (65% - 79%)
              </span>
              <span className="font-mono text-slate-800 font-bold">{slaRiskSummary.highRiskCount} tickets</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${(slaRiskSummary.highRiskCount / slaRiskSummary.totalMonitoredTickets) * 100}%` }}
              />
            </div>
          </div>

          {/* Medium Risk Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-blue-600 font-medium flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Medium Risk (35% - 64%)
              </span>
              <span className="font-mono text-slate-800 font-bold">{slaRiskSummary.mediumRiskCount} tickets</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${(slaRiskSummary.mediumRiskCount / slaRiskSummary.totalMonitoredTickets) * 100}%` }}
              />
            </div>
          </div>

          {/* Low Risk Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Low Risk (&lt;35%)
              </span>
              <span className="font-mono text-slate-800 font-bold">{slaRiskSummary.lowRiskCount} tickets</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${(slaRiskSummary.lowRiskCount / slaRiskSummary.totalMonitoredTickets) * 100}%` }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-indigo-100 bg-indigo-50/60 p-3 rounded-xl mt-4">
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-indigo-700">Guardian AI Proactive Shield:</strong> Pre-breach escalations trigger automatically when predicted breach risk crosses the 75% threshold, giving agents a 15–30 minute remediation buffer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
