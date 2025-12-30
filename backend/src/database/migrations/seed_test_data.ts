import db from '../../config/database';
import { up as seedTestData } from './012_seed_test_data';

const runSeedTestData = async (): Promise<void> => {
  console.log('Executando seed de dados de teste...');
  
  try {
    await seedTestData();
    console.log('✓ Dados de teste criados com sucesso!');
    console.log('  - 100 clientes');
    console.log('  - 100 livros');
  } catch (error) {
    console.error('Erro ao criar dados de teste:', error);
    process.exit(1);
  }
  
  db.close();
  process.exit(0);
};

runSeedTestData();

