import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../theme';
import { requestsApi, categoriesApi, getErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import { customAlert } from '../utils/alert';

export default function SubmitRequestScreen({ navigation, route }) {
  const { user } = useAuth();
  const [rawText, setRawText] = useState('');
  const [location, setLocation] = useState('');
  const [contactNumber, setContactNumber] = useState(user?.phone || '');
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(route.params?.categoryId || null);
  const [loading, setLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!rawText.trim()) {
      return customAlert('Required', 'Please describe the service you need.');
    }
    if (!location.trim()) {
      return customAlert('Required', 'Please enter your location.');
    }
    if (!contactNumber.trim()) {
      return customAlert('Required', 'Please provide a contact number.');
    }

    setLoading(true);
    try {
      const payload = {
        raw_text: rawText.trim(),
        location: location.trim(),
        contact_number: contactNumber.trim(),
      };
      if (selectedCat) {
        payload.matched_category_id = selectedCat;
      }
      const res = await requestsApi.create(payload);
      
      customAlert('Request Submitted!', 'Our AI is matching you with the best provider.', [
        { text: 'View Status', onPress: () => navigation.replace('RequestDetail', { requestId: res.data.id }) },
      ]);
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to submit request. Please try again.');
      customAlert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedCatName = categories.find((c) => c.id === selectedCat)?.name || route.params?.categoryName;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Describe Your Problem</Text>
        <Text style={styles.hint}>
          Be as specific as you can — our AI will match you to the right category and provider.
        </Text>

        {/* Problem description */}
        <Text style={styles.label}>Service Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g. My kitchen sink is leaking and the pipe under the cabinet is cracked..."
          placeholderTextColor={Colors.muted}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          value={rawText}
          onChangeText={setRawText}
        />

        {/* Category selector (optional) */}
        <Text style={styles.label}>Category (optional — AI will auto-detect)</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowCategories(!showCategories)}
          activeOpacity={0.8}
        >
          <Text style={[styles.selectorText, !selectedCatName && { color: Colors.muted }]}>
            {selectedCatName || 'Let AI choose'}
          </Text>
          <Ionicons name={showCategories ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.muted} />
        </TouchableOpacity>

        {showCategories && (
          <View style={styles.dropdownContainer}>
            <ScrollView
              nestedScrollEnabled
              style={{ maxHeight: 180 }}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => { setSelectedCat(null); setShowCategories(false); }}
              >
                <Text style={styles.dropdownText}>Let AI choose</Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.dropdownItem, selectedCat === cat.id && styles.dropdownItemActive]}
                  onPress={() => { setSelectedCat(cat.id); setShowCategories(false); }}
                >
                  <Text style={[styles.dropdownText, selectedCat === cat.id && { color: Colors.teal, ...Fonts.semibold }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Location */}
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Gulshan Block 5, Karachi"
          placeholderTextColor={Colors.muted}
          value={location}
          onChangeText={setLocation}
        />

        {/* Contact */}
        <Text style={styles.label}>Contact Number</Text>
        <TextInput
          style={styles.input}
          placeholder="03XX-XXXXXXX"
          placeholderTextColor={Colors.muted}
          keyboardType="phone-pad"
          value={contactNumber}
          onChangeText={setContactNumber}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="send" size={18} color={Colors.white} />
              <Text style={styles.btnText}>Submit Request</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.paper },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  title: { fontSize: 22, color: Colors.ink, ...Fonts.bold, marginBottom: 4 },
  hint: { fontSize: 14, color: Colors.muted, ...Fonts.regular, marginBottom: Spacing.md, lineHeight: 20 },

  label: { fontSize: 13, color: Colors.inkSoft, ...Fonts.medium, marginBottom: 6, marginTop: Spacing.md },
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
  textArea: { minHeight: 110, lineHeight: 22 },

  selector: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: { fontSize: 15, color: Colors.ink },
  dropdownContainer: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 6,
    marginBottom: 6,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemActive: { backgroundColor: Colors.tealBg },
  dropdownText: { fontSize: 14, color: Colors.ink },

  btn: {
    backgroundColor: Colors.teal,
    borderRadius: Radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.xl,
  },
  btnText: { fontSize: 16, color: Colors.white, ...Fonts.semibold },
});
