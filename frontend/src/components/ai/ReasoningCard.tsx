import React from 'react';
import { Sparkles, Brain, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { RoutingDecision } from '../../types/ticket';
import { Card, CardHeader, CardContent } from '../common/Card';

interface ReasoningCardProps {
  routing: RoutingDecision;
  category: string;
  department: string;
}

export const ReasoningCard: React.FC<ReasoningCardProps> = ({
  routing,
  category,
  department,
}) => {
  return (
    <Card className="border-indigo-100 bg-white shadow-xs">
      <CardHeader
        title={
          <div className="flex items-center gap-2 text-indigo-950 font-bold">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span>AI Automated Routing Explanation</span>
          </div>
        }
        subtitle="Transparent algorithmic reasoning for agent selection and capacity balancing"
        action={
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            {routing.confidenceScore}% Confidence Match
          </div>
        }
      />
      <CardContent className="space-y-4">
        {/* Core Human-Readable Explanation */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Why was {routing.recommendedAgentName} selected?
          </p>
          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            "{routing.reasoning}"
          </p>
        </div>

        {/* Feature Attribution Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Skill Domain Match</span>
            <span className="text-base font-bold text-cyan-700 font-mono mt-0.5 block">{routing.skillMatchScore}%</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Category: {category}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Agent Workload Capacity</span>
            <span className="text-base font-bold text-emerald-700 font-mono mt-0.5 block">{routing.agentCurrentCapacity}% load</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Active: {routing.agentWorkloadRatio} tickets</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Historical SLA Adherence</span>
            <span className="text-base font-bold text-indigo-700 font-mono mt-0.5 block">{routing.historicalSlaRate}%</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Department: {department}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Fair Load Balancing</span>
            <span className="text-base font-bold text-slate-800 font-mono mt-0.5 block">Optimal</span>
            <span className="text-[10px] text-emerald-600 mt-1 block">Overload risk: Minimal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
