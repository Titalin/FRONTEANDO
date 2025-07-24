// src/navigation.ts

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

/**
 * 🚀 Tipado global de rutas
 */
export type RootStackParamList = {
  Home: undefined;
  Locker: undefined;
  Access: { lockerId: number };
  Alerts: undefined;
  Login: undefined;
  LockerDetalle: { lockerId: number }; // ✅ AGREGAR ESTA LÍNEA
};

/**
 * 🚀 Tipos de navegación por pantalla
 */
export type LockerNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Locker'>;
export type AccessNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Access'>;
