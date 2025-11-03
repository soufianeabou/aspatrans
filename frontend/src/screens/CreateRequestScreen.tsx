import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const FREQUENCIES = ['daily', 'weekly', 'monthly'];

export default function CreateRequestScreen({ navigation }: any) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  const [pickup_location, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [employees_count, setEmployeesCount] = useState('');
  const [frequency, setFrequency] = useState<typeof FREQUENCIES[number]>('daily');
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [special_notes, setSpecialNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!user) return;
    try {
      setLoading(true);
      await api.post('/api/requests', {
        pickup_location,
        destination,
        employees_count: Number(employees_count),
        frequency,
        start_date,
        end_date: end_date || null,
        special_notes: special_notes || null,
      });
      Alert.alert('Succès', 'Demande créée', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de créer la demande');
    } finally {
      setLoading(false);
    }
  }

  function canProceedStep1() {
    return pickup_location.trim().length > 0 && destination.trim().length > 0;
  }

  function canProceedStep2() {
    return employees_count.trim().length > 0 && Number(employees_count) >= 1;
  }

  function canProceedStep3() {
    return start_date.trim().length > 0;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepText}>Étape {step}/4</Text>
      </View>

      {step === 1 && (
        <View style={styles.step}>
          <Text style={styles.title}>Lieux de transport</Text>
          <TextInput placeholder="Lieu de départ" style={styles.input} value={pickup_location} onChangeText={setPickupLocation} />
          <TextInput placeholder="Destination" style={styles.input} value={destination} onChangeText={setDestination} />
          <TouchableOpacity style={[styles.button, !canProceedStep1() && styles.buttonDisabled]} onPress={() => setStep(2)} disabled={!canProceedStep1()}>
            <Text style={styles.buttonText}>Suivant</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.step}>
          <Text style={styles.title}>Détails du transport</Text>
          <TextInput placeholder="Nombre d'employés (min 1)" style={styles.input} keyboardType="numeric" value={employees_count} onChangeText={setEmployeesCount} />
          <Text style={styles.pickerLabel}>Fréquence:</Text>
          <View style={styles.freqContainer}>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.freqBtn, frequency === f && styles.freqBtnActive]}
                onPress={() => setFrequency(f)}
              >
                <Text style={[styles.freqText, frequency === f && styles.freqTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setStep(1)}>
              <Text style={styles.buttonText}>Précédent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, !canProceedStep2() && styles.buttonDisabled]} onPress={() => setStep(3)} disabled={!canProceedStep2()}>
              <Text style={styles.buttonText}>Suivant</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.step}>
          <Text style={styles.title}>Dates et notes</Text>
          <TextInput placeholder="Date début (YYYY-MM-DD)" style={styles.input} value={start_date} onChangeText={setStartDate} />
          <TextInput placeholder="Date fin (YYYY-MM-DD, optionnel)" style={styles.input} value={end_date} onChangeText={setEndDate} />
          <TextInput placeholder="Notes spéciales (optionnel)" style={[styles.input, styles.textArea]} multiline numberOfLines={4} value={special_notes} onChangeText={setSpecialNotes} />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setStep(2)}>
              <Text style={styles.buttonText}>Précédent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, !canProceedStep3() && styles.buttonDisabled]} onPress={() => setStep(4)} disabled={!canProceedStep3()}>
              <Text style={styles.buttonText}>Suivant</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 4 && (
        <View style={styles.step}>
          <Text style={styles.title}>Confirmation</Text>
          <View style={styles.summary}>
            <Text style={styles.summaryText}><Text style={styles.summaryLabel}>De:</Text> {pickup_location}</Text>
            <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Vers:</Text> {destination}</Text>
            <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Employés:</Text> {employees_count}</Text>
            <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Fréquence:</Text> {frequency}</Text>
            <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Début:</Text> {start_date}</Text>
            {end_date && <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Fin:</Text> {end_date}</Text>}
            {special_notes && <Text style={styles.summaryText}><Text style={styles.summaryLabel}>Notes:</Text> {special_notes}</Text>}
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setStep(3)}>
              <Text style={styles.buttonText}>Précédent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Envoi...' : 'Créer demande'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, backgroundColor: '#2196F3', alignItems: 'center' },
  stepText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  step: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  pickerLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  freqContainer: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  freqBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  freqBtnActive: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  freqText: { color: '#666', fontWeight: '600' },
  freqTextActive: { color: '#fff' },
  button: { backgroundColor: '#2196F3', padding: 14, borderRadius: 8, alignItems: 'center', flex: 1 },
  buttonSecondary: { backgroundColor: '#999' },
  submitButton: { backgroundColor: '#4CAF50' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '700' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  summary: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 },
  summaryText: { fontSize: 14, marginBottom: 8, color: '#666' },
  summaryLabel: { fontWeight: '700', color: '#333' }
});

