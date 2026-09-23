import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import { activarUsuario, listarPendientes } from '../db/authRepo';
import { LoginUser, Rol } from '../types';
import { mostrarAlerta } from '../utils/alerta';

export default function AdminUsuariosScreen() {
  const [pendientes, setPendientes] = useState<LoginUser[]>([]);

  const cargar = useCallback(async () => {
    setPendientes(await listarPendientes());
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const activar = async (id: number, rol: Rol) => {
    try {
      await activarUsuario(id, rol);
      mostrarAlerta(`Rol : ${rol}`);
      cargar();
    } catch (e: any) {
      mostrarAlerta('Error', e?.message ?? 'No se pudo activar la cuenta.');
    }
  };

  return (
    <Screen title="Usuarios pendientes" current="AdminUsuarios">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contenedor}>
          {pendientes.length === 0 ? (
            <View style={styles.vacioCaja}>
              <Text style={styles.vacioTitulo}>No hay usuarios pendientes</Text>
            
            </View>
          ) : (
            <>
              <Text style={styles.total}>
                {pendientes.length}{' '}
                {pendientes.length === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}
              </Text>

              {pendientes.map((item) => (
                <View key={String(item.Id)} style={styles.tarjeta}>
                  <View style={styles.encabezado}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarTexto}>
                        {item.Correo.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <Text style={styles.correo} numberOfLines={1}>
                      {item.Correo}
                    </Text>

                    <View style={styles.badge}>
                      <Text style={styles.badgeTexto}>Pendiente</Text>
                    </View>
                  </View>

                  <View style={styles.botones}>
                    <TouchableOpacity
                      style={styles.botonCliente}
                      onPress={() => activar(item.Id, 'Cliente')}
                    >
                      <Text style={styles.botonTexto}>Activar como Cliente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.botonAdmin}
                      onPress={() => activar(item.Id, 'Admin')}
                    >
                      <Text style={styles.botonTexto}>Activar como Admin</Text>
                    </TouchableOpacity>
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
  // Mismo ancho máximo y centrado que Clientes y Productos
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
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE3FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B4189F',
  },
  correo: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },

  botones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonCliente: {
    flex: 1,
    backgroundColor: '#bb95f9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonAdmin: {
    flex: 1,
    backgroundColor: '#ff95ec',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
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