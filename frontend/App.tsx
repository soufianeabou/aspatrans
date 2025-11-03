import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import BusinessDashboard from './src/screens/BusinessDashboard';
import CreateRequestScreen from './src/screens/CreateRequestScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import RequestsManagementScreen from './src/screens/RequestsManagementScreen';
import CreateContractScreen from './src/screens/CreateContractScreen';
import ContractsScreen from './src/screens/ContractsScreen';
import ContractDetailsScreen from './src/screens/ContractDetailsScreen';
import DriverDashboard from './src/screens/DriverDashboard';
import TripDetailsScreen from './src/screens/TripDetailsScreen';
import CompanyDashboard from './src/screens/CompanyDashboard';
import VehiclesScreen from './src/screens/VehiclesScreen';
import DriversScreen from './src/screens/DriversScreen';
import AddVehicleScreen from './src/screens/AddVehicleScreen';
import AddDriverScreen from './src/screens/AddDriverScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BusinessNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#2196F3' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="Dashboard" component={BusinessDashboard} options={{ title: 'ASPATRANS' }} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} options={{ title: 'Nouvelle demande' }} />
    </Stack.Navigator>
  );
}

function ContractsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#2196F3' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="Contracts" component={ContractsScreen} options={{ title: 'ASPATRANS' }} />
      <Stack.Screen name="ContractDetails" component={ContractDetailsScreen} options={{ title: 'Détails contrat' }} />
    </Stack.Navigator>
  );
}

function BusinessTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2196F3', tabBarInactiveTintColor: '#999' }}>
      <Tab.Screen name="Mes Demandes" component={BusinessNavigator} options={{ tabBarLabel: 'Demandes' }} />
      <Tab.Screen name="Contrats" component={ContractsNavigator} options={{ tabBarLabel: 'Contrats' }} />
      <Tab.Screen name="Profil" component={HomeScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#FF9800' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="Dashboard" component={AdminDashboard} options={{ title: 'ASPATRANS Admin' }} />
      <Stack.Screen name="RequestsManagement" component={RequestsManagementScreen} options={{ title: 'Gestion demandes' }} />
      <Stack.Screen name="CreateContract" component={CreateContractScreen} options={{ title: 'Créer contrat' }} />
    </Stack.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FF9800', tabBarInactiveTintColor: '#999' }}>
      <Tab.Screen name="AdminMain" component={AdminNavigator} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Profil" component={HomeScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

function DriverNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="Dashboard" component={DriverDashboard} options={{ title: 'ASPATRANS Chauffeur' }} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} options={{ title: 'Détails trajet' }} />
    </Stack.Navigator>
  );
}

function DriverTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#4CAF50', tabBarInactiveTintColor: '#999' }}>
      <Tab.Screen name="Mes Trajets" component={DriverNavigator} options={{ tabBarLabel: 'Trajets' }} />
      <Tab.Screen name="Profil" component={HomeScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

function CompanyNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#FF9800' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="CompanyDashboard" component={CompanyDashboard} options={{ title: 'ASPATRANS Transport' }} />
      <Stack.Screen name="Vehicles" component={VehiclesScreen} options={{ title: 'Mes véhicules' }} />
      <Stack.Screen name="Drivers" component={DriversScreen} options={{ title: 'Mes chauffeurs' }} />
      <Stack.Screen name="AddVehicle" component={AddVehicleScreen} options={{ title: 'Ajouter véhicule' }} />
      <Stack.Screen name="AddDriver" component={AddDriverScreen} options={{ title: 'Ajouter chauffeur' }} />
    </Stack.Navigator>
  );
}

function CompanyTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FF9800', tabBarInactiveTintColor: '#999' }}>
      <Tab.Screen name="CompanyMain" component={CompanyNavigator} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Profil" component={HomeScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { token, user } = useAuth();
  const headerStyle = { backgroundColor: '#2196F3' };
  const headerTint = '#fff';

  return (
    <Stack.Navigator>
      {token ? (
        user?.role === 'business' ? (
          <Stack.Screen name="BusinessTabs" component={BusinessTabs} options={{ headerShown: false }} />
        ) : user?.role === 'admin' ? (
          <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
        ) : user?.role === 'driver' ? (
          <Stack.Screen name="DriverTabs" component={DriverTabs} options={{ headerShown: false }} />
        ) : user?.role === 'transport_company' ? (
          <Stack.Screen name="CompanyTabs" component={CompanyTabs} options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ASPATRANS', headerStyle, headerTintColor: headerTint }} />
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'ASPATRANS', headerStyle, headerTintColor: headerTint }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'ASPATRANS', headerStyle, headerTintColor: headerTint }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
