import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import { activarUsuario, listarPendientes } from '../db/authRepo';
import { LoginUser, Rol } from '../types';

export default function AdminUsuariosScreen() {
  const [pendientes, setPendientes] = useState<LoginUser[]>([]);

  const cargar = useCallback(async () => {
    setPendientes(await listarPendientes());
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const activar = async (id: number, rol: Rol) => {
    await activarUsuario(id, rol);
    Alert.alert('Cuenta activada', `Rol asignado: ${rol}`);
    cargar();
  };

  return (
    <Screen title="Usuarios pendientes" current="AdminUsuarios">
      {pendientes.length === 0 ? (
        <Text style={styles.vacio}>No hay solicitudes de registro pendientes.</Text>
      ) : (
        <FlatList
          data={pendientes}
          keyExtractor={(item) => String(item.Id)}
          renderItem={({ item }) => (
            <View style={styles.fila}>
              <Text style={styles.correo}>{item.Correo}</Text>
              <View style={styles.botones}>
                <TouchableOpacity
                  style={styles.botonCliente}
                  onPress={() => activar(item.Id, 'Cliente')}
                >
                  <Text style={styles.botonTexto}>Activar como Cliente</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonAdmin} onPress={() => activar(item.Id, 'Admin')}>
                  <Text style={styles.botonTexto}>Activar como Admin</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
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
  },
  correo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  botones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonCliente: {
    flex: 1,
    backgroundColor: '#bb95f9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonAdmin: {
    flex: 1,
    backgroundColor: '#ff95ec',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
});
