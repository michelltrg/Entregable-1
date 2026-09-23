import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { findByCorreo } from '../db/authRepo';
import { getClientePorLogin } from '../db/clienteRepo';
import { Cliente, LoginUser } from '../types';

interface ResultadoLogin {
  ok: boolean;
  mensaje?: string;
}

interface AuthContextValue {
  usuario: LoginUser | null;
  cliente: Cliente | null;
  cargando: boolean;
  login: (correo: string, password: string) => Promise<ResultadoLogin>;
  logout: () => void;
  refrescarCliente: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<LoginUser | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [cargando, setCargando] = useState(false);

  const refrescarCliente = useCallback(async () => {
    if (usuario && usuario.Rol === 'Cliente') {
      const c = await getClientePorLogin(usuario.Id);
      setCliente(c);
    } else {
      setCliente(null);
    }
  }, [usuario]);

  useEffect(() => {
    refrescarCliente();
  }, [usuario, refrescarCliente]);

  const login = useCallback(async (correo: string, password: string): Promise<ResultadoLogin> => {
    setCargando(true);
    try {
      const encontrado = await findByCorreo(correo);

      if (!encontrado || encontrado.Password !== password.trim()) {
        return { ok: false, mensaje: 'Correo o contraseña incorrectos.' };
      }
      if (encontrado.Estado !== 'Activo') {
        return {
          ok: false,
          mensaje: 'Tu cuenta aún no ha sido activada por un administrador.',
        };
      }

      setUsuario(encontrado);
      return { ok: true };
    } finally {
      setCargando(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);
    setCliente(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cliente, cargando, login, logout, refrescarCliente }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>.');
  }
  return ctx;
}
