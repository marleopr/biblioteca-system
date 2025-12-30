import dotenv from 'dotenv';

dotenv.config();

// Usar porta 3001 por padrão (evita necessidade de permissões de admin)
// Pode ser alterada via variável de ambiente PORT
const defaultPort = 3001;

export const env = {
  port: Number(process.env.PORT) || defaultPort,
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

