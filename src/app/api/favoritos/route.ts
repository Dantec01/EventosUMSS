// filepath: src/app/api/favoritos/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const usuario_id = (decoded as any).id;

    const result = await pool.query(
      `
      SELECT evento.*
      FROM favorito
      JOIN evento ON evento.id = favorito.evento_id
      WHERE favorito.usuario_id = $1
      `,
      [usuario_id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const usuario_id = (decoded as any).id;
    const { evento_id } = await request.json();

    // Primero verificamos si ya existe el favorito
    const existingFavorito = await pool.query(
      'SELECT * FROM favorito WHERE usuario_id = $1 AND evento_id = $2',
      [usuario_id, evento_id]
    );

    if (existingFavorito.rows.length > 0) {
      // Si existe, lo eliminamos
      await pool.query(
        'DELETE FROM favorito WHERE usuario_id = $1 AND evento_id = $2',
        [usuario_id, evento_id]
      );
      return NextResponse.json({ message: 'Favorito eliminado' });
    } else {
      // Si no existe, lo creamos
      const result = await pool.query(
        'INSERT INTO favorito (usuario_id, evento_id) VALUES ($1, $2) RETURNING *',
        [usuario_id, evento_id]
      );
      return NextResponse.json(result.rows[0]);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}