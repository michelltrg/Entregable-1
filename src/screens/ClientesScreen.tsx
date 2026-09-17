import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import { listarClientes } from '../db/clienteRepo';
import { Cliente } from '../types';

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useFocusEffect(
    useCallback(() => {
      listarClientes().then(setClientes);
    }, [])
  );

  return (
    <Screen title="Clientes registrados" current="Clientes">
      {clientes.length === 0 ? (
        <Text style={styles.vacio}>Aún no hay clientes con perfil completo.</Text>
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={(item) => String(item.Id)}
          renderItem={({ item }) => (
            <View style={styles.fila}>
              <Text style={styles.nombre}>
                {item.Nombre} {item.Apellido}
              </Text>
              <Text style={styles.correo}>{item.Correo}</Text>
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
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },
  correo: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
});
