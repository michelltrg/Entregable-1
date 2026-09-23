import { Alert, Platform } from 'react-native';

export function mostrarAlerta(
  titulo: string,
  mensaje?: string,
  onAceptar?: () => void
): void {
  if (Platform.OS === 'web') {
    window.alert(mensaje ? `${titulo}\n\n${mensaje}` : titulo);
    onAceptar?.();
  } else {
    Alert.alert(titulo, mensaje, [{ text: 'Entendido', onPress: onAceptar }]);
  }
}