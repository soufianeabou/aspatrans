import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import * as Location from 'expo-location';

export default function TripDetailsScreen({ route, navigation }: any) {
  const { tripId } = route.params || {};
  const { user } = useAuth();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    loadTrip();
    checkLocationPermission();
    
    // Timer for active trips
    let interval: NodeJS.Timeout | null = null;
    if (trip?.status === 'active' && trip?.actual_start) {
      interval = setInterval(() => {
        const start = new Date(trip.actual_start).getTime();
        const now = Date.now();
        setTimer(Math.floor((now - start) / 1000)); // seconds
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tripId, trip?.status]);

  async function checkLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationPermission(granted);
      return granted;
    } catch (e) {
      console.error('Location permission error:', e);
      setLocationPermission(false);
      return false;
    }
  }

  async function loadTrip() {
    if (!tripId) return;
    try {
      setLoading(true);
      // Get driver info first
      const { data: driverData } = await api.get('/api/drivers/me');
      
      if (driverData.driver) {
        const myDriver = driverData.driver;
        const { data: tripsData } = await api.get(`/api/trips/driver/${myDriver.id}`);
        const foundTrip = tripsData.trips?.find((t: any) => t.id === tripId);
        if (foundTrip) {
          setTrip(foundTrip);
          if (foundTrip.status === 'active' && foundTrip.actual_start) {
            const start = new Date(foundTrip.actual_start).getTime();
            const now = Date.now();
            setTimer(Math.floor((now - start) / 1000));
          }
        }
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de charger le trajet');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  async function handleStart() {
    if (!locationPermission) {
      const granted = await checkLocationPermission();
      if (!granted) {
        Alert.alert(
          'Permission requise',
          'La géolocalisation est nécessaire pour démarrer un trajet. Veuillez autoriser l\'accès à la localisation dans les paramètres de l\'appareil.'
        );
        return;
      }
    }

    let lat = 0;
    let lng = 0;

    try {
      const location = await Location.getCurrentPositionAsync({});
      lat = location.coords.latitude;
      lng = location.coords.longitude;
    } catch (e) {
      console.warn('Could not get location, using defaults:', e);
      Alert.alert(
        'Géolocalisation non disponible',
        'La géolocalisation n\'a pas pu être obtenue. Le trajet sera démarré sans coordonnées GPS.'
      );
    }

    try {
      await api.put(`/api/trips/${tripId}/start`, {
        lat,
        lng,
      });
      Alert.alert('Succès', 'Trajet démarré');
      await loadTrip();
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de démarrer le trajet');
    }
  }

  async function handleEnd() {
    let lat = 0;
    let lng = 0;

    if (locationPermission) {
      try {
        const location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        lng = location.coords.longitude;
      } catch (e) {
        console.warn('Could not get location, using defaults:', e);
      }
    }

    Alert.alert('Confirmer', 'Terminer ce trajet ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Terminer',
        onPress: async () => {
          try {
            await api.put(`/api/trips/${tripId}/end`, {
              lat,
              lng,
            });
            Alert.alert('Succès', 'Trajet terminé');
            await loadTrip();
          } catch (e: any) {
            Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de terminer le trajet');
          }
        },
      },
    ]);
  }

  function formatTimer(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function openMaps(address: string) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => Alert.alert('Erreur', 'Impossible d\'ouvrir Maps'));
  }

  if (loading || !trip) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trajet #{trip.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: trip.status === 'active' ? '#4CAF50' : trip.status === 'completed' ? '#2196F3' : '#FF9800' }]}>
          <Text style={styles.statusText}>{trip.status.toUpperCase()}</Text>
        </View>
      </View>

      {trip.status === 'active' && timer > 0 && (
        <View style={styles.timerSection}>
          <Text style={styles.timerLabel}>Temps en cours</Text>
          <Text style={styles.timerValue}>{formatTimer(timer)}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations du trajet</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Départ:</Text>
          <View style={styles.addressRow}>
            <Text style={styles.value}>{trip.pickup_location}</Text>
            <TouchableOpacity style={styles.mapBtn} onPress={() => openMaps(trip.pickup_location)}>
              <Text style={styles.mapBtnText}>📍 Carte</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Destination:</Text>
          <View style={styles.addressRow}>
            <Text style={styles.value}>{trip.destination}</Text>
            <TouchableOpacity style={styles.mapBtn} onPress={() => openMaps(trip.destination)}>
              <Text style={styles.mapBtnText}>📍 Carte</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date/Heure:</Text>
          <Text style={styles.value}>
            {new Date(trip.scheduled_datetime).toLocaleDateString('fr-FR')} à{' '}
            {new Date(trip.scheduled_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Employés:</Text>
          <Text style={styles.value}>{trip.employees_count}</Text>
        </View>
        {trip.vehicle_model && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Véhicule:</Text>
            <Text style={styles.value}>{trip.vehicle_model} ({trip.vehicle_plate})</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact business</Text>
        {trip.business_name && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nom:</Text>
            <Text style={styles.value}>{trip.business_name}</Text>
          </View>
        )}
        {trip.business_phone && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Téléphone:</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${trip.business_phone}`)}>
              <Text style={[styles.value, styles.phoneLink]}>{trip.business_phone}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {trip.status === 'pending' && (
        <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startBtnText}>▶ DÉMARRER LE TRAJET</Text>
        </TouchableOpacity>
      )}

      {trip.status === 'active' && (
        <TouchableOpacity style={styles.endBtn} onPress={handleEnd}>
          <Text style={styles.endBtnText}>■ TERMINER LE TRAJET</Text>
        </TouchableOpacity>
      )}

      {trip.status === 'completed' && (
        <View style={styles.completedSection}>
          <Text style={styles.completedText}>✅ Trajet terminé</Text>
          {trip.actual_start && (
            <Text style={styles.completedInfo}>
              Démarré: {new Date(trip.actual_start).toLocaleString('fr-FR')}
            </Text>
          )}
          {trip.actual_end && (
            <Text style={styles.completedInfo}>
              Terminé: {new Date(trip.actual_end).toLocaleString('fr-FR')}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#4CAF50', padding: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  timerSection: { backgroundColor: '#E8F5E9', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  timerLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  timerValue: { fontSize: 48, fontWeight: '800', color: '#4CAF50' },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  infoRow: { marginBottom: 12 },
  label: { fontSize: 14, color: '#666', marginBottom: 4, fontWeight: '600' },
  value: { fontSize: 16, color: '#333', fontWeight: '600' },
  addressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  mapBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  mapBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  phoneLink: { color: '#4CAF50', textDecorationLine: 'underline' },
  startBtn: { backgroundColor: '#4CAF50', padding: 24, margin: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  startBtnText: { color: '#fff', fontWeight: '800', fontSize: 20 },
  endBtn: { backgroundColor: '#f44336', padding: 24, margin: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  endBtnText: { color: '#fff', fontWeight: '800', fontSize: 20 },
  completedSection: { backgroundColor: '#E3F2FD', padding: 20, margin: 16, borderRadius: 12, alignItems: 'center' },
  completedText: { fontSize: 18, fontWeight: '700', color: '#2196F3', marginBottom: 8 },
  completedInfo: { fontSize: 14, color: '#666', marginBottom: 4 }
});

