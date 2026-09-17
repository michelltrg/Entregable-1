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

export default function LoginScreen({ navigation }: any) {
  const { login, cargando } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const correoLimpio = correo.trim();
    const claveLimpia = password.trim();

    if (correoLimpio === '' || claveLimpia === '') {
      Alert.alert('Datos incompletos', 'Ingresa tu correo y tu contraseña.');
      return;
    }

    const resultado = await login(correoLimpio, claveLimpia);
    if (!resultado.ok) {
      Alert.alert('No se pudo iniciar sesión', resultado.mensaje);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar Sesión</Text>

        <Text style={styles.inputLabel}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Contraseña</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={cargando}>
          <Text style={styles.buttonText}>{cargando ? 'Ingresando...' : 'Ingresar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.switchButtonText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>Cuenta admin de prueba: admin@tienda.com / admin123</Text>
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
  loginButton: {
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
  hint: {
    marginTop: 15,
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
});
