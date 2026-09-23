import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { usuario, cliente } = useAuth();
  const nombreVisible = cliente ? cliente.Nombre : usuario?.Correo;

  return (
    <Screen title="Inicio" current="Home">
      <Text style={styles.texto}>Correo: {nombreVisible} </Text>
      <Text style={styles.texto}>Rol: {usuario?.Rol}</Text>

      {usuario?.Rol === 'Cliente' && (
        <Text style={styles.ayuda}>
          Bienvenidos
        </Text>
      )}

      {usuario?.Rol === 'Admin' && (
        <Text style={styles.ayuda}>
          Bienvenido
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  texto: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 6,
  },
  ayuda: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
  },
});
