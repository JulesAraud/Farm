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

app.get('/ferme', async (_req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.query('SELECT stockage, revenu_total FROM ferme WHERE id = 1');
  await conn.end();
  res.json(rows[0]);
});

app.get('/produits-transformes', async (_req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.query('SELECT produit, quantite FROM produits_transformes');
  await conn.end();
  res.json(rows);
});

app.post('/vendre-produit', async (req: Request, res: Response) => {
  const { produit, quantite } = req.body;

  if (!produit || !quantite || isNaN(quantite) || quantite <= 0) {
    return res.status(400).json({ error: "Données invalides" });
  }

  const conn = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await conn.query('SELECT quantite FROM produits_transformes WHERE produit = ?', [produit]);
    const actuel = (rows as any[])[0]?.quantite || 0;

    if (quantite > actuel) {
      await conn.end();
      return res.status(400).json({ error: "Quantité demandée supérieure au stock" });
    }

    await conn.execute('UPDATE produits_transformes SET quantite = quantite - ? WHERE produit = ?', [quantite, produit]);
    await conn.execute('UPDATE ferme SET revenu_total = revenu_total + ?, stockage = stockage - ? WHERE id = 1', [quantite, quantite]);
    await conn.end();

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur /vendre-produit :", err);
    await conn.end();
    res.status(500).json({ error: "Erreur serveur" });
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



app.get('/usines-disponibles', async (_req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await conn.query('SELECT * FROM usines WHERE dispo IS NULL');
    res.json(rows);
  } catch (err) {
    console.error('Erreur /usines-disponibles :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    await conn.end();
  }
});

app.get('/usines-utilisation', async (_req, res) => {
  const conn = await mysql.createConnection(dbConfig);

  const [rows] = await conn.query(`
    SELECT nom, resultat, derniere_production, quantite_produite
    FROM usines
    WHERE dispo = 1
  `);

  await conn.end();
  res.json(rows);
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


async function getIntrants(nomUsine: string): Promise<string[]> {
  const mapping: Record<string, string[]> = {
    'Moulin à huile': ['tournesol', 'olive', 'canola', 'riz'],
    'Scierie': ['peuplier'],
    'Fabrique de wagons': ['planches'],
    'Usine de jouets': ['planches'],
    'Moulin à grains': ['blé', 'orge', 'sorgho'],
    'Raffinerie de sucre': ['betterave', 'canne à sucre'],
    'Filature': ['coton'],
    'Atelier de couture': ['tissu'],
    'Boulangerie': ['sucre', 'farine'],
    'Usine de chips': ['pomme de terre', 'huile'],
    'Cave à vin': ['raisin']
  };
  return mapping[nomUsine] || [];
}


app.post('/transformer', async (req: Request, res: Response) => {
  const { usine } = req.body;
  const conn = await mysql.createConnection(dbConfig);

  try {
    const [usineRows] = await conn.query('SELECT * FROM usines WHERE nom = ?', [usine]);
    const usineInfo = (usineRows as any[])[0];

    if (!usineInfo || usineInfo.dispo === 1) {
      await conn.end();
      return res.status(400).json({ error: 'Usine indisponible ou introuvable' });
    }

    // Marquer l'usine comme occupée
    await conn.execute('UPDATE usines SET dispo = 1 WHERE id = ?', [usineInfo.id]);

    // Charger les intrants
    const [intrantsRows] = await conn.query(
      'SELECT intrant FROM usines_intrants WHERE usine_id = ?',
      [usineInfo.id]
    );
    const intrants = (intrantsRows as any[]).map(row => row.intrant);

    // Charger le stock
    const [stockRows] = await conn.query('SELECT * FROM stockage_culture');
    const [transformeRows] = await conn.query('SELECT * FROM produits_transformes');
    const [fermeRows] = await conn.query('SELECT stockage FROM ferme WHERE id = 1');

    const stockCulture: Record<string, number> = {};
    const stockTransforme: Record<string, number> = {};

    (stockRows as any[]).forEach(r => stockCulture[r.culture] = r.quantite);
    (transformeRows as any[]).forEach(r => stockTransforme[r.produit] = r.quantite);

    let stockageActuel = (fermeRows as any[])[0]?.stockage || 0;
    const maxStock = 100_000;
    const capaciteParTick = 100;
    let produitTotal = 0;

    const attendre = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    if (usineInfo.quantiteEgale) {
      let minDispo = Math.min(...intrants.map(i =>
        (stockCulture[i] || 0) + (stockTransforme[i] || 0)
      ));

      while (minDispo > 0 && stockageActuel + produitTotal < maxStock) {
        for (const intrant of intrants) {
          if ((stockCulture[intrant] || 0) > 0) {
            await conn.execute('UPDATE stockage_culture SET quantite = quantite - 1 WHERE culture = ?', [intrant]);
            stockCulture[intrant]--;
          } else if ((stockTransforme[intrant] || 0) > 0) {
            await conn.execute('UPDATE produits_transformes SET quantite = quantite - 1 WHERE produit = ?', [intrant]);
            stockTransforme[intrant]--;
          }
        }

        const produit = usineInfo.multiplicateur * intrants.length;
        await conn.execute('UPDATE produits_transformes SET quantite = quantite + ? WHERE produit = ?', [produit, usineInfo.resultat]);
        await conn.execute('UPDATE ferme SET stockage = stockage + ? WHERE id = 1', [produit]);

        produitTotal += produit;
        stockageActuel += produit;

        await attendre(1000);
        minDispo = Math.min(...intrants.map(i =>
          (stockCulture[i] || 0) + (stockTransforme[i] || 0)
        ));
      }

    } else {
      for (const intrant of intrants) {
        while (((stockCulture[intrant] || 0) + (stockTransforme[intrant] || 0)) >= capaciteParTick &&
               stockageActuel + produitTotal < maxStock) {

          let reste = capaciteParTick;

          if ((stockCulture[intrant] || 0) > 0) {
            const aPrendre = Math.min(reste, stockCulture[intrant]);
            await conn.execute('UPDATE stockage_culture SET quantite = quantite - ? WHERE culture = ?', [aPrendre, intrant]);
            stockCulture[intrant] -= aPrendre;
            reste -= aPrendre;
          }

          if (reste > 0 && (stockTransforme[intrant] || 0) > 0) {
            const aPrendre = Math.min(reste, stockTransforme[intrant]);
            await conn.execute('UPDATE produits_transformes SET quantite = quantite - ? WHERE produit = ?', [aPrendre, intrant]);
            stockTransforme[intrant] -= aPrendre;
            reste -= aPrendre;
          }

          const produit = usineInfo.multiplicateur * capaciteParTick;
          await conn.execute('UPDATE produits_transformes SET quantite = quantite + ? WHERE produit = ?', [produit, usineInfo.resultat]);
          await conn.execute('UPDATE ferme SET stockage = stockage + ? WHERE id = 1', [produit]);

          produitTotal += produit;
          stockageActuel += produit;

          await attendre(1000);
        }
      }
    }

    // Mise à jour finale
    await conn.execute(
      'UPDATE usines SET quantite_produite = ?, derniere_production = NOW() WHERE id = ?',
      [produitTotal, usineInfo.id]
    );

    // Libérer l'usine
    await conn.execute('UPDATE usines SET dispo = NULL WHERE id = ?', [usineInfo.id]);
    await conn.end();

    if (produitTotal === 0) {
      return res.status(400).json({ error: 'Pas assez d’intrants ou stockage plein' });
    }

    res.json({
      success: true,
      produit: produitTotal,
      message: `✅ L'usine '${usine}' a traité ${produitTotal} L.`
    });

  } catch (err) {
    console.error('Erreur /transformer :', err);
    await conn.execute('UPDATE usines SET dispo = NULL WHERE nom = ?', [usine]);
    await conn.end();
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.post('/vendre-stockage', async (_req: Request, res: Response) => {
  const conn = await mysql.createConnection(dbConfig);

  try {
    const [rows] = await conn.query('SELECT stockage FROM ferme WHERE id = 1');
    const stockage = (rows as any[])[0]?.stockage || 0;

    if (stockage <= 0) {
      await conn.end();
      return res.status(400).json({ error: 'Aucun stock à vendre.' });
    }

    await conn.execute('UPDATE ferme SET stockage = 0, revenu_total = revenu_total + ? WHERE id = 1', [stockage]);

    await conn.end();
    res.json({ success: true, message: `💰 Vous avez vendu ${stockage}L de stockage pour ${stockage} pièces.` });
  } catch (err) {
    console.error('Erreur /vendre-stockage :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/vendre-quantite', async (req: Request, res: Response) => {
  const { quantite } = req.body;

  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.query('SELECT stockage, revenu_total FROM ferme WHERE id = 1');
    const ferme = (rows as any[])[0];

    if (!ferme || quantite > ferme.stockage) {
      await conn.end();
      return res.status(400).json({ error: 'Quantité invalide ou stock insuffisant' });
    }

    await conn.execute('UPDATE ferme SET stockage = stockage - ?, revenu_total = revenu_total + ? WHERE id = 1', [quantite, quantite]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
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
