import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CompletarPerfilScreen from '../screens/CompletarPerfilScreen';
import HomeScreen from '../screens/HomeScreen';
import ClientePerfilScreen from '../screens/ClientePerfilScreen';
import AdminUsuariosScreen from '../screens/AdminUsuariosScreen';
import ClientesScreen from '../screens/ClientesScreen';
import ProductosScreen from '../screens/ProductosScreen';
import CompraScreen from '../screens/CompraScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { usuario, cliente } = useAuth();

  // Sin sesión: solo Login / Registro (HU-01, HU-03).
  if (!usuario) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  // Cliente activo sin datos personales todavía: se fuerza a completarlos.
  if (usuario.Rol === 'Cliente' && !cliente) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CompletarPerfil" component={CompletarPerfilScreen} />
      </Stack.Navigator>
    );
  }

  // Sesión activa: los módulos visibles dependen del rol (ver AppMenu).
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Perfil" component={ClientePerfilScreen} />
      <Stack.Screen name="Compra" component={CompraScreen} />
      <Stack.Screen name="AdminUsuarios" component={AdminUsuariosScreen} />
      <Stack.Screen name="Clientes" component={ClientesScreen} />
      <Stack.Screen name="Productos" component={ProductosScreen} />
    </Stack.Navigator>
  );
}
