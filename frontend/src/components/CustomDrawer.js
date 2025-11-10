// src/components/CustomDrawer.js
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

function getInitials(nameOrEmail) {
  if (!nameOrEmail) return '?';
  const parts = nameOrEmail.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return nameOrEmail.slice(0, 2).toUpperCase();
}

export default function CustomDrawer({ navigation, state, user, unreadCount }) {
  const currentRoute = state.routeNames[state.index];
  const displayName = user?.username || user?.email || 'Usuario';

  const goto = (route) => navigation.navigate(route);

  return (
    <View style={styles.container}>
      {/* Parte superior: logo y menú */}
      <View>
        <View style={styles.header}>
          <Text style={styles.logoText}>LUCIA</Text>
          <TouchableOpacity onPress={() => navigation.closeDrawer()}>
            <Ionicons name="close" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.menuItem,
            currentRoute === 'Home' && styles.menuItemActive,
          ]}
          onPress={() => goto('Home')}
        >
          <Ionicons name="home-outline" size={20} color="#ffffff" />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            currentRoute === 'Notifications' && styles.menuItemActive,
          ]}
          onPress={() => goto('Notifications')}
        >
          <Ionicons name="notifications-outline" size={20} color="#ffffff" />
          <Text style={styles.menuText}>Notifications</Text>
          {unreadCount > 0 && <View style={styles.dot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => goto('ScanQR')}
        >
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={20}
            color="#ffffff"
          />
          <Text style={styles.scanText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      {/* Parte inferior: perfil */}
      <View style={styles.footer}>
        <View style={styles.profileBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{displayName}</Text>
          </View>
          <MaterialIcons name="settings" size={18} color="#ffffff" />
        </View>
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
    paddingBottom: 16,
    justifyContent: 'space-between', // esto empuja el perfil hacia abajo
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  menuItemActive: {
    backgroundColor: '#1c1c1c',
  },
  menuText: {
    color: '#ffffff',
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4d4f',
  },
  scanButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  scanText: {
    color: '#ffffff',
    marginLeft: 10,
    fontWeight: '500',
  },
  footer: {
    marginTop: 24,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
    borderRadius: 16,
    padding: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff7a2f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 13,
  },
});
