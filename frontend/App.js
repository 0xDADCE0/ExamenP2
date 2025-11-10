// App.js
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import 'react-native-gesture-handler';

import CustomDrawer from './src/components/CustomDrawer';
import FakeSplashScreen from './src/screens/FakeSplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ScanQRScreen from './src/screens/ScanQRScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function AppDrawer({ token, user, setToken }) {
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.6)',
        sceneContainerStyle: { backgroundColor: '#111111' },
      }}
      drawerContent={(props) => (
        <CustomDrawer
          {...props}
          user={user}
          unreadCount={unreadCount}
        />
      )}
    >
      <Drawer.Screen name="Home">
        {(props) => <HomeScreen {...props} />}
      </Drawer.Screen>

      <Drawer.Screen name="Notifications">
        {(props) => (
          <NotificationsScreen
            {...props}
            token={token}
            setUnreadCount={setUnreadCount}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen name="ScanQR">
        {(props) => <ScanQRScreen {...props} token={token} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // estado para el fake splash
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // duración en ms (2 segundos)

    return () => clearTimeout(timeout);
  }, []);

  // mientras showSplash sea true, solo mostramos la pantalla de splash
  if (showSplash) {
    return <FakeSplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Main">
            {() => (
              <AppDrawer token={token} user={user} setToken={setToken} />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {() => <LoginScreen setToken={setToken} setUser={setUser} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
