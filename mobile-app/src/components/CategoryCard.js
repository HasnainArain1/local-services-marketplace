/**
 * CategoryCard — tappable card shown in the Home category grid.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '../theme';

const CATEGORY_ICONS = {
  plumbing: 'water',
  electrical: 'flash',
  'house cleaning': 'home',
  'appliance repair': 'construct',
  tutoring: 'school',
  landscaping: 'leaf',
  'moving services': 'car',
  'personal training': 'fitness',
  'pet sitting': 'paw',
  photography: 'camera',
  'web development': 'code-slash',
  'ac repair': 'snow',
  painting: 'color-palette',
  carpentry: 'hammer',
  'home security': 'shield-checkmark',
  'cooking & catering': 'restaurant',
  'pest control': 'bug',
  'car wash & detailing': 'car-sport',
  'computer repair': 'desktop',
  'plastering & tiling': 'grid',
};

function getIcon(name) {
  const key = name?.toLowerCase();
  return CATEGORY_ICONS[key] || 'ellipsis-horizontal-circle';
}

export default function CategoryCard({ category, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={getIcon(category.name)} size={26} color={Colors.teal} />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    margin: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
    justifyContent: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.tealBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: 13,
    color: Colors.ink,
    ...Fonts.medium,
    textAlign: 'center',
  },
});
