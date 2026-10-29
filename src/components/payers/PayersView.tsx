/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Search,
  PlusCircle,
  Building2,
  Edit2,
  Eye,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { Payer, PayerType } from '../../types/api';
import { apiService } from '../../services/apiClient';
import { formatCOP, getPayerTypeBadge } from '../../utils/formatters';
import { TableSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';
import { CreateEditPayerModal } from './CreateEditPayerModal';
import { PayerDetailDrawer } from './PayerDetailDrawer';
import { useAuth } from '../../context/AuthContext';

interface PayersViewProps {
  onSelectPayerDetail?: (payerId: string) => void;
}

export const PayersView: React.FC<PayersViewProps> = ({ onSelectPayerDetail }) => {
  const { isAdmin } = useAuth();
  const [payers, setPayers] = useState<Payer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [payerToEdit, setPayerToEdit] = useState<Payer | null>(null);

  // Drawer
  const [drawerPayerId, setDrawerPayerId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const fetchPayers = async () => {
    setIsLoading(true);
    try {
      const activeParam =
        statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined;
      const data = await apiService.getPayers({
        search: search.trim() || undefined,
        type: typeFilter || undefined,
        isActive: activeParam,
      });
      setPayers(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayers();
  }, [search, typeFilter, statusFilter]);

  const handleOpenCreate = () => {
    setPayerToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (payer: Payer, e: React.MouseEvent) => {
    e.stopPropagation();
    setPayerToEdit(payer);
    setIsModalOpen(true);
  };

  const handleOpenDrawer = (payerId: string) => {
    setDrawerPayerId(payerId);
    setIsDrawerOpen(true);
    if (onSelectPayerDetail) onSelectPayerDetail(payerId);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Directorio de Pagadores
          </h2>
          <p className="text-xs text-slate-500">
            Entidades responsables de pago: EPS, Aseguradoras y Particulares.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Pagador</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Search */}
          <div className="relative sm:col-span-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre, NIT o contacto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Type filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="">Todos los tipos (EPS, Aseguradora, Particular)</option>
              <option value="EPS">Solo EPS</option>
              <option value="Aseguradora">Solo Aseguradoras</option>
              <option value="Particular">Solo Particulares</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">Todos los estados (Activos e Inactivos)</option>
              <option value="active">Solo Activos</option>
              <option value="inactive">Solo Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : payers.length === 0 ? (
          <EmptyState
            title="No se encontraron pagadores"
            description="Intente con otro término o registre un nuevo pagador en el sistema."
            actionText={isAdmin ? 'Registrar Pagador' : undefined}
            onAction={isAdmin ? handleOpenCreate : undefined}
            icon={search ? 'search' : 'inbox'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-3 font-semibold">Nombre / Razón Social</th>
                  <th className="py-3 px-3 font-semibold">Tipo</th>
                  <th className="py-3 px-3 font-semibold">Identificación</th>
                  <th className="py-3 px-3 font-semibold">Contacto Principal</th>
                  <th className="py-3 px-3 font-semibold text-right">Saldo Pendiente</th>
                  <th className="py-3 px-3 font-semibold text-right">Vencido</th>
                  <th className="py-3 px-3 font-semibold text-center">Estado</th>
                  <th className="py-3 px-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {payers.map((payer) => {
                  const badge = getPayerTypeBadge(payer.type);
                  return (
                    <tr
                      key={payer.id}
                      onClick={() => handleOpenDrawer(payer.id)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Nombre */}
                      <td className="py-3 px-3 font-sans">
                        <div className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {payer.name}
                        </div>
                        {payer.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                            {payer.notes}
                          </div>
                        )}
                      </td>

                      {/* Tipo */}
                      <td className="py-3 px-3 font-sans">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Identificación */}
                      <td className="py-3 px-3 text-slate-700 font-mono">
                        {payer.idNumber ? (
                          <span>
                            <span className="text-[10px] text-slate-400 font-sans mr-1">{payer.idType}:</span>
                            {payer.idNumber}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-sans">—</span>
                        )}
                      </td>

                      {/* Contacto */}
                      <td className="py-3 px-3 font-sans text-slate-600">
                        {payer.contactName ? (
                          <div>
                            <div className="text-slate-800 font-medium">{payer.contactName}</div>
                            {payer.phone && <div className="text-[11px] text-slate-400 font-mono">{payer.phone}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Saldo Pendiente */}
                      <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {formatCOP(payer.pendingBalance)}
                      </td>

                      {/* Saldo Vencido */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        {parseFloat(payer.overdueBalance) > 0 ? (
                          <span className="text-rose-700 font-medium">
                            {formatCOP(payer.overdueBalance)}
                          </span>
                        ) : (
                          <span className="text-slate-300">$ 0</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-3 text-center font-sans">
                        {payer.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-3 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {isAdmin && (
                            <button
                              onClick={(e) => handleOpenEdit(payer, e)}
                              className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                              title="Editar pagador"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenDrawer(payer.id)}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateEditPayerModal
        payerToEdit={payerToEdit}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPayers}
      />

      <PayerDetailDrawer
        payerId={drawerPayerId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
