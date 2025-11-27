// src/screens/ScanQRScreen.js
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { subscribeToDevice } from '../api/devices';

export default function ScanQRScreen({ token, navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    setShowScanner(false);
    await handleSubscribe(data, false);
  };

  const handleManualConnect = async () => {
    if (!manualCode.trim()) {
      setErrorMessage('Ingresa un ID válido.');
      return;
    }
    await handleSubscribe(manualCode, true);
  };

  const handleSubscribe = async (deviceCode, isManual) => {
    setLoading(true);
    if (isManual) {
        setErrorMessage(null);
        setSuccessMessage(null);
    }

    try {
      await subscribeToDevice(token, deviceCode.trim());
      
      if (isManual) {
          setSuccessMessage('¡Dispositivo encontrado y vinculado!');
          setManualCode('');
      } else {
          Alert.alert('Éxito', `Dispositivo ${deviceCode} vinculado correctamente.`);
      }

    } catch (e) {
      if (isManual) {
          setErrorMessage(e.message || 'Error al conectar');
      } else {
          Alert.alert('Error', e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        {/* Header Centrado */}
        <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.openDrawer()}>
                <Ionicons name="menu" size={26} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>Scan QR</Text>
                <Text style={styles.headerSubtitle}>Vincular nuevo dispositivo</Text>
            </View>
            <View style={styles.headerRightDummy} />
        </View>

      <View style={styles.scannerBox}>
        {showScanner && hasPermission ? (
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <View style={styles.placeholderBox}>
            <Ionicons name="qr-code-outline" size={64} color="#444444" />
            <Text style={styles.placeholderText}>Alinear código QR</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.openCameraButton}
        onPress={() => setShowScanner(true)}
      >
        <Ionicons name="camera-outline" size={18} color="#000000" />
        <Text style={styles.openCameraText}>Abrir Cámara</Text>
      </TouchableOpacity>

      <View style={styles.manualBox}>
        <Text style={styles.manualTitle}>Configuración Manual</Text>
        <Text style={styles.manualSubtitle}>Ingresa el ID de Lucía manualmente</Text>

        <TextInput
          style={[
              styles.manualInput, 
              errorMessage && styles.inputError,
              successMessage && styles.inputSuccess
          ]}
          placeholder="CAM-XXXX-XXXX"
          placeholderTextColor="#777777"
          autoCapitalize="none"
          value={manualCode}
          onChangeText={(text) => {
              setManualCode(text);
              if (errorMessage) setErrorMessage(null);
              if (successMessage) setSuccessMessage(null);
          }}
        />

        <TouchableOpacity
          style={styles.connectButton}
          onPress={handleManualConnect}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.connectText}>Conectar Cámara</Text>
          )}
        </TouchableOpacity>

        {/* --- MENSAJES DE ESTADO --- */}
        
        {/* Caso Error */}
        {errorMessage && (
            <View style={styles.messageContainer}>
                <Ionicons name="alert-circle" size={16} color="#ff4d4f" />
                <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
        )}

        {/* Caso Éxito */}
        {successMessage && (
            <View style={styles.messageContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                <Text style={styles.successText}>{successMessage}</Text>
            </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRightDummy: {
    width: 40,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  scannerBox: {
    height: 260,
    borderRadius: 20,
    backgroundColor: '#000000',
    overflow: 'hidden',
    marginBottom: 16,
  },
  placeholderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#666666',
    marginTop: 8,
  },
  openCameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 24,
  },
  openCameraText: {
    color: '#000000',
    marginLeft: 8,
    fontWeight: '600',
  },
  manualBox: {
    backgroundColor: '#181818',
    borderRadius: 20,
    padding: 16,
  },
  manualTitle: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  manualSubtitle: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 16,
  },
  manualInput: {
    backgroundColor: '#111111',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    marginBottom: 16,
  },
  inputError: {
    borderColor: '#ff4d4f',
  },
  inputSuccess: {
    borderColor: '#4caf50',
  },
  connectButton: {
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  connectText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  messageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      paddingHorizontal: 8
  },
  errorText: {
      color: '#ff4d4f',
      fontSize: 14,
      marginLeft: 6,
      fontWeight: '500'
  },
  successText: {
      color: '#4caf50',
      fontSize: 14,
      marginLeft: 6,
      fontWeight: '500'
  }
});