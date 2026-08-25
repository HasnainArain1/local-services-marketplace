/**
 * ProviderOnboardingScreen — lets a newly registered provider
 * select their service categories, location, experience, and bio.
 * Calls POST /providers/ or PUT /providers/{id} to persist to DB.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Fonts, Spacing, Radius } from '../theme';
import { categoriesApi, getErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import { customAlert } from '../utils/alert';
import api from '../api';

export default function ProviderOnboardingScreen({ navigation }) {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch available categories
      const catRes = await categoriesApi.list();
      setCategories(catRes.data || []);

      // Check if provider already has a profile
      const provRes = await api.get('/providers/');
      const allProviders = provRes.data || [];
      const myProfile = allProviders.find((p) => p.user_id === user?.id);

      if (myProfile) {
        setExistingProfile(myProfile);
        setLocation(myProfile.location || '');
        setExperience(String(myProfile.experience_years || ''));
        setDescription(myProfile.raw_description || '');
        setSelectedCats((myProfile.categories || []).map((c) => c.id));
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (catId) => {
    setSelectedCats((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
    );
  };

  const handleSave = async () => {
    if (selectedCats.length === 0) {
      return customAlert('Required', 'Please select at least one service category.');
    }
    if (!location.trim()) {
      return customAlert('Required', 'Please enter your city or area.');
    }

    setSaving(true);
    try {
      const payload = {
        location: location.trim(),
        experience_years: parseInt(experience, 10) || 0,
        raw_description: description.trim(),
        category_ids: selectedCats,
      };

      if (existingProfile) {
        // Update existing profile
        await api.put(`/providers/${existingProfile.id}`, payload);
      } else {
        // Create new profile
        await api.post('/providers/', payload);
      }

      customAlert('Profile Saved!', 'Your service profile has been saved. You will now see incoming requests matching your categories.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to save provider profile.');
      customAlert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.teal} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {existingProfile ? 'Edit Service Profile' : 'Complete Your Profile'}
      </Text>
      <Text style={styles.subtitle}>
        {existingProfile
          ? 'Update your specializations and service details.'
          : 'Select your service categories so customers can find you.'}
      </Text>

      {/* Category Selection */}
      <Text style={styles.sectionLabel}>Service Categories *</Text>
      <Text style={styles.hint}>Tap to select the services you offer</Text>
      <View style={styles.catGrid}>
        {categories.map((cat) => {
          const selected = selectedCats.includes(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, selected && styles.catChipActive]}
              onPress={() => toggleCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={selected ? Colors.white : Colors.inkSoft}
              />
              <Text style={[styles.catChipText, selected && styles.catChipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Location */}
      <Text style={styles.sectionLabel}>City / Area *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Gulshan, Karachi"
        placeholderTextColor={Colors.muted}
        value={location}
        onChangeText={setLocation}
      />

      {/* Experience */}
      <Text style={styles.sectionLabel}>Years of Experience</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 5"
        placeholderTextColor={Colors.muted}
        keyboardType="numeric"
        value={experience}
        onChangeText={setExperience}
      />

      {/* Bio */}
      <Text style={styles.sectionLabel}>Short Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe your services and expertise..."
        placeholderTextColor={Colors.muted}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        value={description}
        onChangeText={setDescription}
      />

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <>
            <Ionicons name="save" size={18} color={Colors.white} />
            <Text style={styles.saveBtnText}>
              {existingProfile ? 'Update Profile' : 'Save & Start Receiving Requests'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.paper },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.paper },

  title: { fontSize: 22, color: Colors.ink, ...Fonts.bold, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.muted, ...Fonts.regular, marginBottom: Spacing.lg, lineHeight: 20 },

  sectionLabel: { fontSize: 13, color: Colors.inkSoft, ...Fonts.semibold, marginTop: Spacing.lg, marginBottom: 6 },
  hint: { fontSize: 12, color: Colors.muted, marginBottom: 8 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  catChipText: { fontSize: 13, color: Colors.inkSoft, ...Fonts.medium },
  catChipTextActive: { color: Colors.white },

  input: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.ink,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: { minHeight: 100, lineHeight: 22 },

  saveBtn: {
    backgroundColor: Colors.teal,
    borderRadius: Radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.xl,
  },
  saveBtnText: { fontSize: 15, color: Colors.white, ...Fonts.semibold },
});
