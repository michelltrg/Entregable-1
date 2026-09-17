import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AppMenu from './AppMenu';

interface Props {
  title: string;
  current: string;
  children: React.ReactNode;
}

/**
 * Envoltura común usada por todas las pantallas autenticadas para que el
 * menú, el título y el padding sean consistentes en toda la aplicación
 * (requisito: "Menú en todas las pantallas").
 */
export default function Screen({ title, current, children }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <AppMenu current={current} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 14,
  },
});
