const express = require('express'); // Importation d'Express
const app = express(); // Initialisation de l'application
const PORT = 3000;

// Middleware pour gérer les requêtes JSON
app.use(express.json());
// Définir une route principale
app.get('/', (req, res) => {
  res.send('Bienvenue sur mon serveur Node.js');
});
// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
