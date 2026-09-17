import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { initDatabase } from './src/db/database';

export default function App() {
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initDatabase()
      .then(() => setListo(true))
      .catch((e) => setError(e?.message ?? 'Error inicializando la base de datos.'));
  }, []);

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>No se pudo iniciar la base de datos.</Text>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!listo) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#ff95ec" />
        <Text style={styles.cargando}>Preparando la base de datos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4F8',
    padding: 20,
  },
  cargando: {
    marginTop: 12,
    color: '#666666',
  },
  error: {
    color: '#b90d2a',
    textAlign: 'center',
    marginBottom: 6,
  },
});
