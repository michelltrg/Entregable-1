import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { listarProductos } from '../db/productoRepo';
import { crearCompra, ItemCompra } from '../db/compraRepo';
import { Producto } from '../types';
import { mostrarAlerta } from '../utils/alerta';

export default function CompraScreen() {
  const { cliente } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  // Cantidad elegida por producto: { [idProducto]: cantidad }
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(async () => {
    setProductos(await listarProductos());
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  // HU-05: solo se pueden seleccionar productos con Stock > 0.
  const disponibles = productos.filter((p) => p.Stock > 0);

  // Suma o resta una unidad, sin bajar de 0 ni pasar del stock (HU-05).
  const cambiarCantidad = (producto: Producto, delta: number) => {
    setCantidades((prev) => {
      const actual = prev[producto.Id] ?? 0;
      const nueva = Math.min(Math.max(actual + delta, 0), producto.Stock);
      return { ...prev, [producto.Id]: nueva };
    });
  };

  const items: ItemCompra[] = disponibles
    .filter((p) => (cantidades[p.Id] ?? 0) > 0)
    .map((p) => ({ producto: p, cantidad: cantidades[p.Id] }));

  const total = items.reduce((acc, it) => acc + it.cantidad * it.producto.ValorUnitario, 0);
  const totalUnidades = items.reduce((acc, it) => acc + it.cantidad, 0);

  const confirmarCompra = async () => {
    if (!cliente) {
      mostrarAlerta('Perfil incompleto', 'Debes completar tus datos de cliente antes de comprar.');
      return;
    }
    if (items.length === 0) {
      mostrarAlerta('Carrito vacío', 'Agrega al menos un producto para continuar.');
      return;
    }

    // Se revisa de nuevo por si el stock cambió mientras el cliente elegía.
    for (const item of items) {
      if (item.cantidad > item.producto.Stock) {
        mostrarAlerta(
          'Stock insuficiente',
          `Solo hay ${item.producto.Stock} unidades disponibles de "${item.producto.Nombre}".`
        );
        return;
      }
    }

    setProcesando(true);
    try {
      const idEncabezado = await crearCompra(cliente.Id, items);
      mostrarAlerta(
        'Compra realizada',
        `Pedido #${idEncabezado} Total: ${total.toFixed(2)}.`
      );
      setCantidades({});
      cargar();
    } catch (e: any) {
      mostrarAlerta('No se pudo completar la compra', e?.message ?? 'Intenta nuevamente.');
      cargar();
    } finally {
      setProcesando(false);
    }
  };

  // No dejar realizar compras hasta no tener el registro de los productos.
  if (productos.length === 0) {
    return (
      <Screen title="Comprar" current="Compra">
        <View style={styles.pagina}>
          <View style={styles.vacioCaja}>
            <Text style={styles.vacioTitulo}>Catálogo vacío</Text>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Comprar" current="Compra">
      <View style={styles.pagina}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {disponibles.length === 0 ? (
            <View style={styles.vacioCaja}>
              <Text style={styles.vacioTitulo}>Sin stock</Text>
              <Text style={styles.vacioTexto}>No hay productos disponibles.</Text>
            </View>
          ) : (
            disponibles.map((p) => {
              const cantidad = cantidades[p.Id] ?? 0;
              const enCarrito = cantidad > 0;
              const alMaximo = cantidad >= p.Stock;

              return (
                <View key={String(p.Id)} style={[styles.tarjeta, enCarrito && styles.tarjetaActiva]}>
                  <View style={styles.info}>
                    <Text style={styles.nombre}>{p.Nombre}</Text>
                    {!!p.Descripcion && <Text style={styles.descripcion}>{p.Descripcion}</Text>}

                    <View style={styles.filaPrecio}>
                      <Text style={styles.precio}>${p.ValorUnitario.toFixed(2)}</Text>
                      <View style={styles.badgeStock}>
                        <Text style={styles.textoStock}>Stock: {p.Stock}</Text>
                      </View>
                    </View>

                    {enCarrito && (
                      <Text style={styles.subtotal}>
                        Subtotal: ${(cantidad * p.ValorUnitario).toFixed(2)}
                      </Text>
                    )}
                  </View>

                  {/* Sin cantidad: botón Agregar. Con cantidad: contador − n + */}
                  {!enCarrito ? (
                    <TouchableOpacity
                      style={styles.botonAgregar}
                      onPress={() => cambiarCantidad(p, 1)}
                    >
                      <Text style={styles.botonAgregarTexto}>Agregar</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.contador}>
                      <TouchableOpacity
                        style={styles.botonContador}
                        onPress={() => cambiarCantidad(p, -1)}
                      >
                        <Text style={styles.botonContadorTexto}>−</Text>
                      </TouchableOpacity>

                      <Text style={styles.cantidad}>{cantidad}</Text>

                      <TouchableOpacity
                        style={[styles.botonContador, alMaximo && styles.botonContadorOff]}
                        onPress={() => cambiarCantidad(p, 1)}
                        disabled={alMaximo}
                      >
                        <Text style={styles.botonContadorTexto}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Resumen siempre visible al pie */}
        <View style={styles.resumen}>
          <View style={styles.filaResumen}>
            <Text style={styles.resumenEtiqueta}>
              {totalUnidades === 0
                ? 'Tu carrito está vacío'
                : `${totalUnidades} ${totalUnidades === 1 ? 'unidad' : 'unidades'}`}
            </Text>
            <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.botonComprar, (procesando || items.length === 0) && styles.botonComprarOff]}
            onPress={confirmarCompra}
            disabled={procesando || items.length === 0}
          >
            <Text style={styles.botonComprarTexto}>
              {procesando ? 'Procesando...' : 'Confirmar compra'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Mismo ancho máximo y centrado que las demás pantallas
  pagina: {
    flex: 1,
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center',
    paddingHorizontal: 10,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
  },

  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBF1F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  // Se resalta la tarjeta cuando el producto ya está en el carrito
  tarjetaActiva: {
    borderColor: '#ff80ed',
    borderWidth: 2,
    backgroundColor: '#FFF5FD',
  },
  info: {
    flex: 1,
    paddingRight: 12,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
  },
  descripcion: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  filaPrecio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  precio: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2B6CB0',
  },
  badgeStock: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  textoStock: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
  },
  subtotal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B4189F',
    marginTop: 6,
  },

  botonAgregar: {
    backgroundColor: '#ff80ed',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  botonAgregarTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  contador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3B6EA',
    padding: 4,
  },
  botonContador: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#ff80ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonContadorOff: {
    backgroundColor: '#E2E8F0',
  },
  botonContadorTexto: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  cantidad: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
  },

  resumen: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBF1F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  filaResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resumenEtiqueta: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '600',
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
  },
  botonComprar: {
    backgroundColor: '#ff80ed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonComprarOff: {
    opacity: 0.5,
  },
  botonComprarTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  vacioCaja: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EBF1F6',
    alignItems: 'center',
  },
  vacioTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 6,
  },
  vacioTexto: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
  },
});