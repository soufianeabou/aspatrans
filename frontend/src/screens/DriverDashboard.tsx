import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function DriverDashboard({ navigation }: any) {
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [driver, setDriver] = useState<any>(null);
  const [availability, setAvailability] = useState(false);
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
      // Get driver info
      const { data: driverData } = await api.get('/api/drivers/me');
      
      if (driverData.driver) {
        const myDriver = driverData.driver;
        setDriver(myDriver);
        setAvailability(myDriver.availability_status === 'active');
        
        // Get trips
        const { data: tripsData } = await api.get(`/api/trips/driver/${myDriver.id}`);
        setTrips(tripsData.trips || []);
      }
    } catch (e: any) {
      if (e?.response?.status !== 403 && e?.response?.status !== 404) {
        Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de charger les données');
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleAvailability(value: boolean) {
    if (!driver) return;
    
    try {
      await api.put(`/api/drivers/${driver.id}/availability`, {
        availability_status: value ? 'active' : 'inactive',
      });
      setAvailability(value);
      Alert.alert('Succès', value ? 'Vous êtes maintenant disponible' : 'Vous n\'êtes plus disponible');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de mettre à jour la disponibilité');
    }
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const upcomingTrips = trips.filter((t: any) => {
    const scheduled = new Date(t.scheduled_datetime);
    return scheduled >= today && scheduled < tomorrow && t.status === 'pending';
  });

  const activeTrip = trips.find((t: any) => t.status === 'active');

  const recentTrips = trips.filter((t: any) => {
    const scheduled = new Date(t.scheduled_datetime);
    return scheduled < today || t.status === 'completed';
  }).slice(0, 5);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord Chauffeur</Text>
      </View>

      {driver && (
        <View style={styles.section}>
          <View style={styles.availabilityRow}>
            <Text style={styles.availabilityLabel}>Disponibilité</Text>
            <Switch
              value={availability}
              onValueChange={toggleAvailability}
              trackColor={{ false: '#ccc', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>
          <Text style={styles.availabilityText}>
            {availability ? '✅ Disponible' : '❌ Non disponible'}
          </Text>
        </View>
      )}

      {activeTrip && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trajet en cours</Text>
          <TouchableOpacity
            style={styles.activeTripCard}
            onPress={() => navigation.navigate('TripDetails', { tripId: activeTrip.id })}
          >
            <Text style={styles.activeTripTitle}>Trajet #{activeTrip.id}</Text>
            <Text style={styles.activeTripText}>{activeTrip.pickup_location} → {activeTrip.destination}</Text>
            <Text style={styles.activeTripText}>Démarré à {new Date(activeTrip.actual_start).toLocaleTimeString('fr-FR')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prochains trajets</Text>
        {upcomingTrips.length === 0 ? (
          <Text style={styles.empty}>Aucun trajet prévu</Text>
        ) : (
          upcomingTrips.map((trip: any) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={() => navigation.navigate('TripDetails', { tripId: trip.id })}
            >
              <Text style={styles.tripTitle}>Trajet #{trip.id}</Text>
              <Text style={styles.tripText}>{trip.pickup_location} → {trip.destination}</Text>
              <Text style={styles.tripText}>
                {new Date(trip.scheduled_datetime).toLocaleDateString('fr-FR')} à{' '}
                {new Date(trip.scheduled_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.tripText}>{trip.employees_count} employés</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historique récent</Text>
        {recentTrips.length === 0 ? (
          <Text style={styles.empty}>Aucun trajet récent</Text>
        ) : (
          recentTrips.map((trip: any) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={() => navigation.navigate('TripDetails', { tripId: trip.id })}
            >
              <Text style={styles.tripTitle}>Trajet #{trip.id}</Text>
              <Text style={styles.tripText}>{trip.pickup_location} → {trip.destination}</Text>
              <Text style={[styles.tripStatus, { color: trip.status === 'completed' ? '#4CAF50' : '#999' }]}>
                {trip.status === 'completed' ? '✅ Terminé' : trip.status}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#4CAF50', padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  section: { padding: 16, backgroundColor: '#fff', marginBottom: 12, borderRadius: 8, marginHorizontal: 16, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  availabilityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  availabilityLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  availabilityText: { fontSize: 14, color: '#666', marginTop: 4 },
  activeTripCard: { backgroundColor: '#E8F5E9', padding: 16, borderRadius: 8, borderWidth: 2, borderColor: '#4CAF50' },
  activeTripTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8 },
  activeTripText: { fontSize: 14, color: '#666', marginBottom: 4 },
  tripCard: { backgroundColor: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#ddd' },
  tripTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  tripText: { fontSize: 14, color: '#666', marginBottom: 2 },
  tripStatus: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 16 }
});

