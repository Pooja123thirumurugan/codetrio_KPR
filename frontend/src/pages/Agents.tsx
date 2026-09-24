import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AgentCard } from '../components/agents/AgentCard';
import { Users, Filter, CheckCircle2, AlertOctagon, UserX, Clock } from 'lucide-react';
import { Department } from '../types/ticket';
import { AgentStatus } from '../types/agent';

export const Agents: React.FC = () => {
  const { agents } = useApp();
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const filteredAgents = agents.filter((agent) => {
    if (selectedDept && agent.department !== selectedDept) return false;
    if (selectedStatus && agent.status !== selectedStatus) return false;
    return true;
  });

  const availableCount = agents.filter((a) => a.status === 'AVAILABLE').length;
  const busyCount = agents.filter((a) => a.status === 'BUSY').length;
  const atCapacityCount = agents.filter((a) => a.status === 'AT CAPACITY').length;
  const offlineCount = agents.filter((a) => a.status === 'OFFLINE').length;

  const totalActiveTickets = agents.reduce((acc, a) => acc + a.activeTickets, 0);
  const totalMaxCapacity = agents.reduce((acc, a) => acc + a.maxCapacity, 0);
  const overallUtilization = Math.round((totalActiveTickets / (totalMaxCapacity || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Page Header & Overall Capacity Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Agent Capacity & Workload</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono font-medium">
              {agents.length} Specialists
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time workload distribution, skill coverage, SLA adherence metrics, and capacity saturation
          </p>
        </div>

        {/* Global Capacity Metric */}
        <div className="flex items-center gap-4 bg-white border border-slate-200 shadow-xs rounded-xl px-4 py-2.5">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Team Utilization</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-slate-900 font-mono">{overallUtilization}%</span>
              <span className="text-[11px] text-slate-500 font-mono">({totalActiveTickets}/{totalMaxCapacity} slots)</span>
            </div>
          </div>
          <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                overallUtilization > 85 ? 'bg-rose-500' : overallUtilization > 65 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${overallUtilization}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedStatus(selectedStatus === 'AVAILABLE' ? '' : 'AVAILABLE')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStatus === 'AVAILABLE'
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Available
            </span>
            <span className="font-mono font-bold text-emerald-600 text-sm">{availableCount}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Ready for ticket assignment</span>
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'BUSY' ? '' : 'BUSY')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStatus === 'BUSY'
              ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Busy
            </span>
            <span className="font-mono font-bold text-amber-600 text-sm">{busyCount}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Actively working (50-89%)</span>
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'AT CAPACITY' ? '' : 'AT CAPACITY')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStatus === 'AT CAPACITY'
              ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              At Capacity
            </span>
            <span className="font-mono font-bold text-rose-600 text-sm">{atCapacityCount}</span>
          </div>
          <span className="text-[10px] text-rose-600 mt-1 block">100% full (no new tickets)</span>
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'OFFLINE' ? '' : 'OFFLINE')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStatus === 'OFFLINE'
              ? 'bg-slate-100 border-slate-400 text-slate-800 shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <UserX className="w-3.5 h-3.5 text-slate-400" />
              Offline / Shift
            </span>
            <span className="font-mono font-bold text-slate-600 text-sm">{offlineCount}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Off-duty or break</span>
        </button>
      </div>

      {/* Department Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Department:
        </span>
        {['', 'Payments', 'Technical Support', 'Billing', 'Account Support', 'Product Support'].map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              selectedDept === dept
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
            }`}
          >
            {dept || 'All Departments'}
          </button>
        ))}
      </div>

      {/* Agents Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
};
