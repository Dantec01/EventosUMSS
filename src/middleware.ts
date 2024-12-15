// filepath: src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose';

interface JWTPayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

export async function middleware(request: NextRequest) {
  // Configuración de CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Verificar si es una ruta que requiere autenticación
  if (request.nextUrl.pathname.startsWith('/api/favoritos')) {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Token no proporcionado' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secretKey) as { payload: JWTPayload };

      // Agregar información del usuario al request
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.id.toString());
      requestHeaders.set('x-user-email', payload.email);

      // Crear nueva request con los headers modificados
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      // Agregar headers CORS a la respuesta
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return response;

    } catch (error) {
      console.error('Error verificando token:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Token inválido o expirado' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }
  }

  // Para rutas que no requieren autenticación
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export const config = {
  matcher: ['/api/:path*']
}