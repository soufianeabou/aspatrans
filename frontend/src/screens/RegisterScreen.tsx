import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<any>;

const ROLES = ['business', 'admin', 'driver', 'transport_company'] as const;
type Role = typeof ROLES[number];

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('business');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  async function onRegister() {
    try {
      setLoading(true);
      await register({ email: email.trim(), password, role, full_name: fullName, phone, company_name: companyName });
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message || 'Échec de l\'inscription');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ASPATRANS</Text>
      <TextInput placeholder="Nom complet" style={styles.input} value={fullName} onChangeText={setFullName} />
      <TextInput placeholder="Email" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Mot de passe (6+)" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput placeholder="Rôle (business/admin/driver/transport_company)" style={styles.input} value={role} onChangeText={(t) => setRole((t as Role) || 'business')} />
      <TextInput placeholder="Téléphone" style={styles.input} value={phone} onChangeText={setPhone} />
      <TextInput placeholder="Nom de l'entreprise" style={styles.input} value={companyName} onChangeText={setCompanyName} />
      <TouchableOpacity style={styles.button} onPress={onRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Création..." : "Créer le compte"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '800', color: '#2196F3', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#2196F3', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  link: { color: '#FF9800', marginTop: 12, textAlign: 'center', fontWeight: '600' }
});


