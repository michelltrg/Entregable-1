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
import { findByCorreo, registrarUsuario } from '../db/authRepo';

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
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico con un formato válido.');
      return;
    }
    if (!esPasswordSegura(claveLimpia)) {
      Alert.alert(
        'Contraseña insegura',
        'La contraseña debe tener al menos 6 caracteres e incluir letras y números.'
      );
      return;
    }
    if (claveLimpia !== confirmar.trim()) {
      Alert.alert('Las contraseñas no coinciden');
      return;
    }

    setEnviando(true);
    try {
      const existente = await findByCorreo(correoLimpio);
      if (existente) {
        Alert.alert('Correo ya registrado', 'Ya existe una cuenta con este correo electrónico.');
        return;
      }

      await registrarUsuario(correoLimpio, claveLimpia);
      Alert.alert(
        'Registro exitoso',
        'Tu cuenta quedó en estado "Pendiente". Un administrador debe aprobarla antes de que puedas ingresar.',
        [{ text: 'Entendido', onPress: () => navigation.navigate('Login') }]
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo completar el registro.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Crear Cuenta</Text>

        <Text style={styles.inputLabel}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Contraseña</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

        <Text style={styles.inputLabel}>Confirmar contraseña</Text>
        <TextInput style={styles.input} value={confirmar} onChangeText={setConfirmar} secureTextEntry />

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={enviando}>
          <Text style={styles.buttonText}>{enviando ? 'Enviando...' : 'Registrarme'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.switchButtonText}>Inicia sesión</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
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
  registerButton: {
    width: '100%',
    height: 55,
    backgroundColor: '#ff95ec',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
  },
  switchButtonText: {
    color: '#b90d2a',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
