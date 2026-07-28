# syntax=docker/dockerfile:1

# --------------------------------------------------------------------------
# Etape "deps" : installe toutes les dependances (dev incluses) du monorepo
# npm workspaces. Isolee dans sa propre etape pour profiter du cache Docker :
# tant que les package.json ne changent pas, cette etape n'est pas rejouee.
# --------------------------------------------------------------------------
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci

# --------------------------------------------------------------------------
# Etape "build-backend" : compile le TypeScript du backend en JS (dist/).
# --------------------------------------------------------------------------
FROM deps AS build-backend
WORKDIR /app
COPY backend backend
RUN npm run build --workspace=backend

# --------------------------------------------------------------------------
# Etape "build-frontend" : build Vite du frontend.
# VITE_API_URL="" fait pointer le frontend vers des chemins d'API relatifs
# (/api/...), puisqu'en production le backend sert lui-meme les fichiers
# statiques du frontend depuis la meme origine (voir backend/src/app.ts).
# --------------------------------------------------------------------------
FROM deps AS build-frontend
WORKDIR /app
COPY frontend frontend
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build --workspace=frontend

# --------------------------------------------------------------------------
# Etape finale : image d'execution minimale, sans outils de build ni
# dependances de developpement.
# --------------------------------------------------------------------------
FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# N'installe que les dependances de production du backend (pg, express, etc.)
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
RUN npm ci --omit=dev --workspace=backend && npm cache clean --force

# Code compile du backend, migrations SQL, et build du frontend servi en statique
COPY --from=build-backend /app/backend/dist backend/dist
COPY backend/migrations backend/migrations
COPY --from=build-frontend /app/frontend/dist backend/public

# Execute l'application avec un utilisateur non-root pour limiter la surface
# d'attaque si le conteneur est compromis.
RUN addgroup -S openbackup && adduser -S openbackup -G openbackup
USER openbackup

WORKDIR /app/backend
EXPOSE 3001

# Applique les migrations puis demarre le serveur. En cas d'echec des
# migrations (base indisponible au demarrage), le conteneur s'arrete et
# Docker/orchestrateur peut le redemarrer une fois la base prete.
CMD ["sh", "-c", "npm run migrate:up && node dist/index.js"]
