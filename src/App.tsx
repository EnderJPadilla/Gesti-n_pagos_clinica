/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Control Financiero de Clínica — Aplicación Principal
 * Especificación de frontend para clínica en Colombia (es-CO, COP, America/Bogota)
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Section11ValidatorModal } from './components/common/Section11ValidatorModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { ReceivablesView } from './components/receivables/ReceivablesView';
import { PayersView } from './components/payers/PayersView';
import { PaymentsView } from './components/payments/PaymentsView';
import { AuditView } from './components/audit/AuditView';
import { CreatePaymentModal } from './components/payments/CreatePaymentModal';
import { CreateReceivableModal } from './components/receivables/CreateReceivableModal';
import { PayerDetailDrawer } from './components/payers/PayerDetailDrawer';
import { PaymentDetailModal } from './components/payments/PaymentDetailModal';
import { apiService } from './services/apiClient';
import { Payment } from './types/api';
import { Loader2 } from 'lucide-react';

function MainApp() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  // Global modals
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);
  const [isGlobalPaymentModalOpen, setIsGlobalPaymentModalOpen] = useState<boolean>(false);
  const [isGlobalReceivableModalOpen, setIsGlobalReceivableModalOpen] = useState<boolean>(false);

  // Cross-navigation selection states
  const [selectedPayerId, setSelectedPayerId] = useState<string | null>(null);
  const [isPayerDrawerOpen, setIsPayerDrawerOpen] = useState<boolean>(false);

  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<Payment | null>(null);
  const [isPaymentDetailModalOpen, setIsPaymentDetailModalOpen] = useState<boolean>(false);

  // Reset demo
  const handleResetDemo = async () => {
    if (window.confirm('¿Desea restablecer los datos de demostración al escenario inicial?')) {
      await apiService.resetToInitialDemo();
      window.location.reload();
    }
  };

  const handleSelectPayerDetail = (payerId: string) => {
    setSelectedPayerId(payerId);
    setIsPayerDrawerOpen(true);
  };

  const handleSelectPaymentDetail = async (paymentId: string) => {
    try {
      const p = await apiService.getPaymentById(paymentId);
      setSelectedPaymentDetail(p);
      setIsPaymentDetailModalOpen(true);
    } catch {
      // Error manejado
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span>Iniciando entorno de control financiero...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpenMobile={isOpenMobile}
          onCloseMobile={() => setIsOpenMobile(false)}
          onResetDemo={handleResetDemo}
          onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
        />

        {/* Main Content Area (with 64 offset on lg) */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <TopBar
            activeTab={activeTab}
            onOpenMobileSidebar={() => setIsOpenMobile(true)}
            onOpenNewPaymentModal={() => setIsGlobalPaymentModalOpen(true)}
            onOpenNewReceivableModal={() => setIsGlobalReceivableModalOpen(true)}
          />

          <main className="flex-1 overflow-y-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigateTab={setActiveTab}
                onSelectPayerDetail={handleSelectPayerDetail}
                onSelectPaymentDetail={handleSelectPaymentDetail}
                onOpenNewPaymentModal={() => setIsGlobalPaymentModalOpen(true)}
              />
            )}

            {activeTab === 'receivables' && (
              <ReceivablesView />
            )}

            {activeTab === 'payers' && (
              <PayersView onSelectPayerDetail={handleSelectPayerDetail} />
            )}

            {activeTab === 'payments' && (
              <PaymentsView onSelectPaymentDetail={handleSelectPaymentDetail} />
            )}

            {activeTab === 'audit' && (
              <AuditView />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <Section11ValidatorModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
      />

      <CreatePaymentModal
        isOpen={isGlobalPaymentModalOpen}
        onClose={() => setIsGlobalPaymentModalOpen(false)}
        onSuccess={() => {
          // Si estamos en la vista de pagos o dashboard, forzar actualización
          if (activeTab === 'dashboard') {
            setActiveTab('dashboard');
          }
        }}
      />

      <CreateReceivableModal
        isOpen={isGlobalReceivableModalOpen}
        onClose={() => setIsGlobalReceivableModalOpen(false)}
        onSuccess={() => {
          // Éxito
        }}
      />

      <PayerDetailDrawer
        payerId={selectedPayerId}
        isOpen={isPayerDrawerOpen}
        onClose={() => setIsPayerDrawerOpen(false)}
      />

      <PaymentDetailModal
        payment={selectedPaymentDetail}
        isOpen={isPaymentDetailModalOpen}
        onClose={() => setIsPaymentDetailModalOpen(false)}
        onRefresh={() => {
          if (selectedPaymentDetail) {
            handleSelectPaymentDetail(selectedPaymentDetail.id);
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
