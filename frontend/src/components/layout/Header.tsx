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
    <header className="h-16 bg-white/95 border-b border-slate-200/90 px-6 flex items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ticket #, customer, error code, or agent..."
          className="w-full bg-slate-100/90 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
        />
      </form>

      {/* Live SLA & Incident Ticker Bar */}
      <div className="hidden lg:flex items-center gap-3 text-xs">
        {activeIncidents > 0 && (
          <div
            onClick={() => navigate('/incident-commander')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold cursor-pointer hover:bg-rose-100/70 transition-colors shadow-xs"
          >
            <Flame className="w-4 h-4 text-rose-600 animate-bounce" />
            <span>SEV-1 Active Crisis in Payments</span>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-800 shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>At-Risk Queue: <strong className="text-amber-700 font-bold">{criticalTickets} Critical</strong></span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-800 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SLA Adherence: <strong className="text-emerald-700 font-bold">{slaRiskSummary.slaComplianceRateToday}%</strong></span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Role Persona Switcher */}
        <RoleSwitcher />

        {/* Global Raise Ticket Trigger */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsRaiseTicketModalOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
          className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold shadow-sm shadow-indigo-500/20"
        >
          + Raise Ticket
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={resetAllData}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          title="Reset mock data to pristine evaluation baseline"
          className="hidden xl:inline-flex bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
        >
          Reset
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/demo')}
          icon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold shadow-xs"
        >
          Demo Flow
        </Button>

        <div
          onClick={() => navigate('/sla-risk')}
          className="relative p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 cursor-pointer transition-colors"
          title="SLA Risk Alerts"
        >
          <Bell className="w-4 h-4" />
          {criticalTickets > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] text-white font-bold flex items-center justify-center">
              {criticalTickets}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
