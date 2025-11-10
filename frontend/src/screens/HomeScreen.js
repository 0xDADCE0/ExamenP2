// src/screens/HomeScreen.js
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header con botón de menú */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={26} color="#ffffff" />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Home</Text>
            <Text style={styles.headerSubtitle}>This is the home screen</Text>
        </View>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Lucía</Text>
        <Text style={styles.subtitle}>
          Here you can manage your devices and see your notifications.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    paddingHorizontal: 20,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#aaaaaa',
    fontSize: 14,
  },
});
