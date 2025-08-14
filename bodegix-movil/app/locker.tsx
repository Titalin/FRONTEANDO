import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LockerNavigationProp } from '../src/navigation';

// ⚠️ Ajusta esta URL según tu entorno:
// - Dispositivo físico: http://<IP-de-tu-PC>:5000
// - Emulador Android (AVD): http://10.0.2.2:5000
// - iOS Simulator (misma Mac): http://localhost:5000
const API_BASE = 'http://192.168.1.148:5000';

type Locker = {
  id: number;
  identificador: string;   // "001", "002", etc.
  ubicacion: string;
  tipo: string;
  estado: string;
  usuario_id?: number | null;
  sensores?: {
    temperatura: number;
    humedad: number;
    peso?: number | null;
    fecha: string;
  } | null;
};

export default function LockerScreen() {
  const navigation = useNavigation<LockerNavigationProp>();
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [currentLocker, setCurrentLocker] = useState<Locker | null>(null);
  const [loading, setLoading] = useState(true);

  // Animación del marco
  const colorAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: false }),
        Animated.timing(colorAnim, { toValue: 2, duration: 4000, easing: Easing.linear, useNativeDriver: false }),
        Animated.timing(colorAnim, { toValue: 0, duration: 4000, easing: Easing.linear, useNativeDriver: false }),
      ])
    ).start();
  }, []);
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['#f5a623', '#00bfff', '#32cd32'],
  });

  // Carga lockers + sensores en UNA SOLA LLAMADA
  const fetchLockers = async () => {
    setLoading(true);
    const controller = new AbortController();
    try {
      const userStr = await AsyncStorage.getItem('usuario');
      if (!userStr) {
        setLockers([]);
        setCurrentLocker(null);
        return;
      }

      const usuario = JSON.parse(userStr);
      const userId: number = Number(usuario?.id);
      if (!userId) {
        console.warn('usuario.id no válido en AsyncStorage:', usuario);
        setLockers([]);
        setCurrentLocker(null);
        return;
      }

      const url = `${API_BASE}/api/lockers-with-sensors?user_id=${userId}`;
      const resp = await fetch(url, { signal: controller.signal });

      console.log('GET', url, 'status', resp.status);
      if (!resp.ok) {
        const msg = await resp.text().catch(() => '');
        throw new Error(`Backend no OK (${resp.status}) ${msg}`);
      }

      const data: Locker[] = await resp.json();
      // Asegurar propiedad sensores siempre presente
      const safeData = data.map(l => ({ ...l, sensores: l.sensores ?? null }));

      setLockers(safeData);
      setCurrentLocker(safeData[0] ?? null);
      console.log('lockers count:', safeData.length);
      if (safeData[0]?.sensores) {
        console.log('primer locker sensores:', safeData[0].sensores);
      }
    } catch (err) {
      console.error('Error al obtener lockers+sensores:', err);
      setLockers([]);
      setCurrentLocker(null);
    } finally {
      setLoading(false);
      controller.abort();
    }
  };

  useEffect(() => {
    fetchLockers();
  }, []);

  const otherLockers = lockers.filter(l => l.id !== currentLocker?.id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Locker</Text>

      {loading ? (
        <Text style={{ color: '#fff', marginTop: 30 }}>Cargando lockers...</Text>
      ) : lockers.length === 0 ? (
        <Text style={{ color: '#fff', fontSize: 18, marginTop: 40 }}>
          No tienes lockers asignados aún.
        </Text>
      ) : currentLocker ? (
        <Animated.View style={[styles.panelBackground, { backgroundColor }]}>
          <Text style={styles.summary}>Locker {currentLocker.identificador}</Text>
          <View style={styles.panel}>
            <View style={styles.lockerNumber}>
              <Text style={styles.lockerNumberText}>{currentLocker.identificador}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="location" size={20} color="#0c1b3a" style={{ marginRight: 8 }} />
              <Text style={styles.infoText}>Ubicación: {currentLocker.ubicacion}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="cube" size={20} color="#0c1b3a" style={{ marginRight: 8 }} />
              <Text style={styles.infoText}>Tipo: {currentLocker.tipo}</Text>
            </View>

            {currentLocker.estado === 'activo' && currentLocker.sensores ? (
              <>
                <View style={styles.infoRow}>
                  <Icon name="water" size={20} color="#0c1b3a" style={{ marginRight: 8 }} />
                  <Text style={styles.infoText}>
                    Humedad: {currentLocker.sensores.humedad}%
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="thermometer" size={20} color="#0c1b3a" style={{ marginRight: 8 }} />
                  <Text style={styles.infoText}>
                    Temperatura: {currentLocker.sensores.temperatura}°C
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="scale" size={20} color="#0c1b3a" style={{ marginRight: 8 }} />
                  <Text style={styles.infoText}>
                    Peso:{' '}
                    {currentLocker.sensores.peso !== null && currentLocker.sensores.peso !== undefined
                      ? `${currentLocker.sensores.peso} kg`
                      : 'N/A'}
                  </Text>
                </View>
              </>
            ) : currentLocker.estado === 'activo' ? (
              <Text style={styles.infoText}>Sin datos de sensores</Text>
            ) : null}

            <View style={styles.infoRow}>
              <Icon
                name={currentLocker.estado === 'activo' ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={currentLocker.estado === 'activo' ? 'green' : 'red'}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.infoText}>
                Estado: {currentLocker.estado === 'activo' ? 'Activo' : 'Inactivo'}
              </Text>
            </View>

            {currentLocker.estado === 'activo' && (
              <TouchableOpacity style={styles.actionButton} onPress={fetchLockers}>
                <Text style={styles.actionButtonText}>Recargar Datos</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      ) : null}

      {lockers.length > 1 && (
        <>
          <Text style={styles.subtitle}>Otros Lockers Disponibles:</Text>
          <View style={styles.lockersList}>
            {otherLockers.map(locker => (
              <TouchableOpacity
                key={locker.id}
                style={styles.lockerButton}
                onPress={() => setCurrentLocker(locker)}
              >
                <Text style={styles.lockerButtonText}>{locker.identificador}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0c1b3a',
    padding: 20,
    alignItems: 'center',
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  panelBackground: {
    width: '100%',
    borderRadius: 20,
    padding: 5,
    marginBottom: 30,
  },
  summary: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  panel: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  lockerNumber: {
    backgroundColor: '#ffc285',
    borderRadius: 50,
    paddingHorizontal: 25,
    paddingVertical: 10,
    marginBottom: 20,
  },
  lockerNumberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0c1b3a',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 18,
    color: '#0c1b3a',
  },
  actionButton: {
    marginTop: 20,
    backgroundColor: '#0c1b3a',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  lockersList: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  lockerButton: {
    backgroundColor: '#ffc285',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    margin: 5,
  },
  lockerButtonText: {
    color: '#0c1b3a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
