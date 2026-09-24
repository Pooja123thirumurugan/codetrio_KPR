import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { TicketCategory, Department, PriorityLevel } from '../../types/ticket';
import {
  X,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  UserCheck,
  Building,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Button } from '../common/Button';

interface PresetOption {
  label: string;
  category: TicketCategory;
  department: Department;
  priority: PriorityLevel;
  subject: string;
  description: string;
}

const PRESETS: PresetOption[] = [
  {
    label: '💳 Payment Failure',
    category: 'Payment Failure',
    department: 'Payments',
    priority: 'P1 - Critical',
    subject: 'Production Checkout Timeout — Double Charge Risk on Visa Cards',
    description: 'Our customer checkout flow is timing out on Visa 3D-Secure step with error ERR_PAYMENT_TIMEOUT (504). Multiple enterprise transactions appear locked.',
  },
  {
    label: '🔐 SSO Auth Lockout',
    category: 'Login Issue',
    department: 'Account Support',
    priority: 'P2 - High',
    subject: 'Okta SAML 2.0 Identity Provider returning invalid signature',
    description: 'Corporate staff cannot log into our staging and production clusters via Okta SSO. 45 developers currently blocked from deployments.',
  },
  {
    label: '⚡ API Latency Spike',
    category: 'Technical Error',
    department: 'Technical Support',
    priority: 'P2 - High',
    subject: 'GraphQL Gateway latency spiked past 3500ms on /v2/orders query',
    description: 'High p99 response times on order processing endpoints starting 15 minutes ago. Database connection pool utilization near 98%.',
  },
];

export const RaiseTicketModal: React.FC = () => {
  const { isRaiseTicketModalOpen, setIsRaiseTicketModalOpen, createTicket, activeCustomerPersona } = useApp();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState(activeCustomerPersona.company || 'Acme Corp');
  const [customerName, setCustomerName] = useState(activeCustomerPersona.name || 'Sarah Jenkins');
  const [customerEmail, setCustomerEmail] = useState(activeCustomerPersona.email || 'sarah.j@acmecorp.com');
  const [tier, setTier] = useState<'Enterprise' | 'Business' | 'Pro' | 'Free'>('Enterprise');

  const [category, setCategory] = useState<TicketCategory>('Payment Failure');
  const [department, setDepartment] = useState<Department>('Payments');
  const [priority, setPriority] = useState<PriorityLevel>('P1 - Critical');
  const [subject, setSubject] = useState('Payment Gateway Timeout — Double Charge Risk on Production Checkout');
  const [description, setDescription] = useState(
    'Production checkout is encountering unexpected 504 timeouts when calling the Stripe charge webhook endpoint. Customers reporting pending card deductions.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  if (!isRaiseTicketModalOpen) return null;

  const handleApplyPreset = (p: PresetOption) => {
    setCategory(p.category);
    setDepartment(p.department);
    setPriority(p.priority);
    setSubject(p.subject);
    setDescription(p.description);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const ticket = await createTicket({
        companyName,
        customerName,
        customerEmail,
        tier,
        category,
        department,
        priority,
        subject,
        description,
      });
      setCreatedTicketId(ticket.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsRaiseTicketModalOpen(false);
    setCreatedTicketId(null);
  };

  const handleViewTicket = () => {
    if (createdTicketId) {
      navigate(`/tickets/${createdTicketId}`);
      handleClose();
    }
  };

  const slaTargetMinutes = priority === 'P1 - Critical' ? 60 : priority === 'P2 - High' ? 120 : priority === 'P3 - Medium' ? 480 : 1440;
  const recommendedAgent = category === 'Payment Failure' || department === 'Payments' ? 'Priya Sharma (L3 Financial Lead)' : 'Marcus Vance (L2 Support)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Raise Support Ticket</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-600" />
                  AI Auto-Triage Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tickets are analyzed in real-time for SLA deadlines, risk probability, and skill-matched routing.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {createdTicketId ? (
            /* Success View */
            <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-md shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Ticket Successfully Created & Auto-Routed!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  SLA Guardian AI evaluated the issue complexity and guaranteed your resolution timeline.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Assigned Ticket ID</span>
                  <span className="font-mono font-bold text-indigo-600">{createdTicketId}</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Guaranteed SLA Target</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {slaTargetMinutes} Minutes
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Auto-Assigned Specialist</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
                    {recommendedAgent}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Initial Breach Probability</span>
                  <span className="font-semibold text-emerald-600">Low (12% Protected)</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={handleClose}>
                  Create Another Ticket
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleViewTicket}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  View Ticket in System
                </Button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Presets Bar */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Quick-Fill Emergency Scenarios
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 text-left transition-all group"
                    >
                      <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                        {p.label}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{p.subject}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Metadata Row */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Company / Organization</label>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 shadow-xs">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="bg-transparent w-full focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Support Tier Policy</label>
                  <select
                    value={tier}
                    onChange={(e: any) => setTier(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none shadow-xs"
                  >
                    <option value="Enterprise">Enterprise Platinum (1h SLA)</option>
                    <option value="Business">Business Gold (2h SLA)</option>
                    <option value="Pro">Pro Support (4h SLA)</option>
                    <option value="Free">Standard Support (24h SLA)</option>
                  </select>
                </div>
              </div>

              {/* Category & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Problem Category
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
                  >
                    <option value="Payment Failure">Payment Failure</option>
                    <option value="Login Issue">Login Issue</option>
                    <option value="Technical Error">Technical Error</option>
                    <option value="API Integration">API Integration</option>
                    <option value="Subscription Issue">Subscription Issue</option>
                    <option value="Refund Request">Refund Request</option>
                    <option value="Account Access">Account Access</option>
                    <option value="Billing">Billing & Invoicing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Target Department
                  </label>
                  <select
                    value={department}
                    onChange={(e: any) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
                  >
                    <option value="Payments">Payments & Transactions</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing">Billing & Finance</option>
                    <option value="Account Support">Account Support</option>
                    <option value="Product Support">Product Support</option>
                  </select>
                </div>
              </div>

              {/* Priority Selector Cards */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Severity & SLA Priority
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { p: 'P1 - Critical', time: '60 Mins', desc: 'Outage / Data Loss', active: 'bg-rose-50 border-rose-300 text-rose-800' },
                    { p: 'P2 - High', time: '120 Mins', desc: 'Core Feature Down', active: 'bg-amber-50 border-amber-300 text-amber-800' },
                    { p: 'P3 - Medium', time: '8 Hours', desc: 'Minor Degradation', active: 'bg-indigo-50 border-indigo-300 text-indigo-800' },
                    { p: 'P4 - Low', time: '24 Hours', desc: 'Inquiry / Question', active: 'bg-slate-100 border-slate-300 text-slate-800' },
                  ].map((item) => (
                    <button
                      key={item.p}
                      type="button"
                      onClick={() => setPriority(item.p as PriorityLevel)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        priority === item.p ? `${item.active} ring-1 ring-indigo-400 font-bold` : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.p.split(' - ')[0]}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{item.time}</div>
                      <div className="text-[9px] text-slate-400 truncate mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Ticket Subject / Summary
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Briefly state the incident or malfunction..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Detailed Symptoms & Error Logs
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide error codes, affected transaction IDs, customer scope..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 resize-none font-mono text-[11px] shadow-xs"
                    required
                  />
                </div>
              </div>

              {/* Real-time AI Triage Preview */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 animate-pulse" />
                  <div>
                    <span className="font-bold text-slate-900">AI Triage Projection: </span>
                    <span className="text-slate-600">
                      Guaranteed SLA <strong className="text-emerald-700">{slaTargetMinutes}m</strong>. Best match: <strong className="text-indigo-700">{recommendedAgent}</strong>.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-indigo-700 font-bold hidden sm:inline-block">96% Routing Match</span>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <Button variant="outline" size="sm" type="button" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isSubmitting}
                  icon={<Send className="w-3.5 h-3.5" />}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting ? 'Triage & Auto-Routing...' : 'Submit & Route with AI'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
