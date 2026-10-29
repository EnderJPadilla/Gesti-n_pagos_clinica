/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, Inbox, FolderSearch } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: 'inbox' | 'search';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon = 'inbox',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-lg">
      <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-slate-100 text-slate-500">
        {icon === 'search' ? <FolderSearch className="w-6 h-6" /> : <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const AccessDeniedView: React.FC<{
  title?: string;
  description?: string;
  onSwitchRole?: () => void;
}> = ({
  title = 'Acceso restringido',
  description = 'Su perfil actual de "Consulta gerencial" solo tiene permisos de lectura para este módulo.',
  onSwitchRole,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-lg">
      <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-amber-50 text-amber-700">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 max-w-md">{description}</p>
      {onSwitchRole && (
        <button
          onClick={onSwitchRole}
          className="mt-4 px-4 py-2 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
        >
          Cambiar a perfil Administrador para interactuar
        </button>
      )}
    </div>
  );
};
