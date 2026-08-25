/**
 * StatusStepper — clean visual timeline step indicator for request lifecycle.
 * Perfectly aligns step numbers, icons, and connecting lines without overlapping.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, STATUS_FLOW, StatusStyle } from '../theme';

export default function StatusStepper({ currentStatus }) {
  const currentIdx = STATUS_FLOW.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  return (
    <View style={styles.container}>
      {STATUS_FLOW.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isLast = idx === STATUS_FLOW.length - 1;
        const ss = StatusStyle[step];

        return (
          <View key={step} style={styles.itemRow}>
            {/* Left Column: Circle & Vertical Connecting Line */}
            <View style={styles.leftCol}>
              <View
                style={[
                  styles.circle,
                  isDone && { backgroundColor: Colors.teal },
                  isCurrent && {
                    backgroundColor: Colors.amber,
                    borderWidth: 3,
                    borderColor: Colors.amberBg,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                  },
                  !isDone && !isCurrent && {
                    backgroundColor: Colors.paper,
                    borderWidth: 1.5,
                    borderColor: Colors.border,
                  },
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark-sharp" size={14} color={Colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.stepNum,
                      isCurrent && { color: Colors.white, fontWeight: '700' },
                      !isDone && !isCurrent && { color: Colors.muted },
                    ]}
                  >
                    {idx + 1}
                  </Text>
                )}
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: isDone ? Colors.teal : Colors.border },
                  ]}
                />
              )}
            </View>

            {/* Right Column: Label & Tone */}
            <View style={styles.rightCol}>
              <Text
                style={[
                  styles.stepLabel,
                  isDone && { color: Colors.teal, ...Fonts.semibold },
                  isCurrent && { color: ss?.fg || Colors.amberDeep, ...Fonts.bold, fontSize: 15 },
                  !isDone && !isCurrent && { color: Colors.muted },
                ]}
              >
                {ss?.label || step}
              </Text>
            </View>
          </View>
        );
      })}

      {isCancelled && (
        <View style={styles.itemRow}>
          <View style={styles.leftCol}>
            <View style={[styles.circle, { backgroundColor: Colors.danger }]}>
              <Ionicons name="close-sharp" size={14} color={Colors.white} />
            </View>
          </View>
          <View style={styles.rightCol}>
            <Text style={[styles.stepLabel, { color: Colors.danger, ...Fonts.bold }]}>
              Request Cancelled
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 40,
  },
  leftCol: {
    alignItems: 'center',
    width: 32,
    marginRight: Spacing.md,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 14,
    marginVertical: 3,
  },
  rightCol: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 3,
  },
  stepNum: {
    fontSize: 12,
    lineHeight: 14,
    textAlign: 'center',
    includeFontPadding: false,
    ...Fonts.medium,
  },
  stepLabel: {
    fontSize: 14,
    color: Colors.muted,
    ...Fonts.regular,
  },
});
