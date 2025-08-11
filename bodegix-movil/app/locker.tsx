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
import api from '../src/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LockerNavigationProp } from '../src/navigation';

type Locker = {
  id: number;
  identificador: string;
  ubicacion: string;
  tipo: string;
  estado: string;
  usuario_id?: number | null;
  sensores?: {
    temperatura: number;
    humedad: number;
    peso?: number | null; // ✅ Campo agregado
    fecha: string;
  } | null;
};

export default function LockerScreen() {
  const navigation = useNavigation<LockerNavigationProp>();
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [currentLocker, setCurrentLocker] = useState<Locker | null>(null);
  const colorAnim = useRef(new Animated.Value(0)).current;
  const API_LARAVEL = 'http://192.168.1.135:8000/temperatura/';
  const [loading, setLoading] = useState(true);

  const fetchLockers = async () => {
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('usuario');
      if (!userStr) {
        setLockers([]);
        setCurrentLocker(null);
        setLoading(false);
        return;
      }
      const usuario = JSON.parse(userStr);
      const userId = usuario.id;

      const res = await api.get('/lockers');
      const lockersDelUsuario = res.data.filter(
        (locker: Locker) => locker.usuario_id === userId
      );

      if (lockersDelUsuario.length === 0) {
        setLockers([]);
        setCurrentLocker(null);
        setLoading(false);
        return;
      }

      const lockersWithSensores = await Promise.all(
        lockersDelUsuario.map(async (locker: Locker) => {
          const lockerIdMongo = `LOCKER_${locker.identificador.padStart(3, '0')}`;
          if (locker.estado === 'activo') {
            try {
              const sensoresRes = await fetch(`${API_LARAVEL}${lockerIdMongo}`);
              const sensoresData = await sensoresRes.json();
              const sensor =
                Array.isArray(sensoresData) && sensoresData.length > 0
                  ? sensoresData[0]
                  : null;
              return {
                ...locker,
                sensores: sensor
                  ? {
                      temperatura: sensor.temperatura,
                      humedad: sensor.humedad,
                      peso: sensor.peso ?? null, // ✅ Nuevo campo
                      fecha: sensor.timestamp || '',
                    }
                  : null,
              };
            } catch {
              return { ...locker, sensores: null };
            }
          }
          return { ...locker, sensores: null };
        })
      );
      setLockers(lockersWithSensores);
      setCurrentLocker(lockersWithSensores[0]);
    } catch (err) {
      console.error('Error al obtener lockers:', err);
      setLockers([]);
      setCurrentLocker(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLockers();
  }, []);

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
                  <Text style={styles.infoText}>Humedad: {currentLocker.sensores.humedad}%</Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="thermometer" size={20} color="#0c1b3a" style={{ marginRight: 8 }} />
                  <Text style={styles.infoText}>Temperatura: {currentLocker.sensores.temperatura}°C</Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="scale" size={20} color="#0c1b3a" style={{ marginRight: 8 }} />
                  <Text style={styles.infoText}>
                    Peso: {currentLocker.sensores.peso !== null ? `${currentLocker.sensores.peso} kg` : 'N/A'}
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
              <TouchableOpacity
                style={styles.actionButton}
                onPress={fetchLockers}
              >
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
