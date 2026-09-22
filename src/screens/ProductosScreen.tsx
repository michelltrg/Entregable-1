import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import { actualizarProducto, crearProducto, listarProductos } from '../db/productoRepo';
import { Producto } from '../types';
import { mostrarAlerta } from '../utils/alerta';

interface FormularioProducto {
  Nombre: string;
  Descripcion: string;
  ValorUnitario: string;
  Stock: string;
}

const FORM_VACIO: FormularioProducto = { Nombre: '', Descripcion: '', ValorUnitario: '', Stock: '' };

export default function ProductosScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [form, setForm] = useState<FormularioProducto>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setProductos(await listarProductos());
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const seleccionarParaEditar = (p: Producto) => {
    setEditando(p);
    setForm({
      Nombre: p.Nombre,
      Descripcion: p.Descripcion ?? '',
      ValorUnitario: String(p.ValorUnitario),
      Stock: String(p.Stock),
    });
  };

  const limpiar = () => {
    setEditando(null);
    setForm(FORM_VACIO);
  };

  const guardar = async () => {
    const valor = Number(form.ValorUnitario);
    const stock = Number(form.Stock);

    if (!form.Nombre.trim()) {
      mostrarAlerta('Nombre requerido', 'El nombre del producto es obligatorio.');
      return;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      mostrarAlerta('Valor inválido', 'El valor unitario debe ser un número positivo.');
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      mostrarAlerta('Stock inválido', 'El stock debe ser un número entero mayor o igual a 0.');
      return;
    }

    setGuardando(true);
    try {
      if (editando) {
        await actualizarProducto({
          ...editando,
          Nombre: form.Nombre.trim(),
          Descripcion: form.Descripcion.trim(),
          ValorUnitario: valor,
          Stock: stock,
        });
      } else {
        await crearProducto({
          Nombre: form.Nombre.trim(),
          Descripcion: form.Descripcion.trim(),
          ValorUnitario: valor,
          Stock: stock,
        });
      }
      limpiar();
      cargar();
    } catch (e: any) {
      mostrarAlerta('Error', e?.message ?? 'No se pudo guardar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Screen title="Productos" current="Productos">
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.contenedorAncho}>
          {/* FORMULARIO */}
          <View style={styles.formulario}>
            <Text style={styles.subtitulo}>
              {editando ? 'Editar producto' : 'Nuevo producto'}
            </Text>

            <Text style={styles.label}>Nombre del producto</Text>
            <TextInput
              style={styles.input}
              value={form.Nombre}
              onChangeText={(t) => setForm((f) => ({ ...f, Nombre: t }))}
            />

            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={styles.input}
              value={form.Descripcion}
              onChangeText={(t) => setForm((f) => ({ ...f, Descripcion: t }))}
            />

            <View style={styles.filaDosColumnas}>
              <View style={styles.columna}>
                <Text style={styles.label}>Valor ($)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.ValorUnitario}
                  onChangeText={(t) => setForm((f) => ({ ...f, ValorUnitario: t }))}
                />
              </View>

              <View style={styles.columna}>
                <Text style={styles.label}>Stock</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={form.Stock}
                  onChangeText={(t) => setForm((f) => ({ ...f, Stock: t }))}
                />
              </View>
            </View>

            <View style={styles.filaBotones}>
              <TouchableOpacity
                style={styles.botonGuardar}
                onPress={guardar}
                disabled={guardando}
              >
                <Text style={styles.botonTexto}>
                  {guardando
                    ? 'Guardando...'
                    : editando
                    ? 'Guardar cambios'
                    : 'Agregar producto'}
                </Text>
              </TouchableOpacity>
              {editando && (
                <TouchableOpacity style={styles.botonCancelar} onPress={limpiar}>
                  <Text style={styles.botonTextoCancelar}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* LISTADO DE PRODUCTOS */}
          <Text style={[styles.subtitulo, { marginTop: 10, marginBottom: 12 }]}>
            Inventario de Productos ({productos.length})
          </Text>

          {productos.map((item) => (
            <TouchableOpacity
              key={String(item.Id)}
              style={[
                styles.cardProducto,
                editando?.Id === item.Id && styles.cardEditando,
              ]}
              onPress={() => seleccionarParaEditar(item)}
            >
              <View style={styles.infoEncabezado}>
                <Text style={styles.nombreProducto}>{item.Nombre}</Text>
                <Text style={styles.precioProducto}>
                  ${item.ValorUnitario.toFixed(2)}
                </Text>
              </View>

              {!!item.Descripcion && (
                <Text style={styles.descripcionProducto}>{item.Descripcion}</Text>
              )}

              <View style={styles.badgeStock}>
                <Text style={styles.textoStock}>Stock: {item.Stock} uds</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingVertical: 10,
    paddingBottom: 60,
  },

  // Contenedor centrado para web
  contenedorAncho: {
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center',
    paddingHorizontal: 10,
  },

  formulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EBF1F6',
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 5,
  },
  input: {
    height: 46,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 14,
    color: '#2D3748',
  },
  filaDosColumnas: {
    flexDirection: 'row',
    gap: 12,
  },
  columna: {
    flex: 1,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: '#ff80ed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  botonTextoCancelar: {
    color: '#4A5568',
    fontWeight: '700',
    fontSize: 14,
  },
  cardProducto: {
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
  cardEditando: {
    borderColor: '#ff80ed',
    borderWidth: 2,
    backgroundColor: '#FFF5FD',
  },
  infoEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nombreProducto: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
  },
  precioProducto: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B6CB0',
  },
  descripcionProducto: {
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
  },
  badgeStock: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  textoStock: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
  },
});