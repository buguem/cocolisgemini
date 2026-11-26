# Plan Directeur de Finalisation & Innovations - Cocolis Canada (cocolis.ca)
### Feuille de route opérationnelle avec intégration des Innovations Technologiques

Ce document intègre **à la fois** la finalisation technique et les **6 Innovations Majeures** qui font de Cocolis.ca un leader technologique unique sur le marché canadien.

---

```
  ┌─────────────────────────────────────────────────────────────────────────────────────────┐
  │                           LES 6 PHASES DE FINALISATION & INNOVATIONS                    │
  ├───────────────────┬───────────────────┬───────────────────┬─────────────────────────────┤
  │   PHASE 1         │    PHASE 2        │    PHASE 3        │     PHASE 4, 5 & 6          │
  │  Base PostgreSQL  │  API Backend &    │  Stripe Connect   │  Innovations IA & Marché    │
  │  & Persistance    │  Authentification │  + Interac ⚡     │  (Vision, Relais, Carbone)  │
  │  (Prisma V2)      │  Sécurisée        │  (Séquestre 15%)  │  & Déploiement Web + Mobile │
  └───────────────────┴───────────────────┴───────────────────┴─────────────────────────────┘
```

---

## 💡 LES 6 INNOVATIONS MAJEURES INTÉGRÉES DANS LE PROJET

### 1. IA Vision "Photo-to-Quote" 🤖
- **Principe :** L'utilisateur prend une photo de son meuble ou colis.
- **Action IA :** Analyse visuelle automatique qui extrait la catégorie, estime les dimensions ($L \times l \times h$), le volume ($m^3$), le type de véhicule nécessaire et calcule le tarif suggéré en CAD en 5 secondes.
- **Bénéfice :** Fini le mètre à ruban, création d'annonce 10x plus rapide.

### 2. Algorithme de "Route Matching" par Corridor Autoroutier 🛣️
- **Principe :** Un voyageur Montréal → Toronto peut prendre des colis à Kingston ou Belleville sans détour excessif.
- **Action :** Calcul d'un corridor de déviation réglable (ex: max 10 km de détour). Alertes proactives pour rentabiliser le trajet.

### 3. Réseau "Dépanneurs Relais Canadiens 🍁"
- **Principe :** Dépose en commerce de proximité (Dépanneurs indépendants, Couche-Tard, cafés locaux).
- **Action :** Suppression du besoin d'attendre le destinataire en personne. Récupération par QR Code sécurisé.

### 4. Compteur d'Éco-Score Carbone & Certificats ESG 🌱
- **Principe :** Chaque trajet mutualisé économise du carburant par rapport à un camion FedEx ou Purolator dédié.
- **Action :** Calcul en direct des kg de $CO_2$ évités affiché sur les annonces et délivrance de rapports ESG pour les PME.

### 5. FinTech : Virement Instantané Interac e-Transfer ⚡
- **Principe :** Dès saisie du code à 6 chiffres, les 85% de gains du conducteur sont versés immédiatement par virement Interac en moins de 60 secondes.

### 6. Extension d'Achat Kijiji & Facebook Marketplace 🛒
- **Principe :** Bouton "Faire livrer avec Cocolis.ca" sur les annonces d'achat/vente au Canada pour convertir les acheteurs sans voiture.

---

## 🗺️ LE PLAN DE FINALISATION ÉTAPE PAR ÉTAPE

### Étape 1 : Persistance PostgreSQL & Schéma Prisma V2
- Création de la base sur Supabase/Neon et migration du schéma (`npx prisma migrate dev`).

### Étape 2 : API Backend & Sécurité
- Endpoints `/api/auth`, `/api/announcements`, `/api/offers`, `/api/messages`.

### Étape 3 : Paiements Stripe Connect (Séquestre 15%) & Virement Interac
- Blocage des fonds jusqu'au code de confirmation à 6 chiffres.
- Option de virement bancaire ou Interac e-Transfer immédiat.

### Étape 4 : Déploiement des Fonctionnalités d'Innovation dans l'App
- Intégration de l'IA Photo-to-Quote dans le Wizard.
- Activation du badge Éco-Score ($CO_2$ évité).
- Option Dépanneur Relais dans les annonces.

### Étape 5 : Services Tiers (SMS Twilio Canada & Stockage Cloud)
- SMS réels pour le code à 6 chiffres et l'OTP.
- Stockage Cloudflare R2 / S3 pour les photos.

### Étape 6 : Déploiement Web (cocolis.ca) & Mobile (Capacitor iOS / Android)
- Vercel + domaine `cocolis.ca`.
- Génération des builds natifs pour Google Play Store et Apple App Store.
