import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ContractDetailsScreen({ route, navigation }: any) {
  const { contractId } = route.params || {};
  const { user } = useAuth();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [contractId]);

  async function loadDetails() {
    if (!contractId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/api/contracts/${contractId}/details`);
      setContract(data.contract);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de charger les détails du contrat');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  if (loading || !contract) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations du contrat</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>ID Contrat:</Text>
          <Text style={styles.value}>#{contract.id}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Statut:</Text>
          <Text style={[styles.value, styles.status]}>{contract.status.toUpperCase()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Prix:</Text>
          <Text style={[styles.value, styles.price]}>{contract.price} DH</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company transport</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nom:</Text>
          <Text style={styles.value}>{contract.company_name}</Text>
        </View>
        {contract.company_phone && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Téléphone:</Text>
            <Text style={styles.value}>{contract.company_phone}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chauffeur</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nom:</Text>
          <Text style={styles.value}>{contract.driver_name}</Text>
        </View>
        {contract.driver_phone && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Téléphone:</Text>
            <Text style={styles.value}>{contract.driver_phone}</Text>
          </View>
        )}
        {contract.driver_email && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{contract.driver_email}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Véhicule</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Modèle:</Text>
          <Text style={styles.value}>{contract.vehicle_model}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Plaque:</Text>
          <Text style={styles.value}>{contract.vehicle_plate}</Text>
        </View>
        {contract.vehicle_capacity && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Capacité:</Text>
            <Text style={styles.value}>{contract.vehicle_capacity} kg</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails du trajet</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Départ:</Text>
          <Text style={styles.value}>{contract.pickup_location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Destination:</Text>
          <Text style={styles.value}>{contract.destination}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Employés:</Text>
          <Text style={styles.value}>{contract.employees_count}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Fréquence:</Text>
          <Text style={styles.value}>{contract.frequency}</Text>
        </View>
        {contract.start_date && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date début:</Text>
            <Text style={styles.value}>{new Date(contract.start_date).toLocaleDateString('fr-FR')}</Text>
          </View>
        )}
        {contract.end_date && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date fin:</Text>
            <Text style={styles.value}>{new Date(contract.end_date).toLocaleDateString('fr-FR')}</Text>
          </View>
        )}
      </View>

      {contract.admin_notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes admin</Text>
          <Text style={styles.notes}>{contract.admin_notes}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prix détaillé</Text>
        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Distance de base:</Text>
            <Text style={styles.priceValue}>50 DH</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Employés ({contract.employees_count} × 15 DH):</Text>
            <Text style={styles.priceValue}>{contract.employees_count * 15} DH</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Sous-total:</Text>
            <Text style={styles.priceValue}>{50 + contract.employees_count * 15} DH</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Multiplicateur fréquence ({contract.frequency}):</Text>
            <Text style={styles.priceValue}>
              {contract.frequency === 'daily' ? '×1.0' : contract.frequency === 'weekly' ? '×0.8' : '×0.6'}
            </Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>{contract.price} DH</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#666', flex: 1 },
  value: { fontSize: 14, color: '#333', flex: 2, textAlign: 'right', fontWeight: '600' },
  status: { color: '#FF9800', fontWeight: '700' },
  price: { color: '#2196F3', fontSize: 18, fontWeight: '800' },
  notes: { fontSize: 14, color: '#666', lineHeight: 20, backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8 },
  priceBreakdown: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 14, color: '#666' },
  priceValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 8, paddingTop: 8 },
  totalLabel: { fontSize: 16, color: '#333', fontWeight: '700' },
  totalValue: { fontSize: 18, color: '#2196F3', fontWeight: '800' }
});

