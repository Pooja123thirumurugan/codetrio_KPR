import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveIncidentCard } from '../components/incident/ActiveIncidentCard';
import { Flame, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';

export const IncidentCommander: React.FC = () => {
  const { incidents } = useApp();

  const activeIncident = incidents.find((i) => i.status === 'ACTIVE') || incidents[0];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500 animate-bounce" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Incident Commander</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600 text-white font-bold tracking-wide uppercase">
              Operations Control Room
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-agent crisis response, automated queue surge mitigation, and human-in-the-loop approvals
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-slate-700">
          <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Control Room State: <strong className="text-emerald-700 font-bold">Mitigation Active</strong></span>
        </div>
      </div>

      {/* Active Incident View */}
      {activeIncident ? (
        <ActiveIncidentCard incident={activeIncident} />
      ) : (
        <Card className="p-12 text-center text-slate-500 border-slate-200 bg-white shadow-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">No active incidents</p>
          <p className="text-xs text-slate-500">All department queues are operating under nominal load.</p>
        </Card>
      )}
    </div>
  );
};
