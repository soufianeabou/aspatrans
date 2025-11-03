import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AddDriverScreen({ navigation }: any) {
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
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

  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit() {
    if (!email.trim() || !password.trim() || !fullName.trim() || !licenseNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Erreur', 'Email invalide');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!company) {
      Alert.alert('Erreur', 'Compagnie non trouvée');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/drivers', {
        email: email.trim(),
        password: password.trim(),
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        license_number: licenseNumber.trim(),
      });
      Alert.alert('Succès', 'Chauffeur ajouté', [
        { text: 'OK', onPress: () => {
          navigation.navigate('Drivers');
        }}
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible d\'ajouter le chauffeur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ajouter un chauffeur</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="driver@example.ma"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mot de passe *</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 6 caractères"
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom complet *</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ahmed Benali"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+212600000000"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Numéro de permis *</Text>
          <TextInput
            style={styles.input}
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            placeholder="DRV-MA-0001"
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>{loading ? 'Ajout...' : 'Ajouter le chauffeur'}</Text>
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

