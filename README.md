# 🖥️ StatusWatch – Firefox Extension

StatusWatch est une extension Firefox qui permet de **surveiller l’état et la latence de vos services** (sites web, API, adresses IP, hôtes).  
Vous pouvez configurer une liste de ressources, et l’extension interroge une **API externe** (que vous pouvez héberger vous-même) pour afficher l’état en temps réel dans un tableau de bord intégré au navigateur.

---

## ✨ Fonctionnalités

- UI moderne et responsive (popup et page d’options).
- Ajout, modification et suppression de services à surveiller.
- Vérification automatique via une API externe configurable.
- Indicateur de statut **Up / Down** avec latence.
- Rafraîchissement manuel ou programmé (intervalle personnalisable).
- Notifications en cas d’erreur de communication avec l’API.
- Stockage local des paramètres (pas de cloud, tout reste chez vous).

---

## 📷 Aperçu

### Popup (dashboard)
![Popup Screenshot](docs/screenshot-popup.png)

### Options
![Options Screenshot](docs/screenshot-options.png)

---

## 🛠️ Installation

### 1. Charger l’extension en mode développeur
1. Téléchargez/cloner ce dépôt.
2. Ouvrez Firefox et allez dans `about:debugging#/runtime/this-firefox`.
3. Cliquez sur **Load Temporary Add-on…** et sélectionnez le fichier `manifest.json` dans le dossier.

### 2. Configurer l’API backend
L’extension n’effectue pas les pings elle-même : elle délègue la vérification à une API.  
Un backend de référence est fourni [ici](../statuswatch-api) en Node.js (Express).  

#### Schéma d’appel attendu :

- **Requête** :
  ```http
  POST {apiBaseUrl}/check
  Content-Type: application/json
  Authorization: Bearer <apiKey>   # (optionnel)

  {
    "services": [
      { "id": "abc123", "url": "https://example.com" },
      { "id": "def456", "url": "8.8.8.8" }
    ]
  }
  ```

- **Réponse** :
  ```json
  {
    "results": [
      { "id": "abc123", "status": "up", "latency_ms": 87 },
      { "id": "def456", "status": "down", "error": "timeout" }
    ]
  }
  ```

👉 Voir [statuswatch-api](../statuswatch-api) pour un exemple complet.

---

## ⚙️ Développement

### Structure du projet
```
statuswatch-extension/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── options.html
├── options.js
├── util.js
├── styles.css
└── icons/
```

### Scripts utiles
- Recharger l’extension : via `about:debugging`
- Lancer un backend de test :
  ```bash
  cd ../statuswatch-api
  npm install
  node server.js
  ```

---

## 🚀 Roadmap

- [ ] Ajout de graphiques d’évolution (historique latence/disponibilité).
- [ ] Export/Import de la configuration.
- [ ] Support du thème clair/sombre automatique.
- [ ] Compatibilité Chrome (MV3).

---

## 📄 Licence

MIT © 2025  
Contributions et PR bienvenues 🙌
