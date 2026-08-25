import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Fonts, Spacing, Radius } from '../theme';
import { requestsApi, providersApi } from '../api';
import api from '../api';
import StatusBadge from '../components/StatusBadge';
import StatusStepper from '../components/StatusStepper';
import StarRating from '../components/StarRating';
import { customAlert } from '../utils/alert';

export default function RequestDetailScreen({ route, navigation }) {
  const { requestId } = route.params;
  const [request, setRequest] = useState(null);
  const [providerInfo, setProviderInfo] = useState(null);
  const [providerReviews, setProviderReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting, setActing] = useState(false);

  const fetchRequest = async () => {
    try {
      const res = await requestsApi.get(requestId);
      const reqData = res.data;
      setRequest(reqData);

      if (reqData && reqData.matched_provider_id) {
        try {
          const provRes = await providersApi.get(reqData.matched_provider_id);
          setProviderInfo(provRes.data);

          const revRes = await api.get(`/providers/${reqData.matched_provider_id}/reviews`);
          setProviderReviews(revRes.data || []);
        } catch {
          // Ignore provider fetch failure
        }
      }
    } catch {
      customAlert('Error', 'Could not load request details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequest();
    }, [requestId]),
  );

  const handleStatusChange = async (newStatus, confirmMsg) => {
    customAlert('Confirm', confirmMsg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          setActing(true);
          try {
            const res = await requestsApi.updateStatus(requestId, newStatus);
            setRequest(res.data);
          } catch (err) {
            customAlert('Error', err.response?.data?.detail || 'Failed to update status.');
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.teal} />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Request not found</Text>
      </View>
    );
  }

  const canCancel = ['submitted', 'matched', 'quoted', 'accepted'].includes(request.status);
  const isQuoted = request.status === 'quoted';
  const isCompleted = request.status === 'completed';
  const hasChat = ['matched', 'quoted', 'accepted', 'in_progress', 'completed'].includes(request.status);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequest(); }} colors={[Colors.teal]} />}
    >
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Service Request</Text>
          <StatusBadge status={request.status} />
        </View>
        <Text style={styles.rawText}>{request.raw_text}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location" size={14} color={Colors.muted} />
          <Text style={styles.metaText}>{request.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="call" size={14} color={Colors.muted} />
          <Text style={styles.metaText}>{request.contact_number}</Text>
        </View>
        {request.created_at && (
          <View style={styles.metaRow}>
            <Ionicons name="calendar" size={14} color={Colors.muted} />
            <Text style={styles.metaText}>
              {new Date(request.created_at).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {/* Status Stepper */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Progress</Text>
        <StatusStepper currentStatus={request.status} />
      </View>

      {/* Provider Details & Reviews Card */}
      {providerInfo && (
        <View style={styles.providerCard}>
          <View style={styles.providerHeader}>
            <View style={styles.providerAvatar}>
              <Text style={styles.avatarLetter}>
                {(providerInfo.user_name || providerInfo.name || 'P').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.providerName}>{providerInfo.user_name || providerInfo.name || 'Assigned Service Provider'}</Text>
              <Text style={styles.providerSub}>
                {providerInfo.location} · {providerInfo.experience_years || 0} years experience
              </Text>
              {providerInfo.user_phone && (
                <Text style={styles.providerPhone}>Phone: {providerInfo.user_phone}</Text>
              )}
            </View>
          </View>

          {/* Rating Summary */}
          <View style={styles.ratingSummaryRow}>
            <StarRating rating={providerInfo.rating_avg || 5} size={16} />
            <Text style={styles.ratingText}>
              {Number(providerInfo.rating_avg || 5.0).toFixed(1)} ({providerInfo.rating_count || providerReviews.length} reviews)
            </Text>
          </View>

          {/* Actual Provider Reviews List */}
          {providerReviews.length > 0 && (
            <View style={styles.reviewsWrapper}>
              <Text style={styles.reviewsTitle}>Recent Customer Reviews</Text>
              {providerReviews.slice(0, 3).map((rev) => (
                <View key={rev.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <StarRating rating={rev.rating} size={12} />
                    <Text style={styles.reviewDate}>
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}
                    </Text>
                  </View>
                  {rev.comment && (
                    <Text style={styles.reviewComment}>{rev.comment}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Quote Section */}
      {isQuoted && request.quote_amount != null && (
        <View style={styles.quoteCard}>
          <Text style={styles.quoteLabel}>Provider's Official Quote</Text>
          <Text style={styles.quoteAmount}>PKR {request.quote_amount?.toLocaleString()}</Text>
          {request.quote_message && (
            <Text style={styles.quoteMsg}>{request.quote_message}</Text>
          )}
          <View style={styles.quoteActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => handleStatusChange('accepted', 'Accept this quote?')}
              disabled={acting}
            >
              <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
              <Text style={styles.actionBtnText}>Accept Quote</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.declineBtn]}
              onPress={() => handleStatusChange('cancelled', 'Decline this quote and cancel the request?')}
              disabled={acting}
            >
              <Ionicons name="close-circle" size={18} color={Colors.danger} />
              <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Chat Button */}
      {hasChat && (
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => navigation.navigate('Chat', { requestId: request.id })}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubbles" size={20} color={Colors.white} />
          <Text style={styles.chatBtnText}>Open Chat with Provider</Text>
        </TouchableOpacity>
      )}

      {/* Review Button */}
      {isCompleted && (
        <TouchableOpacity
          style={[styles.chatBtn, { backgroundColor: Colors.amber }]}
          onPress={() => navigation.navigate('Review', { requestId: request.id, providerId: request.matched_provider_id })}
          activeOpacity={0.8}
        >
          <Ionicons name="star" size={20} color={Colors.white} />
          <Text style={styles.chatBtnText}>Leave a Review</Text>
        </TouchableOpacity>
      )}

      {/* Cancel */}
      {canCancel && !isQuoted && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => handleStatusChange('cancelled', 'Are you sure you want to cancel this request?')}
          disabled={acting}
        >
          <Text style={styles.cancelText}>Cancel Request</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.paper },
  container: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.paper },
  errorText: { fontSize: 16, color: Colors.danger },

  headerCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  headerTitle: { fontSize: 18, color: Colors.ink, ...Fonts.bold },
  rawText: { fontSize: 15, color: Colors.inkSoft, ...Fonts.regular, lineHeight: 22, marginBottom: Spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { fontSize: 13, color: Colors.muted },

  section: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 16, color: Colors.ink, ...Fonts.semibold },

  providerCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  providerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.sm },
  providerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.teal,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarLetter: { fontSize: 18, color: Colors.white, ...Fonts.bold },
  providerName: { fontSize: 16, color: Colors.ink, ...Fonts.bold },
  providerSub: { fontSize: 13, color: Colors.muted, marginTop: 2 },
  providerPhone: { fontSize: 13, color: Colors.teal, ...Fonts.medium, marginTop: 2 },

  ratingSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 8 },
  ratingText: { fontSize: 13, color: Colors.inkSoft, ...Fonts.semibold },

  reviewsWrapper: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, marginTop: 6 },
  reviewsTitle: { fontSize: 13, color: Colors.inkSoft, ...Fonts.semibold, marginBottom: 6 },
  reviewItem: { backgroundColor: Colors.paper, borderRadius: Radius.sm, padding: 8, marginBottom: 6 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewDate: { fontSize: 11, color: Colors.muted },
  reviewComment: { fontSize: 12.5, color: Colors.ink, lineHeight: 16 },

  quoteCard: {
    backgroundColor: '#F3EEFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#D4C5F9',
    marginBottom: Spacing.md,
  },
  quoteLabel: { fontSize: 13, color: '#5B21B6', ...Fonts.semibold },
  quoteAmount: { fontSize: 28, color: '#5B21B6', ...Fonts.bold, marginVertical: 8 },
  quoteMsg: { fontSize: 14, color: Colors.inkSoft, ...Fonts.regular, marginBottom: Spacing.md },
  quoteActions: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  acceptBtn: { backgroundColor: Colors.success },
  declineBtn: { backgroundColor: Colors.dangerBg, borderWidth: 1, borderColor: Colors.danger },
  actionBtnText: { fontSize: 14, color: Colors.white, ...Fonts.semibold },

  chatBtn: {
    backgroundColor: Colors.teal,
    borderRadius: Radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  chatBtnText: { fontSize: 15, color: Colors.white, ...Fonts.semibold },

  cancelBtn: { alignItems: 'center', paddingVertical: 12, marginTop: Spacing.sm },
  cancelText: { fontSize: 14, color: Colors.danger, ...Fonts.medium },
});
