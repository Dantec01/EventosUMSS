// filepath: src/app/api/favoritos/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usuario_id = searchParams.get('usuario_id');

  const result = await pool.query(
    `
    SELECT "Evento".*
    FROM "Favorito"
    JOIN "Evento" ON "Evento".id = "Favorito".evento_id
    WHERE "Favorito".usuario_id = $1
    `,
    [usuario_id]
  );

  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const { usuario_id, evento_id } = await request.json();

  const result = await pool.query(
    'INSERT INTO "Favorito" (usuario_id, evento_id) VALUES ($1, $2) RETURNING *',
    [usuario_id, evento_id]
  );

  return NextResponse.json(result.rows[0]);
}