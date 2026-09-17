import { getDb } from './database';
import { Cliente } from '../types';

export async function getClientePorLogin(idLogin: number): Promise<Cliente | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Cliente>(
    'SELECT * FROM Cliente WHERE IdLogin = ?',
    [idLogin]
  );
  return row ?? null;
}

/**
 * Crea el registro de Cliente en el primer ingreso, o actualiza sus
 * datos personales si ya existía (HU-03 / HU-04).
 */
export async function crearOActualizarCliente(
  idLogin: number,
  nombre: string,
  apellido: string,
  correo: string
): Promise<void> {
  const db = await getDb();
  const existente = await getClientePorLogin(idLogin);

  if (existente) {
    await db.runAsync(
      'UPDATE Cliente SET Nombre = ?, Apellido = ?, Correo = ? WHERE IdLogin = ?',
      [nombre, apellido, correo, idLogin]
    );
  } else {
    await db.runAsync(
      'INSERT INTO Cliente (IdLogin, Nombre, Apellido, Correo) VALUES (?, ?, ?, ?)',
      [idLogin, nombre, apellido, correo]
    );
  }
}

export async function listarClientes(): Promise<Cliente[]> {
  const db = await getDb();
  return db.getAllAsync<Cliente>('SELECT * FROM Cliente ORDER BY Nombre ASC');
}
