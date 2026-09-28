// src/screens/ProfileScreen.js
// Q6: shows user info and theme toggle
import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const s = styles(theme);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={s.container}>
      <View style={s.avatarWrap}>
        <Text style={s.avatar}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
      </View>
      <Text style={s.name}>{user?.name}</Text>
      <Text style={s.email}>{user?.email}</Text>
      <View style={s.roleBadge}>
        <Text style={s.roleText}>{user?.role?.toUpperCase()}</Text>
      </View>

      <View style={s.card}>
        <View style={s.row}>
          <Text style={s.rowLabel}>🌙  Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={isDark ? '#fff' : theme.textSecondary}
          />
        </View>
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, alignItems: 'center', padding: 24 },
    avatarWrap: {
      width: 90, height: 90, borderRadius: 45,
      backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center',
      marginTop: 40, marginBottom: 12,
    },
    avatar: { fontSize: 36, color: '#fff', fontWeight: '800' },
    name: { fontSize: 22, fontWeight: '700', color: theme.text, marginBottom: 4 },
    email: { fontSize: 14, color: theme.textSecondary, marginBottom: 8 },
    roleBadge: {
      backgroundColor: theme.primary + '22', paddingHorizontal: 16, paddingVertical: 4,
      borderRadius: 20, marginBottom: 32,
    },
    roleText: { color: theme.primary, fontWeight: '700', fontSize: 12 },
    card: {
      width: '100%', backgroundColor: theme.card, borderRadius: 16,
      padding: 16, marginBottom: 24,
      shadowColor: theme.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
      elevation: 3,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rowLabel: { fontSize: 16, color: theme.text, fontWeight: '600' },
    logoutBtn: {
      backgroundColor: theme.error + '20', borderRadius: 12,
      paddingVertical: 14, paddingHorizontal: 40,
    },
    logoutText: { color: theme.error, fontWeight: '700', fontSize: 16 },
  });
