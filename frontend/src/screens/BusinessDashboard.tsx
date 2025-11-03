import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { RequestCard, Request } from '../components/RequestCard';

export default function BusinessDashboard({ navigation }: any) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadRequests() {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/api/requests/business/${user.id}`);
      setRequests(data.requests || []);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de charger les demandes');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    Alert.alert('Confirmer', 'Supprimer cette demande ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/requests/${id}`);
            await loadRequests();
          } catch (e: any) {
            Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de supprimer la demande');
          }
        },
      },
    ]);
  }

  useEffect(() => {
    loadRequests();
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Mes Demandes</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('CreateRequest')}>
          <Text style={styles.newBtnText}>+ Nouvelle demande</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <RequestCard request={item} onDelete={() => handleDelete(item.id)} />}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRequests} />}
        ListEmptyComponent={<Text style={styles.empty}>Aucune demande</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  headerText: { fontSize: 20, fontWeight: '700', color: '#333' },
  newBtn: { backgroundColor: '#2196F3', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  newBtnText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 32, color: '#999', fontSize: 16 }
});

