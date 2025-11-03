import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CompanyDashboard({ navigation }: any) {
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  async function loadData() {
    if (!user) return;

    try {
      setLoading(true);
      // Get company info
      const { data: companyData } = await api.get('/api/company/me');
      
      if (companyData.company) {
        const myCompany = companyData.company;
        setCompany(myCompany);
        
        // Get vehicles
        const { data: vehiclesData } = await api.get(`/api/vehicles/company/${myCompany.id}`);
        setVehicles(vehiclesData.vehicles || []);
        
        // Get drivers
        const { data: driversData } = await api.get(`/api/drivers/company/${myCompany.id}`);
        setDrivers(driversData.drivers || []);
        
        // Get revenue
        const { data: revenueData } = await api.get(`/api/company/revenue/${myCompany.id}`);
        setRevenue(revenueData);
      }
    } catch (e: any) {
      if (e?.response?.status !== 403 && e?.response?.status !== 404) {
        Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de charger les données');
      }
    } finally {
      setLoading(false);
    }
  }

  const activeDrivers = drivers.filter((d: any) => d.availability_status === 'active');
  const maintenanceNeeded = vehicles.filter((v: any) => {
    if (!v.last_maintenance) return true;
    const lastMaintenance = new Date(v.last_maintenance);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return lastMaintenance < sixMonthsAgo;
  });

  const topDrivers = drivers
    .sort((a: any, b: any) => (b.trips_count || 0) - (a.trips_count || 0))
    .slice(0, 3);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}>
      <View style={styles.header}>
        <Text style={styles.title}>{company?.name || 'Ma Compagnie'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{vehicles.length}</Text>
          <Text style={styles.statLabel}>Véhicules</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeDrivers.length}</Text>
          <Text style={styles.statLabel}>Chauffeurs actifs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{revenue?.monthlyRevenue || 0} DH</Text>
          <Text style={styles.statLabel}>Revenus mois</Text>
        </View>
      </View>

      {maintenanceNeeded.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Maintenance requise</Text>
          {maintenanceNeeded.map((v: any) => (
            <View key={v.id} style={styles.alertCard}>
              <Text style={styles.alertText}>{v.model} ({v.plate_number})</Text>
              <Text style={styles.alertSubtext}>
                Dernière maintenance: {v.last_maintenance ? new Date(v.last_maintenance).toLocaleDateString('fr-FR') : 'Jamais'}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top chauffeurs</Text>
        {topDrivers.length === 0 ? (
          <Text style={styles.empty}>Aucun chauffeur</Text>
        ) : (
          topDrivers.map((driver: any, index: number) => (
            <View key={driver.id} style={styles.driverCard}>
              <Text style={styles.driverRank}>#{index + 1}</Text>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{driver.full_name}</Text>
                <Text style={styles.driverStats}>{driver.trips_count || 0} trajets terminés</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Vehicles')}
        >
          <Text style={styles.actionBtnText}>Gérer véhicules</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Drivers')}
        >
          <Text style={styles.actionBtnText}>Gérer chauffeurs</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF9800', padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, backgroundColor: '#fff' },
  statCard: { alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '700', color: '#FF9800' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  section: { padding: 16, backgroundColor: '#fff', marginTop: 12, marginHorizontal: 16, borderRadius: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  alertCard: { backgroundColor: '#FFF3E0', padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#FF9800' },
  alertText: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  alertSubtext: { fontSize: 12, color: '#666' },
  driverCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 8 },
  driverRank: { fontSize: 20, fontWeight: '700', color: '#FF9800', marginRight: 12, width: 30 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  driverStats: { fontSize: 12, color: '#666' },
  empty: { textAlign: 'center', color: '#999', marginTop: 16 },
  actionsContainer: { padding: 16, gap: 12 },
  actionBtn: { backgroundColor: '#FF9800', padding: 16, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

