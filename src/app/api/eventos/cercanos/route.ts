import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { latitude, longitude } = await req.json();

    // Utilizamos la fórmula de Haversine para calcular la distancia
    const query = `
      WITH event_distances AS (
        SELECT 
          e.*,
          u.latitud,
          u.longitud,
          (
            6371 * acos(
              cos(radians($1)) * 
              cos(radians(u.latitud)) * 
              cos(radians(u.longitud) - radians($2)) + 
              sin(radians($1)) * 
              sin(radians(u.latitud))
            )
          ) as distance
        FROM evento e
        JOIN ubicaciones u ON e.ubicacion_id = u.id
      )
      SELECT 
        id,
        title,
        category,
        date,
        time,
        location,
        description,
        image,
        usuario_id,
        ubicacion_id,
        latitud,
        longitud,
        distance
      FROM event_distances
      ORDER BY distance ASC
      LIMIT 5;
    `;

    const result = await pool.query(query, [latitude, longitude]);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener eventos cercanos:', error);
    return NextResponse.json(
      { error: 'Error al obtener eventos cercanos' },
      { status: 500 }
    );
  }
}
