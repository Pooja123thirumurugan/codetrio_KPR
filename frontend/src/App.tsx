import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Tickets } from './pages/Tickets';
import { TicketDetails } from './pages/TicketDetails';
import { Agents } from './pages/Agents';
import { SLARisk } from './pages/SLARisk';
import { Escalations } from './pages/Escalations';
import { IncidentCommander } from './pages/IncidentCommander';
import { Simulator } from './pages/Simulator';
import { DigitalTwin } from './pages/DigitalTwin';
import { Analytics } from './pages/Analytics';
import { Demo } from './pages/Demo';
import { CustomerPortal } from './pages/CustomerPortal';
import { AgentWorkbench } from './pages/AgentWorkbench';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="tickets/:id" element={<TicketDetails />} />
            <Route path="agents" element={<Agents />} />
            <Route path="sla-risk" element={<SLARisk />} />
            <Route path="escalations" element={<Escalations />} />
            <Route path="incident-commander" element={<IncidentCommander />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="digital-twin" element={<DigitalTwin />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="demo" element={<Demo />} />
            <Route path="portal" element={<CustomerPortal />} />
            <Route path="workbench" element={<AgentWorkbench />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
