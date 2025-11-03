import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function DriversScreen({ navigation }: any) {
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [user])
  );

  async function loadData() {
    if (!user) return;

    try {
      setLoading(true);
      const { data: companyData } = await api.get('/api/company/me');
      
      if (companyData.company) {
        const myCompany = companyData.company;
        setCompany(myCompany);
        const { data: driversData } = await api.get(`/api/drivers/company/${myCompany.id}`);
        setDrivers(driversData.drivers || []);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de charger les chauffeurs');
    } finally {
      setLoading(false);
    }
  }

  function getAvailabilityColor(status: string): string {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'inactive': return '#999';
      default: return '#999';
    }
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes chauffeurs</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddDriver')}
        >
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {drivers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun chauffeur</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('AddDriver')}
          >
            <Text style={styles.emptyBtnText}>Ajouter un chauffeur</Text>
          </TouchableOpacity>
        </View>
      ) : (
        drivers.map((driver: any) => (
          <View key={driver.id} style={styles.driverCard}>
            <View style={styles.driverHeader}>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{driver.full_name}</Text>
                <Text style={styles.driverEmail}>{driver.email}</Text>
                <Text style={styles.driverLicense}>Permis: {driver.license_number}</Text>
              </View>
              <View style={[styles.availabilityBadge, { backgroundColor: getAvailabilityColor(driver.availability_status) }]}>
                <Text style={styles.availabilityText}>{driver.availability_status.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{driver.trips_count || 0}</Text>
                <Text style={styles.statLabel}>Trajets terminés</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{driver.total_trips || 0}</Text>
                <Text style={styles.statLabel}>Total trajets</Text>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF9800', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  addBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#FF9800', fontSize: 14, fontWeight: '700' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999', marginBottom: 20 },
  emptyBtn: { backgroundColor: '#FF9800', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  emptyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  driverCard: { backgroundColor: '#fff', padding: 16, margin: 16, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  driverHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 4 },
  driverEmail: { fontSize: 14, color: '#666', marginBottom: 4 },
  driverLicense: { fontSize: 12, color: '#999' },
  availabilityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  availabilityText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#FF9800' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 }
});

