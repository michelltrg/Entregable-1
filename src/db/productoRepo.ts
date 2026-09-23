import { getDb } from './database';
import { Producto } from '../types';

export async function listarProductos(): Promise<Producto[]> {
  const db = await getDb();
  return db.getAllAsync<Producto>('SELECT * FROM Producto ORDER BY Nombre ASC');
}

export async function obtenerProducto(id: number): Promise<Producto | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Producto>('SELECT * FROM Producto WHERE Id = ?', [id]);
  return row ?? null;
}

export async function crearProducto(p: Omit<Producto, 'Id'>): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO Producto (Nombre, Descripcion, ValorUnitario, Stock) VALUES (?, ?, ?, ?)',
    [p.Nombre, p.Descripcion, p.ValorUnitario, p.Stock]
  );
}

export async function actualizarProducto(p: Producto): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE Producto SET Nombre = ?, Descripcion = ?, ValorUnitario = ?, Stock = ? WHERE Id = ?',
    [p.Nombre, p.Descripcion, p.ValorUnitario, p.Stock, p.Id]
  );
}
