# Environnements & Variables — TruckMatch 🚛

Ce document liste l'ensemble des variables d'environnement utilisées par l'application TruckMatch.

---

## 🔒 Principes de Sécurité

1. **Aucun secret dans Git** : Les fichiers `.env`, `.env.local` et toutes leurs variantes locales sont inscrits dans le fichier `.gitignore`.
2. **Cloisonnement Client / Serveur** :
   * Seules les variables préfixées par `NEXT_PUBLIC_` sont injectées dans le code exécuté dans le navigateur du visiteur.
   * La clé `SUPABASE_SERVICE_ROLE_KEY` est strictement confidentielle et réservée aux opérations serveur (API Routes, Webhooks sécurisés, Migrations).

---

## 📋 Liste des Variables

| Variable | Portée | Description | Valeur par défaut / Format |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Publique (Client & Serveur) | URL de l'API REST Supabase | `https://azxwqcdnwkolodxwsqoq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publique (Client) | Clé anonyme avec accès RLS | Chaîne JWT (`eyJ...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Privée (Serveur uniquement) | Clé d'administration Supabase | Chaîne JWT (`eyJ...`) |
| `NEXT_PUBLIC_SITE_URL` | Publique (Client & Serveur) | URL canonique du site | `http://localhost:3000` (dév) ou `https://truckmatch.fr` (prod) |
| `PORT` | Serveur | Port d'écoute Node.js / Next.js | `3005` |

---

## ⚙️ Fichiers de Configuration

* `.env.example` : Template versionné dans Git, exempt de tout secret.
* `.env.local` : Fichier de travail local ou de production contenant les secrets réels (non versionné).
