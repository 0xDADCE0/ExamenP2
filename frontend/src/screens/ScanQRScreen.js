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

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    setShowScanner(false);
    await handleSubscribe(data);
  };

  const handleSubscribe = async (deviceCode) => {
    setLoading(true);
    try {
      await subscribeToDevice(token, deviceCode.trim());
      Alert.alert('Device connected', `Device ${deviceCode} subscribed successfully.`);
      setManualCode('');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualConnect = async () => {
    if (!manualCode.trim()) {
      Alert.alert('Missing ID', 'Enter Lucía ID manually.');
      return;
    }
    await handleSubscribe(manualCode);
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={26} color="#ffffff" />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Scan QR</Text>
            <Text style={styles.headerSubtitle}>Scan QR code to pair this device</Text>
        </View>
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
            <Text style={styles.placeholderText}>Align QR code</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.openCameraButton}
        onPress={() => setShowScanner(true)}
      >
        <Ionicons name="camera-outline" size={18} color="#000000" />
        <Text style={styles.openCameraText}>Open Camera</Text>
      </TouchableOpacity>

      <View style={styles.manualBox}>
        <Text style={styles.manualTitle}>Manual Setup</Text>
        <Text style={styles.manualSubtitle}>Enter Lucía ID manually</Text>

        <TextInput
          style={styles.manualInput}
          placeholder="CAM-XXXX-XXXX"
          placeholderTextColor="#777777"
          autoCapitalize="none"
          value={manualCode}
          onChangeText={setManualCode}
        />

        <TouchableOpacity
          style={styles.connectButton}
          onPress={handleManualConnect}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.connectText}>Connect Camera</Text>
          )}
        </TouchableOpacity>
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
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
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
});
