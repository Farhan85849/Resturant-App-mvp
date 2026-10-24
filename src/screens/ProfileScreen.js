// src/screens/ProfileScreen.js
// Responsive, elegant profile screen with theme toggle & logout

import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const s = styles(theme);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to log out?')) {
        logout();
      }
      return;
    }
    Alert.alert('Logout', 'Are you sure you want to log out of Saveur?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
      <View style={s.responsiveContainer}>
        {/* User Avatar Card */}
        <View style={s.profileCard}>
          <View style={s.avatarWrap}>
            <Text style={s.avatar}>{user?.name?.[0]?.toUpperCase() ?? '👤'}</Text>
          </View>
          <Text style={s.name}>{user?.name || 'Valued Guest'}</Text>
          <Text style={s.email}>{user?.email || 'guest@saveur.com'}</Text>
          <View style={s.roleBadge}>
            <Text style={s.roleText}>
              {user?.role === 'manager' ? '👔 RESTAURANT MANAGER' : '⭐ VIP CUSTOMER'}
            </Text>
          </View>
        </View>

        {/* Settings & Preferences */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Preferences</Text>

          <View style={s.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 20 }}>🌙</Text>
              <View>
                <Text style={s.rowLabel}>Dark Appearance</Text>
                <Text style={s.rowSub}>Switch between light and dark ambient theme</Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={isDark ? '#fff' : theme.textSecondary}
            />
          </View>
        </View>

        {/* About App */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>About Saveur</Text>
          <Text style={s.aboutText}>
            Saveur Bistro & Grill • Version 2.0 (Full-Stack MongoDB Edition)
          </Text>
          <Text style={s.aboutSub}>
            Crafted for premium mobile dining and instant table reservations.
          </Text>
        </View>

        {/* Logout CTA */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={s.logoutText}>Log Out from Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      padding: 20,
    },
    responsiveContainer: {
      width: '100%',
      maxWidth: 540,
      alignSelf: 'center',
    },
    profileCard: {
      backgroundColor: theme.surface,
      borderRadius: 22,
      padding: 24,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    avatarWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 4,
    },
    avatar: {
      fontSize: 34,
      color: '#FFFFFF',
      fontWeight: '900',
    },
    name: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.text,
      marginBottom: 4,
      letterSpacing: -0.3,
    },
    email: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 12,
      fontWeight: '500',
    },
    roleBadge: {
      backgroundColor: theme.primary + '18',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
    },
    roleText: {
      color: theme.primary,
      fontWeight: '800',
      fontSize: 11,
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 14,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rowLabel: {
      fontSize: 15,
      color: theme.text,
      fontWeight: '700',
    },
    rowSub: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    aboutText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    aboutSub: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    logoutBtn: {
      backgroundColor: theme.error + '18',
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.error + '30',
      marginTop: 8,
    },
    logoutText: {
      color: theme.error,
      fontWeight: '800',
      fontSize: 15,
      letterSpacing: 0.3,
    },
  });
