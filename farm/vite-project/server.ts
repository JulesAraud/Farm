import express, { Request, Response } from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'farm',
};

app.get('/', (_req: Request, res: Response) => {
  res.send('Bienvenue sur l’API de la ferme !');
});

app.get('/champs', async (_req: Request, res: Response) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.query('SELECT * FROM champs');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/semer', async (req: Request, res: Response) => {
  const { id, culture } = req.body;

  try {
    const conn = await mysql.createConnection(dbConfig);

    // Vérifie que le champ est dans l'état "labouré"
    const [rows] = await conn.query('SELECT state FROM champs WHERE id = ?', [id]);
    const champ = (rows as any[])[0];

    if (!champ || champ.state !== 'labouré') {
      await conn.end();
      return res.status(400).json({ success: false, error: 'Le champ doit être labouré pour être semé.' });
    }

    // Mise à jour du champ : passage à semé
    await conn.execute(
      'UPDATE champs SET culture = ?, state = ?, last_action_time = NOW(), fertilised = false WHERE id = ?',
      [culture, 'semé', id]
    );

    await conn.end();
    res.json({ success: true });

  } catch (err) {
    console.error('Erreur /semer :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});



app.post('/recolter', async (_req: Request, res: Response) => {
  try {
    const conn = await mysql.createConnection(dbConfig);

    const [champs] = await conn.query(
      'SELECT * FROM champs WHERE state = "prêt à récolter"'
    );

    const rendements: Record<string, number> = {
      blé: 1000, orge: 1000, soja: 1000, avoine: 1000, canola: 1000,
      raisin: 1500, olive: 1500, 'pomme de terre': 5000, betterave: 3500,
      coton: 750, maïs: 3000, tournesol: 3000, 'canne à sucre': 5000,
      légumes: 2500, épinard: 3000, pois: 7500, 'haricots verts': 7500, peuplier: 1500
    };

    const champsRecoltés: number[] = [];

    for (const champ of champs as any[]) {
      let rendementBase = rendements[champ.culture] || 0;

      if (champ.fertilised) {
        rendementBase = Math.floor(rendementBase * 1.5); // bonus de 50 %
      }

      const [stockRow] = await conn.query('SELECT stockage FROM ferme WHERE id = 1');
      const stockageActuel = (stockRow as any[])[0]?.stockage ?? 0;

      if (stockageActuel + rendementBase > 100000) {
        continue;
      }

      await conn.execute(
        'UPDATE stockage_culture SET quantite = quantite + ? WHERE culture = ?',
        [rendementBase, champ.culture]
      );

      await conn.execute(
        'UPDATE ferme SET stockage = stockage + ? WHERE id = 1',
        [rendementBase]
      );

      await conn.execute(
        'UPDATE champs SET state = ?, culture = ?, last_action_time = NOW(), fertilised = false WHERE id = ?',
        ['récolté', '', champ.id]
      );

      champsRecoltés.push(champ.id);
    }

    await conn.end();

    res.json({ success: true, champsRecoltés });
  } catch (err) {
    console.error('Erreur /recolter:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});



app.post('/champs', async (req: Request, res: Response) => {
  const { id, lot } = req.body;

  if (!id || !lot) {
    return res.status(400).json({ success: false, error: 'ID et lot requis' });
  }

  try {
    const conn = await mysql.createConnection(dbConfig);

    const [rows] = await conn.query('SELECT id FROM champs WHERE id = ?', [id]);
    if ((rows as any[]).length > 0) {
      await conn.end();
      return res.status(409).json({ success: false, error: 'ID déjà utilisé' });
    }

    await conn.execute(
      'INSERT INTO champs (id, state, culture, lot) VALUES (?, ?, ?, ?)',
      [id, 'labouré', '', lot]
    );
    await conn.end();

    res.json({ success: true });
  } catch (err) {
    console.error('Erreur /champs POST :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.post('/labourer', async (_req: Request, res: Response) => {
  try {
    const conn = await mysql.createConnection(dbConfig);

    // Sélectionne les champs à labourer
    const [rows] = await conn.query('SELECT id FROM champs WHERE state = "" OR state = "récolté"');
    const champs = rows as any[];

    if (champs.length === 0) {
      await conn.end();
      return res.json({ success: true, message: 'Aucun champ à labourer' });
    }

    for (const champ of champs) {
      await conn.execute(
        'UPDATE champs SET state = ?, last_action_time = NOW() WHERE id = ?',
        ['labouré', champ.id]
      );
    }

    await conn.end();
    res.json({ success: true, updated: champs.length });
  } catch (err) {
    console.error('Erreur /labourer :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});


app.post('/fertiliser', async (_req: Request, res: Response) => {
  try {
    const conn = await mysql.createConnection(dbConfig);

    // Récupérer tous les champs "semé" non fertilisés
    const [champsSemes] = await conn.query(
      "SELECT id FROM champs WHERE state = 'semé' AND fertilised = false"
    );

    const champs = champsSemes as any[];

    if (champs.length === 0) {
      await conn.end();
      return res.json({ success: false, message: 'Aucun champ à fertiliser.' });
    }

    // Fertiliser les champs
    for (const champ of champs) {
      await conn.execute(
        "UPDATE champs SET state = 'fertilisé', fertilised = true WHERE id = ?",
        [champ.id]
      );
    }

    await conn.end();
    res.json({ success: true, message: `${champs.length} champ(s) fertilisé(s).` });
  } catch (err) {
    console.error('Erreur fertilisation :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});



app.get('/usines-disponibles', async (_req: Request, res: Response) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.query('SELECT nom FROM usines WHERE dispo IS NULL');
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error('Erreur /usines-disponibles:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.post('/usine/occupee', async (req: Request, res: Response) => {
  const { nom } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('UPDATE usines SET dispo = 1 WHERE nom = ?', [nom]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur /usine/occupee:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.post('/usine/liberer', async (req: Request, res: Response) => {
  const { nom } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('UPDATE usines SET dispo = NULL WHERE nom = ?', [nom]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur /usine/liberer:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.post('/transformer', async (req: Request, res: Response) => {
  const { usine } = req.body;
  const conn = await mysql.createConnection(dbConfig);

  try {
    // 1. Vérifier que l'usine est disponible
    const [rows]: any[] = await conn.query('SELECT * FROM usines WHERE nom = ?', [usine]);
    const usineRow = rows[0];

    if (!usineRow) {
      await conn.end();
      return res.status(404).json({ error: 'Usine introuvable ou indisponible' });
    }

    const multiplicateur = usineRow.multiplicateur;
    const quantiteEgale = !!usineRow.quantiteEgale;
    const resultat = usineRow.resultat;

    // 2. Récupérer les intrants associés à cette usine
    const [intrantsRows] = await conn.query(
      'SELECT intrant FROM usines_intrants WHERE nom_usine = ?',
      [usine]
    );
    const intrants = (intrantsRows as any[]).map(row => row.intrant);

    // 3. Récupérer les quantités actuelles en stockage
    const [stockRows] = await conn.query('SELECT culture, quantite FROM stockage_culture');
    const stock: Record<string, number> = {};
    (stockRows as any[]).forEach(r => stock[r.culture] = r.quantite);

    const capaciteParTick = 100;
    let produit = 0;

    if (quantiteEgale) {
      const min = Math.min(...intrants.map(i => stock[i] || 0));
      if (min === 0) return res.status(400).json({ error: 'Intrants insuffisants' });

      for (const i of intrants) {
        await conn.execute(
          'UPDATE stockage_culture SET quantite = quantite - ? WHERE culture = ?',
          [min, i]
        );
      }

      const totalIn = min * intrants.length;
      produit = totalIn * multiplicateur;
    } else {
      const intrant = intrants.find(i => (stock[i] || 0) >= capaciteParTick);
      if (!intrant) return res.status(400).json({ error: 'Intrants insuffisants' });

      await conn.execute(
        'UPDATE stockage_culture SET quantite = quantite - ? WHERE culture = ?',
        [capaciteParTick, intrant]
      );
      produit = capaciteParTick * multiplicateur;
    }

    // 4. Vérifier capacité de stockage
    const [[ferme]] = await conn.query('SELECT stockage FROM ferme WHERE id = 1');
    if ((ferme.stockage + produit) > 100_000) {
      return res.status(400).json({ error: 'Stockage plein, usine mise en pause' });
    }

    // 5. Ajouter la production
    await conn.execute(
      'INSERT INTO stockage_culture (culture, quantite) VALUES (?, ?) ON DUPLICATE KEY UPDATE quantite = quantite + ?',
      [resultat, produit, produit]
    );
    await conn.execute('UPDATE ferme SET stockage = stockage + ? WHERE id = 1', [produit]);

    res.json({ success: true, produit });
  } catch (err) {
    console.error('Erreur transformation :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    await conn.end();
  }
});


app.get('/stockage', async (_req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.query('SELECT * FROM stockage_culture');
  await conn.end();
  res.json(rows);
});

app.post('/vider-stockage', async (_req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('UPDATE ferme SET stockage = 0 WHERE id = 1');
  await conn.execute('UPDATE stockage_culture SET quantite = 0');
  await conn.end();
  res.json({ success: true });
});


app.listen(3000, () => {
    setInterval(async () => {
  const conn = await mysql.createConnection(dbConfig);

  // Champs fertilisés depuis au moins 10 sec → prêt à récolter
  await conn.execute(`
    UPDATE champs
    SET state = 'prêt à récolter'
    WHERE state = 'fertilisé'
    AND TIMESTAMPDIFF(SECOND, last_action_time, NOW()) >= 10
  `);

  // Champs semés non fertilisés depuis au moins 20 sec → prêt à récolter
  await conn.execute(`
    UPDATE champs
    SET state = 'prêt à récolter'
    WHERE state = 'semé'
    AND fertilised = false
    AND TIMESTAMPDIFF(SECOND, last_action_time, NOW()) >= 20
  `);

  await conn.end();
}, 1000); // Vérifie toutes les secondes

  console.log('Serveur lancé sur http://localhost:3000');
});
