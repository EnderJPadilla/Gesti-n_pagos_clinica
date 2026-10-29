/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Building2, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/apiClient';
import { Payer, PayerType, IdentificationType, CreatePayerDto, UpdatePayerDto, ApiError } from '../../types/api';
import { useAuth } from '../../context/AuthContext';

interface CreateEditPayerModalProps {
  payerToEdit: Payer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateEditPayerModal: React.FC<CreateEditPayerModalProps> = ({
  payerToEdit,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, role } = useAuth();
  const isEditing = !!payerToEdit;

  const [name, setName] = useState<string>('');
  const [type, setType] = useState<PayerType>('EPS');
  const [idType, setIdType] = useState<IdentificationType>('NIT');
  const [idNumber, setIdNumber] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (payerToEdit) {
        setName(payerToEdit.name);
        setType(payerToEdit.type);
        setIdType(payerToEdit.idType || 'NIT');
        setIdNumber(payerToEdit.idNumber || '');
        setContactName(payerToEdit.contactName || '');
        setEmail(payerToEdit.email || '');
        setPhone(payerToEdit.phone || '');
        setNotes(payerToEdit.notes || '');
        setIsActive(payerToEdit.isActive);
      } else {
        setName('');
        setType('EPS');
        setIdType('NIT');
        setIdNumber('');
        setContactName('');
        setEmail('');
        setPhone('');
        setNotes('');
        setIsActive(true);
      }
      setFieldErrors({});
      setGeneralError(null);
    }
  }, [isOpen, payerToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'El nombre o razón social es obligatorio';
    }

    if (email.trim() && !email.includes('@')) {
      errors.email = 'Ingrese una dirección de correo válida';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && payerToEdit) {
        const dto: UpdatePayerDto = {
          name: name.trim(),
          type,
          idType: idNumber.trim() ? idType : undefined,
          idNumber: idNumber.trim() || undefined,
          contactName: contactName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          notes: notes.trim() || undefined,
          isActive,
        };
        await apiService.updatePayer(payerToEdit.id, dto, user?.name || 'Usuario', role || undefined);
      } else {
        const dto: CreatePayerDto = {
          name: name.trim(),
          type,
          idType: idNumber.trim() ? idType : undefined,
          idNumber: idNumber.trim() || undefined,
          contactName: contactName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          notes: notes.trim() || undefined,
          isActive,
        };
        await apiService.createPayer(dto, user?.name || 'Usuario', role || undefined);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const apiErr = err as ApiError;
      if (apiErr.fieldErrors) setFieldErrors(apiErr.fieldErrors);
      setGeneralError(apiErr.message || 'Error al guardar el pagador.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-100 text-teal-800">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {isEditing ? 'Editar Pagador' : 'Registrar Nuevo Pagador'}
              </h3>
              <p className="text-xs text-slate-500">
                Información institucional de EPS, aseguradora o particular
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {generalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Razón Social */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Nombre o Razón Social <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. EPS Sanitas S.A.S."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((prev) => ({ ...prev, name: '' }));
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            {fieldErrors.name && <p className="mt-1 text-rose-600">{fieldErrors.name}</p>}
          </div>

          {/* Tipo de Pagador */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['EPS', 'Aseguradora', 'Particular'] as PayerType[]).map((t) => (
              <label
                key={t}
                className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer font-medium text-xs transition-colors ${
                  type === t
                    ? 'border-teal-600 bg-teal-50 text-teal-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payerType"
                  value={t}
                  checked={type === t}
                  onChange={() => setType(t)}
                  className="sr-only"
                />
                <span>{t}</span>
              </label>
            ))}
          </div>

          {/* Identificación */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tipo Doc.</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value as IdentificationType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
              >
                <option value="NIT">NIT</option>
                <option value="CC">Cédula (CC)</option>
                <option value="CE">Cédula Ext. (CE)</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Número de Identificación <span className="text-slate-400">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej. 800.251.440-6"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Persona de Contacto</label>
              <input
                type="text"
                placeholder="Ej. Dra. Claudia Rincón"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Teléfono</label>
              <input
                type="text"
                placeholder="Ej. +57 (601) 375-9000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder="Ej. cartera@entidad.com.co"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: '' }));
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
            />
            {fieldErrors.email && <p className="mt-1 text-rose-600">{fieldErrors.email}</p>}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Observaciones</label>
            <textarea
              rows={2}
              placeholder="Detalles sobre acuerdos de radicación o convenios..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          {/* Estado Activo / Inactivo (Sección 5.2: No eliminación física si tiene historial, marcar inactivo) */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <span className="font-medium text-slate-700">
                Pagador Activo (Disponible para radicación de nuevas cuentas y pagos)
              </span>
            </label>
          </div>

          {/* Footer */}
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
              {isLoading ? 'Guardando...' : isEditing ? 'Actualizar Pagador' : 'Crear Pagador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
