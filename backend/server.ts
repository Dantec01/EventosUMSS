import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventRoutes from './routes/eventRoutes'; // Importa las rutas de eventos
import authRoutes from './routes/authRoutes'; // Importa las rutas de autenticación
import estudianteRoutes from './routes/estudianteRoutes';

// Cargar variables de entorno desde .env
dotenv.config();

// Crear la aplicación Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Para manejar datos en formato JSON

// Definir puerto desde las variables de entorno o usar el puerto 5000
const PORT = process.env.PORT || 5000;

// Ruta básica para probar
app.get('/', (req, res) => {
  res.send('API de EventosUMSS funcionando');
});

app.use('/api', eventRoutes);
app.use('/api/auth', authRoutes);  // Registrar rutas de autenticación

// Usar las rutas de estudiantes
app.use('/api', estudianteRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
