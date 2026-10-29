/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_CREDENTIALS } from '../../services/authService';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Estados de validación y carga
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{
    usernameOrEmail?: string;
    password?: string;
  }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Validación de formato de correo (cuando aplica)
  const isValidEmail = (email: string): boolean => {
    // Formato RFC 5322 simplificado para validación amigable
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const errors: { usernameOrEmail?: string; password?: string } = {};
    const trimmedUser = usernameOrEmail.trim();

    // Validación de usuario/correo
    if (!trimmedUser) {
      errors.usernameOrEmail = 'El usuario o correo electrónico es obligatorio.';
    } else if (trimmedUser.includes('@') && !isValidEmail(trimmedUser)) {
      errors.usernameOrEmail = 'Ingresa un correo electrónico con formato válido (ej. usuario@dominio.com).';
    }

    // Validación de contraseña (no se modifica la contraseña, pero se rechaza si es solo espacios)
    if (!password || password.trim().length === 0) {
      errors.password = 'La contraseña es obligatoria.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevenir múltiples envíos concurrentes

    setGeneralError(null);

    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await login({
        usernameOrEmail: usernameOrEmail.trim(),
        password, // Se envía exactamente la contraseña ingresada
        rememberMe,
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      // Mensaje genérico de seguridad sin exponer detalles internos
      setGeneralError(
        err?.message || 'No fue posible iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoCredentials = () => {
    // Autocompleta los campos de ejemplo sin iniciar sesión automáticamente
    setUsernameOrEmail(DEMO_CREDENTIALS.admin.username);
    setPassword(DEMO_CREDENTIALS.admin.password);
    setFieldErrors({});
    setGeneralError(null);
  };

  return (
    <div className="space-y-6">
      {/* Mensaje de error general accesible */}
      {generalError && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-900 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{generalError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Campo Usuario / Correo */}
        <div>
          <label
            htmlFor="usernameOrEmail"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Usuario o correo electrónico <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"
              aria-hidden="true"
            >
              <Mail className="w-4 h-4" />
            </span>
            <input
              id="usernameOrEmail"
              name="usernameOrEmail"
              type="email"
              autoComplete="username"
              placeholder="ejemplo@clinica-demo.local"
              value={usernameOrEmail}
              disabled={isSubmitting}
              onChange={(e) => {
                setUsernameOrEmail(e.target.value);
                if (fieldErrors.usernameOrEmail) {
                  setFieldErrors((prev) => ({ ...prev, usernameOrEmail: undefined }));
                }
                if (generalError) setGeneralError(null);
              }}
              aria-invalid={!!fieldErrors.usernameOrEmail}
              aria-describedby={
                fieldErrors.usernameOrEmail ? 'username-error' : undefined
              }
              className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.usernameOrEmail
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600'
              } disabled:bg-slate-50 disabled:text-slate-400`}
            />
          </div>
          {fieldErrors.usernameOrEmail && (
            <p
              id="username-error"
              role="alert"
              className="mt-1.5 text-[11px] text-rose-600 font-medium"
            >
              {fieldErrors.usernameOrEmail}
            </p>
          )}
        </div>

        {/* Campo Contraseña */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Contraseña <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"
              aria-hidden="true"
            >
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              disabled={isSubmitting}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
                if (generalError) setGeneralError(null);
              }}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={
                fieldErrors.password ? 'password-error' : undefined
              }
              className={`w-full pl-9 pr-10 py-2 bg-white border rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.password
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600'
              } disabled:bg-slate-50 disabled:text-slate-400 font-mono`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
              className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-teal-600 transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p
              id="password-error"
              role="alert"
              className="mt-1.5 text-[11px] text-rose-600 font-medium"
            >
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Casilla Recordarme */}
        <div className="flex items-center justify-between pt-1">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
              className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500 disabled:opacity-50"
            />
            <span className="text-xs text-slate-600">
              Recordar usuario en este navegador
            </span>
          </label>
        </div>

        {/* Botón Principal Ingresar */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-teal-400 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <span>Ingresar</span>
            )}
          </button>
        </div>
      </form>

      {/* Bloque Visible de Credenciales de Demostración (Sección 3) */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5 text-teal-700" /> Credenciales de demostración
          </span>
          <span className="text-[10px] font-medium text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
            Ficticias
          </span>
        </div>

        <div className="space-y-1.5 text-xs font-mono bg-white p-3 rounded-lg border border-slate-200 text-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans text-[11px]">Usuario:</span>
            <span className="font-semibold text-slate-900 select-all">
              {DEMO_CREDENTIALS.admin.username}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-slate-400 font-sans text-[11px]">Contraseña:</span>
            <span className="font-semibold text-slate-900 select-all">
              {DEMO_CREDENTIALS.admin.password}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFillDemoCredentials}
          disabled={isSubmitting}
          className="w-full py-2 px-3 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 border border-teal-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Usar credenciales de ejemplo</span>
        </button>

        <p className="text-[10px] text-slate-400 leading-tight text-center">
          El botón completa los campos. Pulsa “Ingresar” para continuar.
        </p>
      </div>
    </div>
  );
};
