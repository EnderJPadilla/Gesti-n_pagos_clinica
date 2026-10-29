/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Receipt, CheckCircle2 } from 'lucide-react';
import { apiService } from '../../services/apiClient';
import { Payer, ReviewStatus, CreateReceivableDto, ApiError } from '../../types/api';
import { getTodayBogota } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface CreateReceivableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultPayerId?: string;
}

export const CreateReceivableModal: React.FC<CreateReceivableModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultPayerId,
}) => {
  const { user, role } = useAuth();
  const [payers, setPayers] = useState<Payer[]>([]);
  const [payerId, setPayerId] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(getTodayBogota());
  const [dueDate, setDueDate] = useState<string>('');
  const [originalAmount, setOriginalAmount] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('not_reviewed');
  const [notes, setNotes] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      apiService.getPayers({ isActive: true }).then((data) => {
        setPayers(data);
        if (defaultPayerId) {
          setPayerId(defaultPayerId);
        } else if (data.length > 0 && !payerId) {
          setPayerId(data[0].id);
        }
      });
      // Reset form fields
      setReferenceNumber('');
      setDescription('');
      setIssueDate(getTodayBogota());
      setDueDate('');
      setOriginalAmount('');
      setReviewStatus('not_reviewed');
      setNotes('');
      setFieldErrors({});
      setGeneralError(null);
    }
  }, [isOpen, defaultPayerId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    const errors: Record<string, string> = {};

    if (!payerId) errors.payerId = 'Seleccione un pagador responsable';
    if (!referenceNumber.trim()) errors.referenceNumber = 'La referencia de factura o cuenta es obligatoria';
    if (!issueDate) errors.issueDate = 'La fecha de emisión es obligatoria';

    const numAmount = parseFloat(originalAmount.replace(/[^0-9.]/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.originalAmount = 'El valor original debe ser mayor que cero en pesos colombianos (COP)';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const dto: CreateReceivableDto = {
        payerId,
        referenceNumber: referenceNumber.trim(),
        description: description.trim() || undefined,
        issueDate,
        dueDate: dueDate || undefined,
        originalAmount: numAmount.toFixed(2),
        reviewStatus,
        notes: notes.trim() || undefined,
      };

      await apiService.createReceivable(dto, user?.name || 'Usuario', role || undefined);
      onSuccess();
      onClose();
    } catch (err: any) {
      const apiErr = err as ApiError;
      if (apiErr.fieldErrors) {
        setFieldErrors(apiErr.fieldErrors);
      }
      setGeneralError(apiErr.message || 'Error al registrar la cuenta por cobrar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-100 text-teal-800">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Nueva Cuenta por Cobrar
              </h3>
              <p className="text-xs text-slate-500">
                Registro de factura o cuenta emitida al pagador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {generalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Pagador Responsable */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Pagador Responsable <span className="text-rose-600">*</span>
            </label>
            <select
              value={payerId}
              onChange={(e) => {
                setPayerId(e.target.value);
                setFieldErrors((prev) => ({ ...prev, payerId: '' }));
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="">Seleccione un pagador...</option>
              {payers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
            {fieldErrors.payerId && (
              <p className="mt-1 text-rose-600">{fieldErrors.payerId}</p>
            )}
          </div>

          {/* Referencia y Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Referencia de Factura / Cuenta <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. FAC-2026-00150"
                value={referenceNumber}
                onChange={(e) => {
                  setReferenceNumber(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, referenceNumber: '' }));
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
              />
              {fieldErrors.referenceNumber && (
                <p className="mt-1 text-rose-600">{fieldErrors.referenceNumber}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Valor Original (COP) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-mono">$</span>
                <input
                  type="text"
                  placeholder="Ej. 10000000"
                  value={originalAmount}
                  onChange={(e) => {
                    setOriginalAmount(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, originalAmount: '' }));
                  }}
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono text-right"
                />
              </div>
              {fieldErrors.originalAmount && (
                <p className="mt-1 text-rose-600">{fieldErrors.originalAmount}</p>
              )}
            </div>
          </div>

          {/* Fechas de Emisión y Vencimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Fecha de Emisión / Registro <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => {
                  setIssueDate(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, issueDate: '' }));
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
              />
              {fieldErrors.issueDate && (
                <p className="mt-1 text-rose-600">{fieldErrors.issueDate}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Fecha de Vencimiento <span className="text-slate-400">(Opcional)</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
              />
            </div>
          </div>

          {/* Estado de Revisión */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Estado de Revisión Inicial
            </label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value as ReviewStatus)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="not_reviewed">No revisada</option>
              <option value="in_review">En revisión</option>
              <option value="accepted">Aceptada</option>
              <option value="disputed">Con glosa / devolución</option>
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Descripción o Detalle de Servicios
            </label>
            <input
              type="text"
              placeholder="Ej. Procedimientos de laboratorio y urgencias"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Observaciones adicionales
            </label>
            <textarea
              rows={2}
              placeholder="Notas de radicación o entrega física..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs transition-colors"
            >
              {isLoading ? 'Registrando...' : 'Registrar Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
