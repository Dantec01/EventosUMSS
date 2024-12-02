-- Crear base de datos
CREATE DATABASE EventosUmss;
\c EventosUmss
-- Crear tabla de Usuarios
CREATE TABLE Usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL, -- El email sigue siendo único
    password VARCHAR(100) NOT NULL, -- Password no es único
    rol VARCHAR(10) NOT NULL CHECK (rol IN ('estudiante', 'admin'))  
);

-- Crear tabla de Eventos
CREATE TABLE Evento (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    image VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT,
    usuario_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id)
);

-- Crear tabla de Favoritos
CREATE TABLE Favorito (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    evento_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id),
    FOREIGN KEY (evento_id) REFERENCES Evento(id)
);









