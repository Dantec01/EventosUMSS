# EventosUMSS  
Pagina web para los eventos de la UMSS enfocada en mobile first

**EventosUMSS** es una página web enfocada en un diseño **mobile-first** que permite a los estudiantes y usuarios de la **Universidad Mayor de San Simón** consultar y gestionar eventos como cursos, talleres y actividades extracurriculares de todas las facultades y carreras.

## Características principales

- **Http2 y ssl instalados**: Para una mejora de velocidad de conexión. SSL encripta datos entre servidor y cliente para seguridad.
- **Visualización de eventos**: Muestra todos los eventos disponibles en la universidad, categorizados por facultad y carrera.
- **Buscador de eventos**: Permite a los usuarios buscar eventos de forma rápida y eficiente.
- **Calendario personalizado**: Los usuarios pueden guardar eventos que les interesen en su propio calendario.
- **Formulario de creacion de eventos**: Los usuarios pueden proponer nuevos eventos a través de un formulario, que será revisado y aprobado por un administrador.
- **Sistema de login y registro**: Los usuarios deben iniciar sesión para poder guardar y gestionar sus eventos personales, toda la info se guarda en localstorage.
- **Eventos mas cercanos**: Se muestran los eventos mas cercanos a la ubicacion actual del usuario (API navegador)
- **Sliders de eventos**: Se muestran sugerencias en base a los ultimos eventos agregados, eventos mas cercanos al usuario, eventos recomendados por temas de interes del usuario.

## Tecnologías

### Frontend
- **Next.js** es un framework React para crear aplicaciones web full stack completas. Utiliza React Components para crear interfaces de usuario y Next.js para funciones y optimizaciones adicionales.

### Backend
- **Next.js**: Las API Routes en Next.js permiten crear endpoints backend directamente dentro de una aplicación Next.js.

### Base de datos

- **Postgres**: PostgreSQL, también llamado Postgres, es un sistema de gestión de bases de datos relacional orientado a objetos y de código abierto.

## Librerias

**jsonwebtoken:** Para generar y verificar tokens JWT (JSON Web Tokens) que se usan en la autenticación de usuarios.

**bcrypt:** Para hashear y verificar contraseñas de forma segura.

**jose:** Implementación de estándares de seguridad web como JWT, JWE, JWS.

**pg:** Cliente PostgreSQL para Node.js, usado para conectar y hacer consultas a la base de datos.

**selfsigned:** Para generar certificados SSL autofirmados para desarrollo local.

## USER INTERFACE 
![eve7](https://github.com/user-attachments/assets/6a7d702d-9f4c-4621-8bc7-66bf71d4252e)
![eve8](https://github.com/user-attachments/assets/22886dfc-1f4c-47ae-ac08-c9775efab58e)

## INSTALACION

  1. Clonar el repositorio
  2. Instalar dependencias: Abrir una terminal en la ubicacion del proyecto y ejecutar: **npm install**
  3. Generar un certificado ssl. En la terminal ejecutar **node generateCert.js**
  4. Crear la Base de datos en **POSTGRESQL** usando el archivo **BD.sql**
  5. Iniciar el servidor con: **npm run start**
  6. Ingresar a **https://localhost:3000** ignorar el mensaje de precaucion y proceder a la pagina.

## Nota

  - Necesita iniciar sesión para habilitar todas las caracteristicas de la pagina puede usar (User: test@test.com  pas: 123456).
  - Aceptar que el navegador pueda acceder a su ubicacion para mostrarle los eventos mas cercanos.
  - Las credenciales para conectarse a la base de datos se encuentran en .env.local.
    
## Licencia

Este proyecto está bajo una licencia personalizada. Consulta el archivo `LICENSE.txt` para obtener más información.

---

Proyecto en Finalizado 🚧
