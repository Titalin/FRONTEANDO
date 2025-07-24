import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/utils/api';

type AccessScreenProp = NativeStackNavigationProp<RootStackParamList, 'Access'>;

export default function Access() {
  const navigation = useNavigation<AccessScreenProp>();
  const route = useRoute();
  const { lockerId } = route.params as { lockerId: number };

  const [qrValue, setQrValue] = useState(`BODEGIX-LOCKER-${lockerId}-${Date.now()}`);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const progress = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  // Registrar acceso automáticamente
  const registrarAcceso = async () => {
    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      const token = await AsyncStorage.getItem('token');

      if (usuarioStr && token) {
        const usuario = JSON.parse(usuarioStr);

        await api.post(
          '/accesos',
          {
            usuario_id: usuario.id,
            fecha: new Date(),
            accion: `Generó código de apertura para Locker #${lockerId}`,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Error al registrar acceso:', error);
    }
  };

  useEffect(() => {
    registrarAcceso();

    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 2,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['#f5a623', '#00bfff', '#32cd32'],
  });

  useEffect(() => {
    setSecondsLeft(15);
    progress.setValue(1);
    Animated.timing(progress, {
      toValue: 0,
      duration: 15000,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [qrValue]);

  const handleRegenerate = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setQrValue(`BODEGIX-LOCKER-${lockerId}-${Date.now()}`);
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Acceso</Text>

      <View style={styles.qrSection}>
        <Text style={styles.instruction}>Muestra este código para abrir tu locker #{lockerId}</Text>

        <Animated.View style={[styles.qrBackgroundSquare, { backgroundColor }]}>
          <Animated.View style={[styles.qrContainer, { opacity: fadeAnim }]}>
            <QRCode value={qrValue} size={200} />
          </Animated.View>
        </Animated.View>

        <View style={styles.vigenciaContainer}>
          <Text style={styles.vigenciaText}>vigencia: {secondsLeft}s</Text>
          <View style={styles.progressBarBackground}>
            <Animated.View style={[styles.progressBarFill, { flex: progress }]} />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegenerate}>
          <Icon name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Volver a generar código</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#112447',
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
    width: 140,
    height: 40,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#f5a623',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  qrSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 30,
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  qrBackgroundSquare: {
    width: 260,
    height: 260,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  vigenciaContainer: {
    borderWidth: 1,
    borderColor: '#f5a623',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  vigenciaText: {
    color: '#fff',
    fontSize: 16,
  },
  progressBarBackground: {
    height: 8,
    width: 200,
    backgroundColor: '#ccc',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 5,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#f5a623',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f5a623',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
