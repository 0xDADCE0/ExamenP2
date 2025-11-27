// src/screens/LoginScreen.js
import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { login } from '../api/auth';

export default function LoginScreen({ setToken, setUser, navigation }) {
  // Puedes dejar valores por defecto para pruebas o strings vacíos
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
        setError("Ingresa tu email y contraseña");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      setToken(data.token);
      setUser(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading && <ActivityIndicator color="#fff" style={{ marginBottom: 8 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Botón personalizado igual que en Register */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#111111',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1c1c1c',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12, // Aumentado para mejor touch target
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  button: {
      backgroundColor: '#ffffff',
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8
  },
  buttonText: {
      color: '#000000',
      fontWeight: '600',
      fontSize: 16
  },
  error: {
    color: '#ff4d4f',
    marginBottom: 12,
    textAlign: 'center',
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24
  },
  footerText: {
      color: '#888888'
  },
  link: {
      color: '#ffffff',
      fontWeight: '600'
  }
});