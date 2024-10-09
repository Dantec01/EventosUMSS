import { Request, Response } from 'express'; // Importar los tipos de Express
import pool from '../lib/db';
import bcrypt from 'bcrypt';

// Obtener todos los estudiantes
export const getEstudiantes = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM estudiante');
    res.json(result.rows);
  } catch (error: any) {  // Usamos 'any' para el tipo de 'error'
    res.status(500).json({ error: error.message });
  }
};

// Registrar un estudiante
export const registrarEstudiante = async (req: Request, res: Response): Promise<void> => {
  const { nombre, correo_electronico, contrasena } = req.body;
  
  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    
    const result = await pool.query(
      'INSERT INTO estudiante (nombre, correo_electronico, contrasena) VALUES ($1, $2, $3) RETURNING *',
      [nombre, correo_electronico, hashedPassword]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {  // Usamos 'any' para el tipo de 'error'
    res.status(500).json({ error: error.message });
  }
};

