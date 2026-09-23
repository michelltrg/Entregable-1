import * as SQLite from 'expo-sqlite';

const NOMBRE_BD = 'tienda.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Devuelve la instancia única (singleton) de la base de datos SQLite,
 * abriéndola la primera vez que se solicita.
 */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(NOMBRE_BD);
  }
  return dbInstance;
}

/**
 * Crea las tablas del modelo (si no existen) y siembra datos iniciales:
 * un usuario Admin activo y un par de productos de ejemplo, para que
 * la app se pueda probar de inmediato sin pasos manuales.
 */
export async function initDatabase(): Promise<void> {
  const db = await getDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS Login (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Correo TEXT NOT NULL UNIQUE,
      Password TEXT NOT NULL,
      Estado TEXT NOT NULL DEFAULT 'Pendiente',
      Rol TEXT
    );

    CREATE TABLE IF NOT EXISTS Cliente (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      IdLogin INTEGER NOT NULL UNIQUE,
      Nombre TEXT NOT NULL,
      Apellido TEXT NOT NULL,
      Correo TEXT NOT NULL,
      FOREIGN KEY (IdLogin) REFERENCES Login (Id)
    );

    CREATE TABLE IF NOT EXISTS Producto (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Nombre TEXT NOT NULL,
      Descripcion TEXT,
      ValorUnitario REAL NOT NULL,
      Stock INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Encabezado (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      IdCliente INTEGER NOT NULL,
      Fecha TEXT NOT NULL,
      Total REAL NOT NULL,
      FOREIGN KEY (IdCliente) REFERENCES Cliente (Id)
    );

    CREATE TABLE IF NOT EXISTS Detalle (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      IdEncabezado INTEGER NOT NULL,
      IdProducto INTEGER NOT NULL,
      Cantidad INTEGER NOT NULL,
      Subtotal REAL NOT NULL,
      FOREIGN KEY (IdEncabezado) REFERENCES Encabezado (Id),
      FOREIGN KEY (IdProducto) REFERENCES Producto (Id)
    );
  `);

  await sembrarDatosIniciales(db);
}

async function sembrarDatosIniciales(db: SQLite.SQLiteDatabase): Promise<void> {
  const admin = await db.getFirstAsync<{ Id: number }>(
    'SELECT Id FROM Login WHERE Correo = ?',
    ['admin@tienda.com']
  );

  if (!admin) {
    await db.runAsync(
      'INSERT INTO Login (Correo, Password, Estado, Rol) VALUES (?, ?, ?, ?)',
      ['admin@tienda.com', 'admin123', 'Activo', 'Admin']
    );
  }

  const totalProductos = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) as total FROM Producto'
  );

  if (totalProductos && totalProductos.total === 0) {
    const productosIniciales: [string, string, number, number][] = [
      ['Camiseta básica', 'Camiseta de algodón 100%', 45000, 25],
      ['Gorra deportiva', 'Gorra ajustable unitalla', 30000, 15],
      ['Botella térmica', 'Botella de acero inoxidable 750ml', 55000, 10],
    ];

    for (const [nombre, descripcion, valor, stock] of productosIniciales) {
      await db.runAsync(
        'INSERT INTO Producto (Nombre, Descripcion, ValorUnitario, Stock) VALUES (?, ?, ?, ?)',
        [nombre, descripcion, valor, stock]
      );
    }
  }
}
