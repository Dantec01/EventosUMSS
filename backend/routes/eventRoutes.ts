import { Router } from 'express';
import pool from '../lib/db'; // Importa la conexión de PostgreSQL

const router = Router();

// Obtener todos los eventos
router.get('/eventos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM eventos');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error al obtener los eventos' });
  }
});

// Crear un nuevo evento (ejemplo básico)
router.post('/eventos', async (req, res) => {
  const { titulo, descripcion, fecha, hora, lugar, imagen_url } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO eventos (titulo, descripcion, fecha, hora, lugar, imagen_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [titulo, descripcion, fecha, hora, lugar, imagen_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Error al crear el evento' });
  }
});

export default router;
