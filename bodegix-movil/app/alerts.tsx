import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/utils/api';

type Alerta = {
  id: string;
  mensaje: string;
  tipo: 'temperatura' | 'humedad' | 'capacidad';
};

export default function AlertsScreen() {
  const navigation = useNavigation();
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const API_LARAVEL = 'http://10.13.7.193:8000/temperatura/';

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'humedad':
        return <Ionicons name="water" size={24} color="#0c1b3a" style={styles.icon} />;
      case 'temperatura':
        return <Ionicons name="thermometer" size={24} color="#0c1b3a" style={styles.icon} />;
      case 'capacidad':
        return <Ionicons name="cube" size={24} color="#0c1b3a" style={styles.icon} />;
      default:
        return <Ionicons name="notifications" size={24} color="#0c1b3a" style={styles.icon} />;
    }
  };

  const getColor = (tipo: string) => {
    switch (tipo) {
      case 'humedad':
        return '#ffeb99';
      case 'temperatura':
        return '#ffcccb';
      case 'capacidad':
        return '#d1e7dd';
      default:
        return '#ffc285';
    }
  };

  const fetchAlertas = async () => {
    try {
      const userStr = await AsyncStorage.getItem('usuario');
      if (!userStr) return;
      const usuario = JSON.parse(userStr);

      // 1️⃣ Obtener lockers asignados al usuario
      const res = await api.get('/lockers');
      const lockersUsuario = res.data.filter(
        (l: any) => l.usuario_id === usuario.id
      );

      const nuevasAlertas: Alerta[] = [];

      // 2️⃣ Recorrer lockers y comparar datos con sensores
      for (const locker of lockersUsuario) {
        const lockerIdMongo = `LOCKER_${locker.identificador.padStart(3, '0')}`;
        const sensoresRes = await fetch(`${API_LARAVEL}${lockerIdMongo}`);
        const sensoresData = await sensoresRes.json();

        if (Array.isArray(sensoresData) && sensoresData.length > 0) {
          const sensor = sensoresData[0];

          // Comparar temperatura
          if (locker.temp_max && sensor.temperatura > locker.temp_max) {
            nuevasAlertas.push({
              id: `${locker.id}-temp-max`,
              mensaje: `Locker ${locker.identificador}: Temperatura sobre el máximo (${sensor.temperatura}°C)`,
              tipo: 'temperatura'
            });
          }
          if (locker.temp_min && sensor.temperatura < locker.temp_min) {
            nuevasAlertas.push({
              id: `${locker.id}-temp-min`,
              mensaje: `Locker ${locker.identificador}: Temperatura bajo el mínimo (${sensor.temperatura}°C)`,
              tipo: 'temperatura'
            });
          }

          // Comparar humedad
          if (locker.hum_max && sensor.humedad > locker.hum_max) {
            nuevasAlertas.push({
              id: `${locker.id}-hum-max`,
              mensaje: `Locker ${locker.identificador}: Humedad sobre el máximo (${sensor.humedad}%)`,
              tipo: 'humedad'
            });
          }
          if (locker.hum_min && sensor.humedad < locker.hum_min) {
            nuevasAlertas.push({
              id: `${locker.id}-hum-min`,
              mensaje: `Locker ${locker.identificador}: Humedad bajo el mínimo (${sensor.humedad}%)`,
              tipo: 'humedad'
            });
          }

          // Comparar peso
          if (locker.peso_max && sensor.peso && sensor.peso > locker.peso_max) {
            nuevasAlertas.push({
              id: `${locker.id}-peso-max`,
              mensaje: `Locker ${locker.identificador}: Peso excedido (${sensor.peso} kg)`,
              tipo: 'capacidad'
            });
          }
        }
      }

      setAlertas(nuevasAlertas);
    } catch (error) {
      console.error('Error al obtener alertas:', error);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Alertas</Text>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {alertas.length === 0 ? (
          <Text style={{ color: '#fff', textAlign: 'center' }}>
            No hay alertas en este momento.
          </Text>
        ) : (
          alertas.map((alerta) => (
            <View key={alerta.id} style={[styles.alertBox, { backgroundColor: getColor(alerta.tipo) }]}>
              {getIcon(alerta.tipo)}
              <Text style={styles.alertText}>{alerta.mensaje}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c1b3a', paddingTop: 60, paddingHorizontal: 20 },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 1 },
  logo: { width: 120, height: 40, resizeMode: 'contain', marginBottom: 10, alignSelf: 'center' },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  scrollContainer: { paddingBottom: 20 },
  alertBox: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, marginBottom: 15 },
  alertText: { color: '#0c1b3a', fontSize: 16, fontWeight: 'bold', flex: 1, flexWrap: 'wrap' },
  icon: { marginRight: 10 },
});