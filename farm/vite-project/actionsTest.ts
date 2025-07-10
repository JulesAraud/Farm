import mysql from 'mysql2/promise';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'farm',
  });

  const id = parseInt(await ask('ID du champ : '), 10);
  const lot = await ask('Nom du lot : ');
  const culture = await ask('Culture à semer : ');
  const rendement = parseInt(await ask('Rendement estimé (L) : '), 10);

  rl.close();

  await connection.execute(
    'INSERT INTO champs (id, state, culture, lot) VALUES (?, ?, ?, ?)',
    [id, 'labouré', '', lot]
  );

  await connection.execute(
    'UPDATE champs SET state = ?, culture = ? WHERE id = ?',
    ['semé', culture, id]
  );

  const [fermes] = await connection.query('SELECT stockage FROM ferme WHERE id = 1');
  const stockageActuel = (fermes as any)[0].stockage;

  if (stockageActuel + rendement > 100000) {
    console.log('Stockage plein. Récolte impossible.');
  } else {
    await connection.execute('UPDATE champs SET state = ? WHERE id = ?', ['récolté', id]);
    await connection.execute('UPDATE ferme SET stockage = stockage + ? WHERE id = 1', [rendement]);
    await connection.execute(
      'UPDATE stockage_culture SET quantite = quantite + ? WHERE culture = ?',
      [rendement, culture]
    );
    console.log(`Champ ${id} récolté. ${rendement} L ajoutés au stockage.`);
  }

  const [cultures] = await connection.query('SELECT culture, quantite FROM stockage_culture');
  let revenuTotal = 0;
  for (const row of cultures as any[]) {
    const { culture, quantite } = row;
    if (quantite > 0) { 
      revenuTotal += quantite;
      await connection.execute(
        'UPDATE stockage_culture SET quantite = 0 WHERE culture = ?',
        [culture]
      );
    }
  }

  await connection.execute('UPDATE ferme SET stockage = 0, revenu_total = revenu_total + ? WHERE id = 1', [revenuTotal]);
  console.log(`Récolte vendue : ${revenuTotal} pièces d'or gagnées.`);

  await connection.end();
}

main().catch(err => console.error('Erreur :', err));
