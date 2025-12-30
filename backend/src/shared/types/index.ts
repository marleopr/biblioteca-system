export type UserRole = 'ADMIN' | 'USER';

export type AcquisitionType = 'DONATION' | 'PURCHASE';

export type BookCondition = 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';

export type CoverType = 'SOFTCOVER' | 'HARDCOVER';

export interface User {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  address: string;
  email: string | null;
  photo: string | null;
  role: UserRole;
  password_hash: string;
  active: number;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  address: string | null; // Mantido para compatibilidade, mas opcional
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  email: string | null;
  photo: string | null;
  active: number;
  created_at: string;
}

export interface Author {
  id: string;
  name: string;
  active: number;
}

export interface Category {
  id: string;
  name: string;
  active: number;
}

export interface Book {
  id: string;
  title: string;
  author_id: string;
  category_id: string;
  photo: string | null;
  origin: string;
  acquisition_type: AcquisitionType;
  total_quantity: number;
  available_quantity: number;
  barcode: string | null;
  inventory_number: string | null;
  edition: string | null;
  cover_type: CoverType | null;
  isbn: string | null;
  active: number;
  created_at: string;
}

export interface Loan {
  id: string;
  client_id: string;
  book_id: string;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  condition_on_loan: BookCondition;
  condition_on_return: BookCondition | null;
  notes: string | null;
}

export interface Setting {
  id: string;
  max_loans_per_client: number;
  loan_duration_days: number;
  library_name: string;
  library_logo: string | null;
  sidebar_color: string;
}

export interface Log {
  id: string;
  user_id: string;
  action: string;
  created_at: string;
}

