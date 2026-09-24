import React from 'react';
import { KPICards } from '../components/dashboard/KPICards';
import { CrisisBanner } from '../components/dashboard/CrisisBanner';
import { LiveSLARiskQueue } from '../components/dashboard/LiveSLARiskQueue';
import { RiskDistributionChart } from '../components/dashboard/RiskDistributionChart';
import { QueueLoadCard } from '../components/dashboard/QueueLoadCard';
import { ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Support Operations Command Center</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Monitor
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Predictive SLA breach prevention, automated skill-aware routing & proactive escalation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/simulator')}
          >
            What-If Simulator
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/demo')}
            icon={<Sparkles className="w-3.5 h-3.5" />}
            className="bg-gradient-to-r from-indigo-600 to-cyan-600 font-bold"
          >
            Launch Hackathon Demo Flow
          </Button>
        </div>
      </div>

      {/* Prominent Crisis Pre-Breach Alert Banner */}
      <CrisisBanner />

      {/* 7 KPI Cards */}
      <KPICards />

      {/* Live SLA Risk Queue Table */}
      <LiveSLARiskQueue />

      {/* Predictive SLA Risk Visualization Charts */}
      <RiskDistributionChart />

      {/* Department Queue Depth & Capacity Pressure */}
      <QueueLoadCard />
    </div>
  );
};
