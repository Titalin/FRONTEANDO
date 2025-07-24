import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/utils/api';

type Usuario = {
  id: number;
  nombre: string;
  correo: string;
  rol_id: number;
  empresa_id: number;
};

export default function HomeScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [lockersCount, setLockersCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      const token = await AsyncStorage.getItem('token');

      if (usuarioStr && token) {
        const usr: Usuario = JSON.parse(usuarioStr);
        setUsuario(usr);

        // Obtener lockers asignados
        const response = await api.get(`/lockers/usuario/${usr.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLockersCount(response.data.length);
      }
    } catch (error) {
      console.error('Error cargando datos en Home:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffc285" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0c1b3a', '#112447']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>cerrar sesión</Text>
          </TouchableOpacity>

          <Animatable.View animation="pulse" iterationCount="infinite">
            <TouchableOpacity onPress={() => router.push('/alerts')}>
              <Ionicons
                name="notifications"
                size={24}
                color="#ffc285"
                style={styles.bellIcon}
              />
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </View>

      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {usuario?.nombre?.charAt(0).toUpperCase() ?? 'U'}
        </Text>
      </View>

      {/* Welcome */}
      <Text style={styles.welcome}>Bienvenid@</Text>
      <Text style={styles.username}>{usuario?.nombre ?? 'Usuario'}</Text>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/access')}
      >
        <Text style={styles.buttonText}>Código de acceso</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/locker')}
      >
        <Text style={styles.buttonText}>Lockers Asignados</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  logoutText: { color: '#ffc285', marginRight: 10, fontWeight: 'bold' },
  bellIcon: { marginTop: 2 },
  logo: { width: 120, height: 40, resizeMode: 'contain' },
  avatar: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#ffc285',
    alignSelf: 'center', justifyContent: 'center', alignItems: 'center',
    marginTop: 40, marginBottom: 10,
  },
  avatarText: { color: '#0c1b3a', fontSize: 30, fontWeight: 'bold' },
  welcome: { color: '#fff', fontSize: 24, textAlign: 'center' },
  username: { color: '#ffc285', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  card: {
    backgroundColor: '#112447', borderRadius: 10, padding: 20,
    marginBottom: 30, alignItems: 'center',
  },
  cardText: { color: '#fff', fontSize: 16 },
  button: {
    backgroundColor: '#ffc285', paddingVertical: 14, borderRadius: 10,
    marginBottom: 20, alignItems: 'center',
  },
  buttonText: { color: '#0c1b3a', fontSize: 16, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0c1b3a' },
});
