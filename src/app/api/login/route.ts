// filepath: src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const userResult = await pool.query(
    'SELECT * FROM usuario WHERE email = $1',
    [email]
  );

  const user = userResult.rows[0];

  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET!
  );

  return NextResponse.json({ token });
}