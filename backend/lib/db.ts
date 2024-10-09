import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Crear una nueva instancia del Pool de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,         // Nombre de usuario de la base de datos
  host: process.env.DB_HOST,         // Dirección del host de la base de datos
  database: process.env.DB_NAME,     // Nombre de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña de la base de datos
  port: Number(process.env.DB_PORT), // Puerto de conexión (generalmente 5432)
});

// Verificar la conexión a la base de datos
pool.connect()
  .then(() => console.log('Conexión a la base de datos exitosa'))
  .catch(err => console.error('Error de conexión a la base de datos:', err));

// Exportar el pool para usarlo en otros archivos
export default pool;
