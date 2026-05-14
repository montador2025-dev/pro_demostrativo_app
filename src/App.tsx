/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { SupervisorDashboard } from './components/dashboard/SupervisorDashboard';
import { ManagerDashboard } from './components/dashboard/ManagerDashboard';
import { SalespersonDashboard } from './components/dashboard/SalespersonDashboard';
import { Toaster } from './components/ui/sonner';

const DashboardRouter = () => {
  const { currentUser } = useAppContext();

  if (!currentUser) return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando permissões...</div>;

  return (
    <>
      {currentUser.role === 'supervisor' && <SupervisorDashboard />}
      {currentUser.role === 'manager' && <ManagerDashboard />}
      {currentUser.role === 'salesperson' && <SalespersonDashboard />}
    </>
  );
};

export default function App() {
  useEffect(() => {
    document.title = "NEXUS CRM - Demostrativo";
  }, []);

  return (
    <AppProvider>
      <AppLayout>
        <DashboardRouter />
      </AppLayout>
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}
