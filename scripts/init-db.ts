import { initDatabase } from '../lib/db-postgres';

async function main() {
  console.log('🚀 Inicializando base de datos Postgres...');

  try {
    await initDatabase();
    console.log('✅ Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
}

main();
