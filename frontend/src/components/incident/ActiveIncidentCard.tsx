import React from 'react';
import { Flame, AlertTriangle, ShieldCheck, CheckCircle2, Clock, Users, ArrowUpRight } from 'lucide-react';
import { Incident, IncidentAction } from '../../types/incident';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export const ActiveIncidentCard: React.FC<{ incident: Incident }> = ({ incident }) => {
  const { approveIncidentAction } = useApp();

  return (
    <div className="space-y-6">
      {/* Incident Hero Header Card */}
      <Card className="border-red-200 bg-gradient-to-br from-white via-rose-50/30 to-white shadow-xs">
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold bg-red-600 text-white tracking-wider animate-pulse">
                <Flame className="w-4 h-4" />
                {incident.severity}
              </span>
              <span className="font-mono text-xs font-bold text-slate-700">#{incident.id}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Department: <strong className="text-indigo-700">{incident.affectedDepartment}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Incident Elapsed: <strong className="text-slate-800">62 minutes</strong></span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{incident.title}</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-4xl">{incident.summary}</p>
          </div>

          {/* Operational Radar Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3">
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Queue Depth</span>
              <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">{incident.queueDepth}</span>
              <span className="text-[10px] text-rose-600 mt-0.5 block font-medium">+11 spike</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">At-Risk Tickets</span>
              <span className="text-2xl font-extrabold text-amber-600 font-mono mt-1 block">{incident.atRiskTicketsCount}</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">SLA risk &gt;75%</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Dept Capacity</span>
              <span className="text-2xl font-extrabold text-rose-600 font-mono mt-1 block">{incident.avgCapacityUtilization}%</span>
              <span className="text-[10px] text-rose-600 mt-0.5 block font-medium">Near saturation</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Predicted Breaches</span>
              <span className="text-2xl font-extrabold text-red-600 font-mono mt-1 block">{incident.predictedSLABreaches}</span>
              <span className="text-[10px] text-red-600 mt-0.5 block font-medium">Without intervention</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Prevented Breaches</span>
              <span className="text-2xl font-extrabold text-emerald-600 font-mono mt-1 block">{incident.preventedBreachesCount}</span>
              <span className="text-[10px] text-emerald-600 mt-0.5 block font-medium">Via Guardian AI</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Human-in-the-Loop Recommended Actions */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-slate-900">AI Recommends. Human Approves.</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                Human-in-the-Loop Action Center
              </span>
            </div>
          }
          subtitle="Autonomous mitigation suggestions requiring operator sign-off before execution"
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incident.recommendedActions.map((action) => {
              const isApproved = action.status === 'APPROVED';

              return (
                <div
                  key={action.id}
                  className={`p-5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                    isApproved
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {action.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {action.badgeText}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{action.description}</p>

                    <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5 text-xs shadow-2xs">
                      <div>
                        <span className="text-slate-500 font-semibold text-[11px]">Reason: </span>
                        <span className="text-slate-700">{action.reason}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 font-semibold text-[11px]">Expected Impact: </span>
                        <span className="text-emerald-700 font-medium">{action.expectedImpact}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                    <span className="text-[11px] text-slate-500">
                      Risk Rating: <strong className="text-slate-800">{action.riskRating}</strong>
                    </span>

                    {isApproved ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved & Active
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => approveIncidentAction(incident.id, action.id)}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        className="font-bold text-white shadow-xs"
                      >
                        Approve Action
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Incident Timeline */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600" />
              <span className="font-bold text-slate-900">Incident Response Timeline & Audit Log</span>
            </div>
          }
          subtitle="Chronological trail of automated alarms, AI detections, and human operator approvals"
        />
        <CardContent>
          <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2">
            {incident.timeline.map((event, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-white border-2 border-indigo-600" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{event.title}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{event.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{event.description}</p>
                <span className="text-[10px] text-indigo-600 font-mono mt-1 block">Author: {event.author}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
