/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { SupervisorDashboard } from './components/dashboard/SupervisorDashboard';
import { ManagerDashboard } from './components/dashboard/ManagerDashboard';
import { SalespersonDashboard } from './components/dashboard/SalespersonDashboard';
import { LoginScreen } from './components/auth/LoginScreen';
import { LandingPage } from './components/marketing/LandingPage';
import { Toaster } from './components/ui/sonner';

const DashboardRouter = () => {
  const { currentUser } = useAppContext();

  if (!currentUser) return null;

  return (
    <>
      {currentUser.role === 'supervisor' && <SupervisorDashboard />}
      {currentUser.role === 'manager' && <ManagerDashboard />}
      {currentUser.role === 'salesperson' && <SalespersonDashboard />}
    </>
  );
};

const MainAppContent = () => {
  const { currentUser, isLoading } = useAppContext();
  const [viewMode, setViewMode] = useState<'landing' | 'login'>('landing');

  // If a specific workspace query parameter is present, bypass landing directly to login
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('email')) {
      setViewMode('login');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f5f0]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-700/20 border-t-amber-700 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-stone-500 animate-pulse uppercase tracking-wider">Iniciando Banco de Dados Real-Time...</p>
        </div>
      </div>
    );
  }

  // Active session instantly bypasses landing for optimal SaaS user flow
  if (currentUser) {
    return (
      <AppLayout>
        <DashboardRouter />
      </AppLayout>
    );
  }

  if (viewMode === 'landing') {
    return <LandingPage onEnterPortal={() => setViewMode('login')} />;
  }

  return <LoginScreen onBackToLanding={() => setViewMode('landing')} />;
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}
