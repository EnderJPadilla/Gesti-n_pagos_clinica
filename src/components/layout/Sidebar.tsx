/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Building2,
  BadgeDollarSign,
  History,
  Shield,
  UserCheck,
  ChevronRight,
  LogOut,
  X,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type ActiveTab = 'dashboard' | 'receivables' | 'payers' | 'payments' | 'audit';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onResetDemo?: () => void;
  onOpenScenarioModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  onResetDemo,
  onOpenScenarioModal,
}) => {
  const { user, role, switchRole, isAdmin, logout } = useAuth();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    {
      id: 'dashboard',
      label: 'Panel Gerencial',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'receivables',
      label: 'Cuentas por cobrar',
      icon: <ReceiptText className="w-4 h-4" />,
    },
    {
      id: 'payers',
      label: 'Pagadores',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'payments',
      label: 'Pagos recibidos',
      icon: <BadgeDollarSign className="w-4 h-4" />,
    },
    {
      id: 'audit',
      label: 'Auditoría',
      icon: <History className="w-4 h-4" />,
      adminOnly: true, // Según Sec. 5.7: visible solo para roles autorizados
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Lockup (Top Zone 1 single line) */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-xs">
              CF
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white text-sm tracking-tight leading-tight">
                Control Financiero
              </span>
              <span className="text-[11px] text-teal-400 font-medium">Clínica · Colombia</span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded text-slate-400 hover:text-white lg:hidden"
            aria-label="Cerrar menú lateral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Módulos Principales
          </div>

          {navItems.map((item) => {
            const isRestricted = item.adminOnly && !isAdmin;
            if (isRestricted) {
              // Visible solo para roles autorizados según Sección 5
              return null;
            }

            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-200" />}
              </button>
            );
          })}
        </nav>

        {/* User Account / Role Switcher (Sección 4: Administrador vs Consulta gerencial) */}
        <div className="p-3 border-t border-slate-800 shrink-0 bg-slate-950/40">
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Perfil Activo
              </span>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  isAdmin ? 'bg-teal-950 text-teal-300 border border-teal-800' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {isAdmin ? 'Administrador' : 'Consulta'}
              </span>
            </div>

            <div className="text-xs font-medium text-white truncate">{user?.name || 'Usuario'}</div>
            <div className="text-[11px] text-slate-400 truncate mb-2">{user?.roleTitle || ''}</div>

            {/* Quick role toggle for testing RBAC requirements */}
            <div className="pt-2 border-t border-slate-700/60 space-y-1.5">
              <button
                onClick={() => switchRole(isAdmin ? 'viewer' : 'admin')}
                className="w-full flex items-center justify-center gap-1.5 py-1 px-2 text-[11px] font-medium rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                title="Alternar rol para comprobar reglas de autorización en la interfaz"
              >
                <UserCheck className="w-3 h-3 text-teal-400" />
                <span>Cambiar a {isAdmin ? 'Consulta' : 'Admin'}</span>
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-1.5 py-1 px-2 text-[11px] font-medium rounded bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-900 transition-colors"
                title="Cerrar sesión y volver a la pantalla de login"
              >
                <LogOut className="w-3 h-3 text-rose-400" />
                <span>Cerrar sesión</span>
              </button>

              {(onOpenScenarioModal || onResetDemo) && (
                <div className="pt-2 border-t border-slate-700/60 space-y-1">
                  {onOpenScenarioModal && (
                    <button
                      onClick={onOpenScenarioModal}
                      className="w-full flex items-center justify-center gap-1.5 py-1 px-2 text-[10px] font-medium rounded bg-slate-800/80 hover:bg-slate-700 text-teal-300 transition-colors"
                      title="Verificar alineación contable de referencia"
                    >
                      <ShieldCheck className="w-3 h-3 text-teal-400" />
                      <span>Verificar Escenario Contable</span>
                    </button>
                  )}
                  {onResetDemo && (
                    <button
                      onClick={onResetDemo}
                      className="w-full flex items-center justify-center gap-1.5 py-1 px-2 text-[10px] font-medium rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Restablecer datos de prueba al estado inicial"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-400" />
                      <span>Restablecer Datos Demo</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
