import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { crearOActualizarCliente } from '../db/clienteRepo';

export default function ClientePerfilScreen() {
  const { usuario, cliente, refrescarCliente } = useAuth();
  const [nombre, setNombre] = useState(cliente?.Nombre ?? '');
  const [apellido, setApellido] = useState(cliente?.Apellido ?? '');
  const [correo, setCorreo] = useState(cliente?.Correo ?? '');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setNombre(cliente?.Nombre ?? '');
    setApellido(cliente?.Apellido ?? '');
    setCorreo(cliente?.Correo ?? '');
  }, [cliente]);

  const handleGuardar = async () => {
    if (!usuario) return;

    if (!nombre.trim() || !apellido.trim() || !correo.trim()) {
      Alert.alert('Datos incompletos', 'Completa nombre, apellido y correo.');
      return;
    }

    setGuardando(true);
    try {
      await crearOActualizarCliente(usuario.Id, nombre.trim(), apellido.trim(), correo.trim());
      await refrescarCliente();
      Alert.alert('Perfil actualizado');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo actualizar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Screen title="Mi perfil" current="Perfil">
      <Text style={styles.inputLabel}>Nombre</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

      <Text style={styles.inputLabel}>Apellido</Text>
      <TextInput style={styles.input} value={apellido} onChangeText={setApellido} />

      <Text style={styles.inputLabel}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleGuardar} disabled={guardando}>
        <Text style={styles.buttonText}>{guardando ? 'Guardando...' : 'Guardar cambios'}</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555555',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 55,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: '#ff95ec',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
