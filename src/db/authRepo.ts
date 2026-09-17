import { getDb } from './database';
import { LoginUser, Rol } from '../types';

export async function findByCorreo(correo: string): Promise<LoginUser | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<LoginUser>(
    'SELECT * FROM Login WHERE Correo = ?',
    [correo.trim().toLowerCase()]
  );
  return row ?? null;
}

/**
 * Crea la solicitud de registro. Queda en estado "Pendiente" y sin rol
 * asignado hasta que un Administrador la active (HU-01 / HU-02).
 */
export async function registrarUsuario(correo: string, password: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO Login (Correo, Password, Estado, Rol) VALUES (?, ?, ?, NULL)',
    [correo.trim().toLowerCase(), password, 'Pendiente']
  );
}

export async function listarPendientes(): Promise<LoginUser[]> {
  const db = await getDb();
  return db.getAllAsync<LoginUser>(
    'SELECT * FROM Login WHERE Estado = ? ORDER BY Id DESC',
    ['Pendiente']
  );
}

export async function activarUsuario(id: number, rol: Rol): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE Login SET Estado = ?, Rol = ? WHERE Id = ?', ['Activo', rol, id]);
}
