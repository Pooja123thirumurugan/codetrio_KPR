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

  const operationalItems = [
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
      label: 'SLA Risk Radar',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: criticalTickets > 0 ? `${criticalTickets} Crit` : null,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      to: '/incident-commander',
      label: 'Incident Commander',
      icon: <Flame className="w-4 h-4" />,
      badge: activeIncidents > 0 ? 'SEV-1' : null,
      badgeColor: 'bg-rose-600 text-white font-bold animate-pulse',
    },
    {
      to: '/agents',
      label: 'Agent Capacity',
      icon: <Users className="w-4 h-4" />,
      badge: null,
    },
  ];

  const predictiveItems = [
    {
      to: '/simulator',
      label: 'What-If Simulator',
      icon: <Sliders className="w-4 h-4" />,
      badge: 'Model',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      to: '/digital-twin',
      label: 'SLA Digital Twin',
      icon: <Cpu className="w-4 h-4" />,
      badge: null,
    },
    {
      to: '/escalations',
      label: 'Escalation Engine',
      icon: <ArrowUpRight className="w-4 h-4" />,
      badge: pendingEscalations > 0 ? `${pendingEscalations} New` : null,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      to: '/analytics',
      label: 'Executive Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: null,
    },
  ];

  const portalItems = [
    {
      to: '/portal',
      label: 'Customer Portal',
      icon: <User className="w-4 h-4" />,
      badge: 'Acme Corp',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    {
      to: '/workbench',
      label: 'Agent Workbench',
      icon: <Headset className="w-4 h-4" />,
      badge: 'Priya L3',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      to: '/demo',
      label: 'Evaluation Demo',
      icon: <PlayCircle className="w-4 h-4" />,
      badge: '7-Step',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold',
      highlight: true,
    },
    {
      to: '/settings',
      label: 'Policies & Config',
      icon: <Settings className="w-4 h-4" />,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen shrink-0 select-none shadow-xs">
      {/* Brand Header: Exactly 56px to match main Header navbar */}
      <div className="h-14 px-5 border-b border-slate-200/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wider text-slate-900">SLA GUARDIAN</span>
              <span className="text-[10px] font-bold text-indigo-600 px-1 py-0.2 rounded bg-indigo-50 border border-indigo-200">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
              Predictive Breach Prevention
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {/* Section 1: Operations */}
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Operations
          </div>
          <div className="space-y-0.5">
            {operationalItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-700 font-bold shadow-2xs border-l-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                      item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Section 2: Predictive Intelligence */}
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Predictive AI & Twin
          </div>
          <div className="space-y-0.5">
            {predictiveItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-700 font-bold shadow-2xs border-l-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                      item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Section 3: Portals & System */}
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Role Portals & Tools
          </div>
          <div className="space-y-0.5">
            {portalItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-700 font-bold shadow-2xs border-l-2 border-indigo-600'
                      : item.highlight
                      ? 'bg-indigo-50/40 text-indigo-800 font-semibold hover:bg-indigo-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                      item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-200/90 bg-slate-50/80 shrink-0">
        <div className="px-3 py-2 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="leading-tight">
              <p className="text-[11px] font-bold text-slate-800">Guardian Engine</p>
              <p className="text-[10px] text-emerald-600 font-medium">Predictive: Active</p>
            </div>
          </div>
          <Activity className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
        </div>
      </div>
    </aside>
  );
};
