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
import { findByCorreo, registrarUsuario } from '../db/authRepo';
import { mostrarAlerta } from '../utils/alerta';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esPasswordSegura(password: string): boolean {
  return password.length >= 6 && /[0-9]/.test(password) && /[A-Za-z]/.test(password);
}

export default function RegisterScreen({ navigation }: any) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleRegister = async () => {
    const correoLimpio = correo.trim().toLowerCase();
    const claveLimpia = password.trim();

    if (!EMAIL_REGEX.test(correoLimpio)) {
      mostrarAlerta('Correo inválido');
      return;
    }
    if (!esPasswordSegura(claveLimpia)) {
      mostrarAlerta(
        'Contraseña insegura');
      return;
    }
    if (claveLimpia !== confirmar.trim()) {
      mostrarAlerta('Las contraseñas no coinciden');
      return;
    }

    setEnviando(true);
    try {
      const existente = await findByCorreo(correoLimpio);
      if (existente) {
        mostrarAlerta('Correo ya existente');
        return;
      }

      await registrarUsuario(correoLimpio, claveLimpia);
      mostrarAlerta(
        'Registro exitoso',
        'Tu cuenta quedó en estado Pendiente por aprovacion',
        () => navigation.navigate('Login')
);
    } catch (e: any) {
      mostrarAlerta('Error', e?.message ?? 'No se pudo completar el registro.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Crear cuenta</Text>


          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={[styles.input, styles.inputConAyuda]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            value={confirmar}
            onChangeText={setConfirmar}
            secureTextEntry
            onSubmitEditing={handleRegister}
          />

          <TouchableOpacity
            style={[styles.button, enviando && styles.buttonOff]}
            onPress={handleRegister}
            disabled={enviando}
          >
            <Text style={styles.buttonText}>{enviando ? 'Enviando...' : 'Registrarme'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Inicia sesión</Text>
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
    fontSize: 26,
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
  inputConAyuda: {
    marginBottom: 6,
  },
  ayuda: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 16,
    marginLeft: 2,
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