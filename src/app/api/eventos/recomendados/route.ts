import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const usuario_id = (decoded as any).id;

    // Obtener eventos relacionados con los temas del usuario
    const eventosQuery = `
      WITH user_topics AS (
        SELECT tema_id 
        FROM temas_usuario 
        WHERE usuario_id = $1
      ),
      recommended_events AS (
        -- Primero obtener eventos que coincidan con los temas del usuario
        SELECT e.*, 1 as priority
        FROM evento e
        WHERE e.tema_id IN (SELECT tema_id FROM user_topics)
        AND e.date >= CURRENT_DATE

        UNION ALL

        -- Luego obtener algunos eventos recientes si no hay suficientes
        SELECT e.*, 2 as priority
        FROM evento e
        WHERE e.date >= CURRENT_DATE
        AND e.tema_id NOT IN (SELECT tema_id FROM user_topics)
        LIMIT 3
      )
      SELECT DISTINCT * FROM recommended_events
      ORDER BY priority ASC, date ASC
      LIMIT 10
    `;

    const eventosResult = await pool.query(eventosQuery, [usuario_id]);
    return NextResponse.json(eventosResult.rows);

  } catch (error) {
    console.error('Error al obtener eventos recomendados:', error);
    return NextResponse.json(
      { error: 'Error al obtener eventos recomendados' },
      { status: 500 }
    );
  }
}
