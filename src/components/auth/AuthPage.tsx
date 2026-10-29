/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LoginForm } from './LoginForm';
import { ShieldCheck, Building2, Stethoscope, CheckCircle2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-teal-100 selection:text-teal-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 text-white font-bold text-lg shadow-sm mb-1">
            CF
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Control Financiero de Clínica
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Clínica Santa Fe · Sistema de Cuentas por Cobrar y Recaudos
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xs border border-slate-200 rounded-2xl">
          {/* Card Title & Subtitle */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              Iniciar sesión
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Accede para consultar y gestionar la información financiera
            </p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>

        {/* Environmental Demo Notice */}
        <div className="mt-6 text-center space-y-1 text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1.5 font-medium text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Entorno de demostración · Datos simulados no reales</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Zona horaria: <span className="font-mono">America/Bogota (UTC-5)</span> · Moneda: <span className="font-mono">COP</span>
          </p>
        </div>
      </div>
    </div>
  );
};
