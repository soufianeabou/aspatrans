import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export type RequestStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Request {
  id: number;
  business_id: number;
  pickup_location: string;
  destination: string;
  employees_count: number;
  frequency: string;
  start_date: string;
  end_date: string | null;
  special_notes: string | null;
  status: RequestStatus;
  created_at: string;
}

export function RequestCard({ request, onPress, onDelete }: { request: Request; onPress?: () => void; onDelete?: () => void }) {
  const statusColors: Record<RequestStatus, { bg: string; text: string }> = {
    pending: { bg: '#FF9800', text: '#fff' },
    active: { bg: '#4CAF50', text: '#fff' },
    completed: { bg: '#2196F3', text: '#fff' },
    cancelled: { bg: '#f44336', text: '#fff' },
  };
  const status = statusColors[request.status];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title}>Demande #{request.id}</Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.text }]}>{request.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.label}>De: {request.pickup_location}</Text>
      <Text style={styles.label}>Vers: {request.destination}</Text>
      <Text style={styles.label}>Employés: {request.employees_count}</Text>
      <Text style={styles.label}>Fréquence: {request.frequency}</Text>
      <Text style={styles.label}>Date début: {new Date(request.start_date).toLocaleDateString('fr-FR')}</Text>
      {request.end_date && <Text style={styles.label}>Date fin: {new Date(request.end_date).toLocaleDateString('fr-FR')}</Text>}
      {onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteText}>Supprimer</Text>
        </TouchableOpacity>
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
  deleteBtn: { marginTop: 8, padding: 8, backgroundColor: '#f44336', borderRadius: 4, alignItems: 'center' },
  deleteText: { color: '#fff', fontWeight: '600' }
});

