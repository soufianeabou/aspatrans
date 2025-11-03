import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ContractCard, Contract } from '../components/ContractCard';
import LoadingSpinner from '../components/LoadingSpinner';

const TABS = ['pending', 'active', 'completed'] as const;
type Tab = typeof TABS[number];

export default function ContractsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [loading, setLoading] = useState(false);

  async function loadContracts() {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/api/contracts/business/${user.id}`);
      setContracts(data.contracts || []);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Impossible de charger les contrats');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContracts();
    const interval = setInterval(loadContracts, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  async function handleAccept(id: number) {
    Alert.alert('Confirmer', 'Accepter ce contrat ? Les trajets seront générés automatiquement.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Accepter',
        onPress: async () => {
          try {
            setLoading(true);
            const { data } = await api.put(`/api/contracts/${id}/accept`);
            const message = data.tripsGenerated 
              ? `Contrat accepté ! ${data.tripsGenerated} trajets générés automatiquement.`
              : data.warning || 'Contrat accepté !';
            Alert.alert('Succès', message);
            await loadContracts();
          } catch (e: any) {
            Alert.alert('Erreur', e?.response?.data?.message || 'Échec de l\'acceptation du contrat');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }

  async function handleReject(id: number) {
    Alert.alert('Confirmer', 'Refuser ce contrat ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Refuser',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await api.put(`/api/contracts/${id}/reject`);
            Alert.alert('Succès', 'Contrat refusé');
            await loadContracts();
          } catch (e: any) {
            Alert.alert('Erreur', e?.response?.data?.message || 'Échec du refus du contrat');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }

  const filteredContracts = contracts.filter((c) => {
    if (activeTab === 'pending') return c.status === 'pending';
    if (activeTab === 'active') return c.status === 'active';
    if (activeTab === 'completed') return c.status === 'completed';
    return false;
  });

  const pendingCount = contracts.filter((c) => c.status === 'pending').length;

  if (loading && contracts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'pending' ? 'En attente' : tab === 'active' ? 'Acceptés' : 'Terminés'}
            </Text>
            {tab === 'pending' && pendingCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredContracts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ContractCard
            contract={item}
            onPress={() => navigation.navigate('ContractDetails', { contractId: item.id })}
            onAccept={item.status === 'pending' ? () => handleAccept(item.id) : undefined}
            onReject={item.status === 'pending' ? () => handleReject(item.id) : undefined}
          />
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadContracts} />}
        ListEmptyComponent={<Text style={styles.empty}>Aucun contrat {activeTab === 'pending' ? 'en attente' : activeTab === 'active' ? 'accepté' : 'terminé'}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  tab: { flex: 1, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#2196F3' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#2196F3', fontWeight: '700' },
  badge: { backgroundColor: '#FF9800', borderRadius: 10, minWidth: 20, paddingHorizontal: 6, paddingVertical: 2, alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 32, color: '#999', fontSize: 16 }
});

