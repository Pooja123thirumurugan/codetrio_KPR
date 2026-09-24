import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { TicketCategory, Department, PriorityLevel, TicketStatus, RiskLevel } from '../../types/ticket';
import { Button } from '../common/Button';

interface TicketFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  department: string;
  onDepartmentChange: (val: string) => void;
  priority: string;
  onPriorityChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  risk: string;
  onRiskChange: (val: string) => void;
  onReset: () => void;
  totalResults: number;
}

export const TicketFilters: React.FC<TicketFiltersProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  department,
  onDepartmentChange,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  risk,
  onRiskChange,
  onReset,
  totalResults,
}) => {
  const categories: TicketCategory[] = [
    'Payment Failure',
    'Login Issue',
    'Account Access',
    'Refund Request',
    'Technical Error',
    'Subscription Issue',
    'API Integration',
    'Data Sync',
  ];

  const departments: Department[] = [
    'Payments',
    'Technical Support',
    'Billing',
    'Account Support',
    'Product Support',
  ];

  const priorities: PriorityLevel[] = [
    'P1 - Critical',
    'P2 - High',
    'P3 - Medium',
    'P4 - Low',
  ];

  const statuses: TicketStatus[] = [
    'NEW',
    'IN_PROGRESS',
    'ESCALATED',
    'PENDING',
    'RESOLVED',
  ];

  const risks: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const hasActiveFilters = search || category || department || priority || status || risk;

  return (
    <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter by ticket #, subject, customer, or company..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-600"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Department */}
        <select
          value={department}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-600"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-600"
        >
          <option value="">All Priorities</option>
          {priorities.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-600"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Risk Level */}
        <select
          value={risk}
          onChange={(e) => onRiskChange(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-600"
        >
          <option value="">All Risk Levels</option>
          {risks.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <span>Showing <strong className="text-slate-900 font-semibold">{totalResults}</strong> matching tickets</span>
        <span className="text-slate-400 font-mono">Live Ingestion Active</span>
      </div>
    </div>
  );
};
