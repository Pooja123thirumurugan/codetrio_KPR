import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowUpRight, CheckCircle2, Clock, UserCheck } from 'lucide-react';
import { EscalationRecord } from '../../types/escalation';
import { Card, CardHeader, CardContent } from '../common/Card';
import { PreventiveEscalationBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export const EscalationTable: React.FC<{ escalations: EscalationRecord[] }> = ({ escalations }) => {
  const navigate = useNavigate();
  const { approveEscalation } = useApp();

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-900">Escalation Records & Preventive Intervention Log</span>
          </div>
        }
        subtitle="Tracking pre-breach preventive escalations vs post-breach audit records"
      />
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4 font-semibold">Escalation ID</th>
              <th className="py-3 px-4 font-semibold">Type</th>
              <th className="py-3 px-4 font-semibold">Ticket & Subject</th>
              <th className="py-3 px-4 font-semibold text-center">Breach Risk</th>
              <th className="py-3 px-4 font-semibold text-center">SLA Rem.</th>
              <th className="py-3 px-4 font-semibold">Trigger Reason</th>
              <th className="py-3 px-4 font-semibold">Target Level</th>
              <th className="py-3 px-4 font-semibold">Recommended Action</th>
              <th className="py-3 px-4 font-semibold text-center">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {escalations.map((esc) => {
              const isPreBreach = esc.type === 'PREVENTIVE';
              const isPending = esc.status === 'PENDING_APPROVAL';

              return (
                <tr
                  key={esc.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    isPending ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  {/* ID */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                    {esc.id}
                  </td>

                  {/* Type Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <PreventiveEscalationBadge type={esc.type} />
                  </td>

                  {/* Ticket */}
                  <td className="py-3 px-4 max-w-xs">
                    <span
                      onClick={() => navigate(`/tickets/${esc.ticketId}`)}
                      className="font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer block text-[11px]"
                    >
                      #{esc.ticketId}
                    </span>
                    <p className="font-semibold text-slate-900 truncate mt-0.5">{esc.ticketSubject}</p>
                    <span className="text-[10px] text-slate-500">{esc.department}</span>
                  </td>

                  {/* Breach Risk */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`font-mono font-extrabold text-sm ${
                        esc.riskProbability >= 80 ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    >
                      {esc.riskProbability}%
                    </span>
                  </td>

                  {/* SLA Remaining */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className={esc.slaRemainingMinutes <= 20 ? 'text-rose-600' : ''}>
                        {esc.slaRemainingMinutes} min
                      </span>
                    </div>
                  </td>

                  {/* Trigger Reason */}
                  <td className="py-3 px-4 max-w-xs text-slate-600 text-[11px] leading-relaxed">
                    {esc.trigger}
                  </td>

                  {/* Level */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[11px]">
                      {esc.level}
                    </span>
                  </td>

                  {/* Recommended Action */}
                  <td className="py-3 px-4 max-w-xs text-slate-800 font-medium text-[11px] leading-relaxed">
                    {esc.recommendedAction}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {isPending ? (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                        PENDING APPROVAL
                      </span>
                    ) : esc.status === 'EXECUTED' ? (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        EXECUTED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        MITIGATED
                      </span>
                    )}
                  </td>

                  {/* Human-in-the-Loop Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {isPending ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => approveEscalation(esc.id)}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-xs"
                      >
                        Approve Action
                      </Button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">Approved</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
