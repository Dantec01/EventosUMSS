// filepath: src/app/api/eventos/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import path from 'path';

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
    
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File;

    // Guardar imagen
    if (!imageFile) {
      return NextResponse.json({ error: 'Imagen requerida' }, { status: 400 });
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generar nombre único para la imagen
    const ext = path.extname(imageFile.name);
    const filename = `evento_${Date.now()}${ext}`;
    const filepath = path.join(process.cwd(), 'public', 'images', filename);

    await writeFile(filepath, buffer);
    const imagePath = `/images/${filename}`;

    console.log('Datos del evento a guardar:', {
      title, 
      imagePath, 
      category, 
      date, 
      time, 
      location, 
      description, 
      usuario_id
    });

    // Guardar evento en base de datos
    const result = await pool.query(
      'INSERT INTO evento (title, image, category, date, time, location, description, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, imagePath, category, date, time, location, description, usuario_id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error al crear evento:', error);
    return NextResponse.json({ error: 'Error al crear evento' }, { status: 500 });
  }
}