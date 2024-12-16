-- Crear base de datos
CREATE DATABASE EventosUmss;
\c EventosUmss

-- Crear tabla de temas disponibles
CREATE TABLE temas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Insertar temas predefinidos solo si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM temas) THEN
        INSERT INTO temas (nombre) VALUES
            ('Tecnología'),
            ('Ciencias'),
            ('Arte y Cultura'),
            ('Deportes'),
            ('Música'),
            ('Literatura'),
            ('Medicina'),
            ('Ingeniería'),
            ('Arquitectura'),
            ('Medio Ambiente'),
            ('Emprendimiento'),
            ('Innovación'),
            ('Educación'),
            ('Investigación'),
            ('Entretenimiento'),
            ('Gastronomía'),
            ('Otros');
    END IF;
END $$;

-- Crear tabla usuario
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    rol VARCHAR(10) NOT NULL CHECK (rol IN ('estudiante', 'admin'))
);

-- Crear tabla de temas preferidos por usuario
CREATE TABLE temas_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    tema_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (tema_id) REFERENCES temas(id),
    UNIQUE(usuario_id, tema_id)
);

-- Crear función para validar máximo 3 temas por usuario
CREATE OR REPLACE FUNCTION validar_max_temas()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM temas_usuario WHERE usuario_id = NEW.usuario_id) >= 3 THEN
        RAISE EXCEPTION 'Un usuario no puede tener más de 3 temas preferidos.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para la tabla temas_usuario
CREATE TRIGGER trg_validar_max_temas
BEFORE INSERT ON temas_usuario
FOR EACH ROW EXECUTE FUNCTION validar_max_temas();

-- Crear tabla ubicaciones
CREATE TABLE ubicaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL
);

-- Insertar ubicaciones fijas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM ubicaciones) THEN
        INSERT INTO ubicaciones (nombre, latitud, longitud) VALUES
            ('UMSS Campus Central', -17.394227, -66.147166),
            ('UMSS Facultad de Tecnología', -17.393771, -66.146818),
            ('UMSS Facultad de Medicina', -17.383350, -66.156421),
            ('UMSS Facultad de Arquitectura', -17.394476, -66.148132),
            ('UMSS Valle de Sacta', -17.107679, -64.705148),
            ('UMSS Facultad de Veterinaria', -17.355128, -66.140045),
            ('UMSS Facultad de Agronomía', -17.355670, -66.140296),
            ('UMSS Facultad de Odontología', -17.383350, -66.156421),
            ('UMSS Facultad de Economía', -17.394227, -66.147166),
            ('UMSS Facultad de Derecho', -17.394227, -66.147166),
            ('UMSS Facultad de Humanidades', -17.394476, -66.148132);
    END IF;
END $$;

-- Crear tabla ubicacion_usuario
CREATE TABLE ubicacion_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Crear tabla evento
CREATE TABLE evento (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    image VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT,
    usuario_id INT NOT NULL,
    ubicacion_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id) ON DELETE SET NULL
);

-- Crear tabla evento_tema
CREATE TABLE evento_tema (
    id SERIAL PRIMARY KEY,
    evento_id INT NOT NULL,
    tema_id INT NOT NULL,
    FOREIGN KEY (evento_id) REFERENCES evento(id) ON DELETE CASCADE,
    FOREIGN KEY (tema_id) REFERENCES temas(id),
    UNIQUE(evento_id, tema_id)
);

-- Crear índice para mejorar el rendimiento de las búsquedas
CREATE INDEX idx_evento_tema ON evento_tema(tema_id);

-- Crear tabla favorito
CREATE TABLE favorito (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    evento_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (evento_id) REFERENCES evento(id) ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_ubicacion_usuario_id ON ubicacion_usuario(usuario_id);
CREATE INDEX idx_evento_ubicacion ON evento(ubicacion_id);
CREATE INDEX idx_temas_usuario ON temas_usuario(usuario_id);
CREATE INDEX idx_temas_nombre ON temas(nombre);

-- ----------------------------
-- Records of usuario
-- ----------------------------
INSERT INTO "public"."usuario" VALUES (1, 'Admin', 'admin@umss.edu', '$2b$10$AS9gVP5sAbxJyOllxOoFVOwiseLNMeuiFrziN8w2.QRe8y6PPuzXC', 'admin');
INSERT INTO "public"."usuario" VALUES (3, 'Test User', 'test@test.com', '$2b$10$iQZzi5OyBPX1p8CXTJ6YN.4GiZcVYpGANze9AuKVfcSk3WcR1J7ka', 'estudiante');

-- ----------------------------
-- Records of evento
-- ----------------------------
INSERT INTO "public"."evento" VALUES (1, 'Concierto de Rock', '/images/1.jpg', 'Música', '2024-12-26', '20:00:00', 'Coliseo UMSS', 'Un increíble concierto de rock con las mejores bandas locales.', 1, 2);
INSERT INTO "public"."evento" VALUES (2, 'Capacitación para CTFs', '/images/2.jpg', 'Otros', '2024-12-01', '10:00:00', 'Informatica', '📌  𝘌𝘭 𝘋𝘦𝘱𝘢𝘳𝘵𝘢𝘮𝘦𝘯𝘵𝘰 𝘥𝘦 𝘐𝘯𝘧𝘰𝘳𝘮á𝘵𝘪𝘤𝘢 𝘺 𝘚𝘪𝘴𝘵𝘦𝘮𝘢𝘴, 𝘰𝘧𝘦𝘳𝘵𝘢 𝘊𝘶𝘳𝘴𝘰𝘴 𝘥𝘦 𝘍𝘰𝘳𝘮𝘢𝘤𝘪ó𝘯 𝘤𝘰𝘯𝘵𝘪𝘯𝘶𝘢.\n\n✅ 𝘔𝘰𝘥𝘢𝘭𝘪𝘥𝘢𝘥: 𝘗𝘳𝘦𝘴𝘦𝘯𝘤𝘪𝘢𝘭 💻\n⚠️ 𝘚𝘦 𝘰𝘵𝘰𝘳𝘨𝘢𝘳á 𝘊𝘌𝘙𝘐𝘍𝘐𝘊𝘈𝘋𝘖...', 1, 1);
INSERT INTO "public"."evento" VALUES (3, 'Maratón de la UMSS', '/images/3.jpg', 'Deportes', '2024-12-19', '07:00:00', 'Parque Central', 'Participa en la maratón anual de la ciudad. ¡Corre por una buena causa!', 1, 2);
INSERT INTO "public"."evento" VALUES (4, 'Curso: Visual Basic y Java básico', '/images/4.jpg', 'Cursos', '2024-12-30', '15:45:00', 'Laboratorio INF-SIS', '📌 Curso práctico sobre Visual Basic y Java básico.\n\nModalidad: Presencial 💻\nCertificado con valor curricular.', 1, 3);
INSERT INTO "public"."evento" VALUES (5, 'Capture the Flag', '/images/5.jpg', 'Otros', '2024-12-05', '10:00:00', 'LAB 3 INF-SIS (MEMI)', 'Clasificatorio a la Competencia Nacional de Seguridad Informática.\n\nFormulario de registro: https://forms.gle/FqaNDwURsgraADMK9', 1, 3);
INSERT INTO "public"."evento" VALUES (6, 'CÓDIGO FEST', '/images/6.jpg', 'Talleres', '2024-12-10', '19:00:00', 'Auditorio', 'Estás invitado/a a la conferencia anual de Código Facilito: CÓDIGO FEST 2024.\n\nCharla con expertos y tendencias del desarrollo.', 1, 7);
INSERT INTO "public"."evento" VALUES (7, 'Ingeniería en Software', '/images/7.jpg', 'Charlas', '2024-12-07', '10:00:00', 'Salón Amauta', 'Programa de ingeniería en software con becas disponibles.\nModalidad: Virtual.', 1, 4);
INSERT INTO "public"."evento" VALUES (8, 'Introducción a Google Earth Engine', '/images/8.jpg', 'Cursos', '2024-11-14', '19:00:00', 'Museo de la Fotografía', '🌍 Curso sobre análisis de imágenes satelitales con Google Earth Engine.\nDuración: 2 semanas.', 1, 3);
INSERT INTO "public"."evento" VALUES (9, 'IEEEXtreme', '/images/9.jpg', 'Deportes', '2024-12-27', '09:00:00', 'meet.google.com/utp-sctk-nwm', 'Competencia mundial de programación organizada por IEEE.\n\nMás información: meet.google.com/utp-sctk-nwm.', 1, 1);
INSERT INTO "public"."evento" VALUES (10, 'Lenguaje de Señas', '/images/10.jpg', 'Cursos', '2024-12-13', '09:00:00', 'CUADIS', 'Curso básico de lengua de señas.\nOrganizado por CUADIS.', 1, 3);
INSERT INTO "public"."evento" VALUES (11, 'Gran Inauguración del Polideportivo', '/images/11.jpg', 'Deportes', '2024-12-01', '09:00:00', 'Coliseo UMSS', 'Evento de inauguración del polideportivo multifuncional.\n\nSe entregará refrigerio a los asistentes.', 1, 1);
INSERT INTO "public"."evento" VALUES (12, 'Rifa ICPC!', '/images/evento_1733206319149.jpg', 'Otros', '2024-12-04', '11:05:00', 'Auditorio de la Ciencia y Cultura', '🎉 ¡No te lo pierdas! 🎉\n📋 Incluye:\n    - Charlas informativas 🗣️\n    - Concursos divertidos 🎮 (¡mecanografía, algorun, kahoot y más!)\n    - Sorteo de increíbles premios:\n    - 1 cupón de hasta $49 USD para cursos en Coursera\n    - 3 audífonos\n    - 2 mouse gamer\n    - 4 memorias USB\n\n🎟️ ¿Aún no tienes tu boleto?\n¡No te quedes fuera! Compra tu rifa por solo 10 Bs.\n👉 Contáctame al 📞 76995925 para asegurar tu participación', 3, 1);

-- ----------------------------
-- Records of favorito
-- ----------------------------
INSERT INTO "public"."favorito" VALUES (1, 3, 9);
INSERT INTO "public"."favorito" VALUES (2, 3, 12);
INSERT INTO "public"."favorito" VALUES (3, 3, 11);
INSERT INTO "public"."favorito" VALUES (4, 3, 8);
INSERT INTO "public"."favorito" VALUES (5, 3, 7);
INSERT INTO "public"."favorito" VALUES (6, 3, 1);

-- ----------------------------
-- Records of temas_usuario
-- ----------------------------
INSERT INTO "public"."temas_usuario" VALUES (1, 3, 17);
INSERT INTO "public"."temas_usuario" VALUES (2, 3, 4);
INSERT INTO "public"."temas_usuario" VALUES (3, 3, 9);
INSERT INTO "public"."temas_usuario" VALUES (4, 3, 5);
INSERT INTO "public"."temas_usuario" VALUES (5, 3, 16);