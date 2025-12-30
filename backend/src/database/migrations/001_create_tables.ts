import db from '../../config/database';

export const up = (): void => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cpf TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      photo TEXT,
      role TEXT NOT NULL CHECK(role IN ('ADMIN', 'USER')),
      password_hash TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Clients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cpf TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Authors table
  db.exec(`
    CREATE TABLE IF NOT EXISTS authors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      active INTEGER NOT NULL DEFAULT 1
    )
  `);

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      active INTEGER NOT NULL DEFAULT 1
    )
  `);

  // Books table
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      photo TEXT,
      origin TEXT NOT NULL,
      acquisition_type TEXT NOT NULL CHECK(acquisition_type IN ('DONATION', 'PURCHASE')),
      total_quantity INTEGER NOT NULL DEFAULT 1,
      available_quantity INTEGER NOT NULL DEFAULT 1,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (author_id) REFERENCES authors(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Loans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      loan_date TEXT NOT NULL DEFAULT (datetime('now')),
      due_date TEXT NOT NULL,
      return_date TEXT,
      condition_on_loan TEXT NOT NULL CHECK(condition_on_loan IN ('NEW', 'GOOD', 'FAIR', 'DAMAGED')),
      condition_on_return TEXT CHECK(condition_on_return IN ('NEW', 'GOOD', 'FAIR', 'DAMAGED')),
      notes TEXT,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (book_id) REFERENCES books(id)
    )
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      max_loans_per_client INTEGER NOT NULL DEFAULT 5,
      loan_duration_days INTEGER NOT NULL DEFAULT 14
    )
  `);

  // Logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_loans_client_id ON loans(client_id);
    CREATE INDEX IF NOT EXISTS idx_loans_book_id ON loans(book_id);
    CREATE INDEX IF NOT EXISTS idx_loans_return_date ON loans(return_date);
    CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
    CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);
  `);
};

export const down = (): void => {
  db.exec(`
    DROP TABLE IF EXISTS logs;
    DROP TABLE IF EXISTS settings;
    DROP TABLE IF EXISTS loans;
    DROP TABLE IF EXISTS books;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS authors;
    DROP TABLE IF EXISTS clients;
    DROP TABLE IF EXISTS users;
  `);
};

