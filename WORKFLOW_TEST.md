# 🧪 GUIDE DE TEST - WORKFLOW COMPLET ASPATRANS

## 📋 WORKFLOW COMPLET À TESTER

### **1. Business crée demande → Admin voit → Crée contrat → Business accepte → Chauffeur exécute**

#### **Étape 1 : Business crée une demande**
1. Login avec `owner@business.ma` / `business123`
2. Onglet "Demandes" → "+ Nouvelle demande"
3. Remplir le formulaire :
   - Lieu départ : "Casablanca - Sidi Maârouf"
   - Destination : "Rabat - Agdal"
   - Nombre employés : 25
   - Fréquence : Daily
   - Date début : Aujourd'hui
   - Date fin : Dans 30 jours
   - Notes : "Morning shift 8:00"
4. Confirmer → Demande créée avec status='pending'

**✅ Vérifier :**
- Demande apparaît dans la liste avec badge "PENDING"
- Statut correct dans la DB

#### **Étape 2 : Admin voit la demande**
1. Login avec `admin@aspatrans.ma` / `admin123`
2. Dashboard Admin → Voir "Demandes en attente" (stat devrait augmenter)
3. Cliquer "Gérer toutes les demandes"
4. Trouver la demande récente avec status='pending'

**✅ Vérifier :**
- Demande apparaît dans la liste Admin
- Filtre par status fonctionne
- Bouton "Créer contrat" visible

#### **Étape 3 : Admin crée contrat**
1. Cliquer "Créer contrat" sur la demande
2. Sélectionner :
   - Company : TransCo
   - Véhicule : (apparaît après sélection company)
   - Chauffeur : (filtre par company)
3. Prix calculé automatiquement
4. Notes admin : "Priority client"
5. Cliquer "Envoyer proposition"

**✅ Vérifier :**
- Contrat créé avec status='pending'
- Prix calculé correctement
- Demande status change à 'active' (après création contrat)

#### **Étape 4 : Business accepte contrat**
1. Login avec `owner@business.ma` / `business123`
2. Onglet "Contrats" → Tab "En attente"
3. Voir le contrat avec badge notification
4. Cliquer sur le contrat → Voir détails
5. Cliquer "Accepter" → Confirmation

**✅ Vérifier :**
- Message : "Contrat accepté ! X trajets générés automatiquement."
- Contrat status change à 'active'
- Trajets générés automatiquement dans la DB
- Nombre de trajets = nombre de jours entre start_date et end_date (pour daily)

#### **Étape 5 : Chauffeur voit et exécute trajets**
1. Login avec `driver1@transco.ma` / `driver123`
2. Dashboard Chauffeur → Voir "Prochains trajets"
3. Voir les trajets générés (un par jour)
4. Cliquer sur un trajet → Voir détails
5. Cliquer "DÉMARRER LE TRAJET" → GPS capturé
6. Trajet status change à 'active'
7. Timer en temps réel
8. Cliquer "TERMINER LE TRAJET" → GPS capturé
9. Trajet status change à 'completed'

**✅ Vérifier :**
- Tous les trajets générés apparaissent
- Dates correctes (un par jour à 8:00)
- GPS enregistré au start/end
- Timer fonctionne
- Statuts mis à jour correctement

---

## 🔍 POINTS DE VÉRIFICATION

### **Navigation**
- ✅ Toutes les navigations entre rôles fonctionnent
- ✅ Pas de screens avec noms dupliqués
- ✅ Back navigation fonctionne
- ✅ Tab navigation fonctionne

### **Error Handling**
- ✅ Messages d'erreur en français
- ✅ Messages clairs et descriptifs
- ✅ Gestion des erreurs réseau
- ✅ Gestion des erreurs 401/403/404/500

### **Loading States**
- ✅ Loading spinner pendant chargement
- ✅ RefreshControl sur toutes les listes
- ✅ Disabled buttons pendant actions
- ✅ Loading states visibles

### **Génération automatique des trajets**
- ✅ Trajets générés quand contrat accepté
- ✅ Nombre correct selon fréquence
- ✅ Dates correctes
- ✅ Heure par défaut 8:00 AM
- ✅ Message de confirmation avec nombre de trajets

### **Notifications (basiques)**
- ✅ Alert quand contrat accepté avec nombre de trajets
- ✅ Confirmation avant actions importantes
- ✅ Messages de succès clairs

---

## 🐛 PROBLÈMES POTENTIELS À VÉRIFIER

1. **Génération trajets** :
   - Si end_date est NULL, doit générer 30 jours par défaut
   - Si frequency est inconnue, doit default à daily
   - Vérifier que les dates sont correctes (timezone)

2. **Navigation** :
   - Vérifier que tous les navigateurs sont correctement configurés
   - Vérifier que les noms de screens sont uniques

3. **Error handling** :
   - Tester avec serveur éteint
   - Tester avec token invalide
   - Tester avec données invalides

4. **Loading states** :
   - Vérifier que tous les écrans ont des loading states
   - Vérifier que les boutons sont disabled pendant actions

---

## 📝 NOTES DE TEST

Après chaque test, noter :
- ✅ Réussi
- ❌ Échoué (avec description)
- ⚠️ Problème mineur (avec description)

