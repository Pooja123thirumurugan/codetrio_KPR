import React from 'react';
import { CategoryPieChart } from '../components/analytics/CategoryPieChart';
import { ResolutionTimeBarChart } from '../components/analytics/ResolutionTimeBarChart';
import { SLAComplianceTrend } from '../components/analytics/SLAComplianceTrend';
import { RiskDistributionChart } from '../components/dashboard/RiskDistributionChart';
import { BarChart3, TrendingUp, ShieldCheck, CheckCircle2, Flame, Users } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { useApp } from '../context/AppContext';

export const Analytics: React.FC = () => {
  const { slaRiskSummary, tickets, escalations, agents } = useApp();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analytics & Operational Metrics</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
            Executive View
          </span>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Deep operational performance metrics, SLA compliance history, and AI breach prevention attribution
        </p>
      </div>

      {/* Top 4 Metric Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>SLA Compliance Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
            {slaRiskSummary.slaComplianceRateToday}%
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Contractual target: 98.0%</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Breaches Prevented</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-600 font-mono mt-1">
            69 Breaches
          </div>
          <span className="text-[10px] text-cyan-700 font-medium mt-1 block">Across 7 active days</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Avg Resolution Time</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            23.4 min
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">-38% vs legacy routing</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>AI Routing Accuracy</span>
            <Users className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-extrabold text-violet-600 font-mono mt-1">
            96.8%
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Optimal first-touch match</span>
        </Card>
      </div>

      {/* Row 1: Compliance Trend Line Chart */}
      <SLAComplianceTrend />

      {/* Row 2: Category Breakdown & Resolution Times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart />
        <ResolutionTimeBarChart />
      </div>

      {/* Row 3: Hourly Breach Risk & Queue Curve */}
      <RiskDistributionChart />
    </div>
  );
};
