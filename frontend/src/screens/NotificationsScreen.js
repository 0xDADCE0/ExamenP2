// src/screens/NotificationsScreen.js
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  if (groups.today.length) result.push({ title: 'TODAY', data: groups.today });
  if (groups.yesterday.length)
    result.push({ title: 'YESTERDAY', data: groups.yesterday });
  if (groups.earlier.length)
    result.push({ title: 'EARLIER', data: groups.earlier });

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

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(token);
      const grouped = groupByDay(data);
      setSections(grouped);
      setUnreadCount(data.length);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, setUnreadCount]);

  useEffect(() => {
    loadNotifications();
    const id = setInterval(loadNotifications, 10000);
    return () => clearInterval(id);
  }, [loadNotifications]);

  const handleMarkRead = async (item) => {
    try {
      await markNotificationRead(token, item.user_notification_id);
      await loadNotifications();
    } catch (e) {
      // puedes mostrar error si quieres
    }
  };

  const renderCard = ({ item }) => {
    const isFall = item.type === 'fall' || item.type === 'FALL_DETECTED';
    return (
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          {isFall ? (
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={24}
              color="#ff6b6b"
            />
          ) : (
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={24}
              color="#4caf50"
            />
          )}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardTime}>
              {formatTime(item.notification_creation_date || item.creation_date)}
            </Text>
          </View>
          <Text style={styles.cardSubtitle}>{item.body}</Text>

          {isFall && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => handleMarkRead(item)}
              >
                <Text style={styles.primaryButtonText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleMarkRead(item)}
              >
                <Text style={styles.secondaryButtonText}>False Alarm</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const flatData = sections.flatMap((section) => [
    { header: true, title: section.title, key: `header-${section.title}` },
    ...section.data.map((item) => ({ ...item, header: false, key: item.user_notification_id })),
  ]);

  if (!loading && !error && flatData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={26} color="#ffffff" />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>Alerts and notifications history</Text>
          </View>
        </View>

        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptySubtitle}>
            You don&apos;t have any alerts yet.
          </Text>
        </View>
      </View>
    );
  }

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={26} color="#ffffff" />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Alerts and notifications history</Text>
        </View>
      </View>

      {loading && <ActivityIndicator color="#ffffff" style={{ marginBottom: 8 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={flatData}
        keyExtractor={(item) => String(item.key)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
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
  error: {
    color: '#ff6b6b',
    marginBottom: 8,
  },
  sectionHeader: {
    color: '#777777',
    fontSize: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
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
  cardContent: {
    flex: 1,
  },
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
  cardTime: {
    color: '#888888',
    fontSize: 12,
  },
  cardSubtitle: {
    color: '#bbbbbb',
    fontSize: 13,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  emptyBox: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#888888',
    fontSize: 13,
  },
});
