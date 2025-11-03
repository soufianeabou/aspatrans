import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminDashboard({ navigation }: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pendingRequests: 0, pendingContracts: 0, activeTrips: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    if (!user) return;
    try {
      setLoading(true);
      const [requestsRes, contractsRes] = await Promise.all([
        api.get('/api/admin/requests?status=pending'),
        api.get('/api/contracts/pending'),
      ]);
      
      const pendingRequests = requestsRes.data.requests?.length || 0;
      const pendingContracts = contractsRes.data.contracts?.length || 0;
      
      setStats({
        pendingRequests,
        pendingContracts,
        activeTrips: 0, // TODO: implement trips
      });
      
      setRecentRequests(requestsRes.data.requests?.slice(0, 5) || []);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user]);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord Admin</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pendingRequests}</Text>
          <Text style={styles.statLabel}>Demandes en attente</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pendingContracts}</Text>
          <Text style={styles.statLabel}>Contrats pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeTrips}</Text>
          <Text style={styles.statLabel}>Trajets actifs</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Demandes récentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RequestsManagement')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        {recentRequests.length === 0 ? (
          <Text style={styles.empty}>Aucune demande</Text>
        ) : (
          recentRequests.map((req: any) => (
            <TouchableOpacity
              key={req.id}
              style={styles.requestCard}
              onPress={() => navigation.navigate('CreateContract', { requestId: req.id, request: req })}
            >
              <Text style={styles.requestTitle}>Demande #{req.id}</Text>
              <Text style={styles.requestText}>{req.pickup_location} → {req.destination}</Text>
              <Text style={styles.requestText}>{req.employees_count} employés • {req.frequency}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
      
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('RequestsManagement')}>
        <Text style={styles.actionButtonText}>Gérer toutes les demandes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF9800', padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  statsContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  statNumber: { fontSize: 32, fontWeight: '800', color: '#FF9800', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  seeAll: { color: '#FF9800', fontWeight: '600' },
  requestCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#ddd' },
  requestTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  requestText: { fontSize: 14, color: '#666', marginBottom: 2 },
  empty: { textAlign: 'center', color: '#999', marginTop: 16 },
  actionButton: { backgroundColor: '#FF9800', padding: 16, margin: 16, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});

