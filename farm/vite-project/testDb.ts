import mysql from 'mysql2/promise';

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'farm'
    });

    console.log(' Connecté à la base MySQL');

    const [vehicules] = await connection.query('SELECT * FROM vehicules');
    console.log('\n Véhicules disponibles :');
    console.table(vehicules);

    const [usines] = await connection.query('SELECT * FROM usines');
    console.log('\n Usines :');
    console.table(usines);

    const [cultures] = await connection.query('SELECT * FROM stockage_culture');
    console.log('\n Stockage par culture :');
    console.table(cultures);

    const [ferme] = await connection.query('SELECT * FROM ferme');
    console.log('\n État de la ferme :');
    console.table(ferme);

    await connection.end();
  } catch (err) {
    console.error('Erreur de connexion ou de requête :', err);
  }
}

main();
