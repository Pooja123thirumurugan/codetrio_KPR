import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Clock,
  ShieldAlert,
  UserCheck,
  Building,
  Mail,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { RiskBadge, PriorityBadge, StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SLACountdown } from '../components/sla/SLACountdown';
import { BreachPredictorCard } from '../components/sla/BreachPredictorCard';
import { ReasoningCard } from '../components/ai/ReasoningCard';
import { AICopilotDrawer } from '../components/ai/AICopilotDrawer';
import { Modal } from '../components/common/Modal';

export const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tickets, triggerPreBreachEscalation, updateTicketStatus } = useApp();

  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState(
    'Current queue pressure and remaining SLA time indicate a high probability of breach before the ticket can be resolved.'
  );

  const ticket = tickets.find((t) => t.id.toLowerCase() === id?.toLowerCase());

  if (!ticket) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Ticket not found</h2>
        <Button variant="outline" size="sm" onClick={() => navigate('/tickets')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Tickets Queue
        </Button>
      </div>
    );
  }

  const handleEscalateConfirm = async () => {
    await triggerPreBreachEscalation(ticket.id, escalationReason);
    setIsEscalateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/tickets')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            All Tickets
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-slate-900 font-mono">#{ticket.id}</span>
            <RiskBadge level={ticket.sla.riskLevel} />
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ticket.escalationStatus !== 'PREVENTIVE_ESCALATED' ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsEscalateModalOpen(true)}
              icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              className="font-bold"
            >
              Trigger Pre-Breach Escalation
            </Button>
          ) : (
            <span className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              Pre-Breach Escalation Dispatched
            </span>
          )}

          {ticket.status !== 'RESOLVED' && (
            <Button
              variant="success"
              size="sm"
              onClick={() => updateTicketStatus(ticket.id, 'RESOLVED')}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Mark Resolved
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Details & Right SLA / AI Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Ticket Information, AI Copilot, Audit Trail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Information Card */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader
              title={<span className="text-base font-bold text-slate-900">{ticket.subject}</span>}
              subtitle={`Created on ${new Date(ticket.createdAt).toLocaleString()} • Updated ${new Date(ticket.updatedAt).toLocaleTimeString()}`}
            />
            <CardContent className="space-y-4">
              {/* Customer Profile Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-sm font-bold text-indigo-700">
                    {ticket.customer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{ticket.customer.name}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {ticket.customer.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {ticket.customer.email}</span>
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold uppercase font-mono">
                  {ticket.customer.tier} Tier
                </span>
              </div>

              {/* Description Body */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Issue Description</label>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
                  {ticket.description}
                </div>
              </div>

              {/* Classification Tag Matrix */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Detected Category</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">{ticket.category}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Assigned Department</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">{ticket.department}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Urgency Score</span>
                  <span className="font-semibold text-rose-600 mt-0.5 block">{ticket.urgency}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Priority Tier</span>
                  <span className="font-semibold text-amber-600 mt-0.5 block">{ticket.priority}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Automated Response Copilot */}
          <AICopilotDrawer ticket={ticket} />

          {/* Ticket Lifecycle Audit Trail */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader
              title={<span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Operational Audit Trail</span>}
              subtitle="Logged transitions, telemetry events, and AI routing decisions"
            />
            <CardContent>
              <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2">
                {ticket.timeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-white border-2 border-indigo-600" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{item.action}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{item.details}</p>
                    <span className="text-[10px] text-indigo-600 font-mono mt-0.5 block">Actor: {item.performedBy}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): SLA Intelligence, Countdown, Reasoning Card */}
        <div className="space-y-6">
          {/* SLA Countdown Timer */}
          <SLACountdown sla={ticket.sla} />

          {/* Predictive Breach Intelligence Card */}
          <BreachPredictorCard
            sla={ticket.sla}
            agentCapacity={ticket.routing.agentCurrentCapacity}
            onEscalate={() => setIsEscalateModalOpen(true)}
            escalated={ticket.escalationStatus === 'PREVENTIVE_ESCALATED'}
          />

          {/* Transparent AI Routing Reasoning Card */}
          <ReasoningCard
            routing={ticket.routing}
            category={ticket.category}
            department={ticket.department}
          />
        </div>
      </div>

      {/* Pre-Breach Escalation Confirmation Modal */}
      <Modal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        title="Confirm Pre-Breach Escalation"
        description={`Ticket #${ticket.id} (${ticket.subject})`}
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsEscalateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleEscalateConfirm} icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              Confirm Pre-Breach Escalation
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
            <p className="font-bold">Predictive Escalation Safeguard:</p>
            <p>
              Breach probability is currently <strong>{ticket.sla.predictedBreachProbability}%</strong> with only{' '}
              <strong>{ticket.sla.remainingMinutes} minutes</strong> remaining on SLA contract.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Escalation Trigger Reason</label>
            <textarea
              rows={3}
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div className="text-[11px] text-slate-500">
            Escalation will assign this ticket to <strong>Tier 2 Payments Specialists</strong> and enable secondary gateway failover protocols.
          </div>
        </div>
      </Modal>
    </div>
  );
};
