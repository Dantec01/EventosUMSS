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
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
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
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id)
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
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (evento_id) REFERENCES evento(id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_ubicacion_usuario_id ON ubicacion_usuario(usuario_id);
CREATE INDEX idx_evento_ubicacion ON evento(ubicacion_id);
CREATE INDEX idx_temas_usuario ON temas_usuario(usuario_id);
CREATE INDEX idx_temas_nombre ON temas(nombre);