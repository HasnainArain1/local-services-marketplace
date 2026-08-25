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

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [role, setRole] = useState('customer'); // 'customer' or 'provider'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      return customAlert('Missing Fields', 'Please fill in all fields.');
    }

    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), phone.trim(), password, role);
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to create account.');
      customAlert('Signup Error', msg);
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subTitle}>Sign up as a Customer or Service Provider</Text>

        {/* Role Selector */}
        <Text style={styles.label}>I am signing up as a:</Text>
        <View style={styles.roleToggleRow}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'customer' && styles.roleBtnActive]}
            onPress={() => setRole('customer')}
          >
            <Ionicons name="person" size={18} color={role === 'customer' ? Colors.white : Colors.inkSoft} />
            <Text style={[styles.roleBtnText, role === 'customer' && styles.roleBtnTextActive]}>
              Customer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn, role === 'provider' && styles.roleBtnActive]}
            onPress={() => setRole('provider')}
          >
            <Ionicons name="construct" size={18} color={role === 'provider' ? Colors.white : Colors.inkSoft} />
            <Text style={[styles.roleBtnText, role === 'provider' && styles.roleBtnTextActive]}>
              Service Provider
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder={role === 'provider' ? 'e.g. Ali Plumbing Services' : 'John Doe'}
          placeholderTextColor={Colors.muted}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="email@example.com"
          placeholderTextColor={Colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="03001234567"
          placeholderTextColor={Colors.muted}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={Colors.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.btnText}>Create {role === 'provider' ? 'Provider' : 'Customer'} Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.paper },
  container: { padding: Spacing.xl, flexGrow: 1, justifyContent: 'center' },

  title: { fontSize: 24, color: Colors.ink, ...Fonts.bold },
  subTitle: { fontSize: 14, color: Colors.muted, ...Fonts.regular, marginTop: 4, marginBottom: Spacing.lg },

  label: { fontSize: 13, color: Colors.inkSoft, ...Fonts.medium, marginBottom: 6, marginTop: Spacing.md },

  roleToggleRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.sm },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleBtnActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  roleBtnText: { fontSize: 14, color: Colors.inkSoft, ...Fonts.semibold },
  roleBtnTextActive: { color: Colors.white },

  input: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.ink,
    borderWidth: 1,
    borderColor: Colors.border,
  },

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
