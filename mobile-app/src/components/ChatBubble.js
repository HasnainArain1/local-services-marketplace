/**
 * ChatBubble — single message in the chat view.
 * Right-aligned (teal) for the current user, left-aligned (grey) for the other party.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '../theme';

export default function ChatBubble({ content, isMine, timestamp }) {
  return (
    <View style={[styles.row, isMine ? styles.rowRight : styles.rowLeft]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.text, isMine && { color: Colors.white }]}>{content}</Text>
        {timestamp && (
          <Text style={[styles.time, isMine && { color: 'rgba(255,255,255,0.65)' }]}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: Spacing.sm, paddingHorizontal: Spacing.md },
  rowRight: { alignItems: 'flex-end' },
  rowLeft: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  bubbleMine: {
    backgroundColor: Colors.teal,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#EDECE6',
    borderBottomLeftRadius: 4,
  },
  text: { fontSize: 15, color: Colors.ink, ...Fonts.regular, lineHeight: 21 },
  time: { fontSize: 10, color: Colors.muted, marginTop: 4, textAlign: 'right' },
});
