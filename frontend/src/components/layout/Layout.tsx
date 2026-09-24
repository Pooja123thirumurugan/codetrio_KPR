import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { ToastContainer } from '../common/Toast';
import { RaiseTicketModal } from '../tickets/RaiseTicketModal';
import { useApp } from '../../context/AppContext';
import { Shield, Headset, User, ArrowRight } from 'lucide-react';

export const Layout: React.FC = () => {
  const { currentRole, setCurrentRole } = useApp();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-slate-50">
        <Header />

        {/* Dynamic Contextual Persona Helper Banner */}
        <div className="px-8 py-2 border-b border-slate-200/80 bg-white/80 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            {currentRole === 'ADMIN' && (
              <>
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-slate-600">
                  <strong className="text-indigo-700 font-bold">Admin Console:</strong> Full fleet observability, predictive breach radar, SEV-1 incident commander, and what-if simulation.
                </span>
              </>
            )}
            {currentRole === 'AGENT' && (
              <>
                <Headset className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-600">
                  <strong className="text-emerald-700 font-bold">Agent View (Priya Sharma):</strong> Specialized payments queue, capacity load metrics, and 1-click AI Copilot resolution.
                </span>
              </>
            )}
            {currentRole === 'CUSTOMER' && (
              <>
                <User className="w-3.5 h-3.5 text-cyan-600" />
                <span className="text-slate-600">
                  <strong className="text-cyan-700 font-bold">Customer View (Acme Corp):</strong> Submit enterprise support tickets, track SLA countdowns, and verify guaranteed response times.
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentRole !== 'CUSTOMER' && (
              <button
                onClick={() => {
                  setCurrentRole('CUSTOMER');
                  navigate('/portal');
                }}
                className="text-[11px] text-cyan-700 hover:text-cyan-800 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>View Customer Portal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            {currentRole !== 'AGENT' && (
              <button
                onClick={() => {
                  setCurrentRole('AGENT');
                  navigate('/workbench');
                }}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>View Agent Workbench</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <Breadcrumbs />

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Interactive Ticket Modal */}
      <RaiseTicketModal />

      {/* Toast Notification Layer */}
      <ToastContainer />
    </div>
  );
};
