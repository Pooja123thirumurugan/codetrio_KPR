import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  Ticket as TicketIcon,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Flame,
  Sliders,
  Cpu,
  BarChart3,
  PlayCircle,
  Settings,
  Activity,
  CheckCircle,
  User,
  Headset,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { tickets, escalations, incidents, slaRiskSummary } = useApp();

  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE').length;
  const criticalTickets = tickets.filter((t) => t.sla.riskLevel === 'CRITICAL').length;
  const pendingEscalations = escalations.filter((e) => e.status === 'PENDING_APPROVAL').length;

  const navItems = [
    {
      to: '/portal',
      label: 'Customer Portal',
      icon: <User className="w-4 h-4 text-cyan-400" />,
      badge: 'Acme Corp',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold',
    },
    {
      to: '/workbench',
      label: 'Agent Workbench',
      icon: <Headset className="w-4 h-4 text-emerald-400" />,
      badge: 'Priya L3',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold',
    },
    {
      to: '/dashboard',
      label: 'Live Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: null,
    },
    {
      to: '/tickets',
      label: 'Support Tickets',
      icon: <TicketIcon className="w-4 h-4" />,
      badge: tickets.length,
    },
    {
      to: '/sla-risk',
      label: 'SLA Risk Monitor',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: criticalTickets > 0 ? `${criticalTickets} Crit` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      to: '/escalations',
      label: 'Escalation Center',
      icon: <ArrowUpRight className="w-4 h-4" />,
      badge: pendingEscalations > 0 ? `${pendingEscalations} New` : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
    {
      to: '/incident-commander',
      label: 'Incident Commander',
      icon: <Flame className="w-4 h-4" />,
      badge: activeIncidents > 0 ? 'SEV-1' : null,
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    {
      to: '/agents',
      label: 'Agent Capacity',
      icon: <Users className="w-4 h-4" />,
      badge: null,
    },
    {
      to: '/simulator',
      label: 'What-If Simulator',
      icon: <Sliders className="w-4 h-4" />,
      badge: 'Interactive',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    },
    {
      to: '/digital-twin',
      label: 'SLA Digital Twin',
      icon: <Cpu className="w-4 h-4" />,
      badge: null,
    },
    {
      to: '/analytics',
      label: 'Analytics & SLA',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: null,
    },
    {
      to: '/demo',
      label: 'Hackathon Demo',
      icon: <PlayCircle className="w-4 h-4" />,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold',
      highlight: true,
    },
    {
      to: '/settings',
      label: 'Settings & SLA Policies',
      icon: <Settings className="w-4 h-4" />,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen shrink-0 select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/80 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-600/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-wider text-slate-900">SLA GUARDIAN</span>
            <span className="text-xs font-bold text-indigo-600 ml-1.5 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200">
              AI
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 font-medium tracking-tight">
          Predict. Prevent. Optimize. Resolve.
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Operations Command Center
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
              } ${item.highlight ? 'bg-indigo-50/50 font-semibold' : ''}`
            }
          >
            <div className="flex items-center gap-2.5">
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System Status Footer */}
      <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/60">
        <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-[11px] font-semibold text-slate-800">Guardian AI Engine</p>
              <p className="text-[10px] text-emerald-600 font-mono font-medium">Predictive Guard: Active</p>
            </div>
          </div>
          <Activity className="w-4 h-4 text-slate-400 animate-pulse" />
        </div>
      </div>
    </aside>
  );
};
