import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ubicacion = searchParams.get('ubicacion');
  const categoria = searchParams.get('categoria');
  const interes = searchParams.get('interes');

  let query = `
    SELECT 
      e.*,
      u.nombre as ubicacion_nombre,
      u.latitud,
      u.longitud,
      t.nombre as tema_nombre
    FROM evento e
    JOIN ubicaciones u ON e.ubicacion_id = u.id
    LEFT JOIN temas t ON e.tema_id = t.id
    WHERE 1=1
  `;

  const params: any[] = [];
  
  if (ubicacion && ubicacion !== 'all') {
    params.push(ubicacion);
    query += ` AND u.nombre = $${params.length}`;
  }
  
  if (categoria && categoria !== 'all') {
    params.push(categoria);
    query += ` AND e.category = $${params.length}`;
  }

  if (interes && interes !== 'all') {
    params.push(interes);
    query += ` AND t.nombre = $${params.length}`;
  }

  query += ' ORDER BY e.date DESC, e.time DESC';

  try {
    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al filtrar eventos:', error);
    return NextResponse.json({ error: 'Error al filtrar eventos' }, { status: 500 });
  }
}