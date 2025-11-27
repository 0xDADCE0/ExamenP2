// App.js
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import 'react-native-gesture-handler';

import CustomDrawer from './src/components/CustomDrawer';
import FakeSplashScreen from './src/screens/FakeSplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ScanQRScreen from './src/screens/ScanQRScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function AppDrawer({ token, user, setToken, setUser }) {
  const [unreadCount, setUnreadCount] = useState(0);

  // Función para cerrar sesión
  const handleLogout = () => {
    setToken(null);
    setUser(null);
  };

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
          setUser={setUser}
          token={token}
          unreadCount={unreadCount}
          onLogout={handleLogout}
        />
      )}
    >
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
              <AppDrawer 
                token={token} 
                user={user} 
                setToken={setToken} 
                setUser={setUser} 
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login">
              {({ navigation }) => (
                <LoginScreen 
                    setToken={setToken} 
                    setUser={setUser} 
                    navigation={navigation}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {({ navigation }) => (
                <RegisterScreen 
                    setToken={setToken} 
                    setUser={setUser} 
                    navigation={navigation} 
                />
              )}
            </Stack.Screen>
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
