# TruckMatch 🚛

> **« Les entreprises trouvent leurs chauffeurs. Les chauffeurs trouvent leur route. »**

TruckMatch est la plateforme indépendante spécialisée dans le recrutement et la mise en relation directe entre entreprises de transport et conducteurs routiers qualifiés (SPL, PL, Porteur, VUL).

---

## 🏗️ Architecture du Projet

Projet 100 % autonome et indépendant, développé avec :
* **Next.js 15 (App Router)** & **TypeScript Strict**
* **Design System Vanilla CSS** avec tokens CSS standardisés (fond principal blanc, bleu électrique `#0080FF`, bleu marine `#0B192C`)
* **Supabase Client isolé** (Projet `azxwqcdnwkolodxwsqoq`)
* **SEO Natif** : Balisage OpenGraph, JSON-LD (WebSite, Article), Sitemap XML dynamique, Robots.txt

---

## 📂 Structure des Routes (Étape 1 — Site Public)

| Route | Rôle & Contenu |
|---|---|
| `/` | **Homepage** (Hero, Moteur de recherche chauffeurs, Catégories, Sections Chauffeurs & Entreprises, Offres d'emploi, Guide SEO) |
| `/chauffeurs` | **Espace Chauffeur** (Avantages, valorisation permis, formulaire d'amorce profil) |
| `/chauffeurs/spl` | **Landing SEO Chauffeur SPL** (Ensembles articulés, Permis EC, FIMO/FCO, missions) |
| `/chauffeurs/pl` | **Landing SEO Chauffeur PL** (Véhicules isolés &gt; 3,5t, Permis C, distribution régionale) |
| `/chauffeurs/porteur` | **Landing SEO Chauffeur Porteur** (Équipements spécifiques, benne, plateau, grue) |
| `/chauffeurs/vul` | **Landing SEO Chauffeur VUL** (Dernier kilomètre, messagerie rapide, Permis B) |
| `/entreprises` | **Espace Entreprises** (Sourcing de conducteurs qualifiés, filtres, gain de temps) |
| `/offres-emploi` | **Moteur d'offres réelles** (Connecté à Supabase, état vide propre garanti si 0 donnée) |
| `/conseils` | **Hub Éditorial** (Guides recrutement, réglementation, permis et carrière) |
| `/conseils/[slug]` | **Articles SEO riches** (Structure H1/H2, FAQ, JSON-LD Article, CTAs ciblés) |
| `/contact` | **Formulaire de contact** & informations support |
| `/a-propos` | **Mission et valeurs** de la communauté TruckMatch |
| `/mentions-legales` | Informations légales et hébergement OVH |
| `/politique-confidentialite`| Protection des données et conformité RGPD |
| `/cgu` | Conditions Générales d'Utilisation |

---

## 🚀 Démarrage en Développement Local

```bash
# 1. Cloner le repository officiel
git clone https://github.com/TruckMatchAdmin/TruckMatch.git
cd TruckMatch

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Renseigner vos clés Supabase dans .env.local

# 4. Lancer le serveur de développement local
npm run dev
```

L'application est disponible sur : `http://localhost:3000`.

---

## 📦 Production & Build

```bash
# Tester le build de production
npm run build

# Démarrer le serveur de production (port par défaut 3005)
npm run start
```
