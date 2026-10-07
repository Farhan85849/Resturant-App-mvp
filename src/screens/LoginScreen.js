// src/screens/LoginScreen.js
// Q3 (useState) + Q6 (useAuth, useForm, useTheme)
import React, { useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
  Switch,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useForm from '../hooks/useForm';
import users from '../data/users';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*\d).{8,}$/;

function validateLogin(values) {
  const errs = {};
  if (!EMAIL_RE.test(values.email)) errs.email = 'Enter a valid email address.';
  if (!PASSWORD_RE.test(values.password)) errs.password = 'Password must be ≥8 chars and contain a digit.';
  return errs;
}

function validateSignup(values) {
  const errs = {};
  if (!values.name.trim()) errs.name = 'Full name is required.';
  if (!EMAIL_RE.test(values.email)) errs.email = 'Enter a valid email address.';
  if (!PASSWORD_RE.test(values.password)) errs.password = 'Password must be ≥8 chars and contain a digit.';
  if (values.password !== values.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
  return errs;
}

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [mode, setMode] = React.useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = React.useState(false);
  const [role, setRole] = React.useState('customer');
  const [authError, setAuthError] = React.useState(null);

  const loginInitial = { email: '', password: '' };
  const signupInitial = { name: '', email: '', password: '', confirmPassword: '' };

  const loginForm = useForm(loginInitial, validateLogin);
  const signupForm = useForm(signupInitial, validateSignup);

  const form = mode === 'login' ? loginForm : signupForm;

  const handleLogin = useCallback(async (values) => {
    setAuthError(null);
    await new Promise((r) => setTimeout(r, 1000)); // simulate network
    const found = users.find(
      (u) => u.email === values.email && u.password === values.password
    );
    if (!found) {
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      setAuthError('Invalid email or password. Please try again.');
      return;
    }
    login(found);
  }, [login]);

  const handleSignup = useCallback(async (values) => {
    setAuthError(null);
    await new Promise((r) => setTimeout(r, 1000));
    const exists = users.find((u) => u.email === values.email);
    if (exists) {
      Alert.alert('Sign Up Failed', 'An account with this email already exists.');
      setAuthError('An account with this email already exists.');
      return;
    }
    const newUser = {
      id: `u${Date.now()}`,
      name: values.name,
      email: values.email,
      password: values.password,
      role,
    };
    users.push(newUser);
    login(newUser);
  }, [login, role]);

  const s = styles(theme);

  const renderField = (label, field, extra = {}) => (
    <View style={s.fieldWrap} key={field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.input, form.errors[field] && s.inputError]}
        value={form.values[field]}
        onChangeText={(v) => form.handleChange(field, v)}
        placeholderTextColor={theme.placeholder}
        {...extra}
      />
      {form.errors[field] ? <Text style={s.errorText}>{form.errors[field]}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>🍽️ Saveur</Text>
        <Text style={s.subtitle}>
          {mode === 'login' ? 'Welcome back!' : 'Create your account'}
        </Text>

        {mode === 'signup' &&
          renderField('Full Name', 'name', { placeholder: 'e.g. Ali Hassan' })}
        {renderField('Email', 'email', {
          placeholder: 'you@example.com',
          keyboardType: 'email-address',
          autoCapitalize: 'none',
        })}

        <View style={s.fieldWrap}>
          <Text style={s.label}>Password</Text>
          <View style={s.passwordRow}>
            <TextInput
              style={[s.input, { flex: 1 }, form.errors.password && s.inputError]}
              value={form.values.password}
              onChangeText={(v) => form.handleChange('password', v)}
              secureTextEntry={!showPassword}
              placeholder="Min 8 chars, 1 digit"
              placeholderTextColor={theme.placeholder}
              onSubmitEditing={() => {
                if (mode === 'login') form.handleSubmit(handleLogin);
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={s.eyeBtn}
            >
              <Text style={{ color: theme.primary }}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {form.errors.password ? <Text style={s.errorText}>{form.errors.password}</Text> : null}
        </View>

        {mode === 'signup' && (
          <>
            {renderField('Confirm Password', 'confirmPassword', {
              placeholder: 'Repeat password',
              secureTextEntry: !showPassword,
              onSubmitEditing: () => form.handleSubmit(handleSignup)
            })}
            <View style={s.fieldWrap}>
              <Text style={s.label}>Role</Text>
              <View style={s.roleRow}>
                {['customer', 'manager'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[s.roleChip, role === r && s.roleChipActive]}
                    onPress={() => setRole(r)}
                  >
                    <Text style={[s.roleChipText, role === r && s.roleChipTextActive]}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {authError ? (
          <Text style={[s.errorText, { textAlign: 'center', marginBottom: 12, fontSize: 14 }]}>
            {authError}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[s.btn, form.isSubmitting && s.btnDisabled]}
          onPress={() => form.handleSubmit(mode === 'login' ? handleLogin : handleSignup)}
          disabled={form.isSubmitting}
        >
          {form.isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.btnText}>
              {mode === 'login' ? 'Login' : 'Sign Up'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setShowPassword(false);
          }}
        >
          <Text style={s.toggleText}>
            {mode === 'login'
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Login'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flexGrow: 1, padding: 24, paddingTop: 60 },
    title: { fontSize: 36, fontWeight: '800', color: theme.primary, textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginBottom: 32 },
    fieldWrap: { marginBottom: 16 },
    label: { fontSize: 14, color: theme.text, marginBottom: 6, fontWeight: '600' },
    input: {
      backgroundColor: theme.inputBg,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
    },
    inputError: { borderColor: theme.error },
    errorText: { color: theme.error, fontSize: 12, marginTop: 4 },
    passwordRow: { flexDirection: 'row', alignItems: 'center' },
    eyeBtn: { padding: 10 },
    roleRow: { flexDirection: 'row', gap: 12 },
    roleChip: {
      flex: 1, paddingVertical: 10, borderRadius: 8,
      backgroundColor: theme.chipBg, alignItems: 'center',
      borderWidth: 1, borderColor: theme.border,
    },
    roleChipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    roleChipText: { color: theme.chipText, fontWeight: '600' },
    roleChipTextActive: { color: '#fff' },
    btn: {
      backgroundColor: theme.primary, borderRadius: 12,
      paddingVertical: 16, alignItems: 'center', marginBottom: 16, marginTop: 8,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    toggleText: { color: theme.primary, textAlign: 'center', fontWeight: '600' },
  });
