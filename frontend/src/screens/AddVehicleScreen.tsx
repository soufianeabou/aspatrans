import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AddVehicleScreen({ navigation }: any) {
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [plateNumber, setPlateNumber] = useState('');
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompany();
  }, [user]);

  async function loadCompany() {
    if (!user) return;
    try {
      const { data: companyData } = await api.get('/api/company/me');
      if (companyData.company) {
        setCompany(companyData.company);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de charger les informations de la compagnie');
    }
  }

  async function handleSubmit() {
    if (!plateNumber.trim() || !model.trim() || !capacity.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const capacityNum = Number(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      Alert.alert('Erreur', 'La capacité doit être un nombre positif');
      return;
    }

    if (!company) {
      Alert.alert('Erreur', 'Compagnie non trouvée');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/vehicles', {
        plate_number: plateNumber.trim(),
        model: model.trim(),
        capacity: capacityNum,
      });
      Alert.alert('Succès', 'Véhicule ajouté', [
        { text: 'OK', onPress: () => {
          navigation.navigate('Vehicles');
        }}
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible d\'ajouter le véhicule');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ajouter un véhicule</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Plaque d'immatriculation *</Text>
          <TextInput
            style={styles.input}
            value={plateNumber}
            onChangeText={setPlateNumber}
            placeholder="A-123456"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Modèle *</Text>
          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            placeholder="Renault Master"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Capacité (kg) *</Text>
          <TextInput
            style={styles.input}
            value={capacity}
            onChangeText={setCapacity}
            placeholder="1500"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>{loading ? 'Ajout...' : 'Ajouter le véhicule'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#FF9800', padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  form: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  submitBtn: { backgroundColor: '#FF9800', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

