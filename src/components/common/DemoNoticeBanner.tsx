/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertCircle, RotateCcw, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { getTodayBogota, formatDateCO } from '../../utils/formatters';

interface DemoNoticeBannerProps {
  onResetDemo: () => void;
  onOpenScenarioModal: () => void;
}

export const DemoNoticeBanner: React.FC<DemoNoticeBannerProps> = ({
  onResetDemo,
  onOpenScenarioModal,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const todayBogota = getTodayBogota();

  if (isDismissed) {
    return (
      <div className="bg-amber-500 text-slate-950 px-4 py-1 text-xs font-medium flex items-center justify-between border-b border-amber-600">
        <span className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Modo Demostración activo · Datos simulados</span>
        </span>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-xs underline hover:text-white transition-colors"
        >
          Mostrar detalles
        </button>
      </div>
    );
  }

  return (
    <aside aria-label="Aviso de demostración" className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start sm:items-center gap-2">
          <span className="font-semibold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 uppercase tracking-wider text-[10px] shrink-0">
            Datos de demostración
          </span>
          <p className="text-amber-900 leading-tight">
            Ambiente de pruebas del frontend MVP de Control Financiero.
            Cifras financieras simuladas · Zona horaria: <span className="font-mono font-medium">America/Bogota (UTC-5)</span> · Fecha del sistema: <span className="font-mono font-medium">{formatDateCO(todayBogota)}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={onOpenScenarioModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium transition-colors border border-amber-300"
            title="Verificar cumplimiento del Escenario de Prueba Sección 11"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Verificar Escenario Sec. 11</span>
            <ChevronRight className="w-3 h-3 text-amber-600" />
          </button>

          <button
            onClick={onResetDemo}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors border border-slate-300"
            title="Restablecer base de datos simulada al estado inicial"
          >
            <RotateCcw className="w-3 h-3 text-slate-600" />
            <span>Restablecer demo</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-amber-700 hover:text-amber-950 rounded hover:bg-amber-100 transition-colors"
            title="Ocultar aviso temporalmente"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
