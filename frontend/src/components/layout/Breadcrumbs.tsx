import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeNames: Record<string, string> = {
    dashboard: 'Command Center',
    tickets: 'Support Tickets',
    portal: 'Customer Portal',
    workbench: 'Agent Workbench (Priya Sharma)',
    'sla-risk': 'SLA Risk Monitor',
    escalations: 'Escalation Center',
    'incident-commander': 'Incident Commander',
    agents: 'Agent Capacity',
    simulator: 'What-If Simulator',
    'digital-twin': 'SLA Digital Twin',
    analytics: 'Analytics & Trends',
    demo: 'Hackathon Demo Mode',
    settings: 'Settings & SLA Policies',
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
      <Link to="/dashboard" className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors font-medium">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span>Operations</span>
      </Link>

      {pathnames.map((segment, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNames[segment] || segment.toUpperCase();

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="text-indigo-600 font-bold truncate">{displayName}</span>
            ) : (
              <Link to={to} className="hover:text-slate-900 transition-colors truncate">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
