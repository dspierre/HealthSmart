import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
// Configuration de l'application Express
const app = express();
import twilio from 'twilio';
import sqlite3 from 'sqlite3';
app.use(cors());
app.use(express.json());
// Gestion de l'emplacement des fichiers dans ES Modules
const __dirname = fileURLToPath(new URL('.', import.meta.url));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, 'public')));
const db = new sqlite3.Database('./healthsmart.db', (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données SQLite :', err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
        // Création des tables si elles n'existent pas
        const createTablesQueries = [
            `
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                hour INTEGER NOT NULL,
                name TEXT NOT NULL
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                steps INTEGER NOT NULL,
                water REAL NOT NULL,
                sleep REAL NOT NULL,
                mood INTEGER NOT NULL
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS moods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                mood TEXT NOT NULL
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS wellness_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                sleep REAL NOT NULL,
                water REAL NOT NULL,
                steps INTEGER NOT NULL,
                quality TEXT NOT NULL,
                heartRate INTEGER NOT NULL
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS user_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                age INTEGER,
                sex TEXT NOT NULL,
                weight REAL NOT NULL,
                height REAL NOT NULL,
                bmi REAL NOT NULL,
                category TEXT NOT NULL
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS emergency_info (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bloodGroup TEXT NOT NULL,
                allergens TEXT,
                medicalHistory TEXT,
                emergencyContactName TEXT NOT NULL,
                emergencyContactPhone TEXT NOT NULL
            );
            `,
            `
            CREATE TABLE IF NOT EXISTS victories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL,
                points INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user_points(id)
            );
            `,
            `
                CREATE TABLE IF NOT EXISTS user_points (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
               points INTEGER NOT NULL
                );

            `,
        ];
app.get('/api/stats', (req, res) => {
            res.json({ /* Vos données */ });
        });
        // Exécution des requêtes de création des tables
        createTablesQueries.forEach((query) => {
            db.run(query, (err) => {
                if (err) {
                    console.error('Erreur lors de la création des tables :', err.message);
                } else {
                    console.log('Table créée ou déjà existante.');
                }
            });
        });
    }
});
// Ajouter une victoire
app.post('/victories', (req, res) => {
    const { text, category, date, points } = req.body;
    const query = 'INSERT INTO victories (text, category, date, points) VALUES (?, ?, ?, ?)';
    db.run(query, [text, category, date, points], function (err) {
        if (err) {
            console.error('Erreur lors de l\'ajout d\'une victoire :', err.message);
            res.status(500).send({ message: 'Erreur interne du serveur.' });
        } else {
            res.status(201).send({ message: 'Victoire ajoutée', id: this.lastID });
        }
    });
});
// Récupérer toutes les victoires
app.get('/victories', (req, res) => {
    const query = 'SELECT * FROM victories';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des victoires :', err.message);
            res.status(500).send({ message: 'Erreur interne du serveur.' });
        } else {
            res.status(200).send(rows);
        }
    });
});
// Supprimer une victoire
app.delete('/victories/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM victories WHERE id = ?';
    db.run(query, [id], function (err) {
        if (err) {
            console.error('Erreur lors de la suppression d\'une victoire :', err.message);
            res.status(500).send({ message: 'Erreur interne du serveur.' });
        } else {
            if (this.changes > 0) {
                res.status(200).send({ message: 'Victoire supprimée' });
            } else {
                res.status(404).send({ message: 'Victoire non trouvée.' });
            }
        }
    });
});
//------------------------------------ ROUTES EVENTS -----------------------------------//
// Route pour ajouter un événement
app.post('/add-event', (req, res) => {
    const { date, hour, name } = req.body;
    if (!date || !hour || !name) {
        return res.status(400).send({ error: 'Tous les champs sont requis.' });
    }
    const query = 'INSERT INTO events (date, hour, name) VALUES (?, ?, ?)';
    db.run(query, [date, hour, name], function (err) {
        if (err) {
            res.status(500).send({ error: 'Erreur lors de l\'ajout de l\'événement.' });
        } else {
            res.send({ message: 'Événement ajouté avec succès.', eventId: this.lastID });
        }
    });
});
// Route pour récupérer tous les événements
app.get('/events', (req, res) => {
    const query = 'SELECT * FROM events';
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send({ error: 'Erreur lors de la récupération des événements.' });
        } else {
            res.send(rows);
        }
    });
});
//------------------------------------ ROUTES GOALS -----------------------------------//
// Route pour ajouter un objectif
app.post('/add-goal', (req, res) => {
    const { date, steps, water, sleep, mood } = req.body;
    if (!date || !steps || !water || !sleep || !mood) {
        return res.status(400).send({ error: 'Tous les champs sont requis.' });
    }
    const query = 'INSERT INTO goals (date, steps, water, sleep, mood) VALUES (?, ?, ?, ?, ?)';
    db.run(query, [date, steps, water, sleep, mood], function (err) {
        if (err) {
            res.status(500).send({ error: 'Erreur lors de l\'ajout de l\'objectif.' });
        } else {
            res.send({ message: 'Objectif ajouté avec succès.', goalId: this.lastID });
        }
    });
});
// Route pour récupérer tous les objectifs
app.get('/goals', (req, res) => {
    const query = 'SELECT * FROM goals';
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send({ error: 'Erreur lors de la récupération des objectifs.' });
        } else {
            res.send(rows);
        }
    });
});
//------------------------------------ ROUTE POUR ENREGISTRER LES DONNÉES D'URGENCE -----------------------------------//

app.post('/save-emergency', (req, res) => {
    const { bloodGroup, allergens, medicalHistory, emergencyContactName, emergencyContactPhone } = req.body;
    const query = `
    INSERT INTO emergency_info (bloodGroup, allergens, medicalHistory, emergencyContactName, emergencyContactPhone)
    VALUES (?, ?, ?, ?, ?)
  `;
    db.run(query, [bloodGroup, allergens, medicalHistory, emergencyContactName, emergencyContactPhone], function (err) {
        if (err) {
            res.status(500).send({ error: 'Erreur lors de l\'enregistrement des données d\'urgence.' });
        } else {
            res.status(200).send({ message: 'Données d\'urgence sauvegardées avec succès !' });
        }
    });
});
// Route pour récupérer tous les objectifs
app.get('/goals', (req, res) => {
    const query = 'SELECT * FROM goals';
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send({ error: 'Erreur lors de la récupération des objectifs.' });
        } else {
            res.send(rows);
        }
    });
});
app.put('/edit-goal/:id', (req, res) => {
    const { id } = req.params;
    const { date, steps, water, sleep, mood } = req.body;
    if (!date || !steps || !water || !sleep || !mood) {
        return res.status(400).send({ error: 'Tous les champs sont requis.' });
    }
    const query = 'UPDATE goals SET date = ?, steps = ?, water = ?, sleep = ?, mood = ? WHERE id = ?';
    db.run(query, [date, steps, water, sleep, mood, id], function (err) {
        if (err) {
            return res.status(500).send({ error: 'Erreur lors de la modification de l\'objectif.' });
        }
        if (this.changes === 0) {
            return res.status(404).send({ error: 'Objectif non trouvé.' });
        }
        res.send({ message: 'Objectif modifié avec succès.' });
    });
});
app.delete('/delete-goal/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM goals WHERE id = ?';
    db.run(query, [id], function (err) {
        if (err) {
            return res.status(500).send({ error: 'Erreur lors de la suppression de l\'objectif.' });
        }
        if (this.changes === 0) {
            return res.status(404).send({ error: 'Objectif non trouvé.' });
        }
        res.send({ message: 'Objectif supprimé avec succès.' });
    });
});
app.put('/edit-event/:id', (req, res) => {
    const { id } = req.params;
    const { date, hour, name } = req.body;
    if (!date || !hour || !name) {
        return res.status(400).send({ error: 'Tous les champs sont requis.' });
    }
    const query = 'UPDATE events SET date = ?, hour = ?, name = ? WHERE id = ?';
    db.run(query, [date, hour, name, id], function (err) {
        if (err) {
            return res.status(500).send({ error: 'Erreur lors de la modification de l\'événement.' });
        }
        if (this.changes === 0) {
            return res.status(404).send({ error: 'Événement non trouvé.' });
        }
        res.send({ message: 'Événement modifié avec succès.' });
    });
});
//------------------------------------ ROUTES MOODS -----------------------------------//
// Route pour ajouter une humeur
app.post('/add-mood', (req, res) => {
    const { date, mood } = req.body;
    if (!date || !mood) {
        return res.status(400).send({ error: 'Date et humeur sont obligatoires.' });
    }
    const query = 'INSERT INTO moods (date, mood) VALUES (?, ?)';
    db.run(query, [date, mood], function (err) {
        if (err) {
            res.status(500).send({ error: 'Erreur lors de l\'ajout de l\'humeur.' });
        } else {
            res.send({ message: 'Humeur ajoutée avec succès.', moodId: this.lastID });
        }
    });
});
// Route pour récupérer toutes les humeurs
app.get('/moods', (req, res) => {
    const query = 'SELECT * FROM moods';
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).send({ error: 'Erreur lors de la récupération des humeurs.' });
        } else {
            res.send(rows);
        }
    });
});
app.put('/edit-mood/:id', (req, res) => {
    const { id } = req.params;
    const { date, mood } = req.body;
    if (!date || !mood) {
        return res.status(400).send({ error: 'Tous les champs sont requis.' });
    }
    const query = 'UPDATE moods SET date = ?, mood = ? WHERE id = ?';
    db.run(query, [date, mood, id], function (err) {
        if (err) {
            return res.status(500).send({ error: 'Erreur lors de la modification de l\'humeur.' });
        }
        if (this.changes === 0) {
            return res.status(404).send({ error: 'Humeur non trouvée.' });
        }
        res.send({ message: 'Humeur modifiée avec succès.' });
    });
});
app.delete('/delete-mood/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM moods WHERE id = ?';
    db.run(query, [id], function (err) {
        if (err) {
            return res.status(500).send({ error: 'Erreur lors de la suppression de l\'humeur.' });
        }
        if (this.changes === 0) {
            return res.status(404).send({ error: 'Humeur non trouvée.' });
        }
        res.send({ message: 'Humeur supprimée avec succès.' });
    });
});
app.delete('/delete-event/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM events WHERE id = ?';
    db.run(query, [id], function (err) {
        if (err) {
            return res.status(500).send({ error: 'Erreur lors de la suppression de l\'événement.' });
        }
        if (this.changes === 0) {
            return res.status(404).send({ error: 'Événement non trouvé.' });
        }
        res.send({ message: 'Événement supprimé avec succès.' });
    });
});
//------------------------------------ ROUTES WELLNESS -----------------------------------//
// Route pour ajouter une donnée bien-être
app.post('/add-wellness', (req, res) => {
    const { date, sleep, water, steps, quality, heartRate } = req.body;
    if (!date || !sleep || !water || !steps || !quality || !heartRate) {
        return res.status(400).send({ error: 'Tous les champs sont requis.' });
    }
    const query = `INSERT INTO wellness_data (date, sleep, water, steps, quality, heartRate) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [date, sleep, water, steps, quality, heartRate], function (err) {
        if (err) {
            return res.status(500).send({ error: 'Erreur lors de l\'insertion des données.' });
        }
        res.send({ message: 'Données bien-être enregistrées avec succès.', id: this.lastID });
    });
});
// Route pour récupérer toutes les données bien-être
app.get('/wellness', (req, res) => {
    const query = `SELECT * FROM wellness_data`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).send({ error: 'Erreur lors de la récupération des données.' });
        }
        res.send(rows);
    });
});
app.put('/edit-wellness/:id', (req, res) => {
    const { id } = req.params;
    const { date, sleep, water, steps, quality, heartRate } = req.body;
    if (!date || !sleep || !water || !steps || !quality || !heartRate) {
        return res.status(400).send({ error: 'Tous les champs sont requis.' });
    }
    const query = 'UPDATE wellness_data SET date = ?, sleep = ?, water = ?, steps = ?, quality = ?, heartRate = ? WHERE id = ?';
    db.run(query, [date, sleep, water, steps, quality, heartRate, id], function (err) {
        if (err) {
            return res.status(500).send({ error: 'Erreur lors de la modification des données bien-être.' });
        }
        if (this.changes === 0) {
            return res.status(404).send({ error: 'Données bien-être non trouvées.' });
        }
        res.send({ message: 'Données bien-être modifiées avec succès.' });
    });
});
app.get('/', (req, res) =>
{
    res.sendFile(path.join(__dirname, 'public', 'index_premium.html'));
});
app.delete('/delete-wellness/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM wellness_data WHERE id = ?';
    db.run(query, [id], function (err) {
        if (err) {
            return res.status(500).send({ error: 'Erreur lors de la suppression des données bien-être.' });
        }
        if (this.changes === 0) {
            return res.status(404).send({ error: 'Données bien-être non trouvées.' });
        }
        res.send({ message: 'Données bien-être supprimées avec succès.' });
    });
});
app.get('/api/summaries', (req, res) => {
    const query = `
    SELECT 
      SUM(sleep) as totalSleep,
      SUM(water) as totalWater,
      SUM(steps) as totalSteps,
      AVG(heartRate) as averageHeartRate
    FROM wellness_data;
  `;
    db.get(query, [], (err, row) => {
        if (err) {
            res.status(500).send({ error: 'Erreur lors de la récupération des résumés.' });
        } else {
            res.send(row); // Envoie les résultats sous forme JSON
        }
    });
});
app.post('/points', (req, res) => {
    const { date, points } = req.body;
    if (!date || !points) {
        return res.status(400).json({ message: 'Date ou points non spécifiés.' });
    }
    const query = 'INSERT INTO user_points (date, points) VALUES (?, ?)';
    db.run(query, [date, points], function (err) {
        if (err) {
            console.error('Erreur lors de l\'insertion des points:', err.message);
            return res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement des points.' });
        }
        res.status(201).json({ message: 'Points enregistrés avec succès.', id: this.lastID });
    });
});
app.delete('/user-points/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM user_points WHERE id = ?';
    db.run(query, [id], function (err) {
        if (err) {
            console.error('Erreur lors de la suppression des points utilisateur:', err.message);
            return res.status(500).json({ message: 'Erreur serveur lors de la suppression des points.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Points utilisateur non trouvés.' });
        }
        res.status(200).json({ message: 'Points utilisateur supprimés avec succès.' });
    });
});
app.post("/save", (req, res) => {
    const { age, sex, weight, height, bmi, category } = req.body;
    db.run(
        `INSERT INTO user_data (age, sex, weight, height, bmi, category) VALUES (?, ?, ?, ?, ?, ?)`,
        [age, sex, weight, height, bmi, category],
        function (err) {
            if (err) {
                console.error("Erreur lors de l'insertion des données:", err.message);
                res.status(500).json({ message: "Échec de l'enregistrement des données." });
            } else {
                res.status(200).json({ message: "Données enregistrées avec succès !" });
            }
        }
    );
});
app.get('/points-sum', (req, res) => {
    const query = 'SELECT SUM(points) AS totalPoints FROM user_points';
    db.get(query, [], (err, row) => {
        if (err) {
            console.error('Erreur lors du calcul de la somme des points:', err.message);
            res.status(500).json({ message: 'Erreur serveur lors du calcul des points.' });
        } else {
            res.status(200).json({ totalPoints: row.totalPoints || 0 });
        }
    });
});
// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
