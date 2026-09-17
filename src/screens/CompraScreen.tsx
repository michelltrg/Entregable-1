import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { listarProductos } from '../db/productoRepo';
import { crearCompra, ItemCompra } from '../db/compraRepo';
import { Producto } from '../types';

export default function CompraScreen() {
  const { cliente } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cantidades, setCantidades] = useState<Record<number, string>>({});
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

  const cambiarCantidad = (id: number, valor: string) => {
    setCantidades((prev) => ({ ...prev, [id]: valor }));
  };

  const construirItems = (): ItemCompra[] => {
    const items: ItemCompra[] = [];
    for (const p of disponibles) {
      const cantidad = Number(cantidades[p.Id]);
      if (cantidades[p.Id] && cantidad > 0) {
        items.push({ producto: p, cantidad });
      }
    }
    return items;
  };

  const items = construirItems();
  const total = items.reduce((acc, it) => acc + it.cantidad * it.producto.ValorUnitario, 0);

  const confirmarCompra = async () => {
    if (!cliente) {
      Alert.alert('Perfil incompleto', 'Debes completar tus datos de cliente antes de comprar.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Carrito vacío', 'Selecciona al menos un producto con una cantidad válida.');
      return;
    }

    for (const item of items) {
      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        Alert.alert('Cantidad inválida', `La cantidad de "${item.producto.Nombre}" debe ser un entero positivo.`);
        return;
      }
      // HU-05: no permitir agregar una cantidad superior al stock existente.
      if (item.cantidad > item.producto.Stock) {
        Alert.alert(
          'Stock insuficiente',
          `Solo hay ${item.producto.Stock} unidades disponibles de "${item.producto.Nombre}".`
        );
        return;
      }
    }

    setProcesando(true);
    try {
      const idEncabezado = await crearCompra(cliente.Id, items);
      Alert.alert('Compra realizada', `Pedido #${idEncabezado} registrado por un total de $${total.toFixed(2)}.`);
      setCantidades({});
      cargar();
    } catch (e: any) {
      Alert.alert('No se pudo completar la compra', e?.message ?? 'Intenta nuevamente.');
      cargar();
    } finally {
      setProcesando(false);
    }
  };

  // No dejar realizar compras hasta no tener el registro de los productos.
  if (productos.length === 0) {
    return (
      <Screen title="Comprar" current="Compra">
        <Text style={styles.vacio}>
          Aún no hay productos registrados en el catálogo. Vuelve más tarde.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen title="Comprar" current="Compra">
      <FlatList
        data={disponibles}
        keyExtractor={(item) => String(item.Id)}
        ListEmptyComponent={<Text style={styles.vacio}>No hay productos con stock disponible.</Text>}
        renderItem={({ item }) => (
          <View style={styles.fila}>
            <View style={styles.info}>
              <Text style={styles.nombre}>{item.Nombre}</Text>
              <Text style={styles.detalle}>{item.Descripcion}</Text>
              <Text style={styles.detalle}>
                ${item.ValorUnitario.toFixed(2)} · Stock: {item.Stock}
              </Text>
            </View>
            <TextInput
              style={styles.cantidadInput}
              keyboardType="numeric"
              placeholder="0"
              value={cantidades[item.Id] ?? ''}
              onChangeText={(t) => cambiarCantidad(item.Id, t)}
            />
          </View>
        )}
      />

      <View style={styles.resumen}>
        <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
        <TouchableOpacity style={styles.botonComprar} onPress={confirmarCompra} disabled={procesando}>
          <Text style={styles.botonTexto}>{procesando ? 'Procesando...' : 'Confirmar compra'}</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  vacio: {
    color: '#666666',
    fontSize: 14,
  },
  fila: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    paddingRight: 10,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },
  detalle: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  cantidadInput: {
    width: 60,
    height: 44,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    textAlign: 'center',
    fontSize: 15,
  },
  resumen: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
  },
  total: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'right',
  },
  botonComprar: {
    height: 52,
    backgroundColor: '#ff95ec',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
