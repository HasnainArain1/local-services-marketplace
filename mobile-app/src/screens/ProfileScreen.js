import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../theme';
import { authApi } from '../api';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { customAlert } from '../utils/alert';

export default function ProfileScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const isProvider = user?.role === 'provider';

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  // Provider profile state
  const [providerProfile, setProviderProfile] = useState(null);
  const [providerReviews, setProviderReviews] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isProvider) {
        loadProviderProfile();
      }
    }, [isProvider, user?.id])
  );

  const loadProviderProfile = async () => {
    setProfileLoading(true);
    try {
      const provRes = await api.get('/providers/');
      const allProviders = provRes.data || [];
      const myProfile = allProviders.find((p) => p.user_id === user?.id);
      setProviderProfile(myProfile || null);

      if (myProfile) {
        const revRes = await api.get(`/providers/${myProfile.id}/reviews`);
        setProviderReviews(revRes.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateMe({ name: name.trim(), phone: phone.trim(), email: email.trim() });
      await refreshUser();
      setEditing(false);
      customAlert('Saved', 'Your profile has been updated.');
    } catch (err) {
      customAlert('Error', err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    customAlert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const needsOnboarding = isProvider && (!providerProfile || !providerProfile.categories || providerProfile.categories.length === 0);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, isProvider && { backgroundColor: Colors.teal }]}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>
          {isProvider ? 'Service Provider' : 'Customer'}
        </Text>
      </View>

      {/* Provider Onboarding Alert */}
      {isProvider && needsOnboarding && !profileLoading && (
        <TouchableOpacity
          style={styles.onboardingAlert}
          onPress={() => navigation.navigate('ProviderOnboarding')}
          activeOpacity={0.8}
        >
          <Ionicons name="warning" size={22} color="#92400E" />
          <View style={{ flex: 1 }}>
            <Text style={styles.onboardingAlertTitle}>Complete Your Profile</Text>
            <Text style={styles.onboardingAlertText}>
              Select your service categories to start receiving customer requests.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#92400E" />
        </TouchableOpacity>
      )}

      {/* Provider Service Profile Card */}
      {isProvider && providerProfile && providerProfile.categories?.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Service Profile</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProviderOnboarding')}>
              <Ionicons name="create-outline" size={20} color={Colors.teal} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Categories</Text>
          <View style={styles.catRow}>
            {providerProfile.categories.map((cat) => (
              <View key={cat.id} style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{cat.name}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{providerProfile.location || 'Not set'}</Text>

          <Text style={styles.label}>Experience</Text>
          <Text style={styles.value}>{providerProfile.experience_years || 0} years</Text>

          {providerProfile.rating_avg > 0 && (
            <>
              <Text style={styles.label}>Rating</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <StarRating rating={providerProfile.rating_avg} size={14} />
                <Text style={styles.value}>
                  {providerProfile.rating_avg.toFixed(1)} ({providerProfile.rating_count} reviews)
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Customer Reviews Section on Provider Profile */}
      {isProvider && providerReviews.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Reviews ({providerReviews.length})</Text>
          <View style={{ marginTop: Spacing.sm }}>
            {providerReviews.map((rev) => (
              <View key={rev.id} style={styles.revItem}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StarRating rating={rev.rating} size={12} />
                  <Text style={{ fontSize: 11, color: Colors.muted }}>
                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}
                  </Text>
                </View>
                {rev.comment && (
                  <Text style={styles.revComment}>{rev.comment}</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Account Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Account Details</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={20} color={Colors.teal} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>Name</Text>
        {editing ? (
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        ) : (
          <Text style={styles.value}>{user?.name}</Text>
        )}

        <Text style={styles.label}>Email</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        ) : (
          <Text style={styles.value}>{user?.email}</Text>
        )}

        <Text style={styles.label}>Phone</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{user?.phone}</Text>
        )}

        {editing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelEditBtn}
              onPress={() => {
                setEditing(false);
                setName(user?.name || '');
                setPhone(user?.phone || '');
                setEmail(user?.email || '');
              }}
            >
              <Text style={styles.cancelEditText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* AI Support Chatbot Button */}
      <TouchableOpacity
        style={styles.supportCard}
        onPress={() => navigation.navigate('SupportChat')}
        activeOpacity={0.8}
      >
        <Ionicons name="headset" size={22} color={Colors.teal} />
        <Text style={styles.supportCardText}>24/7 AI Support Chatbot</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.paper },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.teal,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: { fontSize: 32, color: Colors.white, ...Fonts.bold },
  userName: { fontSize: 20, color: Colors.ink, ...Fonts.bold },
  userRole: { fontSize: 13, color: Colors.muted, ...Fonts.medium, marginTop: 2 },

  onboardingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginBottom: Spacing.md,
  },
  onboardingAlertTitle: { fontSize: 14, color: '#92400E', ...Fonts.bold },
  onboardingAlertText: { fontSize: 12, color: '#78350F', marginTop: 2 },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  cardTitle: { fontSize: 16, color: Colors.ink, ...Fonts.semibold },

  label: { fontSize: 12, color: Colors.muted, ...Fonts.medium, marginTop: Spacing.md, marginBottom: 4 },
  value: { fontSize: 15, color: Colors.ink, ...Fonts.regular },
  input: {
    backgroundColor: Colors.paper,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.ink,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catBadge: {
    backgroundColor: Colors.tealBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  catBadgeText: { fontSize: 12, color: Colors.tealDeep, ...Fonts.medium },

  revItem: {
    backgroundColor: Colors.paper,
    borderRadius: Radius.sm,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  revComment: { fontSize: 13, color: Colors.ink, marginTop: 4, lineHeight: 18 },

  editActions: { marginTop: Spacing.lg },
  saveBtn: {
    backgroundColor: Colors.teal,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 15, color: Colors.white, ...Fonts.semibold },
  cancelEditBtn: { alignItems: 'center', marginTop: Spacing.sm, paddingVertical: 8 },
  cancelEditText: { fontSize: 14, color: Colors.muted },

  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    gap: 12,
  },
  supportCardText: { flex: 1, fontSize: 15, color: Colors.ink, ...Fonts.medium },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.dangerBg,
    backgroundColor: Colors.dangerBg,
  },
  logoutText: { fontSize: 15, color: Colors.danger, ...Fonts.semibold },
});
