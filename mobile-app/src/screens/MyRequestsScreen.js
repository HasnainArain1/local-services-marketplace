/**
 * MyRequestsScreen — list of all service requests for the current customer.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Fonts, Spacing, Radius } from '../theme';
import { requestsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

export default function MyRequestsScreen({ navigation }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await requestsApi.listMine(user.id);
      setRequests(res.data || []);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [user?.id]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.teal} />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardText} numberOfLines={2}>{item.raw_text}</Text>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.cardBottom}>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={Colors.muted} />
          <Text style={styles.metaText}>{item.location}</Text>
        </View>
        <Text style={styles.dateText}>
          {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
        </Text>
      </View>
      {item.quote_amount != null && (
        <View style={styles.quoteRow}>
          <Text style={styles.quoteLabel}>Quote:</Text>
          <Text style={styles.quoteValue}>PKR {item.quote_amount?.toLocaleString()}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={[styles.list, requests.length === 0 && { flex: 1 }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} colors={[Colors.teal]} />
      }
      ListEmptyComponent={
        <EmptyState
          icon="document-text-outline"
          title="No requests yet"
          message="Submit your first service request from the Home screen."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.paper },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl, backgroundColor: Colors.paper },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  cardText: { flex: 1, fontSize: 15, color: Colors.ink, ...Fonts.medium, lineHeight: 21 },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.muted },
  dateText: { fontSize: 12, color: Colors.muted },
  quoteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  quoteLabel: { fontSize: 12, color: Colors.muted, ...Fonts.medium },
  quoteValue: { fontSize: 14, color: '#5B21B6', ...Fonts.semibold },
});
