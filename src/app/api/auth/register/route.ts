import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  try {
    const { nombre, email, password, tema1, tema2, tema3 } = await request.json()

    // Verificar si el correo ya existe
    const existingUser = await pool.query(
      'SELECT * FROM usuario WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: 'El correo electrónico ya está registrado' },
        { status: 400 }
      )
    }

    // Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Iniciar una transacción
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Insertar usuario
      const userResult = await client.query(
        'INSERT INTO usuario (nombre, email, password) VALUES ($1, $2, $3) RETURNING id',
        [nombre, email, hashedPassword]
      )

      const userId = userResult.rows[0].id

      // Insertar temas de usuario
      await client.query(
        'INSERT INTO temas_usuario (usuario_id, tema_id) VALUES ($1, $2), ($1, $3), ($1, $4)',
        [userId, tema1, tema2, tema3]
      )

      await client.query('COMMIT')

      return NextResponse.json(
        { message: 'Usuario registrado exitosamente' },
        { status: 201 }
      )
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error en el registro:', error)
    return NextResponse.json(
      { message: 'Error al registrar el usuario' },
      { status: 500 }
    )
  }
}
