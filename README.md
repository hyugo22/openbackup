# OpenBackup

[![CI](https://github.com/hyugo22/openbackup/actions/workflows/ci.yml/badge.svg)](https://github.com/hyugo22/openbackup/actions/workflows/ci.yml)
[![Licence: AGPL v3](https://img.shields.io/badge/Licence-AGPLv3-blue.svg)](LICENSE)

Application web open source de gestion de backups : creation et suivi de
jobs de sauvegarde, avec historique des executions.

> **Etat du projet** : MVP. Authentification, gestion des jobs et historique
> des executions sont fonctionnels. La planification automatique (cron), les
> notifications, le stockage cloud et le chiffrement des backups seront
> ajoutes dans de futures versions.

## Stack technique

- **Frontend** : React + TypeScript, Vite
- **Backend** : Node.js + TypeScript, Express
- **Base de donnees** : PostgreSQL, driver [`pg`](https://node-postgres.com/)
  (requetes SQL parametrees ecrites a la main, pas d'ORM), migrations
  versionnees via [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate)
- **Monorepo** : `npm workspaces` (`frontend/`, `backend/`), sans tooling
  monorepo supplementaire

## Prerequis

- [Node.js](https://nodejs.org/) 20+
- [PostgreSQL](https://www.postgresql.org/) 14+ (sauf si vous utilisez Docker)
- [Docker](https://www.docker.com/) et Docker Compose (optionnel, pour le mode conteneurise)

## Installation et lancement

Trois modes de lancement sont supportes.

### 1. Docker (recommande pour demarrer rapidement)

```bash
git clone https://github.com/hyugo22/openbackup.git
cd openbackup
cp .env.example .env
# Editez .env et definissez au moins JWT_SECRET (valeur aleatoire forte)
docker compose up
```

L'application (frontend + backend + PostgreSQL) est disponible sur
`http://localhost:3001`. Les donnees PostgreSQL sont persistees dans un
volume Docker nomme.

### 2. Service Linux (systemd)

Voir [`deploy/openbackup.service`](deploy/openbackup.service) pour un exemple
d'unite systemd complet et commente (installation, build, migrations,
activation du service). PostgreSQL doit etre accessible (local ou distant)
via `DATABASE_URL`.

### 3. Windows (natif ou en service)

Voir [`deploy/windows-service.md`](deploy/windows-service.md) : lancement
natif avec Node.js installe, et enregistrement optionnel en service Windows
via [NSSM](https://nssm.cc/). PostgreSQL doit egalement etre accessible via
`DATABASE_URL`.

### Developpement local (sans Docker)

```bash
npm install
cp .env.example .env
# DATABASE_URL doit pointer vers un PostgreSQL local ou distant
npm run migrate:up
npm run dev
```

`npm run dev` demarre le backend (`http://localhost:3001`) et le frontend
(`http://localhost:5173`) simultanement, avec rechargement a chaud.

## Variables d'environnement

Voir [`.env.example`](.env.example) pour le fichier complet a copier en `.env`.

| Variable        | Description                                                          |
| --------------- | --------------------------------------------------------------------- |
| `PORT`          | Port d'ecoute du backend (defaut : `3001`)                            |
| `DATABASE_URL`  | URL de connexion PostgreSQL (`postgresql://user:pass@host:port/db`)  |
| `JWT_SECRET`    | Secret de signature des sessions (JWT). A generer aleatoirement.      |
| `CORS_ORIGIN`   | Origine autorisee a appeler l'API (URL du frontend)                   |
| `NODE_ENV`      | `development`, `production` ou `test`                                 |
| `VITE_API_URL`  | URL de l'API utilisee par le frontend (vide = chemins relatifs)       |

## Structure du projet

```
openbackup/
├── frontend/             # React + TypeScript (Vite)
│   └── src/
│       ├── pages/          # Ecrans : connexion, jobs, historique
│       ├── components/     # Composants partages (layout, route protegee)
│       ├── context/         # Contexte d'authentification
│       └── api/             # Client HTTP typé vers le backend
├── backend/               # Node.js + TypeScript (Express)
│   ├── src/
│   │   ├── routes/           # Routes Express (auth, jobs)
│   │   ├── db/                # Requetes SQL parametrees (pg)
│   │   ├── services/          # Logique metier (hash, JWT)
│   │   ├── middleware/         # Auth, gestion d'erreurs
│   │   └── validation/         # Schemas Zod
│   ├── migrations/          # Migrations SQL versionnees (node-pg-migrate)
│   └── tests/               # Tests unitaires (vitest)
├── deploy/                # Exemples de deploiement (systemd, Windows)
├── .github/workflows/     # Pipeline CI (GitHub Actions)
├── Dockerfile              # Build multi-stage (backend + frontend)
└── docker-compose.yml      # App + PostgreSQL en une commande
```

## Tests et qualite

```bash
npm run lint    # ESLint (frontend + backend)
npm run test    # Tests unitaires backend (vitest)
npm run build   # Verifie que le TypeScript compile (frontend + backend)
```

TypeScript est configure en mode strict sur les deux workspaces. Les
entrees utilisateur sont validees systematiquement cote backend avec Zod, et
les mots de passe sont haches avec bcrypt avant stockage.

## CI/CD

Le pipeline [GitHub Actions](.github/workflows/ci.yml) execute, dans l'ordre :
`build` (compilation TypeScript) → `test` (lint + tests unitaires) →
`docker` (construction de l'image) → `push` (publication sur GHCR,
uniquement sur `main` ou sur un tag).

## Donnees personnelles (RGPD)

OpenBackup collecte le minimum de donnees necessaire a son fonctionnement :

- **Compte** : adresse email et mot de passe (hache, jamais stocke ou
  journalise en clair).
- **Jobs de backup** : nom du job et chemins source/destination que vous
  configurez.
- **Historique d'execution** : statut, dates, taille et logs basiques des
  executions de backup.

Aucune de ces donnees n'est partagee avec des tiers, et aucun outil
d'analyse/tracking tiers n'est integre. Vous pouvez supprimer definitivement
votre compte et l'ensemble de vos donnees associees depuis l'application
(section "Compte" de la page des jobs).

## Contribuer

Les contributions sont bienvenues. Avant de proposer une pull request :

1. Ouvrez une issue pour discuter du changement envisage.
2. Assurez-vous que `npm run lint`, `npm run test` et `npm run build` passent.
3. Gardez les changements concis et alignes avec l'esprit du projet : pas de
   sur-ingenierie, pas de dependance non justifiee.

## Licence

Distribue sous licence [AGPLv3](LICENSE).
