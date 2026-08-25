import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Fonts, Spacing, Radius } from '../theme';
import { categoriesApi, requestsApi, getErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import CategoryCard from '../components/CategoryCard';
import StatusBadge from '../components/StatusBadge';
import { customAlert } from '../utils/alert';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const isProvider = user?.role === 'provider';

  // State
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Quote input state for provider
  const [quoteInputId, setQuoteInputId] = useState(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);

  const fetchData = async () => {
    try {
      if (isProvider) {
        // Fetch all incoming open requests for provider
        const reqRes = await requestsApi.listMine();
        setRequests(reqRes.data || []);
      } else {
        // Customer fetch
        const [catRes, reqRes] = await Promise.all([
          categoriesApi.list(),
          requestsApi.listMine(user?.id),
        ]);
        setCategories(catRes.data || []);
        setRequests(reqRes.data || []);
        const active = (reqRes.data || []).find(
          (r) => !['completed', 'cancelled'].includes(r.status),
        );
        setActiveRequest(active || null);
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user?.id, user?.role]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSendQuote = async (reqId) => {
    if (!quoteAmount.trim()) {
      return customAlert('Required', 'Please enter a quote amount in PKR.');
    }
    const amountNum = parseFloat(quoteAmount.replace(/[^0-9.]/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) {
      return customAlert('Invalid Amount', 'Please enter a valid numeric amount.');
    }

    setSubmittingQuote(true);
    try {
      await requestsApi.sendQuote(
        reqId,
        amountNum,
        quoteMessage.trim() || `Professional service quote of PKR ${amountNum.toLocaleString()}`,
      );
      customAlert('Quote Sent!', 'Your quote has been sent to the customer.', [
        { text: 'OK', onPress: () => { setQuoteInputId(null); setQuoteAmount(''); setQuoteMessage(''); fetchData(); } },
      ]);
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to send quote.');
      customAlert('Error', msg);
    } finally {
      setSubmittingQuote(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.teal} />
      </View>
    );
  }

  // PROVIDER WORKSPACE VIEW
  if (isProvider) {
    return (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.teal]} />}
      >
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Provider Dashboard 🛠️</Text>
            <Text style={styles.subGreeting}>Welcome back, {user?.name}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Incoming Service Requests</Text>

        {requests.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="briefcase-outline" size={44} color={Colors.muted} />
            <Text style={styles.emptyTitle}>No incoming requests yet</Text>
            <Text style={styles.emptySub}>Check back soon for new service requests from customers.</Text>
          </View>
        ) : (
          requests.map((r) => {
            const hasChat = ['matched', 'quoted', 'accepted', 'in_progress', 'completed'].includes(r.status);
            return (
              <View key={r.id} style={styles.providerCard}>
                <View style={styles.providerCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>Customer Request #{r.id.substring(0, 8)}</Text>
                    <Text style={styles.requestLocation}>📍 {r.location || 'Location provided'}</Text>
                  </View>
                  <StatusBadge status={r.status} />
                </View>

                <Text style={styles.requestText}>{r.raw_text}</Text>

                {r.quote_amount ? (
                  <View style={styles.quotedBadge}>
                    <Text style={styles.quotedText}>
                      Your Quote: <Text style={{ ...Fonts.bold }}>PKR {r.quote_amount.toLocaleString()}</Text>
                    </Text>
                  </View>
                ) : null}

                {/* Actions */}
                <View style={styles.cardActionsRow}>
                  {/* Open Chat */}
                  {hasChat && (
                    <TouchableOpacity
                      style={styles.chatActionBtn}
                      onPress={() => navigation.navigate('Chat', { requestId: r.id })}
                    >
                      <Ionicons name="chatbubbles" size={16} color={Colors.white} />
                      <Text style={styles.chatActionText}>Chat with Customer</Text>
                    </TouchableOpacity>
                  )}

                  {/* Send Quote button if not quoted yet */}
                  {!r.quote_amount && r.status !== 'cancelled' && (
                    <TouchableOpacity
                      style={styles.quoteActionBtn}
                      onPress={() => {
                        setQuoteInputId(quoteInputId === r.id ? null : r.id);
                        setQuoteAmount('');
                        setQuoteMessage('');
                      }}
                    >
                      <Ionicons name="cash-outline" size={16} color={Colors.teal} />
                      <Text style={styles.quoteActionText}>
                        {quoteInputId === r.id ? 'Cancel Quote' : 'Send Quote'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Inline Quote Input Form */}
                {quoteInputId === r.id && (
                  <View style={styles.inlineQuoteForm}>
                    <Text style={styles.quoteFormLabel}>Enter Quote Price (PKR)</Text>
                    <TextInput
                      style={styles.quoteInput}
                      placeholder="e.g. 3500"
                      placeholderTextColor={Colors.muted}
                      keyboardType="numeric"
                      value={quoteAmount}
                      onChangeText={setQuoteAmount}
                    />

                    <Text style={styles.quoteFormLabel}>Quote Note (Optional)</Text>
                    <TextInput
                      style={styles.quoteInput}
                      placeholder="e.g. Includes parts and labor costs"
                      placeholderTextColor={Colors.muted}
                      value={quoteMessage}
                      onChangeText={setQuoteMessage}
                    />

                    <TouchableOpacity
                      style={[styles.submitQuoteBtn, submittingQuote && { opacity: 0.7 }]}
                      onPress={() => handleSendQuote(r.id)}
                      disabled={submittingQuote}
                    >
                      {submittingQuote ? (
                        <ActivityIndicator color={Colors.white} size="small" />
                      ) : (
                        <Text style={styles.submitQuoteText}>Submit Quote to Customer</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    );
  }

  // CUSTOMER WORKSPACE VIEW
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.teal]} />}
    >
      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
          <Text style={styles.subGreeting}>What do you need help with?</Text>
        </View>
      </View>

      {/* AI Support Chatbot Banner */}
      <TouchableOpacity
        style={styles.supportBanner}
        onPress={() => navigation.navigate('SupportChat')}
        activeOpacity={0.85}
      >
        <View style={styles.supportIconBg}>
          <Ionicons name="chatbubbles" size={22} color={Colors.teal} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.supportTitle}>24/7 AI Support Chatbot</Text>
          <Text style={styles.supportSub}>Ask about refunds, bookings & policies</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.teal} />
      </TouchableOpacity>

      {/* Active Request Card */}
      {activeRequest && (
        <TouchableOpacity
          style={styles.activeCard}
          onPress={() => navigation.navigate('RequestDetail', { requestId: activeRequest.id })}
          activeOpacity={0.8}
        >
          <View style={styles.activeCardTop}>
            <Ionicons name="time" size={18} color={Colors.amber} />
            <Text style={styles.activeCardLabel}>Active Request</Text>
            <StatusBadge status={activeRequest.status} />
          </View>
          <Text style={styles.activeCardText} numberOfLines={2}>
            {activeRequest.raw_text}
          </Text>
          <Text style={styles.activeCardCta}>Tap to view details & chat →</Text>
        </TouchableOpacity>
      )}

      {/* Submit CTA */}
      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={() => navigation.navigate('SubmitRequest')}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={22} color={Colors.white} />
        <Text style={styles.ctaBtnText}>Submit a Service Request</Text>
      </TouchableOpacity>

      {/* Categories */}
      <Text style={styles.sectionTitle}>Service Categories</Text>
      <View style={styles.grid}>
        {categories.map((cat) => (
          <View key={cat.id} style={styles.gridItem}>
            <CategoryCard
              category={cat}
              onPress={() => navigation.navigate('SubmitRequest', { categoryId: cat.id, categoryName: cat.name })}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.paper },
  container: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.paper },

  greetingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.sm },
  greeting: { fontSize: 24, color: Colors.ink, ...Fonts.bold },
  subGreeting: { fontSize: 15, color: Colors.muted, ...Fonts.regular, marginTop: 4 },

  supportBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F1',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#B2DFDB',
    gap: 12,
  },
  supportIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportTitle: { fontSize: 15, color: Colors.tealDeep, ...Fonts.bold },
  supportSub: { fontSize: 12, color: Colors.inkSoft, marginTop: 2 },

  activeCard: {
    backgroundColor: Colors.amberBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E8D5B0',
  },
  activeCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  activeCardLabel: { fontSize: 13, color: Colors.amberDeep, ...Fonts.semibold, flex: 1 },
  activeCardText: { fontSize: 14, color: Colors.ink, ...Fonts.regular, lineHeight: 20 },
  activeCardCta: { fontSize: 12, color: Colors.amber, ...Fonts.semibold, marginTop: 8 },

  ctaBtn: {
    backgroundColor: Colors.teal,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  ctaBtnText: { fontSize: 16, color: Colors.white, ...Fonts.semibold },

  sectionTitle: { fontSize: 18, color: Colors.ink, ...Fonts.bold, marginBottom: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '50%' },

  // Provider styles
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: { fontSize: 16, color: Colors.ink, ...Fonts.semibold, marginTop: 12 },
  emptySub: { fontSize: 13, color: Colors.muted, textAlign: 'center', marginTop: 4 },

  providerCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  providerCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  customerName: { fontSize: 15, color: Colors.ink, ...Fonts.bold },
  requestLocation: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  requestText: { fontSize: 14, color: Colors.inkSoft, marginVertical: 8, lineHeight: 20 },

  quotedBadge: {
    backgroundColor: '#F3EEFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    marginVertical: 6,
  },
  quotedText: { fontSize: 13, color: '#5B21B6' },

  cardActionsRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  chatActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.teal,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  chatActionText: { fontSize: 13, color: Colors.white, ...Fonts.semibold },
  quoteActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.tealBg,
    borderWidth: 1,
    borderColor: Colors.teal,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  quoteActionText: { fontSize: 13, color: Colors.teal, ...Fonts.semibold },

  inlineQuoteForm: {
    backgroundColor: Colors.paper,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 12,
  },
  quoteFormLabel: { fontSize: 12, color: Colors.inkSoft, ...Fonts.medium, marginBottom: 4, marginTop: 6 },
  quoteInput: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.ink,
  },
  submitQuoteBtn: {
    backgroundColor: Colors.teal,
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  submitQuoteText: { fontSize: 14, color: Colors.white, ...Fonts.semibold },
});
