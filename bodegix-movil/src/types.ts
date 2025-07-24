export type RootStackParamList = {
  Lockers: undefined;       // 👈 nombre correcto, coincide con tu pantalla
  LockerDetalle: { lockerId: number };
  Access: { lockerId: number };
  // otras pantallas...
};
