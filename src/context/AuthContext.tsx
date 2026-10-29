/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Contexto de Autenticación y Perfil de Usuario para Control Financiero de Clínica.
 * Administra el estado de sesión autenticada (en memoria para el modo demo)
 * y la conexión con authService.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoginCredentialsDto, UserProfile, UserRole } from '../types/api';
import { authService, DEMO_CREDENTIALS } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isViewer: boolean;
  login: (credentials: LoginCredentialsDto) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  isLoading: boolean;
  authMode: 'demo' | 'api';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const authMode = authService.getMode();

  useEffect(() => {
    // Al montar, consultar si existe sesión activa previa en el servicio
    authService
      .getCurrentSession()
      .then((session) => {
        if (session && session.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (credentials: LoginCredentialsDto) => {
    setIsLoading(true);
    try {
      const session = await authService.login(credentials);
      setUser(session.user);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (!isAuthenticated) return;
    if (newRole === 'admin') {
      setUser(DEMO_CREDENTIALS.admin.user);
    } else {
      setUser(DEMO_CREDENTIALS.viewer.user);
    }
  };

  const role = user?.role || null;
  const isAdmin = role === 'admin';
  const isViewer = role === 'viewer';

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        role,
        isAdmin,
        isViewer,
        login,
        logout,
        switchRole,
        isLoading,
        authMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
