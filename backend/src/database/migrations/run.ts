import { up as createTables } from './001_create_tables';
import { up as seedData } from './002_seed_initial_data';
import { up as addEmailFields } from './003_add_email_fields';
import { up as addClientPhoto } from './004_add_client_photo';

const runMigrations = async (): Promise<void> => {
  console.log('Running migrations...');
  
  createTables();
  console.log('✓ Tables created');
  
  try {
    addEmailFields();
    console.log('✓ Email fields added');
  } catch (error) {
    // Ignore error if columns already exist
    console.log('⚠ Email fields may already exist');
  }
  
  try {
    addClientPhoto();
    console.log('✓ Client photo field added');
  } catch (error) {
    // Ignore error if column already exists
    console.log('⚠ Client photo field may already exist');
  }
  
  await seedData();
  console.log('✓ Initial data seeded');
  
  console.log('Migrations completed!');
  process.exit(0);
};

runMigrations().catch((error) => {
  console.error('Migration error:', error);
  process.exit(1);
});

