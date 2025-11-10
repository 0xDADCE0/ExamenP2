// src/screens/FakeSplashScreen.js
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function FakeSplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>LUCIA</Text>
      <Text style={styles.subtitle}>AI monitoring</Text>
      <ActivityIndicator style={{ marginTop: 24 }} color="#ffffff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 4,
  },
  subtitle: {
    marginTop: 8,
    color: '#777777',
    fontSize: 14,
  },
});
