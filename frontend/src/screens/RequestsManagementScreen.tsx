import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STATUS_FILTERS = ['all', 'pending', 'active', 'completed', 'cancelled'];

export default function RequestsManagementScreen({ navigation }: any) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  async function loadRequests() {
    if (!user) return;
    try {
      setLoading(true);
      const params = filter === 'all' ? {} : { status: filter };
      const { data } = await api.get('/api/admin/requests', { params });
      setRequests(data.requests || []);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de charger les demandes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, [user, filter]);

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      pending: '#FF9800',
      active: '#4CAF50',
      completed: '#2196F3',
      cancelled: '#f44336',
    };
    return colors[status] || '#999';
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Toutes' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Demande #{item.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.cardLabel}>Business: {item.business_name || item.company_name}</Text>
            <Text style={styles.cardLabel}>De: {item.pickup_location}</Text>
            <Text style={styles.cardLabel}>Vers: {item.destination}</Text>
            <Text style={styles.cardLabel}>Employés: {item.employees_count} • Fréquence: {item.frequency}</Text>
            {item.status === 'pending' && (
              <TouchableOpacity
                style={styles.createContractBtn}
                onPress={() => navigation.navigate('CreateContract', { requestId: item.id, request: item })}
              >
                <Text style={styles.createContractText}>Créer contrat</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRequests} />}
        ListEmptyComponent={<Text style={styles.empty}>Aucune demande</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filters: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0' },
  filterBtnActive: { backgroundColor: '#FF9800' },
  filterText: { fontSize: 12, color: '#666', fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', padding: 16, margin: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  cardLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  createContractBtn: { marginTop: 12, backgroundColor: '#FF9800', padding: 12, borderRadius: 8, alignItems: 'center' },
  createContractText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 32, color: '#999' }
});

