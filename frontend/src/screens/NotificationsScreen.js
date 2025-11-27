// src/screens/NotificationsScreen.js
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { fetchNotifications, markNotificationRead } from '../api/notifications';

function groupByDay(items) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const groups = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  for (const n of items) {
    const created = new Date(n.notification_creation_date || n.creation_date);
    const sameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (sameDay(created, today)) {
      groups.today.push(n);
    } else if (sameDay(created, yesterday)) {
      groups.yesterday.push(n);
    } else {
      groups.earlier.push(n);
    }
  }

  const result = [];
  if (groups.today.length) result.push({ title: 'HOY', data: groups.today });
  if (groups.yesterday.length)
    result.push({ title: 'AYER', data: groups.yesterday });
  if (groups.earlier.length)
    result.push({ title: 'ANTERIORES', data: groups.earlier });

  return result;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${m} ${ampm}`;
}

export default function NotificationsScreen({ token, setUnreadCount, navigation }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para el Modal de Detalles
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const loadNotifications = useCallback(async () => {
    // Si ya estamos cargando (ej. auto-refresh), no pongamos loading true para no parpadear
    // Solo la primera vez o manual
    if (sections.length === 0) setLoading(true); 
    
    setError(null);
    try {
      const data = await fetchNotifications(token, 'all'); // Traemos TODAS
      
      // Contar solo las no leídas para el badge del menú
      const unread = data.filter(n => !n.is_read).length;
      setUnreadCount(unread);

      const grouped = groupByDay(data);
      setSections(grouped);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, setUnreadCount]);

  useEffect(() => {
    loadNotifications();
    const id = setInterval(loadNotifications, 10000); // Auto-refresh cada 10s
    return () => clearInterval(id);
  }, [loadNotifications]);

  const handleMarkRead = async (item) => {
    if (item.is_read) return; // Si ya está leída, no hacemos nada en la API
    try {
      // Optimista: actualizamos UI localmente antes de llamar API (opcional, aquí refrescamos todo)
      await markNotificationRead(token, item.user_notification_id);
      await loadNotifications();
    } catch (e) {
      console.log(e);
    }
  };

  const openDetails = async (item) => {
    setSelectedNotification(item);
    setDetailsVisible(true);
    // Al ver detalles, marcamos como leída automáticamente
    if (!item.is_read) {
        handleMarkRead(item);
    }
  };

  const renderCard = ({ item }) => {
    const isFall = item.type === 'fall' || item.type === 'FALL_DETECTED';
    const isRead = !!item.is_read;

    return (
      <TouchableOpacity 
        // Si la tarjeta está leída se ve más oscura (opacity 0.6)
        style={[styles.card, isRead && styles.cardRead]} 
        activeOpacity={0.7}
        onPress={() => openDetails(item)}
      >
        <View style={styles.iconContainer}>
          {isFall ? (
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={24}
              color={isRead ? "#884444" : "#ff6b6b"} // Color apagado si ya se leyó
            />
          ) : (
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={24}
              color={isRead ? "#3a663c" : "#4caf50"}
            />
          )}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, isRead && styles.textRead]}>
                {item.title}
            </Text>
            {/* Si no está leída, mostramos un puntito rojo al lado de la hora */}
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <Text style={styles.cardTime}>
                {formatTime(item.notification_creation_date || item.creation_date)}
                </Text>
                {!isRead && <View style={styles.unreadDot} />}
            </View>
          </View>
          <Text style={[styles.cardSubtitle, isRead && styles.textRead]}>
            {item.body}
          </Text>

          {/* Botón View Details solo si es relevante, aunque ahora toda la card es clickeable */}
          {isFall && !isRead && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => openDetails(item)}
              >
                <Text style={styles.primaryButtonText}>Ver Detalles</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const flatData = sections.flatMap((section) => [
    { header: true, title: section.title, key: `header-${section.title}` },
    ...section.data.map((item) => ({ ...item, header: false, key: item.user_notification_id })),
  ]);

  const renderItem = ({ item }) => {
    if (item.header) {
      return (
        <Text style={styles.sectionHeader} key={item.key}>
          {item.title}
        </Text>
      );
    }
    return renderCard({ item });
  };

  // Renderizado del contenido del Modal de Detalles
  const renderDetailsContent = () => {
      if (!selectedNotification) return null;
      const { payload, device_location, device_code } = selectedNotification;
      
      // Parsear payload si viene como string, o usar directo si es objeto (depende del backend driver)
      let parsedPayload = payload;
      if (typeof payload === 'string') {
          try { parsedPayload = JSON.parse(payload); } catch(e) {}
      }

      return (
          <View>
              <Text style={styles.modalTitle}>{selectedNotification.title}</Text>
              <Text style={styles.modalBody}>{selectedNotification.body}</Text>
              
              <View style={styles.divider} />
              
              <Text style={styles.detailLabel}>Ubicación:</Text>
              <Text style={styles.detailValue}>{device_location || 'Desconocida'}</Text>
              
              <Text style={styles.detailLabel}>Dispositivo ID:</Text>
              <Text style={styles.detailValue}>{device_code}</Text>

              {parsedPayload && Object.keys(parsedPayload).length > 0 && (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.detailSectionTitle}>Datos del Sensor</Text>
                    {Object.entries(parsedPayload).map(([key, value]) => (
                        <View key={key} style={styles.payloadRow}>
                            <Text style={styles.payloadKey}>{key}:</Text>
                            <Text style={styles.payloadValue}>{String(value)}</Text>
                        </View>
                    ))}
                  </>
              )}

              <TouchableOpacity 
                style={styles.closeModalButton} 
                onPress={() => setDetailsVisible(false)}
              >
                  <Text style={styles.closeModalText}>Cerrar</Text>
              </TouchableOpacity>
          </View>
      );
  };

  return (
    <View style={styles.container}>
      {/* Header (Mantenemos tu versión centrada) */}
      <View style={styles.header}>
        <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={26} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <Text style={styles.headerSubtitle}>Alertas e historial</Text>
        </View>
        <View style={styles.headerRightDummy} />
      </View>

      {loading && sections.length === 0 && (
          <ActivityIndicator color="#ffffff" style={{ marginBottom: 8 }} />
      )}
      
      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && flatData.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Sin notificaciones</Text>
          <Text style={styles.emptySubtitle}>No tienes alertas registradas.</Text>
        </View>
      ) : (
        <FlatList
            data={flatData}
            keyExtractor={(item) => String(item.key)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}

      {/* MODAL DE DETALLES */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={detailsVisible}
        onRequestClose={() => setDetailsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDetailsVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.dragIndicator} />
                {renderDetailsContent()}
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
  },
  // Header styles (tu versión corregida)
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
  
  // List Styles
  error: { color: '#ff6b6b', marginBottom: 8 },
  sectionHeader: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    letterSpacing: 1
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1c', // Fondo normal (no leída)
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ff4d4f' // Borde rojo para destacar las nuevas
  },
  cardRead: {
    backgroundColor: '#111', // Fondo más oscuro para leídas (casi se funde con el fondo)
    borderWidth: 1,
    borderColor: '#222',
    borderLeftWidth: 1, // Quitamos el borde destacado
    borderLeftColor: '#222',
    opacity: 0.7 // Un poco transparentes
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: { flex: 1 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  cardTitle: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  textRead: {
    color: '#888', // Texto gris si ya se leyó
  },
  cardTime: {
    color: '#666',
    fontSize: 12,
  },
  unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#ff4d4f',
      marginLeft: 6
  },
  cardSubtitle: {
    color: '#bbbbbb',
    fontSize: 13,
    marginBottom: 8,
  },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  primaryButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600', marginBottom: 4 },
  emptySubtitle: { color: '#888888', fontSize: 13 },

  // --- Modal Styles (Reusados y adaptados) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)', // Fondo un poco oscuro para enfocar
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1c1c1c',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%', // Que no ocupe toda la pantalla si hay mucho texto
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalBody: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 16,
  },
  detailLabel: {
      color: '#666',
      fontSize: 12,
      marginBottom: 2
  },
  detailValue: {
      color: '#fff',
      fontSize: 15,
      marginBottom: 12
  },
  detailSectionTitle: {
      color: '#fff',
      fontWeight: '600',
      marginBottom: 12,
      fontSize: 16
  },
  payloadRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#222',
      paddingBottom: 4
  },
  payloadKey: {
      color: '#888',
      fontSize: 14
  },
  payloadValue: {
      color: '#4caf50', // Verde tipo terminal para datos técnicos
      fontFamily: 'Courier', // Si Expo soporta monospace por defecto
      fontSize: 14
  },
  closeModalButton: {
      backgroundColor: '#333',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 24
  },
  closeModalText: {
      color: '#fff',
      fontWeight: '600'
  }
});