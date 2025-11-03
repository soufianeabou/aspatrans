import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function VehiclesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
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
        const { data: vehiclesData } = await api.get(`/api/vehicles/company/${myCompany.id}`);
        setVehicles(vehiclesData.vehicles || []);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de charger les véhicules');
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'inactive': return '#f44336';
      default: return '#999';
    }
  }

  function needsMaintenance(vehicle: any): boolean {
    if (!vehicle.last_maintenance) return true;
    const lastMaintenance = new Date(vehicle.last_maintenance);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return lastMaintenance < sixMonthsAgo;
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes véhicules</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddVehicle')}
        >
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {vehicles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun véhicule</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('AddVehicle')}
          >
            <Text style={styles.emptyBtnText}>Ajouter un véhicule</Text>
          </TouchableOpacity>
        </View>
      ) : (
        vehicles.map((vehicle: any) => (
          <View key={vehicle.id} style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <Text style={styles.vehicleModel}>{vehicle.model}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) }]}>
                <Text style={styles.statusText}>{vehicle.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.vehiclePlate}>Plaque: {vehicle.plate_number}</Text>
            <Text style={styles.vehicleCapacity}>Capacité: {vehicle.capacity} kg</Text>
            {vehicle.last_maintenance ? (
              <Text style={styles.vehicleMaintenance}>
                Dernière maintenance: {new Date(vehicle.last_maintenance).toLocaleDateString('fr-FR')}
              </Text>
            ) : (
              <Text style={[styles.vehicleMaintenance, { color: '#f44336' }]}>
                ⚠️ Aucune maintenance enregistrée
              </Text>
            )}
            {needsMaintenance(vehicle) && (
              <View style={styles.maintenanceAlert}>
                <Text style={styles.maintenanceAlertText}>⚠️ Maintenance requise</Text>
              </View>
            )}
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
  vehicleCard: { backgroundColor: '#fff', padding: 16, margin: 16, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  vehicleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  vehicleModel: { fontSize: 18, fontWeight: '700', color: '#333', flex: 1 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  vehiclePlate: { fontSize: 14, color: '#666', marginBottom: 4 },
  vehicleCapacity: { fontSize: 14, color: '#666', marginBottom: 4 },
  vehicleMaintenance: { fontSize: 12, color: '#666', marginTop: 8 },
  maintenanceAlert: { backgroundColor: '#FFF3E0', padding: 8, borderRadius: 4, marginTop: 8 },
  maintenanceAlertText: { fontSize: 12, color: '#FF9800', fontWeight: '600' }
});

