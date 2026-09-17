import { getDb } from './database';
import { Producto } from '../types';

export interface ItemCompra {
  producto: Producto;
  cantidad: number;
}

/**
 * Registra una compra completa (HU-06):
 *  1) Vuelve a validar el stock disponible dentro de la propia transacción,
 *     por si cambió desde que el cliente armó el carrito.
 *  2) Inserta el Encabezado (IdCliente, Fecha, Total).
 *  3) Inserta un Detalle por cada producto (IdEncabezado, IdProducto,
 *     Cantidad, Subtotal) y descuenta la cantidad comprada del Stock.
 * Todo ocurre dentro de withTransactionAsync: si algo falla, SQLite
 * revierte automáticamente los cambios (operación atómica).
 */
export async function crearCompra(idCliente: number, items: ItemCompra[]): Promise<number> {
  if (items.length === 0) {
    throw new Error('No hay productos seleccionados.');
  }

  const db = await getDb();
  let idEncabezado = -1;

  await db.withTransactionAsync(async () => {
    for (const item of items) {
      const actual = await db.getFirstAsync<{ Stock: number }>(
        'SELECT Stock FROM Producto WHERE Id = ?',
        [item.producto.Id]
      );
      if (!actual || actual.Stock < item.cantidad) {
        throw new Error(`Stock insuficiente para "${item.producto.Nombre}".`);
      }
    }

    const total = items.reduce((acc, it) => acc + it.cantidad * it.producto.ValorUnitario, 0);
    const fecha = new Date().toISOString();

    const resultado = await db.runAsync(
      'INSERT INTO Encabezado (IdCliente, Fecha, Total) VALUES (?, ?, ?)',
      [idCliente, fecha, total]
    );
    idEncabezado = Number(resultado.lastInsertRowId);

    for (const item of items) {
      const subtotal = item.cantidad * item.producto.ValorUnitario;

      await db.runAsync(
        'INSERT INTO Detalle (IdEncabezado, IdProducto, Cantidad, Subtotal) VALUES (?, ?, ?, ?)',
        [idEncabezado, item.producto.Id, item.cantidad, subtotal]
      );

      await db.runAsync(
        'UPDATE Producto SET Stock = Stock - ? WHERE Id = ?',
        [item.cantidad, item.producto.Id]
      );
    }
  });

  return idEncabezado;
}
