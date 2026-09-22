import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { crearOActualizarCliente } from '../db/clienteRepo';
import { mostrarAlerta } from '../utils/alerta';

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
      mostrarAlerta('Datos incompletos');
      return;
    }

    setGuardando(true);
    try {
      await crearOActualizarCliente(usuario.Id, nombre.trim(), apellido.trim(), correo.trim());
      await refrescarCliente();
    } catch (e: any) {
      mostrarAlerta('Error', e?.message ?? 'No se pudo guardar tu información.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Completa tus datos</Text>

          <View style={styles.filaDosColumnas}>
            <View style={styles.columna}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
              />
            </View>
            <View style={styles.columna}>
              <Text style={styles.label}>Apellido</Text>
              <TextInput
                style={styles.input}
                value={apellido}
                onChangeText={setApellido}
              />
            </View>
          </View>

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, guardando && styles.buttonOff]}
            onPress={handleGuardar}
            disabled={guardando}
          >
            <Text style={styles.buttonText}>
              {guardando ? 'Guardando...' : 'Guardar y continuar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={logout}>
            <Text style={styles.linkText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#EBF1F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  filaDosColumnas: {
    flexDirection: 'row',
    gap: 12,
  },
  columna: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 5,
  },
  input: {
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 15,
    color: '#2D3748',
  },
  button: {
    height: 50,
    backgroundColor: '#ff80ed',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonOff: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  link: {
    alignSelf: 'center',
    marginTop: 18,
    padding: 6,
  },
  linkText: {
    color: '#b90d2a',
    fontSize: 14,
    fontWeight: '700',
  },
});