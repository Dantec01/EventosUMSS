// filepath: src/app/api/eventos/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const result = await pool.query('SELECT * FROM evento');
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const {
    title,
    image,
    category,
    date,
    time,
    location,
    description,
    usuario_id,
  } = await request.json();

  const result = await pool.query(
    'INSERT INTO "Evento" (title, image, category, date, time, location, description, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [title, image, category, date, time, location, description, usuario_id]
  );

  return NextResponse.json(result.rows[0]);
}