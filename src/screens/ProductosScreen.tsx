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
import { actualizarProducto, crearProducto, listarProductos } from '../db/productoRepo';
import { Producto } from '../types';

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
      Alert.alert('Nombre requerido', 'El nombre del producto es obligatorio.');
      return;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      Alert.alert('Valor inválido', 'El valor unitario debe ser un número positivo.');
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      Alert.alert('Stock inválido', 'El stock debe ser un número entero mayor o igual a 0.');
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
      Alert.alert('Error', e?.message ?? 'No se pudo guardar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Screen title="Productos" current="Productos">
      <View style={styles.formulario}>
        <Text style={styles.subtitulo}>{editando ? 'Editar producto' : 'Nuevo producto'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={form.Nombre}
          onChangeText={(t) => setForm((f) => ({ ...f, Nombre: t }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={form.Descripcion}
          onChangeText={(t) => setForm((f) => ({ ...f, Descripcion: t }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Valor unitario"
          keyboardType="numeric"
          value={form.ValorUnitario}
          onChangeText={(t) => setForm((f) => ({ ...f, ValorUnitario: t }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Stock"
          keyboardType="numeric"
          value={form.Stock}
          onChangeText={(t) => setForm((f) => ({ ...f, Stock: t }))}
        />

        <View style={styles.filaBotones}>
          <TouchableOpacity style={styles.botonGuardar} onPress={guardar} disabled={guardando}>
            <Text style={styles.botonTexto}>
              {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Agregar producto'}
            </Text>
          </TouchableOpacity>
          {editando && (
            <TouchableOpacity style={styles.botonCancelar} onPress={limpiar}>
              <Text style={styles.botonTexto}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.Id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.fila} onPress={() => seleccionarParaEditar(item)}>
            <Text style={styles.nombre}>
              {item.Nombre} — ${item.ValorUnitario.toFixed(2)}
            </Text>
            <Text style={styles.detalle}>{item.Descripcion}</Text>
            <Text style={styles.detalle}>Stock: {item.Stock}</Text>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  formulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  subtitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 10,
  },
  input: {
    height: 48,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    fontSize: 14,
    color: '#333',
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: '#ff95ec',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: '#cccccc',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  fila: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
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
});
