import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import { listarClientes } from '../db/clienteRepo';
import { Cliente } from '../types';

// Iniciales para el avatar: "Michell Trujillo" -> "MT"
function iniciales(nombre: string, apellido: string): string {
  const a = nombre?.trim().charAt(0) ?? '';
  const b = apellido?.trim().charAt(0) ?? '';
  return (a + b).toUpperCase();
}

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useFocusEffect(
    useCallback(() => {
      listarClientes().then(setClientes);
    }, [])
  );

  return (
    <Screen title="Clientes registrados" current="Clientes">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contenedor}>
          {clientes.length === 0 ? (
            <View style={styles.vacioCaja}>
              <Text style={styles.vacioTitulo}>Aún no hay clientes</Text>
              <Text style={styles.vacioTexto}>
                Aparecerán aquí cuando un usuario con rol Cliente complete su perfil.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.total}>
                {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'}
              </Text>

              {clientes.map((item) => (
                <View key={String(item.Id)} style={styles.tarjeta}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarTexto}>
                      {iniciales(item.Nombre, item.Apellido)}
                    </Text>
                  </View>

                  <View style={styles.datos}>
                    <Text style={styles.nombre}>
                      {item.Nombre} {item.Apellido}
                    </Text>
                    <Text style={styles.correo}>{item.Correo}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
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
  // Mismo ancho máximo y centrado que ProductosScreen
  contenedor: {
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center',
    paddingHorizontal: 10,
  },
  total: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 12,
  },

  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBF1F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE3FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B4189F',
  },
  datos: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
  },
  correo: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },

  vacioCaja: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EBF1F6',
    alignItems: 'center',
  },
  vacioTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 6,
  },
  vacioTexto: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
  },
});