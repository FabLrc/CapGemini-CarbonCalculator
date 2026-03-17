# Carbon Calculator — Capgemini

> Plateforme de suivi et d'analyse des émissions carbone du patrimoine immobilier d'entreprise.

<div align="center">
  <h3>Aperçu Desktop</h3>
  <video src="assets/videos/capgemini_carbon_calculator_compressed.mp4" width="800" controls></video>
  <br/><br/>
  <h3>Aperçu Mobile</h3>
  <video src="assets/videos/capgemini_carbon_calculator_phone_compressed.mp4" height="500" controls></video>
</div>

---

## Table des matières

1. [Présentation](#1-présentation)
2. [Architecture technique](#2-architecture-technique)
3. [Fonctionnalités principales](#3-fonctionnalités-principales)
4. [Logique métier & calculs CO₂](#4-logique-métier--calculs-co₂)
5. [Données de référence](#5-données-de-référence)
6. [Modèle de données](#6-modèle-de-données)
7. [Conformité CSRD & Scopes](#7-conformité-csrd--scopes)
8. [Installation et démarrage](#8-installation-et-démarrage)
9. [Structure du projet](#9-structure-du-projet)

---

## 1. Présentation

Carbon Calculator est une application **cross-platform** (web, iOS, Android) permettant aux organisations de mesurer, suivre et réduire l'empreinte carbone de leurs bâtiments. Elle couvre l'ensemble du cycle de vie d'un bâtiment :

- **Carbone de construction** — émissions liées aux matériaux de structure
- **Carbone d'exploitation** — émissions annuelles liées à la consommation énergétique
- **Projection temporelle** — cumul des émissions depuis la construction jusqu'à aujourd'hui (et au-delà)
- **Simulation de rénovation** — comparaison avant/après sans modifier les données réelles

L'application est conçue pour s'inscrire dans les démarches de **reporting extra-financier** (CSRD, Bilan Carbone®, RE2020) grâce à une classification des émissions par Scopes GES.

---

## 2. Architecture technique

```
CarbonCalculator/
├── backend/          Spring Boot 3 (Java 21)
│   ├── PostgreSQL    Base de données relationnelle
│   ├── Flyway        Migrations versionnées
│   └── JWT           Authentification stateless
└── frontend/         React Native + Expo (TypeScript)
    ├── Web           Expo Router + React Native Web
    ├── iOS/Android   React Native natif
    └── Zustand       Gestion d'état globale
```

| Couche | Technologie | Rôle |
|--------|-------------|------|
| API REST | Spring Boot 3 | Calculs, persistance, auth |
| Base de données | PostgreSQL 15 | Stockage et migrations |
| Migrations | Flyway | Versioning du schéma |
| Auth | JWT Bearer | Sessions stateless multi-device |
| Frontend | React Native + Expo | UI cross-platform |
| Navigation | Expo Router (file-based) | Routing web & mobile |
| État global | Zustand | Stores partagés |
| Formulaires | React Hook Form | Validation dynamique |
| Graphiques | Victory Native (mobile) + SVG pur (web) | Visualisations sans avertissements DOM |
| Icônes | Lucide React Native | Iconographie unifiée |

---

## 3. Fonctionnalités principales

### 3.1 Tableau de bord (Dashboard)

- Vue d'ensemble du **portefeuille de sites** de l'organisation
- Cartes site avec indicateur de performance relatif à la moyenne du portefeuille :
  - 🟢 **Vert** : CO₂/m² inférieur de plus de 15 % à la moyenne (performant)
  - ⚪ **Neutre** : dans la fourchette ±15 %
  - 🔴 **Rouge** : CO₂/m² supérieur de plus de 15 % à la moyenne (à améliorer)
- **Graphique de comparaison** des sites (barres groupées Construction vs. Exploitation)
- **Graphique de portefeuille dans le temps** — CO₂ cumulé de l'ensemble des bâtiments, année par année, depuis leur mise en service respective

### 3.2 Détail d'un site

- **KPIs** : CO₂ total, CO₂/m², CO₂/employé, consommation kWh annuelle
- **Graphique camembert** : part Construction / Exploitation dans les émissions totales
- **Graphique d'évolution** : historique des snapshots enregistrés
- **Détail des matériaux** : contribution CO₂ de chaque matériau
- **Projection temporelle** du site seul (depuis l'année de construction)
- **Panneau de simulation de rénovation** (cf. §3.5)
- **Export PDF** et **export CSV**

### 3.3 Comparaison multi-sites

- Sélection de **2 à 4 sites** simultanément
- **Tableau de comparaison** : tous les indicateurs côte à côte
- **Graphique groupé** de comparaison CO₂ Construction / Exploitation
- **Graphique temporel comparatif** : courbes cumulatives pour chaque site sélectionné (quel bâtiment consomme le plus dans le temps ?)
- **Export CSV** de la comparaison
- Mise en page adaptative : panneau fixe latéral (desktop) / vue défilante (mobile)

### 3.4 Création et édition d'un site

Formulaire complet organisé en sections :

| Section | Champs |
|---------|--------|
| Informations générales | Nom, description, adresse |
| Données physiques | Surface (m²), places de parking, employés, consommation kWh annuelle, **année de construction** |
| Mix énergétique | Sélection du vecteur énergétique (grille, gaz, fioul, chaleur…) |
| Matériaux | Ajout dynamique de matériaux (type + quantité en kg) |
| Modèles | Chargement d'un template prédéfini pour préremplir le formulaire |

### 3.5 Simulation de rénovation

Accessible directement depuis la fiche d'un site, **sans modifier les données réelles** :

- Sélection d'un nouveau **mix énergétique** (ex. : passer du gaz naturel à l'électricité)
- Modification de la **consommation annuelle** (kWh) après travaux
- Affichage immédiat des **économies annuelles** en kgCO₂e
- **Projection sur 20 ans** des économies cumulées
- **Graphique comparatif** : courbe actuelle vs. courbe rénovée depuis l'année de construction

### 3.6 Carte des sites

Visualisation géographique des sites du portefeuille.

### 3.7 Gestion des utilisateurs et des organisations

- Modèle **multi-organisation** : chaque organisation voit uniquement ses propres sites
- Rôles :
  - **SUPER_ADMIN** : accès à toutes les organisations
  - **ADMIN** : gestion des membres et des sites de son organisation
  - **MEMBER** : lecture et édition des sites de son organisation
- Authentification par e-mail / mot de passe avec JWT

---

## 4. Logique métier & calculs CO₂

### 4.1 CO₂ de construction (Scope 3 — émissions indirectes)

Les émissions de construction représentent le **carbone gris** des matériaux mis en œuvre lors de la construction ou de la rénovation du bâtiment. Elles sont calculées une seule fois et considérées comme fixes.

```
CO₂ construction = Σ (quantité_matériau_i [kg] × facteur_émission_i [kgCO₂e/kg])
```

Chaque ligne de matériau (`SiteMaterial`) contribue :
```
co2_kg_matériau = quantité_kg × facteur.kgCo2ePerUnit
```

Le total construction est la **somme de toutes les contributions matériaux**.

> **Exemple** : 50 000 kg de béton × 0,150 kgCO₂e/kg = **7 500 kgCO₂e**

### 4.2 CO₂ d'exploitation (Scope 1 ou 2 — émissions énergétiques annuelles)

Les émissions d'exploitation représentent le **carbone opérationnel** lié à la consommation d'énergie du bâtiment chaque année. Elles dépendent à la fois du **volume d'énergie consommé** et du **mix énergétique** choisi.

```
CO₂ exploitation [kgCO₂e/an] = consommation_annuelle [kWh] × facteur_énergie [kgCO₂e/kWh]
```

> **Exemple** : 200 000 kWh × 0,0571 kgCO₂e/kWh (électricité FR) = **11 420 kgCO₂e/an**

Le choix du mix énergétique a un impact considérable sur ce résultat (voir §5).

### 4.3 Indicateurs dérivés

| Indicateur | Formule | Usage |
|------------|---------|-------|
| CO₂ total | `co2Construction + co2Exploitation` | Empreinte globale du bâtiment |
| CO₂/m² | `co2Total / surface_m2` | Benchmark densité carbone |
| CO₂/employé | `co2Total / nb_employés` | Benchmark productivité carbone |
| Performance relative | `(co2_m2 - moyenne_portfolio) / moyenne_portfolio` | Comparaison interne |

### 4.4 Projection temporelle

La projection temporelle permet de visualiser la **croissance des émissions cumulées** depuis la mise en service du bâtiment jusqu'à aujourd'hui, et de projeter vers l'avenir.

```
CO₂ cumulé à l'année N = co2Construction + co2Exploitation × (N - annéeConstruction)
```

La courbe est représentée sous forme de **barres empilées** (construction en base + tranches annuelles d'exploitation) surmontées d'une **ligne de cumul**.

Pour la comparaison multi-sites, plusieurs courbes sont superposées : cela permet d'identifier quel bâtiment est le plus émetteur sur sa durée de vie, indépendamment de son ancienneté.

### 4.5 Simulation de rénovation

La simulation calcule côté client (sans appel API) les émissions **hypothétiques** après travaux :

```
CO₂ exploitation simulé = consommation_simulée_kwh × facteur_énergie_simulé.kgCo2ePerUnit

Économie annuelle = co2Exploitation_actuel - co2Exploitation_simulé  (si > 0)
Économie sur 20 ans = économie_annuelle × 20
```

Le graphique de simulation compare :
- **Trait plein** : courbe cumulative réelle (actuel)
- **Trait pointillé vert** : courbe cumulative après rénovation hypothétique

### 4.6 Snapshots et historique

À chaque création ou modification d'un site, un **snapshot** est automatiquement enregistré avec :
- Les valeurs CO₂ au moment de la sauvegarde
- La date et une note descriptive (ex. : "Création", "Mise à jour", "Isolation façade")

Ces snapshots alimentent le **graphique d'évolution** permettant de suivre l'impact réel des travaux réalisés.

---

## 5. Données de référence

### 5.1 Facteurs d'émission des matériaux (Scope 3)

Source : **ADEME Base Carbone® 2024**

| Code | Matériau | kgCO₂e / kg | Notes |
|------|----------|-------------|-------|
| `CONCRETE` | Béton | 0,150 | Matériau le plus utilisé en volume |
| `STEEL` | Acier | 1,460 | Structure métallique |
| `GLASS` | Verre | 0,850 | Façades vitrées |
| `WOOD_STRUCTURE` | Bois de structure | 0,060 | Matériau bas-carbone |
| `ALUMINUM` | Aluminium | 8,240 | Très énergivore à produire |
| `BRICK` | Brique | 0,220 | Maçonnerie traditionnelle |
| `INSULATION` | Isolant | 1,280 | Laine de verre / roche |
| `COPPER` | Cuivre | 2,710 | Réseaux et câblages |

> 💡 L'aluminium présente le facteur d'émission le plus élevé (×55 par rapport au bois). Son utilisation doit être justifiée et minimisée dans une démarche bas-carbone.

### 5.2 Facteurs d'émission des vecteurs énergétiques (Scope 1 & 2)

Source : **ADEME Base Carbone® 2024**

| Code | Vecteur | kgCO₂e / kWh | Scope GES | Notes |
|------|---------|--------------|-----------|-------|
| `ELECTRICITY_FR` | Électricité (réseau FR) | 0,0571 | Scope 2 | Très bas-carbone grâce au nucléaire |
| `DISTRICT_HEAT` | Réseau de chaleur urbain | 0,1110 | Scope 2 | Variable selon la ville |
| `GAS_NATURAL` | Gaz naturel | 0,2270 | Scope 1 | Combustion directe |
| `FUEL_OIL` | Fioul domestique | 0,3240 | Scope 1 | Le plus carboné |

> 💡 Un bâtiment chauffé au fioul émet environ **5,7 fois plus de CO₂/kWh** qu'un bâtiment électrique en France. Passer de `FUEL_OIL` à `ELECTRICITY_FR` est le levier de simulation le plus impactant.

### 5.3 Interprétation des indicateurs de performance

Les pastilles de couleur sur les cartes de sites comparent le **CO₂/m²** d'un bâtiment à la **moyenne du portefeuille** :

| Couleur | Condition | Signification |
|---------|-----------|---------------|
| 🟢 Vert | CO₂/m² < moyenne − 15 % | Bâtiment performant |
| ⚪ Neutre | CO₂/m² dans ±15 % de la moyenne | Dans la norme du portefeuille |
| 🔴 Rouge | CO₂/m² > moyenne + 15 % | Bâtiment à prioriser pour rénovation |

Ces seuils permettent d'identifier rapidement les sites les plus énergivores et de prioriser les actions de réduction.

---

## 6. Modèle de données

```
Organization
├── id, name, description
└── ── 1:N ──▶  User (firstName, lastName, email, role)
               Site
               ├── id, name, location, description
               ├── totalAreaM2, parkingSpaces, employeeCount
               ├── annualEnergyKwh, energyFactorCode
               ├── constructionYear
               ├── co2Construction [calculé], co2Exploitation [calculé]
               └── ── 1:N ──▶  SiteMaterial
                                ├── emissionFactor (FK)
                                ├── quantityKg
                                └── co2Kg [calculé]

EmissionFactor (table de référence)
├── code, label, category (MATERIAL | ENERGY)
├── kgCo2ePerUnit, unit, source
└── scope (SCOPE_1 | SCOPE_2 | SCOPE_3)

SiteSnapshot (historique)
├── siteId (FK), snapshotDate
├── co2Construction, co2Exploitation, co2Total
├── co2PerM2, co2PerEmployee
└── note (ex: "Isolation façade")
```

### Migrations Flyway

| Version | Contenu |
|---------|---------|
| V1 | Schéma initial (tables, contraintes, index) |
| V2 | Seed des facteurs d'émission (8 matériaux + 4 vecteurs ADEME) |
| V3 | Enrichissement des facteurs (vecteurs supplémentaires) |
| V4 | Ajout de la colonne `scope` sur `emission_factors` (CSRD) |
| V5 | Table `site_snapshots` pour l'historique |
| V6 | Données de démonstration : 10 sites fictifs en France |
| V7 | Colonne `construction_year` sur `sites` |

---

## 7. Conformité CSRD & Scopes

L'application catégorise toutes les émissions selon le **Protocole GES** (GHG Protocol), requis par la directive européenne **CSRD** (Corporate Sustainability Reporting Directive) :

| Scope | Définition | Sources dans l'app |
|-------|-----------|-------------------|
| **Scope 1** | Émissions directes (combustion sur site) | Gaz naturel, fioul, propane |
| **Scope 2** | Émissions indirectes liées à l'énergie achetée | Électricité, réseau de chaleur |
| **Scope 3** | Autres émissions indirectes | Tous les matériaux de construction |

Chaque facteur d'émission est étiqueté avec son scope, ce qui permet de produire des reportings conformes aux exigences CSRD/ESRS E1 (changement climatique).

---

## 8. Installation et démarrage

### Prérequis

- **Docker** & Docker Compose
- **Node.js** ≥ 18 + npm
- **Java** 21 (pour compilation manuelle)

### Démarrage rapide

```bash
# 1. Cloner le dépôt
git clone <url-du-repo>
cd CarbonCalculator

# 2. Lancer la base de données et le backend
docker compose up --build -d

# 3. Installer les dépendances frontend
cd frontend
npm install

# 4. Lancer l'application web
EXPO_NO_DOCTOR=1 npx expo start --web
```

L'API backend est disponible sur `http://localhost:8080`.
L'application web est disponible sur `http://localhost:8081`.

### Variables d'environnement

| Variable | Valeur par défaut | Description |
|----------|------------------|-------------|
| `POSTGRES_DB` | `carboncalc` | Nom de la base |
| `POSTGRES_USER` | `carboncalc` | Utilisateur PostgreSQL |
| `POSTGRES_PASSWORD` | `carboncalc` | Mot de passe |
| `JWT_SECRET` | *(défini dans application.yml)* | Clé de signature JWT |
| `EXPO_PUBLIC_API_URL` | `http://localhost:8080` | URL de l'API pour le frontend |

### Compte de démonstration

Après le démarrage, les données de démonstration (V6) sont automatiquement insérées par Flyway :

| Champ | Valeur |
|-------|--------|
| Email | `admin@capgemini.fr` |
| Mot de passe | `password` |
| Organisation | Capgemini Paris |
| Sites | 10 sites répartis en France |

---

## 9. Structure du projet

```
frontend/
├── app/
│   ├── (app)/
│   │   ├── index.tsx              # Dashboard
│   │   ├── compare.tsx            # Comparaison multi-sites
│   │   ├── map.tsx                # Carte des sites
│   │   └── sites/
│   │       ├── [id].tsx           # Détail d'un site
│   │       ├── new.tsx            # Création
│   │       └── edit/[id].tsx      # Édition
│   └── (auth)/
│       ├── login.tsx
│       └── register.tsx
├── components/
│   ├── carbon/                    # Graphiques et panneaux métier
│   │   ├── EmissionPieChart.tsx
│   │   ├── SitesComparisonChart.tsx
│   │   ├── SiteTimelineChart.tsx
│   │   ├── ComparativeTimelineChart.tsx
│   │   ├── PortfolioTimelineChart.tsx
│   │   ├── EvolutionChart.tsx
│   │   ├── MaterialsBarChart.tsx
│   │   └── SimulationPanel.tsx
│   ├── layout/
│   │   ├── WebSidebar.tsx         # Navigation desktop
│   │   └── BottomTabBar.tsx       # Navigation mobile
│   └── ui/                        # Composants génériques (Card, Button…)
├── stores/
│   ├── sitesStore.ts              # CRUD sites + types Site
│   └── authStore.ts               # Authentification
├── services/
│   └── api.ts                     # Client Axios + types payload
└── constants/
    └── colors.ts                  # Palette de couleurs

backend/
├── src/main/java/com/capgemini/carboncalculator/
│   ├── entity/                    # Site, SiteMaterial, EmissionFactor…
│   ├── dto/                       # SiteRequest, SiteResponse…
│   ├── service/                   # SiteService, CarbonCalculationService…
│   ├── controller/                # SiteController, AuthController…
│   └── security/                  # JwtFilter, UserDetailsService
└── src/main/resources/
    └── db/migration/              # V1 → V7 Flyway
```
