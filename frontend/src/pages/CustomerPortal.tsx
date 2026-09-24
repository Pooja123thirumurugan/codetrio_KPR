import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LifeBuoy,
  PlusCircle,
  Clock,
  ShieldCheck,
  Search,
  ArrowRight,
  Building,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';

export const CustomerPortal: React.FC = () => {
  const { tickets, setIsRaiseTicketModalOpen, activeCustomerPersona } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tickets belonging to this customer or Acme Corp
  const myTickets = tickets.filter(
    (t) =>
      t.customer.company.toLowerCase().includes('acme') ||
      t.customer.name.toLowerCase().includes('jenkins') ||
      t.customer.company.toLowerCase().includes(activeCustomerPersona.company.toLowerCase())
  );

  const filteredTickets = myTickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openTickets = myTickets.filter((t) => t.status !== 'RESOLVED');

  return (
    <div className="space-y-6">
      {/* Customer Hero Banner */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-indigo-50/80 via-white to-cyan-50/80 border border-indigo-200/70 shadow-sm overflow-hidden">
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 flex items-center gap-1.5 shadow-xs">
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                {activeCustomerPersona.company} • Enterprise Platinum Tier
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                1-Hour SLA Guaranteed
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Customer Support & SLA Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Welcome, {activeCustomerPersona.name}. Track your enterprise support tickets with real-time resolution deadlines, or submit a new critical ticket directly to our AI auto-routing queue.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsRaiseTicketModalOpen(true)}
            icon={<PlusCircle className="w-5 h-5" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 shrink-0 px-6 py-3"
          >
            Raise New Ticket
          </Button>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Open Tickets Under Resolution</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-3">{openTickets.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Guaranteed response windows active</p>
        </Card>

        <Card className="p-5 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Average First Response</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-3">14 Minutes</div>
          <p className="text-[11px] text-slate-500 mt-1">Contract SLA Target: Under 30 minutes</p>
        </Card>

        <Card className="p-5 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">SLA Contract Compliance</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-cyan-700 mt-3">100.0%</div>
          <p className="text-[11px] text-slate-500 mt-1">Zero breaches recorded this billing cycle</p>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader
          title={`Active Support Requests (${filteredTickets.length})`}
          subtitle="Real-time status updates and guaranteed SLA countdown timers for Acme Corp"
          action={
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ticket subject or ID..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
          }
        />
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No tickets match your search. Click "Raise New Ticket" to create one.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isCritical = ticket.sla.riskLevel === 'CRITICAL';
                return (
                  <div
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="p-5 hover:bg-slate-50/80 cursor-pointer transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-indigo-600 group-hover:text-indigo-800">
                          {ticket.id}
                        </span>
                        <PriorityBadge priority={ticket.priority} />
                        <StatusBadge status={ticket.status} />
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                          {ticket.category}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {ticket.subject}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-1">{ticket.description}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* SLA Timer */}
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">SLA Guarantee</div>
                        <div
                          className={`text-xs font-mono font-bold flex items-center gap-1 justify-end ${
                            isCritical ? 'text-rose-600 animate-pulse' : 'text-emerald-700'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {ticket.sla.remainingMinutes}m remaining
                        </div>
                        <div className="text-[10px] text-slate-500">Specialist: {ticket.routing.assignedAgentName}</div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<ArrowRight className="w-4 h-4" />}
                        className="text-slate-500 group-hover:text-indigo-600"
                      >
                        Inspect
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
