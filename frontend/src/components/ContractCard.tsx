import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export type ContractStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Contract {
  id: number;
  request_id: number;
  company_id: number;
  driver_id: number;
  vehicle_id: number;
  price: number;
  admin_notes: string | null;
  status: ContractStatus;
  created_at: string;
  pickup_location?: string;
  destination?: string;
  company_name?: string;
  driver_name?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
}

export function ContractCard({ contract, onPress, onAccept, onReject }: { 
  contract: Contract; 
  onPress?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}) {
  const statusColors: Record<ContractStatus, { bg: string; text: string }> = {
    pending: { bg: '#FF9800', text: '#fff' },
    active: { bg: '#4CAF50', text: '#fff' },
    completed: { bg: '#2196F3', text: '#fff' },
    cancelled: { bg: '#f44336', text: '#fff' },
  };
  const status = statusColors[contract.status];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title}>Contrat #{contract.id}</Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.text }]}>{contract.status.toUpperCase()}</Text>
        </View>
      </View>
      
      {contract.pickup_location && (
        <>
          <Text style={styles.label}>De: {contract.pickup_location}</Text>
          <Text style={styles.label}>Vers: {contract.destination}</Text>
        </>
      )}
      
      <Text style={styles.price}>Prix: {contract.price} DH</Text>
      
      {contract.company_name && (
        <Text style={styles.label}>Company: {contract.company_name}</Text>
      )}
      
      {contract.driver_name && (
        <Text style={styles.label}>Chauffeur: {contract.driver_name}</Text>
      )}
      
      {contract.vehicle_model && (
        <Text style={styles.label}>Véhicule: {contract.vehicle_model} ({contract.vehicle_plate})</Text>
      )}
      
      {contract.status === 'pending' && (onAccept || onReject) && (
        <View style={styles.actions}>
          {onAccept && (
            <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
              <Text style={styles.acceptText}>Accepter</Text>
            </TouchableOpacity>
          )}
          {onReject && (
            <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
              <Text style={styles.rejectText}>Refuser</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#ddd', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#333' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  label: { fontSize: 14, color: '#666', marginBottom: 4 },
  price: { fontSize: 16, fontWeight: '700', color: '#2196F3', marginTop: 8, marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  acceptBtn: { flex: 1, backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: '700' },
  rejectBtn: { flex: 1, backgroundColor: '#f44336', padding: 12, borderRadius: 8, alignItems: 'center' },
  rejectText: { color: '#fff', fontWeight: '700' }
});

