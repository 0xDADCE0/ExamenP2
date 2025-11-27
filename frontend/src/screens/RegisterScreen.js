// src/screens/RegisterScreen.js
import { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { login, register } from '../api/auth';

export default function RegisterScreen({ setToken, setUser, navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    if (!email || !password) {
        setError("Email y contraseña requeridos");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      // Registrar
      await register(email, password);
      
      // Login automático
      const data = await login(email, password);
      
      // Guardar sesión (Redirige a Home automáticamente desde App.js)
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
      <Text style={styles.title}>Crear Cuenta</Text>
      <Text style={styles.subtitle}>Solo necesitas un email para comenzar</Text>

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
        placeholder="Contraseña (min 8 caracteres)"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading && <ActivityIndicator color="#fff" style={{ marginBottom: 8 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Entrar</Text>
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
    paddingVertical: 12,
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