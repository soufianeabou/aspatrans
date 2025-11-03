import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CreateContractScreen({ route, navigation }: any) {
  const { requestId, request } = route.params || {};
  const [companies, setCompanies] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompanies();
    loadDrivers();
    if (request) {
      calculatePriceForRequest(request);
    }
  }, [request]);

  useEffect(() => {
    if (selectedCompany) {
      // Reset first
      setSelectedVehicle(null);
      setSelectedDriver(null);
      setVehicles([]);
      // Then load vehicles for the selected company
      loadVehicles(selectedCompany);
    } else {
      setVehicles([]);
      setSelectedVehicle(null);
      setSelectedDriver(null);
    }
  }, [selectedCompany]);

  async function loadCompanies() {
    try {
      const { data } = await api.get('/api/admin/companies');
      setCompanies(data.companies || []);
    } catch (e: any) {
      Alert.alert('Erreur', 'Impossible de charger les compagnies');
    }
  }

  async function loadDrivers() {
    try {
      const { data } = await api.get('/api/admin/drivers/available');
      setDrivers(data.drivers || []);
    } catch (e: any) {
      Alert.alert('Erreur', 'Impossible de charger les chauffeurs');
    }
  }

  async function loadVehicles(companyId: number) {
    try {
      const { data } = await api.get(`/api/admin/companies/${companyId}/vehicles`);
      // Ensure all vehicles have correct company_id and all IDs are numbers
      const vehiclesWithCompany = (data.vehicles || []).map((v: any) => ({
        ...v,
        id: Number(v.id),
        company_id: Number(v.company_id || companyId),
      }));
      setVehicles(vehiclesWithCompany);
    } catch (e: any) {
      setVehicles([]);
      if (e?.response?.status !== 404) {
        Alert.alert('Erreur', `Impossible de charger les véhicules: ${e?.response?.data?.message || 'Erreur serveur'}`);
      }
    }
  }

  async function calculatePriceForRequest(req: any) {
    if (!req) return;
    
    try {
      // Normalize frequency to lowercase
      const frequency = String(req.frequency || '').toLowerCase();
      const { data } = await api.get('/api/contracts/calculate-price', {
        params: {
          employees_count: req.employees_count,
          frequency: frequency,
        },
      });
      setCalculatedPrice(data.price);
    } catch (e) {
      // Fallback calculation
      const BASE_DISTANCE = 50;
      const PER_EMPLOYEE = 15;
      const multipliers: Record<string, number> = { daily: 1.0, weekly: 0.8, monthly: 0.6 };
      const frequency = String(req.frequency || 'daily').toLowerCase();
      const multiplier = multipliers[frequency] || 1.0;
      const price = Math.round((BASE_DISTANCE + Number(req.employees_count || 0) * PER_EMPLOYEE) * multiplier);
      setCalculatedPrice(price);
    }
  }

  async function handleSubmit() {
    if (!selectedCompany || !selectedDriver || !selectedVehicle) {
      Alert.alert('Erreur', 'Veuillez sélectionner company, chauffeur et véhicule');
      return;
    }
    
    // Double check: verify vehicle belongs to selected company
    const selectedVehicleObj = filteredVehicles.find((v: any) => v.id === selectedVehicle);
    if (!selectedVehicleObj || Number(selectedVehicleObj.company_id) !== Number(selectedCompany)) {
      Alert.alert('Erreur', 'Le véhicule sélectionné ne correspond pas à la company. Veuillez re-sélectionner.');
      setSelectedVehicle(null);
      return;
    }
    
    // Double check: verify driver belongs to selected company
    const selectedDriverObj = filteredDrivers.find((d: any) => d.id === selectedDriver);
    if (!selectedDriverObj || Number(selectedDriverObj.company_id) !== Number(selectedCompany)) {
      Alert.alert('Erreur', 'Le chauffeur sélectionné ne correspond pas à la company. Veuillez re-sélectionner.');
      setSelectedDriver(null);
      return;
    }
    
    if (!calculatedPrice || calculatedPrice <= 0) {
      Alert.alert('Erreur', 'Le prix calculé est invalide. Vérifiez les informations de la demande.');
      return;
    }
    
    if (!requestId && !request?.id) {
      Alert.alert('Erreur', 'Demande non trouvée');
      return;
    }
    
    try {
      setLoading(true);
      await api.post('/api/contracts', {
        request_id: Number(requestId || request?.id),
        company_id: Number(selectedCompany),
        driver_id: Number(selectedDriver),
        vehicle_id: Number(selectedVehicle),
        price: Number(calculatedPrice),
        admin_notes: adminNotes || null,
      });
      Alert.alert('Succès', 'Contrat créé', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || 'Impossible de créer le contrat';
      Alert.alert('Erreur', errorMsg);
      // If vehicle/company mismatch, reset selections
      if (errorMsg.includes('Vehicle does not belong')) {
        setSelectedVehicle(null);
        setSelectedDriver(null);
      }
    } finally {
      setLoading(false);
    }
  }

  // Filter drivers by selected company (ensure number comparison)
  const filteredDrivers = selectedCompany
    ? drivers.filter((d: any) => Number(d.company_id) === Number(selectedCompany))
    : [];
  
  // Vehicles are already filtered by company via API, but double-check (ensure number comparison)
  const filteredVehicles = selectedCompany
    ? vehicles.filter((v: any) => Number(v.company_id) === Number(selectedCompany))
    : [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Créer contrat</Text>
        {request && (
          <View style={styles.requestInfo}>
            <Text style={styles.requestText}>Demande #{request.id}</Text>
            <Text style={styles.requestText}>{request.pickup_location} → {request.destination}</Text>
            <Text style={styles.requestText}>{request.employees_count} employés • {request.frequency}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company transport</Text>
        <View style={styles.optionsContainer}>
          {companies.map((comp) => (
            <TouchableOpacity
              key={comp.id}
              style={[styles.option, Number(selectedCompany) === Number(comp.id) && styles.optionActive]}
              onPress={() => setSelectedCompany(Number(comp.id))}
            >
              <Text style={[styles.optionText, Number(selectedCompany) === Number(comp.id) && styles.optionTextActive]}>
                {comp.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedCompany && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Véhicule</Text>
          <View style={styles.optionsContainer}>
            {vehicles.length === 0 ? (
              <Text style={styles.emptyText}>Chargement des véhicules...</Text>
            ) : filteredVehicles.length === 0 ? (
              <Text style={styles.emptyText}>Aucun véhicule disponible pour cette company</Text>
            ) : (
              filteredVehicles.map((v: any) => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.option, selectedVehicle === v.id && styles.optionActive]}
                  onPress={() => setSelectedVehicle(v.id)}
                >
                  <Text style={[styles.optionText, selectedVehicle === v.id && styles.optionTextActive]}>
                    {v.model} ({v.plate_number})
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      )}

      {selectedCompany && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chauffeur disponible</Text>
          <View style={styles.optionsContainer}>
            {drivers.length === 0 ? (
              <Text style={styles.emptyText}>Chargement des chauffeurs...</Text>
            ) : filteredDrivers.length === 0 ? (
              <Text style={styles.emptyText}>Aucun chauffeur disponible pour cette company</Text>
            ) : (
              filteredDrivers.map((d: any) => (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.option, selectedDriver === d.id && styles.optionActive]}
                  onPress={() => setSelectedDriver(d.id)}
                >
                  <Text style={[styles.optionText, selectedDriver === d.id && styles.optionTextActive]}>
                    {d.full_name} ({d.license_number})
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prix calculé</Text>
        <View style={styles.priceContainer}>
          {calculatedPrice ? (
            <Text style={styles.priceText}>{calculatedPrice} DH</Text>
          ) : (
            <Text style={styles.pricePlaceholder}>Calcul en cours...</Text>
          )}
        </View>
        {request && !calculatedPrice && (
          <TouchableOpacity style={styles.recalcBtn} onPress={() => calculatePriceForRequest(request)}>
            <Text style={styles.recalcText}>Recalculer le prix</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes admin</Text>
        <View style={styles.notesInputContainer}>
          <TextInput
            style={styles.notesInput}
            placeholder="Ajoutez des notes pour le business (optionnel)"
            multiline
            numberOfLines={4}
            value={adminNotes}
            onChangeText={setAdminNotes}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>{loading ? 'Envoi...' : 'Envoyer proposition'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#FF9800', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 12 },
  requestInfo: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 8 },
  requestText: { color: '#fff', fontSize: 14, marginBottom: 4 },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  optionsContainer: { gap: 8 },
  option: { padding: 14, borderRadius: 8, borderWidth: 2, borderColor: '#ddd', backgroundColor: '#f9f9f9' },
  optionActive: { borderColor: '#FF9800', backgroundColor: '#FFF3E0' },
  optionText: { fontSize: 16, color: '#333' },
  optionTextActive: { color: '#FF9800', fontWeight: '700' },
  emptyText: { color: '#999', fontStyle: 'italic', padding: 12 },
  priceContainer: { backgroundColor: '#FFF3E0', padding: 16, borderRadius: 8, alignItems: 'center' },
  priceText: { fontSize: 32, fontWeight: '800', color: '#FF9800' },
  pricePlaceholder: { fontSize: 16, color: '#999', fontStyle: 'italic' },
  recalcBtn: { marginTop: 8, padding: 8, backgroundColor: '#FF9800', borderRadius: 4, alignItems: 'center' },
  recalcText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  notesInputContainer: { backgroundColor: '#f9f9f9', borderRadius: 8 },
  notesInput: { padding: 12, minHeight: 80, textAlignVertical: 'top', fontSize: 14, color: '#333' },
  submitBtn: { backgroundColor: '#FF9800', padding: 16, margin: 16, borderRadius: 8, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#ccc' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});

