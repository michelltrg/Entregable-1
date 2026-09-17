import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { crearOActualizarCliente } from '../db/clienteRepo';

/**
 * HU-03: "Si es primer ingreso con perfil cliente, debe llenar los datos
 * personales." El RootNavigator solo muestra esta pantalla cuando el
 * usuario logueado tiene rol Cliente y aún no tiene fila en Cliente.
 */
export default function CompletarPerfilScreen() {
  const { usuario, refrescarCliente, logout } = useAuth();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState(usuario?.Correo ?? '');
  const [guardando, setGuardando] = useState(false);

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
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo guardar tu información.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Completa tus datos</Text>
        <Text style={styles.subtitle}>
          Antes de continuar necesitamos tu información personal.
        </Text>

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
          <Text style={styles.buttonText}>{guardando ? 'Guardando...' : 'Guardar y continuar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={logout}>
          <Text style={styles.linkText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    width: '100%',
    textAlign: 'left',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555555',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    width: '100%',
    height: 55,
    backgroundColor: '#F9F9F9',
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
  link: {
    marginTop: 16,
    padding: 10,
  },
  linkText: {
    color: '#b90d2a',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
