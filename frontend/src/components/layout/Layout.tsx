import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { ToastContainer } from '../common/Toast';
import { RaiseTicketModal } from '../tickets/RaiseTicketModal';

export const Layout: React.FC = () => {

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-slate-50">
        <Header />

        <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-5">
          <div className="max-w-7xl mx-auto space-y-6">
            <Breadcrumbs />
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
