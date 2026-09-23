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
import { mostrarAlerta } from '../utils/alerta';

export default function LoginScreen({ navigation }: any) {
  const { login, cargando } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const correoLimpio = correo.trim();
    const claveLimpia = password.trim();

    if (correoLimpio === '' || claveLimpia === '') {
      mostrarAlerta('Datos incompletos', 'Ingresa tu correo y tu contraseña.');
      return;
    }

    const resultado = await login(correoLimpio, claveLimpia);
    if (!resultado.ok) {
      mostrarAlerta('No se pudo iniciar sesión', resultado.mensaje);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Iniciar sesión</Text>

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
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[styles.button, cargando && styles.buttonOff]}
            onPress={handleLogin}
            disabled={cargando}
          >
            <Text style={styles.buttonText}>{cargando ? 'Ingresando...' : 'Ingresar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Regístrate</Text>
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
    backgroundColor: '#ffffff',
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
  hintBox: {
    backgroundColor: '#FFF5FD',
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
  },
  hint: {
    fontSize: 12,
    color: '#8A4B84',
    textAlign: 'center',
  },
});