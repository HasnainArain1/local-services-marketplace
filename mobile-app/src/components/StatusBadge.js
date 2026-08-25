/**
 * StatusBadge — colour-coded pill showing the current status of a request.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusStyle, Radius, Fonts } from '../theme';

export default function StatusBadge({ status, style }) {
  const s = StatusStyle[status] || { bg: '#EDECE6', fg: '#6B7280', label: status };

  return (
    <View style={[styles.badge, { backgroundColor: s.bg }, style]}>
      <Text style={[styles.label, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    ...Fonts.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
