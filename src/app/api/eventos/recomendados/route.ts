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
      )
      SELECT DISTINCT e.* 
      FROM evento e
      WHERE e.tema_id IN (SELECT tema_id FROM user_topics)
      ORDER BY e.date ASC
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
