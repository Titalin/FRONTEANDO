import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AlertsScreen() {
  const navigation = useNavigation();

  // 🔹 Podrás reemplazar este array con tu API de eventos/alertas
  const alertas = [
    { id: 1, mensaje: 'Locker 3: Humedad alta', tipo: 'humedad' },
    { id: 2, mensaje: 'Locker 7: Temperatura elevada', tipo: 'temperatura' },
    { id: 3, mensaje: 'Locker 5: Capacidad al 95%', tipo: 'capacidad' },
    { id: 4, mensaje: 'Locker 2: Estado inactivo', tipo: 'estado' },
  ];

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'humedad':
        return <Ionicons name="water" size={24} color="#0c1b3a" style={styles.icon} />;
      case 'temperatura':
        return <Ionicons name="thermometer" size={24} color="#0c1b3a" style={styles.icon} />;
      case 'capacidad':
        return <Ionicons name="cube" size={24} color="#0c1b3a" style={styles.icon} />;
      case 'estado':
        return <Ionicons name="alert-circle" size={24} color="#0c1b3a" style={styles.icon} />;
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
      case 'estado':
        return '#f8d7da';
      default:
        return '#ffc285';
    }
  };

  return (
    <View style={styles.container}>
      {/* Flecha de regreso */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Logo */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      {/* Título */}
      <Text style={styles.title}>Alertas</Text>

      {/* Alertas */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {alertas.map((alerta) => (
          <View key={alerta.id} style={[styles.alertBox, { backgroundColor: getColor(alerta.tipo) }]}>
            {getIcon(alerta.tipo)}
            <Text style={styles.alertText}>{alerta.mensaje}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1b3a',
    paddingTop: 60,
    paddingHorizontal: 20,
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
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  alertText: {
    color: '#0c1b3a',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    flexWrap: 'wrap',
  },
  icon: {
    marginRight: 10,
  },
});
