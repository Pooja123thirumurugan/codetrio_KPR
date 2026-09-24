import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TicketFilters } from '../components/tickets/TicketFilters';
import { TicketTable } from '../components/tickets/TicketTable';
import { Ticket as TicketIcon, Plus } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Tickets: React.FC = () => {
  const { tickets, setIsRaiseTicketModalOpen } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [risk, setRisk] = useState(searchParams.get('risk') || '');

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) setSearch(urlSearch);
  }, [searchParams]);

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setDepartment('');
    setPriority('');
    setStatus('');
    setRisk('');
    setSearchParams({});
  };

  const filteredTickets = tickets.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.customer.name.toLowerCase().includes(q) ||
        t.customer.company.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (category && t.category !== category) return false;
    if (department && t.department !== department) return false;
    if (priority && t.priority !== priority) return false;
    if (status && t.status !== status) return false;
    if (risk && t.sla.riskLevel !== risk) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Support Tickets Queue</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono font-medium">
              {tickets.length} total tickets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete triage ledger with category classification, skill matching, and predictive breach probabilities
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsRaiseTicketModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs shrink-0"
        >
          + Raise Ticket
        </Button>
      </div>

      {/* Filter Toolbar */}
      <TicketFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        department={department}
        onDepartmentChange={setDepartment}
        priority={priority}
        onPriorityChange={setPriority}
        status={status}
        onStatusChange={setStatus}
        risk={risk}
        onRiskChange={setRisk}
        onReset={handleReset}
        totalResults={filteredTickets.length}
      />

      {/* Professional Ticket Table */}
      <TicketTable tickets={filteredTickets} />
    </div>
  );
};
