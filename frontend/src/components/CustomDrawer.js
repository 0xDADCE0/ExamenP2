// src/components/CustomDrawer.js
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { updateProfile } from '../api/auth';

function getInitials(nameOrEmail) {
  if (!nameOrEmail) return '?';
  const parts = nameOrEmail.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return nameOrEmail.slice(0, 2).toUpperCase();
}

export default function CustomDrawer({ navigation, state, user, unreadCount, onLogout, token, setUser }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentView, setCurrentView] = useState('menu');

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const currentRoute = state.routeNames[state.index];
  const displayName = user?.username || user?.email || 'Usuario';
  const displayEmail = user?.email || '';

  const goto = (route) => navigation.navigate(route);

  const openModal = () => {
      setCurrentView('menu');
      setInputValue('');
      setErrorMessage(null);
      setSuccessMessage(null);
      setModalVisible(true);
  };

  const handleEditPress = (viewType, initialValue = '') => {
      setErrorMessage(null);
      setSuccessMessage(null);
      
      setInputValue(initialValue);
      setCurrentView(viewType);
  };

  const handleSave = async () => {
      setErrorMessage(null);
      setSuccessMessage(null);

      if (!inputValue.trim()) {
          setErrorMessage('El campo no puede estar vacío');
          return;
      }
      
      setLoading(true);
      try {
          const payload = {};
          if (currentView === 'username') payload.username = inputValue;
          if (currentView === 'email') payload.email = inputValue;
          if (currentView === 'password') {
             if (inputValue.length < 8) {
                 throw new Error('La contraseña debe tener al menos 8 caracteres');
             }
             payload.password = inputValue;
          }

          await updateProfile(token, payload);
          
          setUser({ ...user, ...payload });
          
          setSuccessMessage('¡Actualizado correctamente!');
          
          if (currentView === 'password') {
              setInputValue('');
          }

      } catch (e) {
          setErrorMessage(e.message || 'Error al actualizar');
      } finally {
          setLoading(false);
      }
  };

  const renderModalContent = () => {
      if (currentView === 'menu') {
          return (
              <>
                <Text style={styles.modalTitle}>Cuenta</Text>

                <TouchableOpacity 
                    style={styles.modalItem} 
                    onPress={() => handleEditPress('username', user?.username)}
                >
                    <Ionicons name="person-outline" size={20} color="#fff" />
                    <Text style={styles.modalItemText}>Cambiar Nombre</Text>
                    <Ionicons name="chevron-forward" size={16} color="#444" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.modalItem} 
                    onPress={() => handleEditPress('email', user?.email)}
                >
                    <Ionicons name="mail-outline" size={20} color="#fff" />
                    <Text style={styles.modalItemText}>Cambiar Email</Text>
                    <Ionicons name="chevron-forward" size={16} color="#444" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.modalItem} 
                    onPress={() => handleEditPress('password')}
                >
                    <Ionicons name="lock-closed-outline" size={20} color="#fff" />
                    <Text style={styles.modalItemText}>Cambiar Contraseña</Text>
                    <Ionicons name="chevron-forward" size={16} color="#444" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.modalItem} onPress={() => { setModalVisible(false); onLogout(); }}>
                    <Ionicons name="log-out-outline" size={20} color="#ff4d4f" />
                    <Text style={[styles.modalItemText, { color: '#ff4d4f' }]}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </>
          );
      }

      let title = '';
      let placeholder = '';
      let isSecure = false;

      if (currentView === 'username') { title = 'Editar Nombre'; placeholder = 'Nuevo nombre'; }
      if (currentView === 'email') { title = 'Editar Email'; placeholder = 'Nuevo email'; }
      if (currentView === 'password') { title = 'Nueva Contraseña'; placeholder = 'Mínimo 8 caracteres'; isSecure = true; }

      return (
          <>
            <View style={styles.formHeader}>
                <TouchableOpacity onPress={() => setCurrentView('menu')}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.formTitle}>{title}</Text>
                <View style={{ width: 24 }} /> 
            </View>

            <TextInput
                style={[
                    styles.input,
                    errorMessage && styles.inputError,
                    successMessage && styles.inputSuccess
                ]}
                value={inputValue}
                onChangeText={(text) => {
                    setInputValue(text);
                    if (errorMessage) setErrorMessage(null);
                    if (successMessage) setSuccessMessage(null);
                }}
                placeholder={placeholder}
                placeholderTextColor="#666"
                secureTextEntry={isSecure}
                autoCapitalize="none"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={styles.saveButtonText}>Guardar</Text>
                )}
            </TouchableOpacity>

            {/* --- MENSAJES DE ESTADO --- */}
            
            {errorMessage && (
                <View style={styles.messageContainer}>
                    <Ionicons name="alert-circle" size={16} color="#ff4d4f" />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            )}

            {successMessage && (
                <View style={styles.messageContainer}>
                    <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                    <Text style={styles.successText}>{successMessage}</Text>
                </View>
            )}
          </>
      );
  };

  const handleLogoutPress = () => {
    setModalVisible(false);
    onLogout();
  };

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
            currentRoute === 'Notifications' && styles.menuItemActive,
          ]}
          onPress={() => goto('Notifications')}
        >
          <Ionicons name="notifications-outline" size={20} color="#ffffff" />
          <Text style={styles.menuText}>Notifications</Text>
          {unreadCount > 0 && <View style={styles.dot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            currentRoute === 'ScanQR' && styles.menuItemActive,
          ]}
          onPress={() => goto('ScanQR')}
        >
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={20}
            color="#ffffff"
          />
          <Text style={styles.menuText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      {/* Parte inferior: Perfil Clickable */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.profileBox} onPress={openModal}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{displayEmail}</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-up" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* MODAL / BOTTOM SHEET */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.dragIndicator} />
                {renderModalContent()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    justifyContent: 'space-between',
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
    height: 50,
    paddingHorizontal: 12,
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
  footer: {
    marginTop: 24,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
    borderRadius: 16,
    padding: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff7a2f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileEmail: {
    color: '#666666',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1c1c1c',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  modalItemText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginVertical: 8,
  },
  formHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24
  },
  formTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600'
  },
  input: {
      backgroundColor: '#111',
      color: '#fff',
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#333',
      marginBottom: 20
  },
  inputError: {
      borderColor: '#ff4d4f',
  },
  inputSuccess: {
      borderColor: '#4caf50',
  },
  saveButton: {
      backgroundColor: '#fff',
      padding: 14,
      borderRadius: 12,
      alignItems: 'center'
  },
  saveButtonText: {
      color: '#000',
      fontWeight: '700',
      fontSize: 16
  },
  messageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
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