import db from '../../config/database';

export const up = (): void => {
  // Add barcode column (optional, unique if provided)
  try {
    db.exec(`ALTER TABLE books ADD COLUMN barcode TEXT NULL`);
    console.log('✓ Added barcode column');
  } catch (error: any) {
    if (!error.message.includes('duplicate column name')) {
      throw error;
    }
  }

  // Add inventory_number column (optional, unique if provided)
  try {
    db.exec(`ALTER TABLE books ADD COLUMN inventory_number TEXT NULL`);
    console.log('✓ Added inventory_number column');
  } catch (error: any) {
    if (!error.message.includes('duplicate column name')) {
      throw error;
    }
  }

  // Add edition column (optional, free text)
  try {
    db.exec(`ALTER TABLE books ADD COLUMN edition TEXT NULL`);
    console.log('✓ Added edition column');
  } catch (error: any) {
    if (!error.message.includes('duplicate column name')) {
      throw error;
    }
  }

  // Add cover_type column (SOFTCOVER or HARDCOVER)
  try {
    db.exec(`ALTER TABLE books ADD COLUMN cover_type TEXT NULL CHECK(cover_type IN ('SOFTCOVER', 'HARDCOVER'))`);
    console.log('✓ Added cover_type column');
  } catch (error: any) {
    if (!error.message.includes('duplicate column name')) {
      throw error;
    }
  }

  // Add isbn column (optional, unique if provided)
  try {
    db.exec(`ALTER TABLE books ADD COLUMN isbn TEXT NULL`);
    console.log('✓ Added isbn column');
  } catch (error: any) {
    if (!error.message.includes('duplicate column name')) {
      throw error;
    }
  }

  // Create unique indexes for barcode and inventory_number (only for non-null values)
  // SQLite doesn't support partial unique indexes directly, so we'll handle uniqueness in application logic
};

export const down = (): void => {
  // Note: SQLite doesn't support DROP COLUMN directly
  // This would require recreating the table, which is complex
  // For now, we'll leave this empty as it's not critical for development
};

