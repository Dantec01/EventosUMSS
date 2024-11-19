// filepath: src/app/api/usuarios/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  const { nombre, email, password, rol } = await request.json();

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    'INSERT INTO Usuario (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING *',
    [nombre, email, hashedPassword, rol]
  );

  return NextResponse.json(result.rows[0]);
}