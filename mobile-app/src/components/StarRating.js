/**
 * StarRating — interactive (input) and static (display) star component.
 * Pass `editable` to make it tappable.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

export default function StarRating({ rating = 0, size = 24, editable = false, onChange }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.row}>
      {stars.map((s) => {
        const filled = s <= Math.round(rating);
        const icon = filled ? 'star' : 'star-outline';
        const color = filled ? Colors.amber : Colors.border;

        if (editable) {
          return (
            <TouchableOpacity key={s} onPress={() => onChange?.(s)} activeOpacity={0.6}>
              <Ionicons name={icon} size={size} color={color} style={styles.star} />
            </TouchableOpacity>
          );
        }
        return <Ionicons key={s} name={icon} size={size} color={color} style={styles.star} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  star: { marginRight: 2 },
});
