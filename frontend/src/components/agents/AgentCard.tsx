import React from 'react';
import { Agent } from '../../types/agent';
import { Card, CardHeader, CardContent, CardFooter } from '../common/Card';
import { Badge } from '../common/Badge';
import { Clock, ShieldCheck, CheckCircle2, AlertOctagon, UserX } from 'lucide-react';

export const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
  const getStatusBadge = () => {
    switch (agent.status) {
      case 'AVAILABLE':
        return (
          <Badge variant="success" size="xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AVAILABLE
          </Badge>
        );
      case 'BUSY':
        return (
          <Badge variant="warning" size="xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            BUSY
          </Badge>
        );
      case 'AT CAPACITY':
        return (
          <Badge variant="danger" size="xs" pulse>
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            AT CAPACITY
          </Badge>
        );
      case 'OFFLINE':
      default:
        return (
          <Badge variant="gray" size="xs">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            OFFLINE
          </Badge>
        );
    }
  };

  const isAtCapacity = agent.status === 'AT CAPACITY';

  return (
    <Card className={`border ${isAtCapacity ? 'border-rose-300 bg-rose-50/30 shadow-xs' : 'border-slate-200 bg-white shadow-xs'}`}>
      <div className="p-5 space-y-4">
        {/* Header: Avatar, Name, Department & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs"
              />
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                  agent.status === 'AVAILABLE'
                    ? 'bg-emerald-500'
                    : agent.status === 'BUSY'
                    ? 'bg-amber-500'
                    : agent.status === 'AT CAPACITY'
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
                }`}
              />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">{agent.name}</h4>
              <p className="text-xs text-slate-500">
                {agent.department} • <span className="text-indigo-600 font-medium">{agent.tier}</span>
              </p>
            </div>
          </div>

          <div>{getStatusBadge()}</div>
        </div>

        {/* Capacity Visualization: Active Tickets & Utilization */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Current Workload:</span>
            <span className="font-mono font-bold text-slate-900">
              {agent.activeTickets} / {agent.maxCapacity} tickets
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                agent.utilizationPercentage >= 90
                  ? 'bg-rose-500'
                  : agent.utilizationPercentage >= 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, agent.utilizationPercentage)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Utilization: <strong className={agent.utilizationPercentage >= 90 ? 'text-rose-600' : 'text-slate-800'}>{agent.utilizationPercentage}%</strong></span>
            <span>Capacity: <strong className="text-slate-700">{agent.maxCapacity - agent.activeTickets} slots free</strong></span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Avg Resol.</span>
            <span className="font-mono font-bold text-slate-800 mt-0.5 block">{agent.avgResolutionTimeMinutes}m</span>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">SLA Breach</span>
            <span className="font-mono font-bold text-emerald-600 mt-0.5 block">{agent.slaBreachRate}%</span>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">CSAT Score</span>
            <span className="font-mono font-bold text-amber-600 mt-0.5 block">★ {agent.satisfactionScore}</span>
          </div>
        </div>

        {/* Skills Chips */}
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block mb-1.5">
            Verified Skills
          </span>
          <div className="flex flex-wrap gap-1.5">
            {agent.skills.map((skill, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/70 rounded-b-xl flex items-center justify-between text-[11px] text-slate-500">
        <span>Location: {agent.location}</span>
        <span>Shift: {agent.shift}</span>
      </div>
    </Card>
  );
};
