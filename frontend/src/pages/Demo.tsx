import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  PlayCircle,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  CheckCircle2,
  Users,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { RiskBadge, PriorityBadge } from '../components/common/Badge';

export const Demo: React.FC = () => {
  const navigate = useNavigate();
  const { runDemoScenario, tickets, escalations, agents } = useApp();
  const [currentStep, setCurrentStep] = useState<number>(1);

  const demoScenarios = [
    {
      id: 1,
      title: '1. Normal Operations Baseline',
      desc: 'System operating at optimal capacity. All SLA targets compliant with nominal queue arrival rate.',
      badge: 'Baseline',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionText: 'Set Normal Baseline',
    },
    {
      id: 2,
      title: '2. Inject Critical Enterprise Ticket',
      desc: 'Simulates incoming P1 ticket #TCK-1048 (Payment Failure) under 30-minute SLA guarantee from Fortune 500 client.',
      badge: 'P1 Injected',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      actionText: 'Inject Ticket #TCK-1048',
    },
    {
      id: 3,
      title: '3. Simulate Rising SLA Breach Risk',
      desc: 'Predictive model detects rising queue friction and increases breach probability: 72% → 76% → 82% with 18m remaining.',
      badge: 'Risk: 82%',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      actionText: 'Simulate Risk Surge (82%)',
    },
    {
      id: 4,
      title: '4. Trigger Preventive Escalation',
      desc: 'Guardian AI intervenes BEFORE SLA breach occurs: triggers pre-breach escalation to Tier 2 Payments team and secondary gateway.',
      badge: 'Pre-Breach Action',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      actionText: 'Execute Pre-Breach Escalation',
    },
    {
      id: 5,
      title: '5. Queue Overload Stress Test',
      desc: 'Sudden burst of 15 incoming checkout failure tickets. Queue depth jumps past saturation limits.',
      badge: 'Surge Test',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      actionText: 'Inject Queue Surge',
    },
    {
      id: 6,
      title: '6. Agent Failure Simulation',
      desc: 'Senior specialist Agent David Chen abruptly goes offline. Workload automatically redistributes across available agents.',
      badge: 'Failover',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      actionText: 'Drop Agent Offline',
    },
    {
      id: 7,
      title: '7. Automated Recovery & Normalization',
      desc: 'Overflow capacity absorbs excess tickets, workload rebalances, and breach probability returns safely under 20%.',
      badge: 'Restored',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      actionText: 'Trigger Recovery Flow',
    },
  ];

  const handleScenarioClick = (id: number) => {
    setCurrentStep(id);
    runDemoScenario(id);
  };

  const ticket1048 = tickets.find((t) => t.id === 'TCK-1048');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hackathon Evaluation Demo Mode</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold tracking-wide">
              7-Step Live Walkthrough
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Simulate the entire end-to-end predictive lifecycle with one-click interactive scenarios
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleScenarioClick(1)}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Demo
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Guided Walkthrough Step Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {demoScenarios.map((sc) => {
          const isCurrent = currentStep === sc.id;
          const isPassed = currentStep > sc.id;

          return (
            <Card
              key={sc.id}
              className={`p-4 border transition-all ${
                isCurrent
                  ? 'border-indigo-500 bg-indigo-50/50 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20'
                  : isPassed
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${sc.badgeColor}`}>
                  {sc.badge}
                </span>
                {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              </div>

              <h4 className="text-xs font-bold text-slate-900">{sc.title}</h4>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed min-h-[44px]">
                {sc.desc}
              </p>

              <div className="pt-3 border-t border-slate-100 mt-3">
                <Button
                  variant={isCurrent ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleScenarioClick(sc.id)}
                  className="w-full text-xs font-semibold"
                >
                  {sc.actionText}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Live Scenario Telemetry Feedback Preview */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-slate-900 font-bold">Active Scenario Telemetry Live Preview</span>
            </div>
          }
          subtitle={`Current Stage: Step ${currentStep} of 7`}
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Box 1: TCK-1048 Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                Primary Crisis Ticket Status
              </span>
              {ticket1048 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-600 text-sm">#{ticket1048.id}</span>
                    <RiskBadge level={ticket1048.sla.riskLevel} />
                  </div>
                  <p className="text-slate-800 truncate font-medium">{ticket1048.subject}</p>
                  <div className="flex justify-between text-[11px] pt-1 text-slate-500">
                    <span>SLA: <strong className="text-amber-600">{ticket1048.sla.remainingMinutes}m left</strong></span>
                    <span>Breach Risk: <strong className="text-rose-600">{ticket1048.sla.predictedBreachProbability}%</strong></span>
                  </div>
                  <div className="text-[11px] text-indigo-700 font-medium">
                    Action: {ticket1048.sla.recommendedAction}
                  </div>
                </>
              ) : (
                <p className="text-slate-400 italic">Ticket not yet injected into queue</p>
              )}
            </div>

            {/* Box 2: Active Escalation Ledger */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                Pre-Breach Escalation Status
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Total Escalations:</span>
                <span className="font-mono font-bold text-indigo-600 text-sm">{escalations.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Pre-Breach Preventive:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  {escalations.filter((e) => e.type === 'PREVENTIVE').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Pending Human Approval:</span>
                <span className="font-mono font-bold text-amber-600 text-sm">
                  {escalations.filter((e) => e.status === 'PENDING_APPROVAL').length}
                </span>
              </div>
            </div>

            {/* Box 3: Agent Fleet Capacity */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                Agent Workload Saturation
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Available Agents:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  {agents.filter((a) => a.status === 'AVAILABLE').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">At Capacity (100%):</span>
                <span className="font-mono font-bold text-rose-600 text-sm">
                  {agents.filter((a) => a.status === 'AT CAPACITY').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Offline / Failover:</span>
                <span className="font-mono font-bold text-slate-500 text-sm">
                  {agents.filter((a) => a.status === 'OFFLINE').length}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
