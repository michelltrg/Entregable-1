import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { crearOActualizarCliente } from '../db/clienteRepo';
import { mostrarAlerta } from '../utils/alerta';

// Iniciales para el avatar: "Michell Trujillo" -> "MT"
function iniciales(nombre: string, apellido: string, respaldo: string): string {
  const a = nombre.trim().charAt(0);
  const b = apellido.trim().charAt(0);
  const texto = (a + b).toUpperCase();
  return texto || respaldo.trim().charAt(0).toUpperCase();
}

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
      mostrarAlerta('Datos incompletos');
      return;
    }

    setGuardando(true);
    try {
      await crearOActualizarCliente(usuario.Id, nombre.trim(), apellido.trim(), correo.trim());
      await refrescarCliente();
      mostrarAlerta('Perfil actualizado');
    } catch (e: any) {
      mostrarAlerta('Error', e?.message ?? 'No se pudo actualizar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  const nombreCompleto = `${nombre} ${apellido}`.trim();

  return (
    <Screen title="Mi perfil" current="Perfil">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contenedor}>
          <View style={styles.tarjeta}>
            {/* Cabecera con avatar */}
            <View style={styles.cabecera}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>{iniciales(nombre, apellido, correo)}</Text>
              </View>
              <Text style={styles.nombreCompleto}>
                {nombreCompleto || 'Completa tu perfil'}
              </Text>
              {!!correo && <Text style={styles.correoCabecera}>{correo}</Text>}
            </View>

            {/* Formulario */}
            <View style={styles.filaDosColumnas}>
              <View style={styles.columna}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Tu nombre"
                />
              </View>
              <View style={styles.columna}>
                <Text style={styles.label}>Apellido</Text>
                <TextInput
                  style={styles.input}
                  value={apellido}
                  onChangeText={setApellido}
                  placeholder="Tu apellido"
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
              style={[styles.boton, guardando && styles.botonDeshabilitado]}
              onPress={handleGuardar}
              disabled={guardando}
            >
              <Text style={styles.botonTexto}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingVertical: 10,
    paddingBottom: 60,
  },
  // Más angosto que las listas: un formulario se lee mejor así
  contenedor: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 10,
  },

  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EBF1F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cabecera: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFE3FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarTexto: {
    fontSize: 26,
    fontWeight: '700',
    color: '#B4189F',
  },
  nombreCompleto: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
  },
  correoCabecera: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
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

  boton: {
    backgroundColor: '#ff80ed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});