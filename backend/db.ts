import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Cargar las variables de entorno

// Crear el pool de conexiones con PostgreSQL
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT || '5432'),
});

export default pool;
