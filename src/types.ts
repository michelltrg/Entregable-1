export type Rol = 'Admin' | 'Cliente';
export type EstadoLogin = 'Pendiente' | 'Activo';

export interface LoginUser {
  Id: number;
  Correo: string;
  Password: string;
  Estado: EstadoLogin;
  Rol: Rol | null;
}

export interface Cliente {
  Id: number;
  IdLogin: number;
  Nombre: string;
  Apellido: string;
  Correo: string;
}

export interface Producto {
  Id: number;
  Nombre: string;
  Descripcion: string;
  ValorUnitario: number;
  Stock: number;
}

export interface Encabezado {
  Id: number;
  IdCliente: number;
  Fecha: string;
  Total: number;
}

export interface Detalle {
  Id: number;
  IdEncabezado: number;
  IdProducto: number;
  Cantidad: number;
  Subtotal: number;
}
