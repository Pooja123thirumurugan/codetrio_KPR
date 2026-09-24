import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EscalationTable } from '../components/escalation/EscalationTable';
import { ArrowUpRight, ShieldAlert, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { EscalationType } from '../types/escalation';

export const Escalations: React.FC = () => {
  const { escalations } = useApp();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PREVENTIVE' | 'POST_BREACH' | 'PENDING'>('ALL');

  const preventiveCount = escalations.filter((e) => e.type === 'PREVENTIVE').length;
  const postBreachCount = escalations.filter((e) => e.type === 'POST_BREACH').length;
  const pendingCount = escalations.filter((e) => e.status === 'PENDING_APPROVAL').length;

  const filteredEscalations = escalations.filter((e) => {
    if (activeTab === 'PREVENTIVE') return e.type === 'PREVENTIVE';
    if (activeTab === 'POST_BREACH') return e.type === 'POST_BREACH';
    if (activeTab === 'PENDING') return e.status === 'PENDING_APPROVAL';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Escalation Center</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold">
              {pendingCount} Pending Approvals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Proactive pre-breach ticket reallocations, specialist dispatches, and emergency intervention oversight
          </p>
        </div>

        {/* Preventive Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-slate-700 font-medium">
          <ShieldCheck className="w-4 h-4 text-cyan-600" />
          <span>Preventive Escalation Rate: <strong className="text-slate-900 font-bold">88%</strong> (Prior to Breach)</span>
        </div>
      </div>

      {/* Core Architectural Concept Banner: Pre-Breach vs Post-Breach */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              PRE-BREACH ESCALATION (PREVENTIVE)
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
              {preventiveCount} Records
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Triggered Before SLA Deadline</h4>
          <p className="text-xs text-slate-700 leading-relaxed">
            The AI model identifies that risk probability has crossed policy thresholds (e.g., 75% or 80%) while remaining SLA time is low, automatically elevating the ticket to senior specialists to <strong>prevent</strong> breach penalties.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              POST-BREACH ESCALATION (AUDIT / CREDIT)
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              {postBreachCount} Records
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-800">Recorded After SLA Expiration</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Legacy reactive pattern. Triggered only after an SLA has already failed. Used strictly for audit compliance, customer apology credit issuance, and post-mortem review.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`text-xs px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-indigo-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
          }`}
        >
          All Escalations ({escalations.length})
        </button>

        <button
          onClick={() => setActiveTab('PREVENTIVE')}
          className={`text-xs px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'PREVENTIVE'
              ? 'bg-indigo-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
          }`}
        >
          Preventive Pre-Breach ({preventiveCount})
        </button>

        <button
          onClick={() => setActiveTab('PENDING')}
          className={`text-xs px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'PENDING'
              ? 'bg-amber-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
          }`}
        >
          Pending Operator Approval ({pendingCount})
        </button>

        <button
          onClick={() => setActiveTab('POST_BREACH')}
          className={`text-xs px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'POST_BREACH'
              ? 'bg-slate-700 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
          }`}
        >
          Post-Breach Compliance ({postBreachCount})
        </button>
      </div>

      {/* Escalation Table */}
      <EscalationTable escalations={filteredEscalations} />
    </div>
  );
};
