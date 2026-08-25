/**
 * EmptyState — displayed when a list has no data.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '../theme';

export default function EmptyState({ icon = 'file-tray-outline', title, message }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={Colors.border} />
      <Text style={styles.title}>{title || 'Nothing here yet'}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  title: { fontSize: 17, color: Colors.inkSoft, ...Fonts.semibold, marginTop: Spacing.md },
  message: {
    fontSize: 14,
    color: Colors.muted,
    ...Fonts.regular,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
});
