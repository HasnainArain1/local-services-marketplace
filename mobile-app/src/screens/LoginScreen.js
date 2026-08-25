import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../theme';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api';
import { customAlert } from '../utils/alert';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return customAlert('Missing Fields', 'Please enter your email and password.');
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const msg = getErrorMessage(err, 'Invalid credentials. Please try again.');
      customAlert('Login Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="construct" size={36} color={Colors.teal} />
          </View>
          <Text style={styles.brandTitle}>Service Marketplace</Text>
          <Text style={styles.brandSub}>Book trusted local professionals</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="customer@example.com"
              placeholderTextColor={Colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.muted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.muted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.btnText}>Log In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.paper },
  container: { padding: Spacing.xl, flexGrow: 1, justifyContent: 'center' },

  brandContainer: { alignItems: 'center', marginBottom: Spacing.xxl },
  logoBadge: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.tealBg,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  brandTitle: { fontSize: 24, color: Colors.ink, ...Fonts.bold },
  brandSub: { fontSize: 14, color: Colors.muted, ...Fonts.regular, marginTop: 4 },

  form: { width: '100%' },
  label: { fontSize: 13, color: Colors.inkSoft, ...Fonts.medium, marginBottom: 6, marginTop: Spacing.md },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 15, color: Colors.ink },
  eyeBtn: { padding: 8 },

  btn: {
    backgroundColor: Colors.teal,
    borderRadius: Radius.md,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  btnText: { fontSize: 16, color: Colors.white, ...Fonts.semibold },

  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: 14, color: Colors.muted },
  linkText: { fontSize: 14, color: Colors.teal, ...Fonts.semibold },
});
