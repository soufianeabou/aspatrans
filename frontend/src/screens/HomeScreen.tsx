import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue</Text>
      {user && (
        <>
          <Text style={styles.info}>Nom: {user.full_name}</Text>
          <Text style={styles.info}>Email: {user.email}</Text>
          <Text style={styles.role}>Rôle: {user.role}</Text>
        </>
      )}
      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '800', color: '#2196F3', marginBottom: 16, textAlign: 'center' },
  info: { fontSize: 16, marginBottom: 4, color: '#333', textAlign: 'center' },
  role: { fontSize: 16, marginBottom: 16, color: '#FF9800', textAlign: 'center', fontWeight: '700' },
  logout: { backgroundColor: '#FF9800', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  logoutText: { color: '#fff', fontWeight: '700' }
});


