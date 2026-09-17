import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

interface Opcion {
  key: string;
  label: string;
}

export default function AppMenu({ current }: { current: string }) {
  const navigation = useNavigation<any>();
  const { usuario, logout } = useAuth();

  if (!usuario) return null;

  const opciones: Opcion[] = [{ key: 'Home', label: 'Inicio' }];

  if (usuario.Rol === 'Cliente') {
    opciones.push({ key: 'Perfil', label: 'Mi perfil' });
    opciones.push({ key: 'Compra', label: 'Comprar' });
  }

  if (usuario.Rol === 'Admin') {
    opciones.push({ key: 'AdminUsuarios', label: 'Usuarios' });
    opciones.push({ key: 'Clientes', label: 'Clientes' });
    opciones.push({ key: 'Productos', label: 'Productos' });
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {opciones.map((op) => (
          <TouchableOpacity
            key={op.key}
            style={[styles.item, current === op.key && styles.itemActivo]}
            onPress={() => navigation.navigate(op.key)}
          >
            <Text style={[styles.itemTexto, current === op.key && styles.itemTextoActivo]}>
              {op.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={styles.logoutTexto}>Salir</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F0F4F8',
  },
  itemActivo: {
    backgroundColor: '#ff95ec',
  },
  itemTexto: {
    color: '#555555',
    fontWeight: '600',
    fontSize: 13,
  },
  itemTextoActivo: {
    color: '#FFFFFF',
  },
  logout: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fdecec',
  },
  logoutTexto: {
    color: '#b90d2a',
    fontWeight: '700',
    fontSize: 13,
  },
});
