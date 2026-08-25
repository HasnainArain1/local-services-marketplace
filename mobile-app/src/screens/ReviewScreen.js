import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '../theme';
import { reviewsApi, getErrorMessage } from '../api';
import StarRating from '../components/StarRating';
import { customAlert } from '../utils/alert';

export default function ReviewScreen({ route, navigation }) {
  const { requestId, providerId } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      return customAlert('Rating Required', 'Please select a star rating.');
    }

    setSubmitting(true);
    try {
      await reviewsApi.create({
        request_id: requestId,
        provider_id: providerId,
        rating,
        comment: comment.trim(),
      });
      customAlert('Thank You!', 'Your review has been submitted.', [
        { text: 'Done', onPress: () => navigation.popToTop() },
      ]);
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to submit review.');
      customAlert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Rate Your Experience</Text>
      <Text style={styles.subTitle}>How was the service provided?</Text>

      {/* Star rating picker */}
      <View style={styles.starContainer}>
        <StarRating rating={rating} onRate={setRating} size={36} editable />
      </View>

      {/* Comment text */}
      <Text style={styles.label}>Comment (optional)</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Write a few lines about the service..."
        placeholderTextColor={Colors.muted}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        value={comment}
        onChangeText={setComment}
      />

      {/* Submit button */}
      <TouchableOpacity
        style={[styles.btn, submitting && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.8}
      >
        {submitting ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.btnText}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.paper },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  title: { fontSize: 22, color: Colors.ink, ...Fonts.bold, marginBottom: 4 },
  subTitle: { fontSize: 14, color: Colors.muted, ...Fonts.regular, marginBottom: Spacing.xl },

  starContainer: { alignItems: 'center', marginVertical: Spacing.lg },

  label: { fontSize: 13, color: Colors.inkSoft, ...Fonts.medium, marginBottom: 6, marginTop: Spacing.md },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.ink,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
  },

  btn: {
    backgroundColor: Colors.teal,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  btnText: { fontSize: 16, color: Colors.white, ...Fonts.semibold },
});
