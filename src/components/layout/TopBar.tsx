/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, PlusCircle, CreditCard, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from './Sidebar';

interface TopBarProps {
  activeTab: ActiveTab;
  onOpenMobileSidebar: () => void;
  onOpenNewPaymentModal?: () => void;
  onOpenNewReceivableModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onOpenNewPaymentModal,
  onOpenNewReceivableModal,
}) => {
  const { role, isAdmin, logout } = useAuth();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Panel Gerencial · Indicadores Financieros';
      case 'receivables':
        return 'Gestión de Cuentas por Cobrar';
      case 'payers':
        return 'Directorio de Pagadores';
      case 'payments':
        return 'Registro e Historial de Pagos';
      case 'audit':
        return 'Registro de Auditoría y Trazabilidad';
      default:
        return 'Control Financiero';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Zone 1: Mobile toggle & Breadcrumb Trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 lg:hidden"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
          <span className="font-medium text-slate-900 hidden sm:inline">Clínica Santa Fe</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <h1 className="text-sm font-semibold text-slate-900 tracking-tight truncate">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Zone 2: Informative metadata */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap shrink-0">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
          COP (Pesos Colombianos)
        </span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span className="font-mono text-slate-600">Bogotá UTC-5</span>
      </div>

      {/* Zone 3: Primary Action (Admin only) or Status Indicator */}
      <div className="flex items-center gap-2.5 shrink-0">
        {isAdmin ? (
          <div className="flex items-center gap-2">
            {onOpenNewPaymentModal && (
              <button
                onClick={onOpenNewPaymentModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Registrar Pago</span>
              </button>
            )}
            {onOpenNewReceivableModal && (
              <button
                onClick={onOpenNewReceivableModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Nueva Cuenta</span>
              </button>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 bg-slate-100 rounded-md border border-slate-200">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium">Modo solo lectura</span>
          </div>
        )}

        <button
          onClick={logout}
          className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
