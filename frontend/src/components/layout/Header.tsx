import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Sparkles,
  RefreshCw,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { RoleSwitcher } from './RoleSwitcher';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, incidents, slaRiskSummary, resetAllData, setIsRaiseTicketModalOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE').length;
  const criticalTickets = tickets.filter((t) => t.sla.riskLevel === 'CRITICAL').length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tickets?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-14 bg-white/95 border-b border-slate-200/90 px-6 flex items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-64 lg:w-72 shrink-0">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tickets, agents, codes..."
          className="w-full bg-slate-100/90 border border-slate-200/80 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs pointer-events-none">
          /
        </kbd>
      </form>

      {/* Unified Executive Health Capsule */}
      <div className="hidden md:flex items-center">
        {activeIncidents > 0 ? (
          <div
            onClick={() => navigate('/incident-commander')}
            className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-rose-50/80 border border-rose-200 text-xs cursor-pointer hover:bg-rose-100/70 transition-all shadow-xs"
            title="Click to open Incident Commander"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-bold text-rose-800 tracking-tight">SEV-1 Crisis</span>
            <span className="text-rose-200 font-light">•</span>
            <span className="text-slate-600 font-medium">
              <strong className="text-rose-700 font-bold">{criticalTickets}</strong> At-Risk
            </span>
            <span className="text-slate-200 font-light">•</span>
            <span className="text-emerald-700 font-semibold">{slaRiskSummary.slaComplianceRateToday}% SLA</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-800">Nominal Operations</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-semibold">{slaRiskSummary.slaComplianceRateToday}% SLA</span>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Role Persona Switcher */}
        <RoleSwitcher />

        {/* Global Raise Ticket Trigger */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsRaiseTicketModalOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
          className="h-9 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
        >
          Raise Ticket
        </Button>

        {/* Demo Flow Shortcut */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/demo')}
          icon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
          className="hidden sm:inline-flex h-9 px-3 bg-white hover:bg-indigo-50/50 text-slate-700 border-slate-200 font-medium shadow-xs"
        >
          Demo Flow
        </Button>

        {/* Quick Reset Mock Data */}
        <button
          onClick={resetAllData}
          title="Reset mock data to baseline"
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* SLA Alerts Bell */}
        <button
          onClick={() => navigate('/sla-risk')}
          title="SLA Risk Alerts"
          className="relative h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Bell className="w-4 h-4" />
          {criticalTickets > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] text-white font-bold flex items-center justify-center ring-2 ring-white">
              {criticalTickets}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
