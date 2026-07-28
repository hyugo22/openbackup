# Lancer OpenBackup sous Windows

## Lancement natif (sans service)

Prerequis : Node.js 20+ installe, et un PostgreSQL accessible (local ou distant).

```powershell
git clone https://github.com/hyugo22/openbackup.git
cd openbackup
npm install
copy .env.example .env
# Editez .env : DATABASE_URL, JWT_SECRET, CORS_ORIGIN, VITE_API_URL
npm run migrate:up
npm run build
npm run --workspace=backend start
```

Le backend sert alors l'API et le frontend buildé sur `http://localhost:3001`
(adapter `PORT` dans `.env` si besoin).

Pour le developpement (rechargement a chaud, frontend et backend separes) :

```powershell
npm run dev
```

## Enregistrer OpenBackup comme service Windows (NSSM)

Pour que l'application demarre automatiquement avec Windows et redemarre en
cas de crash, utilisez [NSSM](https://nssm.cc/) (Non-Sucking Service Manager).

1. Buildez le projet comme ci-dessus (`npm install`, `npm run build`).
2. Telechargez NSSM et placez `nssm.exe` dans votre PATH.
3. Installez le service :

   ```powershell
   nssm install OpenBackup "C:\Program Files\nodejs\node.exe" "dist\index.js"
   nssm set OpenBackup AppDirectory "C:\chemin\vers\openbackup\backend"
   nssm set OpenBackup AppEnvironmentExtra NODE_ENV=production
   ```

   Le backend charge `.env` depuis son repertoire de travail courant (via
   `dotenv`). Comme `AppDirectory` pointe vers `backend`, copiez votre
   fichier `.env` configure dans `backend/.env` pour qu'il soit trouve au
   demarrage du service.

4. Demarrez le service :

   ```powershell
   nssm start OpenBackup
   ```

5. Consultez les logs via l'Observateur d'evenements Windows, ou configurez
   `nssm set OpenBackup AppStdout` / `AppStderr` pour rediriger vers des
   fichiers de log.

Pour desinstaller : `nssm remove OpenBackup confirm`.

## PostgreSQL

Dans les deux cas ci-dessus, `DATABASE_URL` (dans `.env`) doit pointer vers
une instance PostgreSQL accessible : une installation locale sous Windows,
une instance distante, ou le conteneur `db` du `docker-compose.yml` si vous
ne voulez conteneuriser que la base de donnees.
