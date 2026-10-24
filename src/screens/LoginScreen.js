// src/screens/LoginScreen.js
// Professional, responsive authentication screen with quick-demo autofill & cross-platform layout

import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useForm from '../hooks/useForm';
import { apiFetch } from '../api/client';

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

export default function LoginScreen() {
  const { login } = useAuth();
  const { theme } = useTheme();

  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('customer');
  const [authError, setAuthError] = useState(null);

  const loginForm = useForm({ email: '', password: '' }, validateLogin);
  const signupForm = useForm(
    { name: '', email: '', password: '', confirmPassword: '' },
    validateSignup
  );
  const form = mode === 'login' ? loginForm : signupForm;

  const handleLogin = useCallback(async (values) => {
    setAuthError(null);
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: values.email, password: values.password }),
      });
      await login(data);
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please verify credentials.');
    }
  }, [login]);

  const handleSignup = useCallback(async (values) => {
    setAuthError(null);
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          role,
        }),
      });
      await login(data);
    } catch (err) {
      setAuthError(err.message || 'Sign up failed. Please try again.');
    }
  }, [login, role]);

  // Demo login autofill helper
  const fillDemo = (demoEmail, demoPassword) => {
    setMode('login');
    loginForm.handleChange('email', demoEmail);
    loginForm.handleChange('password', demoPassword);
    setAuthError(null);
  };

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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.cardWrapper}>
          {/* Logo & Header */}
          <View style={s.header}>
            <View style={s.logoCircle}>
              <Text style={{ fontSize: 32 }}>🍽️</Text>
            </View>
            <Text style={s.title}>Saveur</Text>
            <Text style={s.tagline}>FINE DINING & ARTISAN BISTRO</Text>
            <Text style={s.subtitle}>
              {mode === 'login' ? 'Sign in to savor your favorite dishes' : 'Create an account to begin'}
            </Text>
          </View>

          {/* Quick Demo Autofill Bar */}
          {mode === 'login' && (
            <View style={s.demoSection}>
              <Text style={s.demoHeading}>QUICK DEMO ACCESS:</Text>
              <View style={s.demoBtnRow}>
                <TouchableOpacity
                  style={s.demoBtn}
                  onPress={() => fillDemo('customer@demo.com', 'Customer1')}
                  activeOpacity={0.8}
                >
                  <Text style={s.demoBtnText}>👤 Customer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.demoBtn}
                  onPress={() => fillDemo('manager@demo.com', 'Manager1')}
                  activeOpacity={0.8}
                >
                  <Text style={s.demoBtnText}>👔 Manager</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Form Fields */}
          {mode === 'signup' &&
            renderField('Full Name', 'name', { placeholder: 'e.g. Farhan Ahmed' })}

          {renderField('Email Address', 'email', {
            placeholder: 'your.email@example.com',
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
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {form.errors.password ? <Text style={s.errorText}>{form.errors.password}</Text> : null}
          </View>

          {mode === 'signup' && (
            <>
              {renderField('Confirm Password', 'confirmPassword', {
                placeholder: 'Repeat your password',
                secureTextEntry: !showPassword,
              })}

              <View style={s.fieldWrap}>
                <Text style={s.label}>Select Role</Text>
                <View style={s.roleRow}>
                  {['customer', 'manager'].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[s.roleChip, role === r && s.roleChipActive]}
                      onPress={() => setRole(r)}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.roleChipText, role === r && s.roleChipTextActive]}>
                        {r === 'customer' ? '👤 Customer' : '👔 Manager'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {authError ? (
            <View style={s.errorBox}>
              <Text style={s.errorBoxText}>{authError}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={[s.btn, form.isSubmitting && s.btnDisabled]}
            onPress={() => form.handleSubmit(mode === 'login' ? handleLogin : handleSignup)}
            disabled={form.isSubmitting}
            activeOpacity={0.85}
          >
            {form.isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>{mode === 'login' ? 'Sign In →' : 'Create Account →'}</Text>
            )}
          </TouchableOpacity>

          {/* Toggle Login / Sign Up */}
          <TouchableOpacity
            onPress={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setShowPassword(false);
              setAuthError(null);
            }}
            activeOpacity={0.7}
          >
            <Text style={s.toggleText}>
              {mode === 'login'
                ? "Don't have an account? Create one"
                : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      paddingVertical: 40,
    },
    cardWrapper: {
      width: '100%',
      maxWidth: 460,
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 28,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: theme.isDark ? 0.4 : 0.08,
      shadowRadius: 16,
      elevation: 5,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    logoCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.primary + '18',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 30,
      fontWeight: '900',
      color: theme.primary,
      letterSpacing: -0.5,
      marginBottom: 2,
    },
    tagline: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 2,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    demoSection: {
      backgroundColor: theme.chipBg,
      borderRadius: 14,
      padding: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    demoHeading: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.8,
      marginBottom: 8,
      textAlign: 'center',
    },
    demoBtnRow: {
      flexDirection: 'row',
      gap: 10,
    },
    demoBtn: {
      flex: 1,
      backgroundColor: theme.surface,
      paddingVertical: 8,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    demoBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
    },
    fieldWrap: {
      marginBottom: 16,
    },
    label: {
      fontSize: 13,
      color: theme.text,
      marginBottom: 6,
      fontWeight: '700',
    },
    input: {
      backgroundColor: theme.inputBg,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
    },
    inputError: {
      borderColor: theme.error,
    },
    errorText: {
      color: theme.error,
      fontSize: 12,
      marginTop: 4,
    },
    errorBox: {
      backgroundColor: theme.error + '15',
      borderRadius: 10,
      padding: 10,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: theme.error + '30',
    },
    errorBoxText: {
      color: theme.error,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
    },
    passwordRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    eyeBtn: {
      position: 'absolute',
      right: 12,
      padding: 6,
    },
    roleRow: {
      flexDirection: 'row',
      gap: 10,
    },
    roleChip: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: theme.chipBg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    roleChipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    roleChipText: {
      color: theme.chipText,
      fontWeight: '700',
      fontSize: 13,
    },
    roleChipTextActive: {
      color: '#FFFFFF',
    },
    btn: {
      backgroundColor: theme.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 16,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    btnDisabled: {
      opacity: 0.6,
    },
    btnText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 16,
      letterSpacing: 0.3,
    },
    toggleText: {
      color: theme.primary,
      textAlign: 'center',
      fontWeight: '700',
      fontSize: 14,
      paddingVertical: 6,
    },
  });
