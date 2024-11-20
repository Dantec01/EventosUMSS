// filepath: src/app/api/eventos/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET() {
  const result = await pool.query('SELECT * FROM evento');
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const usuario_id = (decoded as any).id;
    const {
      title,
      image,
      category,
      date,
      time,
      location,
      description,
    } = await request.json();

    const result = await pool.query(
      'INSERT INTO "Evento" (title, image, category, date, time, location, description, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, image, category, date, time, location, description, usuario_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}